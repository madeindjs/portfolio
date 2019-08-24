#!/bin/bash
bundle exec jekyll build
cp -r _site/* /var/www/portfolio/
