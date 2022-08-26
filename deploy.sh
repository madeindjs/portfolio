#!/bin/bash

git fetch origin

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

RUBY_VERSION=$(cat .ruby-version)

if [ $LOCAL = $BASE ]; then
  git pull origin master
  ~/.rvm/gems/$RUBY_VERSION/wrappers/jekyll build
  rm -rf /var/www/portfolio/*
  cp -r _site/* /var/www/portfolio/
  cp -r _site/.well-known /var/www/portfolio/
fi
