---
title: Deploy static website like Netlify but using simple Bash script
description: You don't have to use an external service to deploy your website each time you push on your repository. Bash does the job.

date: 2023-09-09 23:20:00 +0200
tags: [bash]
translations:
  fr: reproduire-netlify-avec-un-raspberry
categories: devops
lang: en
---

[Netlify](https://www.netlify.com/) allows you, among other things, to connect to Github and build your static site automatically with each commit, then deploy it on a server. This service is really great because you don't have to do a thing. Netlify takes care of everything.

It's great, but you don't necessarily want to depend on yet another third-party service. Or like me, you host your own web server.

I have a _low tech_ Crontab-based solution that requires no dependencies: a Bash script. Basically, it does the following:

1. do a `git pull` if necessary
2. _rebuild_ the site with Jekyll
3. update site sources

It takes 13 lines of code. Here's what it looks like:

```bash
#!/bin/bash

git fetch origin

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "@{u}")

if [ "$LOCAL" != "$REMOTE" ] || [ "$1" = "force" ]; then
  git pull origin master
  npm ci
  npm run build
  rm -rf /var/www/portfolio/*
  cp -r dist/* /var/www/portfolio/
  cp -r dist/.well-known /var/www/portfolio/
else
  echo "Deployment skipped"
fi
```

This file is versioned with my project, soberly named `deploy.sh` and located at the project root.

All you have to do is call this script every hour, for example, by setting up a [CRON](https://wikipedia.org/wiki/Cron#crontab). To install it, simply run the command:

```bash
crontab
```

and then copy/paste the following line (adapting it to your specific case).

```bash
0 *  *   *   *    cd /home/pi/portfolio && ./deploy.sh
```

And that's all there is to it.

The only limitation is latency, as the CRON only runs every hour. You could modify the CRON to run every minute, but the best way would be to listen to a Github webhook when creating a commit and restart the build. That's ideal, but it's more complicated and a bit overkill for my purposes. It does the job and that's good enough.

![David Goodenough](../../../assets/img/blog/david-good.webp)
