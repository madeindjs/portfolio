---
layout: post
title:  Optimiser Ruby on Rails
description:  Participez au développement de votre navigateur preéferé
date:   2017-11-06 12:00:00 +0200
tags: ruby rails
categories: development
---

Récemment, j'ai remarqué que la page principale de mon site [https://raspberry-cook.fr/recipes](https://raspberry-cook.fr/recipes) répondait en 1,30 seconde! L'impacte sur le référencement est **gravissime**.

> Le temps de réponse de votre serveur ne devrait pas dépasser 200 ms.
>
> *Google - [PageSpeed Tools](https://developers.google.com/speed/pagespeed/insights/)*

![Capture d'écran de l'outil SpeedInsight de Google](/img/blog/pagespeedinsights_raspberry_cook.png)

C'est bien connu: **Ruby on Rails est lent**! Ceci notamment à cause de:

* **Ruby** qui un langage **interprété** dynamiquement & faiblement typé. Donc lent
* **Ruby on Rails** qui gère beaucoup de choses pour nous en sacrifiants les performances

Mais si [Github](https://github.com/), [Airbnb](https://airbnb.fr) et [Soundcloud](https://soundcloud.com) arrivent à utiliser Rails, c'est bien qu'il est possible de l'utiliser sans sacrifier les performances.

J'ai donc commencé ma quête d'optimisation des performances (spoiler: Apache est votre ami).


## Les requêtes N+1

Déja fait ;)


## La consommation mémoire

Ici il n'y pas de règle particulière mais il faut éviter le chargement d’objets Active Record pour rien.


Ma classe `Recipe` représente une recette qui peut-être notée par des commentaires (= `Comment`). J'ai implémenté une fonction `rate` qui calcule la moyenne des notes.
Un peu naif, j'ai utilisé toute la puissance d' *Active Record* et je chargeai toutes le liaisons:

~~~ruby
class Recipe
  has_many :comments

  def rate
    rates = []
    self.comments.each{|com| rates.append com.rate}
    return rates.size > 0 ? rates.reduce(:+) / rates.size.to_f : 0
  end

end
~~~

Ca fonctionne bien et le code est *(assez)* parlant. Le problème est que:

* On fait du N+1 (voir plus haut)
* On récupère beaucoup d'objets juste pour faire une moyenne

Le chargement des objets va créer des variables pour stocker **toutes** les informations des commentaires (`name`, `content`, `user_id`, `recipe_id`, etc...). Nous n'avons pas besoin de tout cela. Ici nous pouvons nous contenter d'utiliser la fonction SQL [`AVG`](http://sql.sh/fonctions/agregation/avg) qui fait la moyenne pour nous.


~~~ruby
def rate
  sql = "SELECT AVG(rate) as rate FROM comments WHERE recipe_id = :recipe_id"
  statement  = ActiveRecord::Base.connection.raw_connection.prepare sql
  results = statement.execute({recipe_id: self.id})
  average = results.first['rate'].to_i
  statement.close
  return average
end
~~~


OK, c'est moins sexy. Mais cela nous évite de charger X objets `Comment`. Cette fonction était appelée plus de 20 fois sur la page. Cette modification m'a fait **gagner 200ms**.

## Les images

On sait que **Ruby On Rails** n'est pas réputé pour sa rapidité donc autant éviter de l'utiliser pour servir les fichiers statiques (images, css, javascript, etc..).

### Utiliser Apache pour servir les fichiers Statiques

La première optimisation est d'utiliser les serveur pour servir les fichiers statiques. Pour **Apache** on édite la configuration de notre application Rails:

~~~ruby
# config/environments/production.rb
config.serve_static_files = false
~~~

Et on modifie notre **Vhost** en ajoutant la directive suivante

~~~apache
Alias / "/var/www/raspberry_cook/current/public/"
<Directory "/var/www/raspberry_cook/current/public/">
  Options FollowSymLinks
</Directory>
~~~


### Le lazy-loader

Il est possible d'utiliser un **LazyLoader** JavaScript. Celui va s'occuper de charger les images uniquement lorsqu'elles sont visibles par le navigateur. Dans nos balises `<img />` Nous définissons un attribut `data-src` qui sera définit comme source de l'image sera affichée.

Le gem [**lazyload-rails**](https://github.com/jassa/lazyload-rails) vous simplifie la vie. Quelques secondes suffisent pour l'installer et il suffit d'activer l'option `lazy`.

~~~ruby
image_tag "kittenz.png", alt: "OMG a cat!", lazy: true
# <img alt="OMG a cat!" data-original="/images/kittenz.png" src="http://www.appelsiini.net/projects/lazyload/img/grey.gif">
~~~


## Utiliser la bonne version de Ruby

Lors de la [migration de mon application vers mon Raspberry PI 3](http://rousseau-alexandre.fr/development/2017/09/22/Migrer-une-application-Rails-vers-MariaDB.html), j'ai utilisé [RVM](https://rvm.io/) pour installer Ruby. Sans trop réfléchir, j'ai installé la dernière version de Ruby, c'est à dire la 2.4.J'ai observé d'énorme latences sur mon environnement de développement. Le moindre `rake -T` met quelques secondes à s'afficher...

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

~~~apache
LoadModule passenger_module /home/pi/.rvm/gems/ruby-2.0.2/gems/passenger-5.1.11/buildout/apache2/mod_passenger.so
<IfModule mod_passenger.c>
  PassengerRoot /home/pi/.rvm/gems/ruby-2.0.2/gems/passenger-5.1.11
  PassengerDefaultRuby /home/pi/.rvm/gems/ruby-2.0.2/wrappers/ruby
</IfModule>
~~~

Et on redémarre Apache

~~~bash
$ sudo /etc/init.d/apache restart
~~~
