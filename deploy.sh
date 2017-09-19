#!/bin/bash
ssh pi 'rm -r /var/www/portfolio/*'
bundle exec jekyll build && scp -r _site/* pi:/var/www/portfolio 