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
  /home/pi/.rvm/gems/ruby-2.4.0/wrappers/jekyll build
  rm -rf /var/www/portfolio/*
  cp -r _site/* /var/www/portfolio/
elif [ $REMOTE = $BASE ]; then
  echo "Need to push"
else
  echo "Diverged"
fi
