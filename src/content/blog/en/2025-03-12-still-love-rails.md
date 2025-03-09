---
title: I still love my boring Ruby on Rails app
description: Quick reflexion about maintaining a Ruby on Rails project in 2025
tags:
  - ruby
  - rails
  - devops
lang: en
translations:
  fr: still-love-rails
date: 2025-03-12T12:30:00
---

I started [iSignif](https://isignif.fr), almost 8 years ago. Initially, it was a cool SAAS project powered by one of the most trendy stack: [Ruby on Rails](https://rubyonrails.org/).

Almost 8 years later, I think my stack joined [the boring technology club](https://boringtechnology.club/), and I'm still happy to maintain this project!

## The framework

When I initialized the project, I went with the latest version of Ruby on Rails 5.2 / Ruby 2.4.2.

![The initial commit of my project](../../../assets/img/blog/isignif-first-commit.png)

Rails amazes me about how easy it is to upgrade to major versions. I upgraded from `v5.x` to `v6.x`, then `7.x` and finally `v8.0` with ease.

My own expersient was just by bumping the Rails version in the `Gemfile`, run `rails app:update`, and run my test suite. `app:update` takes care of setting new default configuration parameters that I take care of review. All deprecated feature are often announced in the previous version

![List of configuration files for Rails versions](../../../assets/img/blog/isignif-rails-bumps.png)

Compared to my experience with other frontend stack in "Frontend world", it's a breeze:

1. I [remember give up](/fr/blog/go-back-to-jekyll) on upgrading [Gatsby](https://www.gatsbyjs.com/) for my personal website
2. I had a hard time with [Nest.js](https://nextjs.org/) and their new `app` directory on my side project <https://the-killer.online/>

Definitely, Ruby on Rails is not a popular choice nowadays. I don't see many posts about Rails applications on [Hacker news](https://news.ycombinator.com/), and [this Google trend](https://trends.google.com/trends/explore?cat=13&date=all&q=%2Fm%2F0505cl,%2Fg%2F11h4q9rcf3,%2Fm%2F0jwy148&hl=en) of Rails vs other popular choices confirm the situation...

![Google trend of Ruby on Rails vs other popular choices](../../../assets/img/blog/rails-trend.png)

I won't lie, it's difficult to resist the hype, and I thought many times about doing a big rewrite of the APP using a new technology like [Nuxt](https://nuxt.com/). I'm still not happy to manage plain HTML/ERB templating, espicially touching Vue.js application professionally, but it does the job.

**But I think that, when a project requires stability, a boring framework is a better choice.**.

## The server

Back in the day, you just needed a Linux server to host your application (the classic [LAMP stack](<https://en.wikipedia.org/wiki/LAMP_(software_bundle)>)). It's almost how I started the iSignif startup.

But then, the trend became to use a PAAS service like [Heroku](https://www.heroku.com/), that handles everything for you. Later, it became [Docker](https://docker.com/) / Kubernetes and a cloud provider like [Google Cloud](https://cloud.google.com/) to make it scalable. And tomorrow, it'll be something else for sure.

For my project, I stayed on the same VPS server I ordered 8 years ago.

![Screenshot of the VPS I rent on OVH](../../../assets/img/blog/isignif-ovh.png)

Powered by Ubuntu 18.04, it's really a simple Linux server with [Apache server with Phusion Passenger](/en/blog/deploy-rails). Again, it does the job. Of course, I had to put some effort in it:

- I upgraded my Server to Ubuntu 20 and then 22.
- ordered an additional hard drive and move assets on it
- did some Bash scripts for the backup running with cron
- [automate some startup scripts with Systemd](/en/blog/sidekiq-on-vps)

But it was really rewarding to do everything myself, I learned a lot from that. But most importantly, it helped us to keep the hosting cost low. Actually, the server cost me around 10€/month. So it permitted us to host the service even when we had few revenues.

## My feeling

From my (small) experience, I found that launching a SAAS is a long run journey. Especially when you're doing it part-time. So you need to chose your fight and focus on what matter.

Doing it helped me to forge my own opinion on the developer role. I now think that the main thing to keep in mind is to think about the startup goal, not the technology.

Will I restart a Ruby on Rails project today? Most likely not; there are countless mature and more exciting technologies nowadays. But I'm really proud of the journey I had with Ruby. I think I made the right choice 8 years ago.
