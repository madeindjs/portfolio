#!/bin/bash
ssh pi 'rm -r /var/www/nature_coiffure/*'
jekyll build && scp -r _site/* pi:/var/www/nature_coiffure 