---
layout: post
title:  Optimiser Apache
description:  Participez au développement de votre navigateur preéferé
date:   2017-11-06 12:00:00 +0200
tags: ruby rails
categories: development
---

Apache est un serveur HTTP distribué sous licence libre. Avec quasiment [50% de part de marché](https://www.developpez.com/actu/129511/Serveurs-Web-Nginx-detient-desormais-un-tiers-des-parts-de-marche-tandis-qu-Apache-chute-en-dessous-des-50-pourcent-d-apres-W3Tech/) c'est un des serveur web les plus populaire.

Ses avantages sont:

* **open-source** et gratuit
* énormément de **ressources** disponnibles sur internet
* **dsiponnible** partout, sur toutes les plateformes


Voici donc quelques étapes pour apprendre à blabla


## Créer un container *(Optionnel)* 

Afin de realiser mes tests, j'ai crée un container à l'aide de [LXC](https://linuxcontainers.org/fr/) (**L**inu**x** **C**ontainer). Cela permet de créer un evinronnement indépendant de notre système afin de réaliser nos tests. On peut tout casser dessus sans crainte.

LXC s'installe très facilement avec un petit `apt install`

~~~bash
$ apt install lxc lxc-templates debootstrap
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
$ apt install apache2
~~~

Afin de connaitre l'addresse IP de notre machine on lance un `ìfconfig`. On ouvre donc notre navigateur et on tape directement _http://mon-ip_. La page d'acceuil par défaut apparait!

![Page par défaut d'Apache](/img/blog/debian_apache_works.png)

Ce n'est pas de la magie, la page par défaut est située ici. 

~~~plain
/var/www/
└── html
    └── index.html
~~~


## Création de notre projet

Nous savons donc que nos projets doivent être stockées dans dans **/var/www**. Nous allons créer notre projet _test.fr_ directement dans ce dans ce dossier. 

~~~bash
$ mkdir -p /var/www/test.fr/public
~~~

> Nous créeons un dossier _public_ pour séparer ce qui sera accessible de ce qui sera innaccessible à tout le monde. C'est une bonne pratique 

Maintenant on crée le fichier _index.html_. 

~~~bash
$ echo '<h1>Hello world</h1>' > /var/www/test.fr/public/index.html
~~~

Et afin d'avoir du CSS, on rajoute la dernière version de [Twitter Bootstrap](http://getbootstrap.com) en utilisant `curl`.

~~~bash
$ apt install curl
$ curl https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.css > /var/www/test.fr/public/twitter-bootstrap.css
$ echo '<link rel="stylesheet" href="twitter-bootstrap.css">' >> /var/www/test.fr/public/index.html
~~~

Si tout c'est bien déroulé (il n'y a pas de raison), vous devez avoir ça:

~~~plain
/var/www/test.fr/
└── public
    ├── index.html
    └── twitter-bootstrap.css
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

Quoi de mieux que de réduire la taille des fichiers? Utiliser le cache du navigateur pour ne pas les envoyer! 

Nous allons utiliser [PHP](http://php.net/) pour simuler une charge serveur. On commence par l'installer:

~~~bash
$ apt install php libapache2-mod-php
$ a2enmod php7.0
$ systemctl reload apache2
~~~

> La verison de PHP à activer peut différer en fonction de celle qui a été installée

Et on crée un petit script qui va retarder l'affichage de la page:

~~~bash
$ echo '<?php sleep(2); echo "loaded" ?>' > /var/www/test.fr/public/load.php
~~~

On se rend sur [http://test.fr/load.php](http://test.fr/load.php). La page met plus de deux secondes à s'afficher

![Affichage de test.fr/load.php sans mise en cache](/img/blog/debian_apache_without_cache.png)

Maintenant, essayons de mettre en cache cette page. Apache utilise deux modules pour ça.

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

On redmarre Apache

~~~bash
$ systemctl reload apache2
~~~

Et lorsqu'on rafraichis notre navigateur, la différence est flagrante!

![Affichage de test.fr/load.php sans mise en cache](/img/blog/debian_apache_with_cache.png)