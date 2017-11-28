---
layout: post
title:  J'ai tenté de créer un bridge avec ma Box SFR (spoiler, j'ai reussi!)
description:  Participez au développement de votre navigateur preéferé
date:   2017-10-11 12:00:00 +0200
tags: networking routing sfr
categories: network
tumbnail: /img/blog/network_router_pi_sfr.png
comments: true
---

Récemment, j'ai acheté un deuxième Raspberry PI pour transférer une partie de mes sites dessus. L'idée était de partager une partie de sites sur l'un et l'autre.

La Box SFR 4K étant ~~une vraie merde~~ un peu limitée, j'ai investis dans un [routeur TP Link](http://www.tp-link.com/ca/products/details/Archer-C2.html) *(je ne touche pas d’argent pour ce placement de produit :( )* pour une quarantaine d'euros et j'ai voulu passer ma Box en mode **Bridge**.

L'idée est la suivante:


![Schéma du réseau à programmer](/img/blog/network_router_pi_sfr_schema.png)


Au cas ou vous n'avez pas compris, si un utilisateur demande la page:

* [http://rousseau-alexandre.fr](http://rousseau-alexandre.fr), la demande est redirigée vers le **Raspberry PI 2**
* [http://raspberry-cook.fr](http://raspberry-cook.fr), la demande est redirigée vers le **Raspberry PI 3**

## Le branchement

Rien de bien sorcier, on suit la notice:

* Débrancher la Box SFR
* Connecter le Routeur
* Brancher le router sur le port #1 et débrancher tout le reste
* Rallumer la Box SFR et attendre l'initialisation
* Allumer le routeur et attendre l'initialisation

## La partie sur ~~le routeur de merde~~ la boxe SFR

On se connecte à l'interface d'administration de la box via le navigateur en accédant à [http://192.168.0.1](http://192.168.0.1). Ensuite on va sur l'onglet *Réseau > Paramètre de base > Mon réseau local* et on note l’adresse IP et l’adresse MAC du routeur

{% highlight plain %}
Router
18:d6:c7:85:7e:a1
192.168.0.17
(1000 Base-T) / 1Gbps
{% endhighlight %}

Il suffit ensuite de se rendre sur l'onglet *Paramètres avancés > Routeur - Bridge* et renseigner l'addresse MAC du router et *appliquer les modifications*


## La partie sur les Raspberry PI

Le but ici est de spécifier des adresses IP spécifiques à nos Raspberry PI. L’intérêt est qu'en cas de redémarrage du routeur, les adresses IP des serveurs ne changent pas et les redirections restent correctes.

Ne sortez pas le câble HDMI de votre Raspberry, on fait tout via **SSH**.

On commence par trouver les Raspberry Pi avec un bon vieux **nmap**

{% highlight bash %}
$ sudo nmap -n -sP 192.168.1.*
{% endhighlight %}

![Résultat du nmap](/img/blog/network_nmap_raspberry.gif)

Il nous suffit donc de se connecter au Raspberry PI via **SSH**:

{% highlight bash %}
$ ssh pi@192.168.1.101
{% endhighlight %}

Et on édite le fichier de configuration réseau

{% highlight bash %}
$ sudo vi /etc/network/interfaces
{% endhighlight %}

{% highlight bash %}
iface eth0 inet static
    address 192.168.1.102 # le 2 pour se rappeler que c'est le Raspberry PI 2 ;)
    netmash 255.255.255.0
    gateway 192.168.1.1 # l'addresse IP du routeur
{% endhighlight %}

On fait la même chose pour le Raspberry PI 3 *(et changeant l’adresse IP bien sûr)*.

## La partie sur le routeur TP Link

Vous êtes toujours là? On vient de faire le plus dur! Maintenant on va mettre en place les redirections.

On va donc se connecter au résaux TP Link afin d'accéder à l'interface d'administration (le SSID & le mot de passe sont noté sous l'étiquette dessous). L'interface d'administration est [http://192.168.1.1](http://192.168.1.1) ou bien [http://tplinkwifi.net/](http://tplinkwifi.net/).

On se rend dans l'onglet *Forwarding > Virtual Server*

![Interface de redirection des ports de TP Link](/img/blog/ip_link_forward.png)

A partir de maintenant, le site [rousseau-alexandre.fr](http://rousseau-alexandre.fr) est accessible depuis votre navigateur.


## La partie Apache

Maintenant que notre réseau est prêt, nous allons mettre en place une redirection de proxy Apache à l'aide du module [`mod_proxy_http`](https://httpd.apache.org/docs/2.4/fr/mod/mod_proxy_http.html).

Le principe est simple: tous les paquet passeront par le RPI2 et les redirigera vers le RPI3 en fonction du domaine demandé.

Pour se faire, on active les modules qui vont bien sur le RPI2:


{% highlight bash %}
$ ssh pi@192.168.1.102
$ sudo a2enmod proxy_http
{% endhighlight %}

Sur la RPI2 on ajoute notre configuration Apache

{% highlight bash %}
$ sudo vi /etc/apache2/site-available/raspberry-cook.fr.conf
{% endhighlight %}

{% highlight apache %}
<VirtualHost *:80>
    ServerName raspberry-cook.fr
    ServerAdmin contact@rousseau-alexandre.fr
 
    ProxyPass / http://raspberry-cook.fr/
    ProxyPassReverse / http://192.168.1.103/
    ProxyRequests Off
</VirtualHost>
{% endhighlight %}

Et on termine par activer le site & redémarrer Apache

{% highlight bash %}
$ sudo a2ensite raspberry-cook.fr
$ sudo service apache2 restart
{% endhighlight %}

Et le tour est joué.