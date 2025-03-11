---
title: Exporting the same JSX library to React, Preact & Solid
description: TODO
tags:
  - ruby
  - rails
  - devops
lang: en
date: 2024-05-13T23:30:00
---

Here are my personal notes to upgrade from Ruby 2.7.6 to 3.2.7 for the Ruby on Rails application powering [iSignif](https://isignif.fr/).

1. I thought about giving up on Ruby many times and switching to a more familiar stack (JavaScript) but Ruby on Rails is really stable. It powered iSignif during the last 8 years and I upgraded from 4.2 to 7.1 without any major issues
2. I though about moving everything to Docker and simply deploy an image, but my boring stack (Apache2 / Passenger / Capistrano) works pretty well.

## Update local project

Replace the Ruby version

```diff
diff --git a/.github/workflows/test.yml b/.github/workflows/test.yml
index 84079d22..3cd81483 100644
--- a/.github/workflows/test.yml
+++ b/.github/workflows/test.yml
@@ -23,7 +23,7 @@ jobs:
         uses: ruby/setup-ruby@v1
         with:
           bundler-cache: true
-          ruby-version: 2.7.6
+          ruby-version: 3.2.7

       - name: Install dependencies
         run: |
diff --git a/.ruby-version b/.ruby-version
index 818bd47a..406ebcbd 100644
--- a/.ruby-version
+++ b/.ruby-version
@@ -1 +1 @@
-2.7.6
+3.2.7
diff --git a/Gemfile b/Gemfile
index 3ab63366..9a0bf504 100644
--- a/Gemfile
+++ b/Gemfile
@@ -1,6 +1,6 @@
 source 'https://rubygems.org'

-ruby '2.7.6'
+ruby '3.2.7'

 # Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
 gem 'rails', '~> 7.1.0'
```

## Prepare the server

```sh
rvm install 3.2.7
rvm use 3.2.7
```

The install [Phusion Passenger](https://www.phusionpassenger.com/) using RVM.

```sh
gem install passenger
```

In order to makes Passenger compatible with Apache2, we need to compile the source

```sh
passenger-install-apache2-module
```

Then it will be prompted to update
