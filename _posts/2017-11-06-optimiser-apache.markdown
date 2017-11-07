---
layout: post
title:  Optimiser Apache
description:  Participez au développement de votre navigateur preéferé
date:   2017-11-06 12:00:00 +0200
tags: ruby rails
categories: development
---

## Créer un container (Optionnel) 

Afin de realiser mes tests, j'ai crée un container à l'aide de [LXC](https://linuxcontainers.org/fr/) (**L**inu**x** **C**ontainer). Cela permet de créer un evinronnement indépendant de notre système afin de réaliser nos tests. On peut tout casser dessus sans crainte.

LXC s'installe très facilement avec un petit `apt install`

~~~bash
$ apt install lxc lxc-templates
~~~

Ensuite, on crée un container basé sur Debian:

~~~bash
$ sudo lxc-create --name apache -t debian
~~~

On démarre le container et on se connecte dessus:

~~~bash
$ sudo lxc-start  --name apache 
$ sudo lxc-attach --name apache
~~~

Nous voilà dans notre container ou nous ne risquont plus de casser quelque chose

## Instalation d'apache

Rien de bien sorcier, un petit `apt install` et c'est plié:

~~~bash
# apt install apache2
~~~

Afin de connaitre l'addresse IP de notre machine on lance un `ìfconfig` et on se rend sur l'adresse IP affiché et on obtient la page par défaut. On ouvre donc notre navigateur et on tape directement _http://<mon-ip>_. Une page d'acceuil apparait.

![Page par défaut d'Apache](/img/blog/debian_apache_works.png)

Ce n'est pas de la magie, cette page par défaut est situé ici. 

~~~plain
/var/www/
└── html
    └── index.html
~~~


## Création de notre projet

Nous savons donc que nos projets doivent être stockées dans dans _/var/www_. On crée notre projet _test.fr_ dans ce dossier avec une page d'acceuil _index.html_. On met le fichier dans un dossier _public_ pour séparer ce qui sera accessible /innaccessible  à tout le monde (c'est une bonne pratique). 

~~~bash
$ mkdir -p /var/www/test.fr/public
$ echo '<h1>Hello world</h1>' > /var/www/test.fr/public/index.html
~~~

Récupérons aussi la dernière version de [Twitter Bootstrap](http://getbootstrap.com) avec `curl`.

~~~bash
$ apt install curl
$ curl https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.css > /var/www/test.fr/public/twitter-bootstrap.css
~~~

Et on charge le CSS dans notre _index.html

~~~bash
$ echo '<link rel="stylesheet" href="twitter-bootstrap.css">' >> /var/www/test.fr/public/index.html
~~~

## Le Virtual Host

Pour accéder à notre site, nous allons créer un **Virtual Host** (= Vhost). Le **Vhost** nous permet d' **héberger plusieurs sites** sur un même serveur.

Pour cela, il suffit de créer une nouvelle configuration dans le dossier _/etc/apache2/sites-availables_. Ce dossier contient les configurations des sites disponnibles tandis que le dossier _/etc/apache2/sites-**enabled**_ contient les sites activées.

Nous ajoutons donc notre configuration:

~~~bash
$ vi /etc/apache2/sites-availables/test.fr.conf
~~~

.. et on rentre la configuration minimale:

~~~apache
<VirtualHost *:80>
  ServerName test.fr

  DocumentRoot /var/www/test.fr/public
</VirtualHost>
~~~

* `ServerName` est le **nom de domaine** qui sera utilisé pour faire correspondre une requête à un Vhost
* `DocumentRoot` est le **dossier racine** de notre site

Nous ne possédons pas le nom de domaine _test.fr_ mais on peut le simuler très facilement. Sur le PC client (celui qui visite le site), on va ajouter une entrée DNS au fichier _/etc/hosts_:

~~~bash
$ echo '10.0.3.146 test.fr' | sudo tee --append /etc/hosts
~~~

> en remplaçant bien évidement par votre adress IP


On termine par activer notre configuration. On utilise `a2ensite` qui va s'occuper de créer un **lien symbolique** de notre fichier de configuration dans le dossier *sites-enabled*.

~~~bash
$ a2ensite test.fr
~~~

Il suffit de redemmarer notre serveur Apache.

~~~bash
$ systemctl reload apache2
~~~

Et de se rendre sur [http://test.fr](http://test.fr).

![Page d'acceuil de test.fr](/img/blog/debian_apache_hello_world.png)

## La compression

La compression permet d'économiser de la bande passante en comprimmant les données (HTML, CSS, Javascript, etc..). L'bjectif est de compresser les données avant de les envoyer. Le navigateur du client s'occupera de les décompresser avant de les interpréter.

Cette fonctionnalité demande l'activation du module [mod_deflate](http://httpd.apache.org/docs/2.0/mod/mod_deflate.html). Pour cela on utilise `a2enmod`:

~~~bash
$ a2enmod headers deflate
~~~

On ajoute maintenant une nouvelle directive à notre fichier de configuration _test.fr.conf_.

~~~bash
$ vi /etc/apache2/sites-availables/test.fr.conf
~~~

~~~apache
# activation du module de compression
<IfModule mod_deflate.c>
  SetOutputFilter DEFLATE
  DeflateCompressionLevel 9

  # compression des fichiers HTML / CSS
  <Location />
   AddOutputFilterByType DEFLATE text/html
   AddOutputFilterByType DEFLATE text/css
  </Location>
</IfModule>
~~~

Et il suffit de rédemarrer Apache

~~~bash
$ systemctl reload apache2
~~~

Sur le PC client, ouvrez l'inspecteur réseaux avec <kbd>F12</kbd> et actualisez la page.

![Page d'acceuil de test.fr](/img/blog/debian_apache_deflate.png)

L'inspecteur nous inqique que sur 155,54 ko, **21,31 ko ont été transférés**! Il s'agit donc d'un gain à ne pas négliger car il fera la différence pour les petites connections.

## La mise en cache

Quoi de mieux que de réduire la taille des fichiers? Utiliser le cache du navigateur pour ne pas les envoyer! Apache utilise deux modules pour ça.

* `headers` qui permet de modifier l'en-tête des réponses
* `expires` qui ajoute l'entête expires

On commence par activer deux modules:

~~~bash
$ a2enmod expires headers
~~~

Tout d'abord  ilf faut rajouter la directive `ExpiresActive on` pour activer l'option et on utilise `ExpireDefault` pour spécifier le temps de mise en cache:

* `A10` pour le garder 10 secondes en cache **après le dernier accès**
* `M60` pour le garder 1 minutes en cache **après la dernière modification**

 Et on rajoute une directive de cache pour les images.

~~~conf
<IfModule mod_expires.c>
  Header append Cache-Control public
  ExpiresActive on
  ExpiresDefault A30
</IfModule>
~~~

