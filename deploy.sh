#!/bin/bash

git fetch origin

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "@{u}")

if [ "$LOCAL" != "$REMOTE" ] || [ "$1" = "force" ]; then
  git pull origin master
  npm run build
  rm -rf /var/www/portfolio/*
  cp -r dist/* /var/www/portfolio/
  cp -r dist/.well-known /var/www/portfolio/
else
  echo "Deployment skipped"
fi
