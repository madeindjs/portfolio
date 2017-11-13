---
layout: post
title:  Optimiser Apache
description:  Participez au développement de votre navigateur preéferé
date:   2017-11-06 12:00:00 +0200
tags: apache linux lxc
categories: tutorial
---

Apache est un serveur HTTP distribué sous licence libre. Avec quasiment [50% de part de marché](https://www.developpez.com/actu/129511/Serveurs-Web-Nginx-detient-desormais-un-tiers-des-parts-de-marche-tandis-qu-Apache-chute-en-dessous-des-50-pourcent-d-apres-W3Tech/) c'est un des serveur web les plus populaire.

Ses avantages sont:

* **communauté** imposantes et donc beaucoup de ressources diponnibles
* **modules** qui permettent de prendre en charge de nombreux langages (PHP, Python, Ruby, etc..) et de personnaliser [Apache][Apache] 
* **open-source** et maintenu par la [fondation Apache](https://fr.wikipedia.org/wiki/Fondation_Apache)
* **disponnible** sur toutes les plateformes

Beaucoup de tutoriels existent pour installer [Apache][Apache] mais voici les informations que j'aurais aimé avoir sous la mains à mes débuts.



## La compression

La compression permet d'économiser de la bande passante en comprimmant les données (HTML, CSS, Javascript, etc..). L'ojectif est de réduire la taille des données avant de les envoyer. Le navigateur du client s'occupera de les décompresser avant de les interpréter.

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

## La mise en cache *(côté client)*

Quoi de mieux que de réduire la taille des fichiers? **Ne pas envoyer ces fichiers**!

Il s'agit du principe de la **mise en cache**. Lors de la première requête, nous spécifiont un [en-tête HTTP](https://developer.mozilla.org/fr/docs/HTTP/Headers) qui définit une **date d'expiration** de la page. La page est stockée dans un fichier par le navigateur jusqu'à cette date. Lors de la prochaine visite, si la date est toujours valide, le navigateur utilisera cette page sans passer par le serveur.

Nous allons utiliser [PHP](http://php.net/) pour simuler un temps de chargement assez logn. On commence par l'installer:

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

Metons en place ce cache. Apache utilise deux modules pour ça:

* `headers` qui permet de modifier l'en-tête des réponses
* `expires` qui ajoute l'entête expires

On commence par les activer:

~~~bash
$ a2enmod expires headers
~~~

On rajoute la directive `ExpiresActive on` pour activer l'option et on utilise `ExpireDefault` pour spécifier le temps de mise en cache. `ExpireDefault` utilise en argument le temps de mise en cache. Ce temp s'exprime avec:

* **une lettre**: `A` pour *Access* (dernière visite) et `M` pour *Modification*
* **un chiffre**: désignant le temps de secondes de mise en cache

Par exemple `A10` pour le garder 10 secondes après le dernier accès ou `M60` pour le garder 1 minutes après la dernière modification.

 Et on rajoute une directive de cache pour les images.

~~~apache
# active la mise en cache
<IfModule mod_header.c>
  Header append Cache-Control public
</IfModule>
# définis un cache d'une heure après la dernier accès 
<IfModule mod_expires.c>
  ExpiresActive on
  ExpiresDefault A3600
</IfModule>
~~~

On redmarre Apache

~~~bash
$ systemctl reload apache2
~~~

Et lorsqu'on rafraichis notre navigateur, la différence est flagrante!

![Affichage de test.fr/load.php sans mise en cache](/img/blog/debian_apache_with_cache.png)

## La mise en cache *(côté serveur)*

La mise en cache côté serveur permet de stocker les pages génerées sur le dsque dur (ou dans la mémoire) afin de les servir sans passer par PHP (ou autre). Pour cela nous utilisons [`mod_cache_disk`](http://httpd.apache.org/docs/2.4/fr/mod/mod_cache_disk.html). Celui-ci s'appuie sur plusieurs élements pour définir si une requête est iddentique (nom d'hôte, protocole, port, chemin, paramètres). 

Commençons par l'installer  

Mettont de côté le cache côté client


~~~bash
$ a2dismod expires headers
~~~


~~~bash
$ a2enmod mod_cache_disk
~~~



```apache
EnableSendfile On
# mise en cache côté serveur
<IfModule mod_cache_disk.c>
  # définit la taille maximale d'un document (en octets)
  CacheMaxFileSize 64000
  # définit le temps minimum qui doit s'écouler avant d'essayer d'envoyer des données au client
  CacheReadTime 1000
  # dossier qui contiendra le cache
  CacheRoot /tmp/apache
</IfModule>
```

[LXC]: https://linuxcontainers.org/fr/
[Apache]: https://fr.wikipedia.org/wiki/Apache_HTTP_Server