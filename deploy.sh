#!/bin/bash
ssh pi2 'rm -r /var/www/portfolio/*'
bundle exec jekyll build && scp -r _site/* pi2:/var/www/portfolio 
