---
date: 2022-08-29T08:02:30.147Z
title: Deployer une application Rails avec Capistrano et Phusion Passenger
description: A step by step guide to self-host a Ruby on Rails application
tags:
  - rails
  - apache
  - capistrano
lang: fr
translations:
  en: deploy-rails
modified: 2022-08-29T08:15:59.861Z
---

Récemment, j'ai déployé une application [Ruby on Rails][ror] sur mon petit VPS: <https://killer.rsseau.fr> . C'est toujours un peu complexe à faire car il faut penser à pas mal de choses. Dans cet article, je vais retracer tout ce que j'ai fais.

Dans mon cas, j'ai la _stack_ suivante:


- Serveur Linux sous Debian 9
- [Apache HTTP server][apache]
- [Phusion Passenger][passenger], il s'agit d'un moyen d'éxécuter du Ruby
- [RVM][rvm] en tant que _Ruby version manager_
- [Ruby on Rails 6][ror]
- [SQlite][sqlite] en tant que base de données simple pour ne pas me prendre la tête

Si tu as une _stack_ un peu différente, la mise en place peut être un peu différente mais elle restera très similaire.



Pour automatiser le déploiement, j'utiliserai [Capistrano][capistrano]. Capistrano va s’occuper de plein de choses pour nous:

1. se connecter en SSH au serveur
2. cloner la dernière version du projet GIT
3. installer les dépendances, lancer les migrations, construire les _assets_, etc..
4. créer des _symlink_ pour les fichiers partagés (ex: `production.sqlite`, `master.key`, database, etc..)

Ca demande un peu de travail pour le mettre en place, mais crois moi: ça vaut le coup. Une fois mis en place, une commande est suffisante pour déployer une nouvelle version de ton site.

## Mise en place du serveur

### `/var/www`

On va commencer par créer quelques dossier dans `/var/www`. Ce dossier contient tout le code de ton site afin qu'Apache puisse le faire fonctionner.

```sh
sudo mkdir /var/www/killer
```

Vu que Capistrano et Apache on besoin d'avoir accès à ce dossier, on va faire en sorte que ce dossier appartienne à l'utilisateur courant (`debian` dans mon cas):

```sh
sudo chown debian /var/www/killer
```

Ensuite, on va créer le dossier `shared`. Capistrano va utiliser ce dossier en faisant des liens symboliques lors des nouvelles _releases_. Je vais aussi créer les dossiers `shared/config` et `shared/config/credentials` (nous les utiliserons juste ensuite):

```sh
mkdir -p /var/www/killer/shared/
mkdir -p /var/www/killer/shared/config/credentials
mkdir -p /var/www/killer/shared/db
```

Dans mon cas, je veux ajouter les fichiers `master.key`, `production.key` (qui ne sont pas suivit dans le projet Git). Je vais le faire avec `scp`

```sh
# on local env
scp config/master.key user@server:/var/www/killer/shared/config/master.key
scp config/credentials/production.key user@server:/var/www/killer/shared/config/credentials/production.key
scp db/production.sqlite user@server:/var/www/killer/shared/db/production.sqlite
```

J'ai aussi besoin de créer une base de données [SQlite][sqlite]. Celle-ci sera partagé lors des nouvelles _release_ afin que les données persistent:

```sh
sqlite3 /var/www/killer/shared/db/production.sqlite
sqlite> SELECT 1;
sqlite> .exit;
```

NOTE: SQLite a besoin de lancer une requête pour que la base de données soit créées. C'est pour cela que j'ai lancé `SELECT 1;`.

### Installer Ruby

Maintenant on a besoin d'installer la même version de Ruby que celle utilisée par le projet. La façon la plus simple de faire est d'utiliser un manager de version Ruby

Dans l’écosystème de Ruby, il en existe deux: [Rbenv](https://github.com/rbenv/rbenv) & [RVM][rvm]. J'utilise ce dernier.

Donc, si tu n'as pas encore installé [RVM][rvm], clique sur [ce lien][rvm] et laisse toi guider par la documentation. Ensuite, installe la version de Ruby en executant:

```sh
rvm install 3.1.2
```

Et on est bon pour le moment

## Mise en place de [Capistrano][capistrano]

Nous allons maintenant installer [Capistrano][capistrano] et quelques plugins nécessaires dans notre cas:

```sh
bundle add capistrano --group development
bundle add capistrano-rvm --group development
```

Maintenant que [Capistrano][capistrano] est installé, nous pouvons l'initialiser pour notre projet:

```sh
cap install
```

Tu dois désormais voir que certains fichiers on été créés.

### `Capfile`

Le premier fichier à modifier est `Capfile`. Ce fichier est responsable de charger les plugins. On a juste besoin d'ajouter quelques `require`s

```rb
# Capfile
# ...
require "capistrano/deploy"
require 'capistrano/rails'
require "capistrano/bundler"
require "capistrano/rvm"
```

### `deploy.rb`

Maintenant passons au fichier `config/deploy.rb`. Ce fichier contient la configuration du déploiement que nous allons effectuer en production.

On va commencer par ajouter quelques paramètre de notre serveur distant:

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

La dernière étape est de lister les fichiers qui seront partagés entre chaque déploiements. Attention car ces fichiers doivent être présents dans le dossier `share` du serveur (heureusement, nous les avons créés dans la section précédente).

```rb
# config/deploy.rb
# ...
# every shared file we need
append :linked_files, 'config/master.key', 'config/credentials/production.key', 'db/production.sqlite'
```

### `production.rb`

Le dernier fichier est `config/deploy/production.rb`. Ce fichier contient les informations de connexion au serveur. Nous allons juste mettre à jour la directive `server`:

```rb
server "vps-1bf61d44.vps.ovh.net", user: "debian", roles: %w{app db web}
```

Mon cas d'usage est vraiment très simple, je n'utilise pas de clé SSH ou de rôle spécifique pour l'utilisateur. Mais sache que Capistrano te propose [beaucoup plus de paramètres](https://capistranorb.com/documentation/getting-started/authentication-and-authorisation/) pour t'aider à te connecter au serveur.

### Premier essai

Maintenant, tout est prêt! Essayons donc d'effectuer un déploiement.

La première chose à faire avant d'aller plus loin est de pousser les modifications sur le _repository_ GIT. En effet, Capistrano va cloner le projet sur le serveur et executer le code depuis le clone. On a donc besoin qu'il prenne en compte nos modifications:

```sh
git add .
git commit -m "Setup Capistrano"
git push origin
```

Une fois que c'est fait, tu peux lancer le déploiement sur la production:

```sh
cap production deploy
```

Si ça a marché, tu devrais voir apparaître des nouveaux fichier sur le serveur:


- un dossier `/var/www/killer/releases/$timestamp` qui contient le code du projet et les liens symboliques
- un lien symbolique `/var/www/killer/current` qui pointe vers `/var/www/killer/releases/$timestamp`

## Configuration du serveur

Revenons à nouveau au serveur afin qu'on le configure pour exécuter notre projet.

### Installer [Phusion Passenger][passenger]

Comme je l'ai dit plus haut, [Passenger][passenger] est un moyen parmi tant d'autres de servir une application Rails avec [Apache][apache]. J'ai choisi [Passenger][passenger] parce qu'il est Open Source et facile à mettre en place.

Aussi, [Passenger][passenger] a une excellente documentation. Pour l'installer, il suffit de suivre [ce tutoriel](https://www.phusionpassenger.com/library/install/apache/install/oss/).

NOTE: Je préfère éviter de copier/coller le tutoriel de [Passenger][passenger] ici car il est amené à changer.

### Configuration de [Apache HTTP server][apache]

Maintenant que [Passenger][passenger] est prêt, la partie la plus délicate nous attend: configurer Apache. Ne t'inquiètes pas, j'ai un _template_ pour toi!

Créé un fichier `killer.rsseau.fr.conf` dans `/etc/apache2/sites-available/`

```sh
sudo vim /etc/apache2/sites-available/killer.rsseau.fr.conf
```

... et colle ce contenu:

```apache
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

Ensuite, tu devrais pouvoir activer cette configuration avec `a2ensite`

```sh
sudo a2ensite killer.rsseau.fr.conf
```

Et pour terminer, tu dois redémarrer ton serveur pour prendre en compte les changements:

```sh
sudo /etc/init.d/apache2 restart
```

Pour tester que tout fonctionne, tu peux ouvrir ton navigateur ou utiliser `cURL` comme un hacker:

```sh
curl http://killer.rsseau.fr
```

Voilà!

### Troubleshooting

A ce moment, beaucoup de problèmes diverses peuvent survenir. Les logs peuvent arriver dans divers fichiers:

- `/var/log/apache2/error.log`
- `/var/log/apache2/killer_fr_error.log`
- `/var/www/killer/current/log/production.log`

Je recommande de tous les regarder au début pour voir si un problème est détecté:

```sh
tail -f /var/log/apache2/error.log /var/log/apache2/killer_fr_error.log /var/www/killer/current/log/production.log
```

## Conclusion

De nos jours, déployer une application Rails est "facile".

Beaucoup de développeurs utilisent un outil comme [Heroku][heroku] pour déployer rapidement une application Rails. Il n'y a rien de mal à cela. Mais **je ne veux pas dépendre d'un service externe** pour mon application. De plus, lorsque tu sais comment déployer toi-même une application Rails, c'est plus rapide que de le faire avec [Heroku][heroku]. Faire soi-même est un bon moyen de **améliorer tes compétences DevOps et d'économiser de l'argent**. J'héberge de nombreux sites Web sur des serveurs VPS à 3 € par mois, alors que [le plan de démarrage de Heroku coûte 7 $ par mois](https://www.heroku.com/pricing) (et coûte rapidement plus cher).

Mais ne te méprends pas, les solutions [Heroku][heroku] ont des avantages. Elles offrent un moyen rapide de _scaler_ ton application: tu dois juste payer plus cher. Aussi, si tu héberge ton application toi-même, tu dois [surveiller les journaux de votre serveur web](https://rsseau.fr/fr/2020-03-02-rapport-automatique-avec-goaccess/), sauvegarder la base de données, mettre à jour le [serveur HTTP Apache][apache] régulièrement... Heroku peut s'en charger pour toi.

C'est à toi de choisir la bonne réponse.

Tu pouvez aller plus loin dans l'auto-hébergement avec ces sujets :

1. configurer HTTPS en utilisant [Certbot](https://certbot.eff.org/)
2. utiliser un autre serveur de base de données (même si [sqlite peut être suffisant](https://www.sqlite.org/whentouse.html))
3. faire une sauvegarde en utilisant une CRONtab

[capistrano]: https://capistranorb.com/
[passenger]: https://www.phusionpassenger.com/
[apache]: https://httpd.apache.org/
[ror]: https://rubyonrails.org/
[sqlite]: https://www.sqlite.org/
[rvm]: https://rvm.io/
[heroku]: https://www.heroku.com/
