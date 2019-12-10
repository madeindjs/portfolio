#!/bin/bash

git fetch origin

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

if [ $LOCAL = $REMOTE ]; then
  echo "Up-to-date"
elif [ $LOCAL = $BASE ]; then
  echo "Need to pull"
  git pull origin master
  bundle exec jekyll build --incremental
  cp -r _site/* /var/www/portfolio/
elif [ $REMOTE = $BASE ]; then
  echo "Need to push"
else
  echo "Diverged"
fi
