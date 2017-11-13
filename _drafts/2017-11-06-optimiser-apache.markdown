---
layout: post
title:  Optimiser Apache
description:  Participez au développement de votre navigateur préféré
date:   2017-11-06 12:00:00 +0200
tags: apache linux lxc
categories: tutorial
---

Apache est un serveur HTTP distribué sous licence libre. Avec quasiment
[50% de part de marché][MarketShareApache] c'est un des serveur web les plus
populaire.

Ses avantages sont:

* **communauté** imposantes et donc beaucoup de ressources disponibles
* **modules** qui permettent de prendre en charge de nombreux langages (PHP,
  Python, Ruby, etc..) et de personnaliser [Apache][Apache]
* **open-source** et maintenu par la [fondation Apache][FondationApache]
* **disponible** sur toutes les plate-formes

Beaucoup de tutoriels existent pour installer [Apache][Apache] mais voici les
informations que j'aurais aimé avoir sous la mains à mes débuts.



## La compression

La compression permet d'économiser de la bande passante en comprimant les
données (HTML, CSS, JavaScript, etc..). L'objectif est de réduire la taille des
données avant de les envoyer. Le navigateur du client s'occupera de les
décompresser avant de les interpréter.

Cette fonctionnalité demande l'activation du module [mod_deflate][mod_deflate].
Pour cela on utilise `a2enmod`:

~~~bash
$ a2enmod headers deflate
~~~

On ajoute maintenant une nouvelle directive à notre fichier de configuration
_test.fr.conf_.

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

Et il suffit de redémarrer Apache

~~~bash
$ systemctl reload apache2
~~~

Sur le PC client, ouvrez l'inspecteur réseaux avec <kbd>F12</kbd> et actualisez
la page.

![Page d'accueil de test.fr](/img/blog/debian_apache_deflate.png)

L'inspecteur nous inique que sur 155,54 ko, **21,31 ko ont été transférés**! Il
s'agit donc d'un gain à ne pas négliger car il fera la différence pour les
petites connections.

## La mise en cache

Quoi de mieux que de réduire la taille des fichiers? Ne pas les envoyer!

Il s'agit du principe de la **mise en cache**. Lors de la première requête, nous
spécifions un [en-tête HTTP](https://developer.mozilla.org/fr/docs/HTTP/Headers)
qui définit une **date d'expiration** de la page. La page est stockée dans un
fichier par le navigateur jusqu'à cette date. Lors de la prochaine visite, si la
date est toujours valide, le navigateur utilisera cette page sans passer par le
serveur.

Nous allons utiliser [PHP](http://php.net/) pour simuler un temps de chargement
assez long. On commence par l'installer:

~~~bash
$ apt install php libapache2-mod-php
$ a2enmod php7.0
$ systemctl reload apache2
~~~

> La version de PHP à activer peut différer en fonction de celle qui a été
installée

Et on crée un petit script qui va retarder l'affichage de la page:

~~~bash
$ echo '<?php sleep(2); echo "loaded" ?>' > /var/www/test.fr/public/load.php
~~~

On se rend sur [http://test.fr/load.php](http://test.fr/load.php). La page met
plus de deux secondes à s'afficher

![Affichage de test.fr/load.php sans mise en cache](/img/blog/debian_apache_without_cache.png)

Mettons en place ce cache. Apache utilise deux modules pour ça:

* `headers` qui permet de modifier l'en-tête des réponses
* `expires` qui ajoute l'entête expires

On commence par les activer:

~~~bash
$ a2enmod expires headers
~~~

On rajoute la directive `ExpiresActive on` pour activer l'option et on utilise
`ExpireDefault` pour spécifier le temps de mise en cache. `ExpireDefault`
utilise en argument le temps de mise en cache. Ce temps s'exprime avec:

* **une lettre**: `A` pour *Access* (dernière visite) et `M` pour *Modification*
* **un chiffre**: désignant le temps de secondes de mise en cache

Par exemple `A10` pour le garder 10 secondes après le dernier accès ou `M60`
pour le garder 1 minutes après la dernière modification.

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

On redémarre Apache

~~~bash
$ systemctl reload apache2
~~~

Et lorsqu'on rafraîchis notre navigateur, la différence est flagrante!

![Affichage de test.fr/load.php sans mise en cache](/img/blog/debian_apache_with_cache.png)


## Désactiver les logs d'accès

Les logs d'accès sont définit dans votre **Vhost** avec la directive

* `ErrorLog` pour les logs erreurs
* `CustomLog` pour les logs d'accès

Pour améliorer les performances, on peut désactiver les logs d'accès avec
`a2disconf`.

~~~bash
$ a2disconf other-vhosts-access-log
~~~

> Pensez bien à supprimer la directive de votre *Vhost*


## HTTP2

Il s'agit de la nouvelle version du protocole HTTP. IL apporte de nombreuses
améliorations.


Ne peux être utilisé que en HTTPS. Si vous n'avez pas encore activé le HTTPS,
considérez vraiment [Let's Encrypt][letsencrypt] qui vous délivre
un certificat rapidement & gratuitement. L'installation est très rapide avec
[Certbot][certbot] qui s'occupe de mettre à jour votre
configuration [Apache][Apache]. Pour l'installer, suivez la
[documentation officielle][certbot-doc].

~~~bash
$ sudo a2enmod ssl http2
~~~

Et on édite notre Vhost en ajoutant la directive.

~~~apache
Protocols h2 http/1.1
SSLEngine on
~~~

## Désactiver les modules qui ne vous servent pas





## D'autres paramètres en vrac

### La recherche de DNS

[`HostnameLookups`][hostnamelookups] permet de rechercher le nom de domaine du
visiteur afin de le logger. Le problème est qu'une recherche DNS est effectuée à
chaque visite. On peut désactiver cette options avec

~~~apache
HostnameLookups off
~~~

### *.htaccess*

Si vous n'utilisez pas de fichiers *.htaccess* dans votre projet vous pouvez
désactiver l'option `AllowOverride`. Ceci permet d'éviter une requête à
[Apache][Apache] pour vérifier qu'un fichier *.htaccess* existe ou non.

~~~apache
AllowOverride None
~~~

### Durée de vie d'une connexion TCP

[`KeepAliveTimeout`][keepalivetimeout] détermine la durée d'attente de la
prochaine requête. Par défaut la valeur est fixée à 5 secondes mais elle peut
être abaissée jusqu'à 2 secondes.

~~~apache
KeepAliveTimeout 2
~~~

### Les liens symboliques




## Liens intéressants

* [https://buzut.fr/configuration-dun-serveur-linux-apache2](https://buzut.fr/configuration-dun-serveur-linux-apache2)
* [http://artisan.karma-lab.net/optimisation-dapache](http://artisan.karma-lab.net/optimisation-dapache)
* [ftp://ftp.traduc.org/pub/lgazette/html/2006/123/lg123-D.html](ftp://ftp.traduc.org/pub/lgazette/html/2006/123/lg123-D.html)


[LXC]:               https://linuxcontainers.org/fr/
[Apache]:            https://fr.wikipedia.org/wiki/Apache_HTTP_Server
[FondationApache]:   https://fr.wikipedia.org/wiki/Fondation_Apache
[MarketShareApache]: https://www.developpez.com/actu/129511/Serveurs-Web-Nginx-detient-desormais-un-tiers-des-parts-de-marche-tandis-qu-Apache-chute-en-dessous-des-50-pourcent-d-apres-W3Tech/

[letsencrypt]:       https://letsencrypt.org
[certbot]:           https://certbot.eff.org
[certbot-doc]:       https://certbot.eff.org/docs/

[mod_deflate]:       https://httpd.apache.org/docs/current/fr/mod/mod_deflate.html
[hostnamelookups]:   https://httpd.apache.org/docs/current/fr/mod/core.html#hostnamelookups
[keepalivetimeout]:  https://httpd.apache.org/docs/current/fr/mod/core.html#keepalivetimeout
