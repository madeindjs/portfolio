#!/bin/bash
ssh pi 'rm -r /var/www/portfolio/*'
jekyll build && scp -r _site/* pi:/var/www/portfolio 