---
layout: post
title:  Benchmark d'un serveur Web Raspberry PI 2 B+ vs Raspberry PI 3 
description:  l'occasion de mettre ma pierre à l'édifice des Benchmarks existants
date:   2017-10-15 12:00:00 +0200
tags: benchmark raspberry apache ruby
categories: network
thumbnail: /img/blog/RPI2_vs_RPI3.png
---

L’occasion de la migration de mon serveur Apache depuis mon **Raspberry PI 2 B+** vers mon **Raspberry PI 3** est l'occasion de mettre ma pierre à l'édifice des *Benchmarks* existants. Je n'ai pas la prétention d'apporter un comparatif complet mais juste de proposer mes résultats.

Sortie à un an d'intervalle, la principale amélioration du RPI3 est d'amener une arcitecture 64 bits.

## Ma configuration

Cette comparaison ne se base pas uniquement sur le Hardware car les software installés sur l'un ou sur l’autre sont différents *(notamment pour la base de donnés dont l'un est sur **MySQL** et l'autre sur **MariaDB**)*. Sinon tous les deux sont des serveurs *Apache* faisant tourner des applications web **Ruby on Rails** avec [**RVM**](https://rvm.io/) *(gestionnaire de version Ruby)* & [**Passenger**](https://www.phusionpassenger.com/) *(bibliothèque permettant de faire fonctionner des applications Ruby sous Apache)*.

* **Raspberry PI 2 B+**
    * Raspbian GNU/Linux 8.0 (jessie)
    * Linux 4.1.19-v7+ armv7l GNU/Linux
    * Apache/2.4.10 (Raspbian)
    * Phusion Passenger 5.1.2
    * MySQL 5.5.57-0+deb8u1 (Raspbian)
* **Raspberry PI 3**
    * Raspbian GNU/Linux 9.1 (stretch)
    * Linux 4.9.41-v7+ armv7l GNU/Linux
    * Apache/2.4.25 (Raspbian)
    * Phusion Passenger 5.1.8
    * MariaDB 10.1.23-MariaDB-9+deb9u1 Raspbian 9.0

## Le script

Pour le script, je me suis basé sur un [script bash trouvé sur internet](http://cacodaemon.de/index.php?id=11) qui utilise un simple `curl` repété plusieurs fois.

{% highlight bash %}
#!/bin/bash

# on spécifie l'URL
URL="$1"
# on spécifie le nombre de requêtes
MAX_RUNS="$2"
SUM_TIME="0"

i="0"
while [ $i -lt $MAX_RUNS ]; do
  # on lance la requête en récupérant le temps de réponse
  TIME=`curl $URL -o /dev/null -s -w %{time_total}`
  # on ajoute le résultat au précédent
  TIME="${TIME/,/.}"
  SUM_TIME=`echo "scale=5; $TIME + $SUM_TIME" | bc`
  i=$[$i+1]
done
# on fait la moyenne et on affiche
TIME_AVERAGE=`echo "scale=5; $SUM_TIME / $MAX_RUNS" | bc`
echo "Sum: $SUM_TIME"
echo "Avg: $TIME_AVERAGE"
{% endhighlight %}


## Les résultats

Voici donc le résultat avec mon Raspberry PI 2 B+ avec 50 requêtes.

{% highlight bash %}
$ ./average_reponse_time.sh http://raspberry-cook.fr/recipes 50
Sum: 38.278
Avg: .76556
$ ./average_reponse_time.sh http://raspberry-cook.fr/recipes 50
Sum: 34.014
Avg: .68028
{% endhighlight %}

Voici donc le résultat avec mon Raspberry PI 3 B+ avec 50 requêtes.

{% highlight bash %}
$ ./average_reponse_time.sh http://192.168.1.103/recipes 50
Sum: 19.812
Avg: .39624
$ ./average_reponse_time.sh http://192.168.1.103/recipes 50
Sum: 19.766
Avg: .39532
{% endhighlight %}

## Conclusion

Je ne m'attendais pas à une différence aussi importante. Dans mon cas, **le RPI3 répond 1,7 fois plus rapidement que le RPI2**!

Néanmoins, ces résultats ne sont pas uniquement dus à la différence au niveau du matériel mais aussi à la différence des logiciels installés.