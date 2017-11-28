---
layout: post
title:  Mettre à jour un Package Pypi
description: Tutoriel pour mettre à jour un package sur Pypi
date:   2017-09-19 11:23:00 +0200
tags: python pipy
categories: programming
comments: true
---
Récement j'ai reçu un Pull request qui incrémentait la version d'un [vieux package Python que j'avais crée](https://github.com/madeindjs/Super-Markdown). Je l'ai accépeté en deux minutes sur Github mais impossible de le mettre à jour sur Pypi! 

Après queleques recherches, voici la procédure à suivre.

## Cloner le projet et installer les dépendances

{% highlight bash %}
$ git clone https://github.com/madeindjs/super-markdown.git
$ cd super-markdown
$ pip install -r requirements.txt
$ python setup.py install
{% endhighlight %}

## configuration pour Pypi

{% highlight bash %}
$ vi ~/.pypirc
{% endhighlight %}

{% highlight ini %}
[distutils]
  index-servers = pypi
[pypi]
  repository=https://upload.pypi.org/legacy/
  username=your_username
  password=your_password 
{% endhighlight %}

On n'oublie pas de mettre les droit en lecture / ecriture uniquement pour l'utilisateur courant:

{% highlight bash %}
$ chmod 600 ~/.pypirc
{% endhighlight %}


## envoie du packet

On se connecte via la ligne de commande

{% highlight bash %}
$ python setup.py register
{% endhighlight %}

Et on envoie le packet

{% highlight bash %}
$ python setup.py sdist upload
{% endhighlight %}

Et le tour est joué.