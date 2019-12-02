#!/bin/bash

git fetch origin master
if [ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]; then
  git pull origin master
  bundle exec jekyll build --incremental
  cp -r _site/* /var/www/portfolio/
fi
