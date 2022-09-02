#!/bin/bash

git fetch origin

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "@{u}")

if [ "$1" == "force" ]; then
  LOCAL=""
fi

if [ $LOCAL != $REMOTE ]; then
  git pull origin master
  RUBY_VERSION=$(cat .ruby-version)
  ~/.rvm/gems/$RUBY_VERSION/wrappers/jekyll build
  rm -rf /var/www/portfolio/*
  cp -r _site/* /var/www/portfolio/
  cp -r _site/.well-known /var/www/portfolio/
fi
