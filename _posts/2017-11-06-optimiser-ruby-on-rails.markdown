---
layout: post
title:  Optimiser Ruby on Rails
description:  Participez au développement de votre navigateur preéferé
date:   2017-11-06 12:00:00 +0200
tags: ruby rails
categories: development
---

Récement, j'ai remarqué que la page principe de mon site https://raspberry-cook.fr/recipes répondait en 1,30 seconde! L'impacte sur le **réferencement** est gravissime.

![Capture d'écran de l'outil SpeedInsight de Google](/img/blog/pagespeedinsights_raspberry_cook.png)

> Le temps de réponse de votre serveur ne devrait pas dépasser 200 ms. *Google - PageSpeed Tools*

C'est bien connu: **Ruby on Rails est lent**! Mais si [Github](https://github.com/), [Airbnb](https://airbnb.fr) et [Soundcloud](https://soundcloud.com) arrivent à utiliser Rails, c'est bien qu'il est possible de l'utiliser sans saccrifier les performances.

J'ai donc commencé ma quête d'optimisation des performances (spoiler: Apache est votre ami).

--- Content Here

Cette fonction était appelée 20 fois sur la page. Cette modification m'a fait gagner 200ms.

## Utiliser Apache pour servir les fichiers Statiques

### La distribution

On sait que **Ruby On Rails** n'est pas réputé pour sa rapidité donc autant éviter de l'utiliser pour servir les fichiers statiques (images, css, javascript, etc..).

Pour cela on éditer la configuration de notre application Rails:

~~~ruby
# config/environments/production.rb
config.serve_static_files = false
~~~

Et on modifie notre **Vhost Apache** et ajoutant la directive suivante

~~~conf
Alias / "/var/www/raspberry_cook/current/public/"
<Directory "/var/www/raspberry_cook/current/public/">
  Options FollowSymLinks
</Directory>
~~~

### La mise en cache

On continue d'exploiter au maximum Apache et on active la mise en cache des images servies. On commence par activer deux modules:

~~~bash
$ sudo a2enmod expires
$ sudo a2enmod headers
~~~

Et on rajoute une directive de cache pour les images.

~~~conf
<FilesMatch "\.(jpg|jprg|png|gif)$">
  ExpireActive on
  ExpireDefault "modification plus 1 seconde"

  Header set Cache-Control "max-age=604800, public"
  FileETag All
</FilesMatch>
~~~

## Utiliser la bonne version de Ruby

Lors de la [migration de mon application vers mon Raspberry PI 3](http://rousseau-alexandre.fr/development/2017/09/22/Migrer-une-application-Rails-vers-MariaDB.html), j'ai utilisé [RVM](https://rvm.io/) pour installer Ruby. Sans trop réflechir, j'ai installé la dernière version de Ruby, c'est à dire la 2.4.J'ai observé d'énorme latences sur mon environnement de développement. Le moinde `rake -T` met quelques secondes à s'afficher...

La Documentation est très claire sur la version à utiliser.

> Rails 4 prefers Ruby 2.0 and requires 1.9.3 or newer. [Ruby on Rail Documentation](http://guides.rubyonrails.org/upgrading_ruby_on_rails.html#ruby-versions)

Le changement se fait très rapidement avec RVM:

~~~bash
$ rvm install 2.0
$ gem install bundler
$ bundle install
$ gem install passenger
$ passenger-install-apache2-module
~~~

Quelques minutes plus tard, vous obtenez quelques lignes à ajouter à votre fichier _/etc/apache2/apache2.conf_

~~~bash
LoadModule passenger_module /home/pi/.rvm/gems/ruby-2.0.2/gems/passenger-5.1.11/buildout/apache2/mod_passenger.so
<IfModule mod_passenger.c>
  PassengerRoot /home/pi/.rvm/gems/ruby-2.0.2/gems/passenger-5.1.11
  PassengerDefaultRuby /home/pi/.rvm/gems/ruby-2.0.2/wrappers/ruby
</IfModule>
~~~

Et on r

~~~bash
$ rvm install 2.0
$ gem install bundler
$ bundle install
$ gem install passenger
$ passenger-install-apache2-module
~~~