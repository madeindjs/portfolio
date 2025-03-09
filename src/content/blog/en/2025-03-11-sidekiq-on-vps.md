---
title: Run a process on a Linux server with Systemd
description: How to properly start and monitor process on the server startup
tags:
  - ruby
  - rails
  - devops
lang: en
date: 2025-03-11T23:30:00
---

For [iSignif](https://isignif.fr), I use [Sidekiq](https://sidekiq.org/) for background jobs like emails. I run it as a simple command like

```sh
bundle exec sidekiq
```

I want that this command at server start, and retry it if it fails. I found that an easy way is to use [Systemd](https://en.wikipedia.org/wiki/Systemd).

So I just had to create a new service. It's a simple file `/etc/systemd/system/isignif_production_sidekiq.service`

```systemd
# /etc/systemd/system/isignif_production_sidekiq.service

[Unit]
Description=isignif_production_sidekiq
After=syslog.target

[Install]
WantedBy=multi-user.target

[Service]
Type=simple
# the directory where I want to execute the command and the command
WorkingDirectory=/var/www/isignif/current
ExecStart=/home/isignif/.rvm/rubies/ruby-3.2.7/bin/bundle exec sidekiq

User=isignif
Group=isignif
UMask=0002
# failing strategy
RestartSec=1
Restart=on-failure
Environment=RAILS_ENV=production
# put content of `echo $PATH` to add RVM
Environment=PATH=/home/isignif/.rvm/gems/ruby-3.2.7/bin:/home/isignif/.rvm/gems/ruby-3.2.7@global/bin:/home/isignif/.rvm/rubies/ruby-3.2.7/bin:/home/isignif/.rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin

```

The main challenge I got was to make Systemd uses the Ruby version from [RVM](https://rvm.io/). The quick and dirty solution I found was to copy/paste the user's `$PATH` variable inside the `Environment` section like this

```systemd
Environment=PATH=/home/isignif/.rvm/gems/ruby-3.2.7/bin:/home/isignif/.rvm/gems/ruby-3.2.7@global/bin:/home/isignif/.rvm/rubies/ruby-3.2.7/bin:/home/isignif/.rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```

Once done, the service can be started as a single command like:

```sh
sudo systemctl start isignif_production_sidekiq.service
```

And you can get the logs using:

```sh
journalctl -u isignif_production_sidekiq.service
```
