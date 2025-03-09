---
title: Run Sidekiq on a VPS with Systemd
description: TODO
tags:
  - ruby
  - rails
  - devops
lang: en
date: 2024-05-13T23:30:00
---

Create a file `/etc/systemd/system/isignif_production_sidekiq.service`

```systemd
[Unit]
Description=isignif_production_sidekiq
After=syslog.target

[Service]
Type=simple
WorkingDirectory=/var/www/isignif/current
ExecStart=/home/isignif/.rvm/rubies/ruby-3.2.7/bin/bundle exec sidekiq
User=isignif
Group=isignif
UMask=0002
RestartSec=1
Restart=on-failure
Environment=RAILS_ENV=production
# put content of `echo $PATH` to add RVM
Environment=PATH=/home/isignif/.rvm/gems/ruby-3.2.7/bin:/home/isignif/.rvm/gems/ruby-3.2.7@global/bin:/home/isignif/.rvm/rubies/ruby-3.2.7/bin:/home/isignif/.rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin

[Install]
WantedBy=multi-user.target
```

Run the service with

```sh
sudo systemctl start isignif_production_sidekiq.service
```

You can get the logs using

```sh
journalctl -u isignif_production_sidekiq.service
```
