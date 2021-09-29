#!/bin/bash

git fetch origin

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

if [ $LOCAL = $BASE ]; then
  git pull origin master
  npm run build
  rm -rf /var/www/portfolio/*
  cp -r public/* /var/www/portfolio/
fi
