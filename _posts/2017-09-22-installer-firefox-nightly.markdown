---
layout: post
title:  Installer Firefox Nightly
description:  Participez au développement de votre navigateur preéferé
date:   2017-09-22 12:00:00 +0200
tags: linux firefox
categories: software
comments: true
---
> Êtes-vous un utilisateur avancé, à l’aise avec l’installation de logiciels pré-alpha ? Installez Nightly et aidez-nous à améliorer la qualité de Firefox, à débusquer les plantages et les régressions, et à tester les nouvelles fonctionnalités dès leur création !

Pour ce faire rendez-vous sur le site de Mozilla pour [Télecharger la dernière version](https://www.mozilla.org/fr/firefox/channel/desktop/#nightly).

Ensuite dés-archivez le tout et déplacer le dans le dossier */opt/*.

{% highlight bash %}
$ tar xvf firefox-57.0a1.fr.linux-x86_64.tar.bz2
$ sudo mv firefox /opt/firefox-nightly
{% endhighlight %}

> Attention, le nom du fichier change en fonction de votre système d'exploitation et de la version télechargée

Et maintenant il ne reste plus qu'à se créer un nouveau lanceur pour executer la nouvelle version.

![Créer un lanceur pour Firefox Nightly sous Linux Mint 18.3](/img/blog/firefox-nightly-launcher.png)