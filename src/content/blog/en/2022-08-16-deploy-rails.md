---
title: Deploy a Rails application in production with Capistrano and Phusion Passenger
description: A step by step guide to self-host a Ruby on Rails application
date: 2022-08-16 18:00:00 +0200
tags:
  - rails
  - apache
  - capistrano
lang: en
translations:
  fr: deployer-rails-avec-capistrano
modified: 2022-08-29T15:44:15.396Z
---

Recently, I deployed a new brand new Rails application in my small VPS: <https://killer.rsseau.fr> . Doing so is alway a complex exercice because it requires to take care of many things. In this post, I will retrace everything I did.

In my case, I have the following stack:

- Linux server on Debian 9
- [Apache HTTP server][apache]
- [Phusion Passenger][passenger], it's a way to run Ruby code with Apache
- [RVM][rvm] as Ruby version manager
- [Ruby on Rails 6][ror]
- [SQlite][sqlite] as database to makes things simpler on the beginning

If you have a slightly different stack, the workflow could be different but the global logic should be very similar.

As a deployment automation, I'll use [Capistrano][capistrano]. Capistrano will do many thing under the hood for us like:

1. makes an SSH connection to the server
2. clone the last version of your Git repository on the server
3. run `bundle install` to get new packages, run `rails db:migrate` for you, build assets, etc..
4. create some symlink for shared item (ex: `production.sqlite`, `master.key`, uploaded files, etc..)

It requires some work to setup properly but, trust me, it worth it. Once setup, one command is sufficient to make a release on production.

NOTE: This guide is a note for myself, I may improve it in the future.

## Setup the server

### Setup `/var/www`

We'll start to create a folder for you project inside `/var/www`. This folder contains all yours websites sources for Apache.

```bash
sudo mkdir /var/www/killer
```

As Capistrano and Apache need access to this folder, we also need to make it writeable by your current user. So we'll change the owner of the folder to `debian` (my user):

```bash
sudo chown debian /var/www/killer
```

Then we'll create the `shared` folder. Capistrano will use this folder and symlink the content for every release. I'll also create `shared/config` and `shared/config/credentials`. We'll use those folder right after:

```bash
mkdir -p /var/www/killer/shared/
mkdir -p /var/www/killer/shared/config/credentials
mkdir -p /var/www/killer/shared/db
```

In my situation, I want to put the `master.key`, `production.key` (who are not committed on the repository). I'll do do using `scp`

```bash
# on local env
scp config/master.key user@server:/var/www/killer/shared/config/master.key
scp config/credentials/production.key user@server:/var/www/killer/shared/config/credentials/production.key
scp db/production.sqlite user@server:/var/www/killer/shared/db/production.sqlite
```

I also need to create an empty [SQlite][sqlite] database. This database will be shared to every release. Let's do it:

```bash
sqlite3 /var/www/killer/shared/db/production.sqlite
sqlite> SELECT 1;
sqlite> .exit;
```

NOTE: we need to execute at least one query to create the file. That's why I did `SELECT 1;`.

### Install Ruby

Now we need to install the same Ruby version than your [Ruby on Rails][ror] project on the server. The easiest way to do so is use a Ruby version manager.

In Ruby world, there is two version manager for Ruby: [Rbenv](https://github.com/rbenv/rbenv) & [RVM][rvm]. I will use the last one.

So, if you didn't install [RVM][rvm], just click on [this link][rvm] and follow steps. Once you did it, install the right version using:

```bash
rvm install 3.1.2
```

And we are good for now.

## Setup [Capistrano][capistrano]

Let the server appart for now and go back on your project.

We'll install [Capistrano][capistrano] and some necessary plugins (those may not be necessary in you case):

```bash
bundle add capistrano --group development
bundle add capistrano-rvm --group development
```

Now we can install Capistrano on your project with this command:

```bash
cap install
```

At this point, you'll see some new files in your project.

### `Capfile`

The first file is `Capfile`, this file is responsible to load plugins of [Capistrano][capistrano]. You just need to add some `require`s

```rb
# Capfile
# ...
require "capistrano/deploy"
require 'capistrano/rails'
require "capistrano/bundler"
require "capistrano/rvm"
```

### `deploy.rb`

Now we want to edit a bit the `config/deploy.rb`. This file contains configuration about all deployments.

We'll start to add basics informations about out project

```rb
# config/deploy.rb
# ...
# Global information about your repo
set :application, "killer-game"
set :repo_url, "git@github.com:madeindjs/killer-game.git"
set :branch, :main
# where to deploy and RVM conf
set :deploy_to, "/var/www/killer"
set :rvm_ruby_version, '3.1.2'
```

The last "complex" part is to list every linked files. Be aware because those files need to exist in the server `share` folder (Hopefully, we created them in the previous section).

```rb
# config/deploy.rb
# ...
# every shared file we need
append :linked_files, 'config/master.key', 'config/credentials/production.key', 'db/production.sqlite'
```

### `production.rb`

Then last thing is to update `config/deploy/production.rb`. This file will contains informations about you production server. So we need to update `server` directive:

```rb
server "vps-1bf61d44.vps.ovh.net", user: "debian", roles: %w{app db web}
```

My case is really simple, I don't use an SSH key or any specific role for this server. But if you want to, Capistrano have [much more settings](https://capistranorb.com/documentation/getting-started/authentication-and-authorisation/).

### Try it out

At this point, everything is ready.

We need to push all changes to the repository before going further because Capistrano will clone the repository and run the configuration from there.

```bash
git add .
git commit -m "Setup Capistrano"
git push origin
```

Once you did it, you'll be able to deploy the project:

```bash
cap production deploy
```

At this point, you should see some changes on the server:

- a folder in `/var/www/killer/releases/$timestamp`, containing the Git repository with shared files as symlinks
- a symlink in `/var/www/killer/current` who points to `/var/www/killer/releases/$timestamp`

## Setup web server

Let's go back again on the server side to configure the Web server properly.

### Install Phusion Passenger

As I said, [Passenger][passenger] is one way to run Ruby code on [Apache][apache]. There is other way but I do like [Passenger][passenger] because it's an Open Source software.

Also, [Passenger][passenger] have a really great documentation. To Install it, you just need to follow this guide: https://www.phusionpassenger.com/library/install/apache/install/oss/ .

NOTE: I prefer to avoid copy/paste the tutorial from [Passenger][passenger] because he may change.

### Setup Apache HTTP server

Now you setup [Passenger][passenger], the hardest part remains: setup Apache. Hopefully, I have a template for you.

So create a new file `killer.rsseau.fr.conf` in `/etc/apache2/sites-available/`

```bash
sudo vim /etc/apache2/sites-available/killer.rsseau.fr.conf
```

... and paste the following content:

```conf
ServerName DefaultServer
DocumentRoot /var/www
PassengerDefaultRuby /home/debian/.rvm/wrappers/ruby-3.1.2/ruby

<VirtualHost *:80>
  # RAILS CONF

  # tell to Passenger which Ruby binary he need to use
  PassengerRuby /home/debian/.rvm/wrappers/ruby-3.1.2/ruby
  # setup rails environment
  RailsEnv production

  # APACHE CONF

  # basic configuration of your webserver
  ServerName killer.rsseau.fr
  ServerAlias www.killer.rsseau.fr
  ServerAdmin alexandre@rsseau.fr
  # setup HTTP2 (not mandatory but better)
  Protocols h2 http/1.1
  # setup log, one file per day (not mandatory but better)
  ErrorLog ${APACHE_LOG_DIR}/killer_fr_error.log
  CustomLog "|/usr/bin/rotatelogs -f /var/log/apache2/killer.access.%Y-%m-%d.log 86400" combined

  # FOLDER CONF

  # serve you current version of the project
  DocumentRoot /var/www/killer/current/public/
  <Directory "/var/www/killer/current">
    Options FollowSymLinks
    Allow From All
    Require all granted
    Options -Indexes
  </Directory>

  # use apache to serve static files to improve perf
  Alias / "/var/www/killer/current/public/"
  <Directory "/var/www/killer/current/public/">
          Options FollowSymLinks
  </Directory>
</VirtualHost>
```

After that, you can activate your configuration using `a2ensite`

```bash
sudo a2ensite killer.rsseau.fr.conf
```

And finally restart Apache to load the new configuration

```bash
sudo /etc/init.d/apache2 restart
```

To test your new application, you can try to navigate on your website using your browser or using `cURL` like an hacker:

```bash
curl http://killer.rsseau.fr
```

Voilà!

### Troubleshooting

At this point, shit may happens. So you need to to watch log to see your error. Log may appears on many files:

- `/var/log/apache2/error.log`
- `/var/log/apache2/killer_fr_error.log`
- `/var/www/killer/current/log/production.log`

If recommend to run this snippet to watch all them at once:

```bash
tail -f /var/log/apache2/error.log /var/log/apache2/killer_fr_error.log /var/www/killer/current/log/production.log
```

## Conclusion

Nowadays, deploy a Rails application is "easy".

Lot's of developer use a tool like [Heroku][heroku] to quickly deploy a Rails application. There is nothing bad with that. But **I don't want to depend on an external service** for my application. Also, when you know how to deploy a Rails application yourself, it can be quicker than do it with [Heroku][heroku]. Do it yourself is a good way to **improve you DevOps skills and save money**. I host many websites on 3€ per month VPS server where [Heroku start plan cost $7 per month](https://www.heroku.com/pricing) (and grow fast).

But don't get me wrong, [Heroku][heroku] solutions have some pros. It provides a quick way to make your application scalable: you just have to pay more. Also, if you host your application yourself, you'll need to [monitor logs of your web server](https://rsseau.fr/fr/2020-03-02-rapport-automatique-avec-goaccess/), backup the database, upgrade [Apache HTTP server][apache] regularly... Heroku can handle that for you.

It's up to you to choose the right answer.

You can go further in self hosting with these topics:

1. setup HTTPS using [Certbot](https://certbot.eff.org/)
2. use an another database server (even if [sqlite may be sufficient](https://www.sqlite.org/whentouse.html))
3. do a backup using a CRONtab

[capistrano]: https://capistranorb.com/
[passenger]: https://www.phusionpassenger.com/
[apache]: https://httpd.apache.org/
[ror]: https://rubyonrails.org/
[sqlite]: https://www.sqlite.org/
[rvm]: https://rvm.io/
[heroku]: https://www.heroku.com/
