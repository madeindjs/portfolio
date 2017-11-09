---
layout: post
title:  Optimiser Ruby on Rails
description:  Participez au développement de votre navigateur preéferé
date:   2017-11-06 12:00:00 +0200
tags: ruby rails
categories: development
---

Récement, j'ai remarqué que la page principale de mon site [https://raspberry-cook.fr/recipes](https://raspberry-cook.fr/recipes) répondait en 1,30 seconde! L'impacte sur le réferencement est **gravissime**.

> Le temps de réponse de votre serveur ne devrait pas dépasser 200 ms. *Google - [PageSpeed Tools](https://developers.google.com/speed/pagespeed/insights/)*

![Capture d'écran de l'outil SpeedInsight de Google](/img/blog/pagespeedinsights_raspberry_cook.png)

C'est bien connu: **Ruby on Rails est lent**! Ceci nottament à cause de:

* **Ruby** qui un langage **interprété** dynamiquement & faiblement typé. Donc lent
* **Ruby on Rails** qui gère beaucoup de choses pour nous en sacrifiants les performances

Mais si [Github](https://github.com/), [Airbnb](https://airbnb.fr) et [Soundcloud](https://soundcloud.com) arrivent à utiliser Rails, c'est bien qu'il est possible de l'utiliser sans sacrifier les performances.

J'ai donc commencé ma quête d'optimisation des performances (spoiler: Apache est votre ami).


## Les requêtes N+1

> T'inquiètes pas, je m'occuppe de tout. *Active Record*

Active Record est formidable et gère tout pour nous. Maleuresement, il lance une requête SQL à chaque utilisation dynamique des liaisons. Et comme disait ma grand-mère:

> Une grosse requête SQL vaut mieux que plusieurs petites. 

Voici un exemple ou l'on veut récupérer tous les utilisateurs qui on déjà crée une recette. Sans réfléchir, on serait tenté de faire plus ou moins comme ça:

~~~ruby
users = Recipe.all.map{|recipe| recipe.user}
~~~

Mine de rien, ce petit bout de code va génerer un nombre impressionant de requêtes:

* `Recipe.all` = 1 * `SELECT "recipes".* FROM "recipes"`
* `recipe.user` = qty_recette * `SELECT  "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 1]]`

C'est là que `includes` vient à la rescousse en préchargeant les liaisons pour nous

~~~ruby
users = Recipe.includes(:user).all.map{|recipe| recipe.user}
# SELECT "recipes".* FROM "recipes"
# SELECT "users".* FROM "users" WHERE "users"."id" IN (1, 2)
~~~

Et voilà:

* `Recipe.all` = 1 * `SELECT "recipes".* FROM "recipes"`
* `recipe.user` = 1 *  * `SELECT "users".* FROM "users" WHERE "users"."id" IN (1, 2)`

## La consommation mémoire

Ici il n'y pas de règle particulière mais il faut éviter le chargement d'ojets Active Record pour rien.


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

Le chargment des objets va créer des variables pour stocker **toutes** les informations des commentaires (`name`, `content`, `user_id`, `recipe_id`, etc...). Nous n'avons pas besoin de tout cela. Ici nous pouvons nous contenter d'utiliser la fonction SQL [`AVG`](http://sql.sh/fonctions/agregation/avg) qui fait la moyenne pour nous.


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

## Utiliser Apache pour servir les fichiers Statiques

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