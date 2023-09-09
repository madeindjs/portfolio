---
title: Déployer son site statique automatiquement avec un script bash

date: 2020-03-01 11:20:00 +0200
tags: [bash]
categories: devops
lang: fr
translations:
  en: deploy-static-website-like-netlify-in-bash
---

[Netlify](https://www.netlify.com/) permet, entre autre entre, de se brancher à Github et de builder ton site statique automatiquement à chaque commit et de le déployer sur un serveur. Ce service est vraiment top car tu n'as rien à faire. Netlify s'occupe de tout.

C'est génial mais tu n'as pas forcément envie de dépendre d'un service tiers de plus. Ou alors comme moi, tu héberge toi-même ton serveur web.

J'ai une solution _low tech_ à base de Crontab qui ne demande aucune dépendance: un script Bash. Assez basiquement il s'occupe de:

1. faire un `git pull` si nécessaire
2. _rebuild_ le site avec Jekyll
3. mettre à jour les sources du site

Ca tiens en 13 lignes de code. Voilà ce que ça donne:

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

Ce fichier est versionné avec mon projet Jekyll, je l'ai sobrement appelé `deploy.sh` et il est situé à la racine du projet.

Il suffit ensuite d'appeler ce script toutes les heures par exemples en mettant en place un [CRON](https://fr.wikipedia.org/wiki/Cron#crontab). Pour l'installer, il suffit de lancer la commande:

```bash
crontab
```

et ensuite copier / coller la ligne suivante (en adaptant à ton cas spécifique).

```bash
0 *  *   *   *    cd /home/pi/portfolio && ./deploy.sh
```

Et voilà, c'est terminé.

La seule limitation est le délais de latence vu que le CRON ne se lance que toutes les heures. On pourrais modifier le CRON pour l'executer toutes les minutes mais le mieux serais d'écouter un webhook de Github lors de la création d'un commit et relancer le build. C'est l'idéal mais c'est plus compliqué et du coup c'est un peu exagéré pour mon usage. Ca fait le taff et c'est très bien.
