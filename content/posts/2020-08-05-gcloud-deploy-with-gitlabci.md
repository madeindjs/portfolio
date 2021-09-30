---
title: Deploy a fullstack application on Google Cloud Plateform with Gitlab CI

date: 2020-08-05 15:00:00 +0200
tags: [devops, gcloud, gitlabci, docker]
categories: programming
lang: en
---

I deployed a Fullstack application (i.e. Frontend / Backend) on Google Cloud Platform with Kubernetes. And since [developers are lazy](https://www.forbes.com/sites/forbestechcouncil/2018/01/08/developers-are-lazy-and-thats-usually-a-good-thing/), I automated everything with Gitlab CI.

It's a far cry from PHP deployed by hand on an Apache server. If you're interested in moving up a gear and see how it works, read on.

## My application

My project I'm currently working on is divided into three parts: _Frontend_, _Backend_, _Job Queue_.

Each part runs in separate _containers_ Docker. So they all have a `Dockerfile':

1. the _frontend_ uses a Node.js image that builds **Angular 9** and then a NGINX image that serves the static files
2. the _backend_ uses a **Node.js** image that launches a web server on port 3000
3. the _job_queue_ also uses a Node.js image that launches a **Node.js** script that communicates with the Postgres database and performs offline actions.

So my project has the following structure:

```
├── backend
├── docker
├── docker-compose.yml
└── frontend
```

So I wanted to build these images automatically during a `git push` and publish it on Google Cloud Platform with Kubernetes. For this, I used **Gitlab CI** but the logic must be identical with Github's Circle CI.

> The Postgres database is independent of Kubernetes and runs on a [Google Cloud SQL for PostgreSQL] service (https://cloud.google.com/sql/docs/postgres). I won't talk about it here..

## Automation with Gitlab CI

Gitlab allows you to define a workflow of things to do when you push code through a `.gitlab-ci.yml` file. This is often useful for launching a _pipeline_ (a sequence of actions) that will run unit tests, linter code, etc...
`
In my case, I created the following actions :

1. `test': launch unit tests
2. `publish`: creation of a Docker image and publication in the GCloud's private image registry
3. `deploy`: tells the GCloud to deploy the images previously _uploaded_.

So the structure of the `.gitlab-ci.yml` file looks like this:

```yml
# .gitlab-ci.yml
# ...
stages: [test, publish, deploy]

job:test:backend:
  stage: test
  # ...

job:publish:backend:
  stage: publish
  # ...

job:deploy-develop:backend:
  stage: deploy
  # ...
```

> I only kept the jobs that involve "backend" to simplify.

I'll walk you through the steps. Here we go.

## `test`: running unit tests

This is the easiest step. I won't spend too much time on it because a lot of tutorials exist and that's not the subject of this article.

So we start two jobs:

1. `job:test:backend` will initialize the application, connect a Postgres database and run `yarn test'.

```yml
job:test:backend:
  stage: test
  services:
    - postgres:12.3-alpine
  variables:
    POSTGRES_DB: database
    POSTGRES_USER: user
    POSTGRES_PASSWORD: password
    POSTGRES_HOST_AUTH_METHOD: trust
  before_script:
    - cd backend
    - cp .example.env .env
    - yarn install
  script: yarn test
```

2. `job:test:frontend` will initialize the application and run `yarn test` but from an image containing a Chrome driver to emulate navigation.

```yml
job:test:frontend:
  image: weboaks/node-karma-protractor-chrome:alpine
  stage: test
  before_script:
    - cd frontend
    - yarn install
  script: yarn test
```

There you go.

## `publish`: creating a Docker image and publishing it in the private image registry of the GCloud.

The `publish` step will build docker images of the different applications and publish them to [GCloud - Container Registry](https://cloud.google.com/container-registry). To do this, we will create a job for each image to be published (frontend, backend and worker).

In order to build the images and publish them, we need to use:

- the image [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/) which allows to communicate with GCloud and publish the images.
- the [Docker-in-Docker] service (https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#use-docker-in-docker-workflow-with-docker-executor) which allows you to use Docker commands in a Docker container.

It is then possible to use the :

- `gcloud auth` to connect to Gcloud in the container.
- gcloud auth configure-docker to connect Docker to GCloud
- `docker buil/push` to create the image and publish it

One last thing to know: to connect to the GCloud in Gitlab CI, you must first log in. To do so, you need to add the GCloud credentials in the Gitlab CI settings in the "Settings > Variables" section. Once this is done, it is possible to log into the job using the following command:

```bash
echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json
gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
```

Bellow the final result for `job:publish:backend` :

```yml
job:publish:backend:
  stage: publish
  image: google/cloud-sdk:latest
  when: on_success
  services:
    - docker:dind
  tags:
    - dind
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
  before_script:
    - cd backend
    - cp .develop.env .env
    - echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json
    - gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
    - gcloud auth configure-docker
  script:
    - docker build --compress -t us.gcr.io/${PROJECT_NAME}/${APP_NAME}-backend:${CI_COMMIT_SHA} .
    - docker push us.gcr.io/${PROJECT_NAME}/${APP_NAME}-backend:${CI_COMMIT_SHA}
    - docker image rm -f us.gcr.io/${PROJECT_NAME}/${APP_NAME}-backend:${CI_COMMIT_SHA}
    - echo "us.gcr.io/${PROJECT_NAME}/${APP_NAME}-backend:${CI_COMMIT_SHA} image build with success and pushed"
```

> I skip over the details of the other two because they're very similar.

## `deploy`: ask GCloud to deploy the images previously _uploaded_.

To use `kubectl` we will also use the [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/) image which contains the Kubernetes utility.

But before we start coding the script, we need to create three **deployment** :

1. `dpl-my-app-frontend` on <https://my-app/>
2. `dpl-my-app-backend` at <https://api.my-app/>.
3. `dpl-my-app-worker` that is not exposed

To create them, you can use the GCloud interface or use `kubectl` directly on your PC (don't forget to [configure cluster access for kubectl](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl?hl=fr)).

For the command line version, use `kubectl create deployment` :

```bash
kubectl create deployment dpl-develop-data-frontend --image=us.gcr.io/<your-node>/data-k8s-frontend
kubectl create deployment dpl-develop-data-backend --image=us.gcr.io/<your-node>/data-k8s-backend
kubectl create deployment dpl-develop-data-worker --image=us.gcr.io/<your-node>/data-k8s-worker
```

> We can check that everything went well with `kubectl get deployments` which should list our three new deployments.

Then, we just have to create the jobs that will update the _containers_ on these deployments and specify the port forwarding.

To do this you also need to use `gcloud auth` as you saw before. Then, just call the methods :

- `kubectl set image` to update the container image.
- `kubectl patch deployment` to update container information (e.g. change metadata)

Here is the full version for `job:deploy-develop:backend`:

```yml
job:deploy-develop:backend:
  stage: deploy
  image: google/cloud-sdk:latest
  before_script:
    - echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json
    - gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
    - gcloud config set compute/zone us-east1-c
    - gcloud config set project ${GCLOUD_PROJECT_NAME}
    - gcloud container clusters get-credentials ${K8S_CLUSTER_NAME}
    - gcloud auth configure-docker
  script:
    - kubectl set image deployment/${APP_NAME}-backend data-k8s-backend=us.gcr.io/${PROJECT_NAME}/${APP_NAME}-backend:${CI_COMMIT_SHA}
    - kubectl patch deployment ${APP_NAME}-backend -p "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"date\":\"`date +'%s'`\"}}}}}"
```

There you go.

Then just go to the GCloud interface in the "Kubernetes Engine > Workloads" section, find the corresponding workloads and create the DNS entries on your domain name provider and point them to the corresponding deployments.

## Conclusion

For my part I found the Google Cloud Platform approach very confusing but quite well documented. The time invested in learning this technology seems to me well invested because the architecture is really _scalable_ and allows to reduce the infrastructure costs.

The only black point could be that we lock ourselves in a provider but I think that Amazon Web Service or Microsoft Azure share the same terminology because their technology is also based on Kubernetes in my opinion.

## Links

- [Deploying a Containerized Web Application](https://cloud.google.com/kubernetes-engine/docs/tutorials/hello-app?hl=fr)
- [Deploying a full stack application to Google Kubernetes Engine - Shine Solutions Group](https://shinesolutions.com/2018/10/25/deploying-a-full-stack-application-to-google-kubernetes-engine/)
- [Connect a Front End to a Back End Using a Service](https://kubernetes.io/docs/tasks/access-application-cluster/connecting-frontend-backend/)
- Building Docker images with GitLab CI/CD](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html)
