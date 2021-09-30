---
title: Déployer une application Frontent / Backend sur Google Cloud Plateform avec Gitlab CI
description: Tutoriel pour utiliser Gitlab CI afin de créer les images Docker d'une application Backend + Frontend et de la déployer sur Google Cloud Computing avec Kubernetes.

date: 2020-08-05 15:00:00 +0200
tags: [devops, gcloud, gitlabci, docker]
categories: programming
toc: true
lang: fr
---

J'ai déployé une application Fullstack (c'est à dire Frontend / Backend) sur Google Cloud Plateform avec Kubernetes. Et comme [les développeur sont fainéant](https://www.forbes.com/sites/forbestechcouncil/2018/01/08/developers-are-lazy-and-thats-usually-a-good-thing/), j'ai tout automatisé avec Gitlab CI.

On est bien loin du PHP déployé à la main sur un serveur Apache. Si ça t'intéresse de passer à la vitesse supérieur et de voir comment ça marche, je t'invite à lire la suite.

## Mon application

Mon projet sur lequel je travaille actuellement est découpé en trois partie : _Frontend_, _Backend_, _Job Queue_.

Chaque partie tourne dans des _containers_ Docker bien séparés. Ils possèdent donc tous un `Dockerfile` :

1. le _frontend_ utilise une image Node.js qui build **Angular 9** puis une image NGINX qui sert les fichiers statiques
2. le _backend_ utilise une image **Node.js** qui lance un serveur web sur le port 3000
3. la _job_queue_ utilise aussi une image Node.js qui lance un script **Node.js** qui communique avec la base Postgres et effectue des actions en différé

Mon projet à donc la structure suivante :

```
├── backend
├── docker
├── docker-compose.yml
└── frontend
```

J'ai donc souhaiter construire ces images automatiquement lors d'un `git push` et la publier sur Google Cloud Plateform avec Kubernetes. Pour cela, j'ai utilisé **Gitlab CI** mais la logique doit être identique avec Circle CI de Github.

> La base Postgres est indépendante de Kubernetes et fonctionne sur un service [Google Cloud SQL pour PostgreSQL](https://cloud.google.com/sql/docs/postgres). Je n'en parlerai pas ici.

## Automatisation avec Gitlab CI

Gitlab permet donc à travers un fichier `.gitlab-ci.yml` de définir un workflow de chose à faire lorsque tu pousse du code. Ceci est souvent intéressant pour lancer une _pipeline_ (suite d'actions) qui vont lancer les tests unitaires, linter le code, etc...

Dans mon cas, j'ai créé les actions suivantes :

1. `test`: lancement des tests unitaires
2. `publish`: création d'une image Docker et publication dans le registre d'image privé de GCloud
3. `deploy`: demande à GCloud de déployer les images précédement _uploadé_

Le structure du fichier `.gitlab-ci.yml` ressemble donc à cela :

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

> j'ai gardé que les job qui concernent `backend` pour simplifier.

Je te propose de passer en revue les différentes étapes. C'est partit.

## `test`: lancement des tests unitaires

Il s'agit de l'étape la plus facile. Je ne vais pas trop m'attarder dessus car beaucoup de tutoriels existent et ce n'est pas le sujet de cet article.

On lance donc deux jobs :

1. `job:test:backend` va initialiser l'application, connecter une base Postgres et lancer `yarn test`

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

2. `job:test:frontend` va initaliser l'application et lancer `yarn test` mais à partir d'une image contenant un driver Chrome pour émuler la navigation

```yml
job:test:frontend:
  image: weboaks/node-karma-protractor-chrome:alpine
  stage: test
  before_script:
    - cd frontend
    - yarn install
  script: yarn test
```

Et voilà.

## `publish`: création d'une image Docker et publication dans le registre d'image privé de GCloud

L'étape `publish` va construire les images Docker des différentes application et les publier sur [GCloud - Container Registry](https://cloud.google.com/container-registry). Pour cela on va créer un job par image à publier (`frontend`, `backend` et `worker`).

Afin de construire les images et les publier, il faut utiliser:

- l'image [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/) qui permet de communiquer avec GCloud et ainsi de publier les images
- le service [Docker-in-Docker](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#use-docker-in-docker-workflow-with-docker-executor) qui permet d'utiliser des commandes Docker dans un container Docker.

Il est ensuite possible d'utiliser la commande :

- `gcloud auth` pour se connecter à Gcloud dans le container
- `gcloud auth configure-docker` pour connecter Docker à GCloud
- `docker buil/push` pour créer l'image et la publier

Une dernière chose à savoir: pour ce connecter à GCloud dans Gitlab CI il faut tout d'abord se connecter. Pour cela il faut ajouter les credentials des GCloud dans les paramètres de Gitlab CI dans la sections "Settings > Variables". Une fois que c'est fait, il est possible de se logger dans le job en utilisant la commande suivante:

```bash
echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json
gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
```

Voici donc le résultat complet pour le job `job:publish:backend` :

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

> je passe le détails des deux autres car ils sont très similaires.

## `deploy`: demande à GCloud de déployer les images précédement _uploadé_

Pour utiliser `kubectl` nous allons aussi utiliser l'image [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/) qui contient l'utilitaire Kubernetes.

Mais avant de commencer à code le script, il faut créer trois **deploiement** :

1. `dpl-my-app-frontend` sur <https://my-app/>
2. `dpl-my-app-backend` sur <https://api.my-app/>
3. `dpl-my-app-worker` qui n'est pas exposé

Pour les créer, tu peux passer par l'interface de GCloud ou bien utiliser directement `kubectl` sur ton PC (en n'oubliant pas de [configurer l'accès au cluster pour kubectl](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl?hl=fr)).

Pour la version en ligne de commande il faut utiliser `kubectl create deployment` :

```bash
kubectl create deployment dpl-develop-data-frontend --image=us.gcr.io/<your-node>/data-k8s-frontend
kubectl create deployment dpl-develop-data-backend --image=us.gcr.io/<your-node>/data-k8s-backend
kubectl create deployment dpl-develop-data-worker --image=us.gcr.io/<your-node>/data-k8s-worker
```

> On peut vérifier que tout s'est bien passé avec `kubectl get deployments` qui doit lister nos trois nouveaux déploiements.

Ensuite, il ne reste plus que à créer les jobs qui vont s'occuper de mettre à jour les _containers_ sur ces déploiements et spécifier la redirection des ports.

Pour cela il faut aussi utiliser `gcloud auth` comme tu l'as vu précédement. Ensuite, il suffit d'appeller les méthodes :

- `kubectl set image` pour mettre à jour l'image du container
- `kubectl patch deployment` pour mettre à jour les information du container (ex: changer les metadata)

Voici la version complète pour `job:deploy-develop:backend`:

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

Et voila.

Il suffit ensuite de ce rendre dans l'interface GCloud dans la section "Kubernetes Engine > Workloads", retrouver les worklow correspondand et de créer les entrée DNS sur votre fournisseur de nom de domaine et de les faire pointer sur les déploiement correspondants.

## Conclusion

Pour ma part j'ai trouvé l'approche de Google Cloud Plateform très déroutante mais assez bien documenté. Le temps investis dans l'apprentissage de cette technologie me semble bien investis car l'architecture est vraiment _scalable_ et permet de réduire les cout de l'infrastructure.

Le seul point noir pourrait être qu'on s'enferme chez un fournisseur mais je pense que Amazon Web Service ou Microsoft Azure partagent la même terminologi car leur technologie reposent aussi sur Kubernetes à mon avis.

## Links

- [Déployer une application Web en conteneur](https://cloud.google.com/kubernetes-engine/docs/tutorials/hello-app?hl=fr)
- [Deploying a full stack application to Google Kubernetes Engine – Shine Solutions Group](https://shinesolutions.com/2018/10/25/deploying-a-full-stack-application-to-google-kubernetes-engine/)
- [Connect a Front End to a Back End Using a Service](https://kubernetes.io/docs/tasks/access-application-cluster/connecting-frontend-backend/)
- [Building Docker images with GitLab CI/CD](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html)
