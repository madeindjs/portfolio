---
layout: post
title: Installer et configurer Debian
date:   2018-09-08 12:00:00 +0200
tags: linux debian
categories: software
thumbnail: /img/blog/debian.svg
---

Suite à quelques problèmes avec mon laptop sous [Xubuntu](https://xubuntu.org), j'ai décidé d'alléger ma distribution. J'ai donc voulu essayer [Debian][debian]. Cet article est donc un récapitulatif que je partage afin de me souvenir de tout ce que j'ai fait:

## Présentation

[Debian][debian] est utilisée comme base pour Ubuntu. Debian est réputé pour être stable et léger. En contrepartie, il faut savoir un peu plus l'"apprivoiser".

L'avantage est qu'on obtiens un OS rapide et léger. L'inconvénient est qu'on passe un peu plus de temps lors de la configuration.

### Comparaison [Debian][debian] et [Ubuntu][ubuntu]

Quand on compare des distributions Linux, on marche un peu sur des œufs. Ici je vais essayer de faire une comparaison purement objective:


|               | Ubuntu                                                               | Debian                                                                    |
|---------------|----------------------------------------------------------------------|---------------------------------------------------------------------------|
|  Avantages    | - installation "out-of-the-box"                                      | - Stabitlié & sécurité<br>- instalation minimal<br>- optimisé (pas de superflu) |
| Inconvénients | - un peu moins stable que Debian<br>- trop de logiciels pré-installé | - logiciels plus anciens<br>- pas de support de logiciels propriétaires       |
{: .table}


En gros:

- si vous cherchez à installer et basta: [Ubuntu][ubuntu]
- si vous cherchez peaufiner et comprendre ce que vous faites: [Debian][debian]


## Installation

On l'installe de la même façon que les autres distributions:

1. on récupère une [image Debian](https://www.debian.org/distrib/netinst)
2. on créer un support d’installation (USB, DVD)
3. on insère le support et on boot dessus

## Configuration

### Installer `sudo` et donner les droits à l'utilisateur courant

`sudo` est un utilitaire sur Linux qui permet de lancer un commande en tant qu'administrateur. Chez Debian, [`sudo` n'est pas installé par défaut](https://unix.stackexchange.com/questions/106529/why-is-sudo-not-installed-by-default-in-debian#106582) pour l'utilisateur courant.

Pour installer `sudo`, il faut être administrateur... Il faut donc commencer par se connecter avec `root`. Ensuite, on peut ouvrir un terminal en tant qu’administrateur. L'invite de commande commence par `#`, ce qui nous indique que nous possédons des privilèges élevés. On peut donc installer le paquet `sudo`:

~~~bash
# apt install sudo
~~~

Et ensuite déplacer l'utilisateur dans le groupe `sudo`. Il existe plusieurs manières de faire mais j'utilise `adduser` qui me parait la plus simple à retenir:

~~~bash
# adduser arousseau sudo
~~~

à partir de là on peut se reconnecter avec l'utilisateur courant et tester la commande `sudo`

~~~bash
$ sudo touch /tmp/test.txt
~~~

### Supprimer le support d’installation des PPA

Une fois qu'on à les droits sudo, si l'on essaye de faire un `apt update` pour mettre à jour les listes de logiciels à jours on va avoir une erreur. En effet, dans les dépôts de logiciels, il reste le périphérique que l'on à utilisé pour installer Debian. Pour le supprimer, il suffit de l'enlever de la liste:

~~~bash
$ sudo nano /etc/apt/source.list
~~~

Pour vérifier que tout fonctionne, on lance un `apt update`

~~~bash
$ sudo apt update
$ sudo apt upgrade
~~~

### Installer les drivers wifi

Lors de l’installation vous êtes tombé sur message de ce genre:

![Demande d'un firmware pour le chipset](/img/blog/debian_firmware.png)


Il faut commencer par récupérer les dépôts non libre. pour cela, on modifie les PPA:

~~~bash
$ sudo nano /etc/apt/source.list
~~~

Et on remplace

> deb http://ftp.us.debian.org/debian/ jessie main

par

> deb http://ftp.us.debian.org/debian/ jessie main contrib non-free

Ensuit on relance pour régénérer la liste des dépôts:

~~~bash
$ sudo apt update
~~~

Et on installe le paquet `firmware-iwlwifi`

~~~bash
$ sudo apt install firmware-iwlwifi
~~~

### Installer un utilitaire pour scanner

Par défault [Debian][debian] utilise [xsane](https://doc.ubuntu-fr.org/xsane). Je n'aime pas du tout l'interface et je préfère de loin [simple-scan](https://gitlab.gnome.org/GNOME/simple-scan).

~~~bash
$ sudo apt purge xsane
$ sudo apt install simple-scane
~~~

### Installer un client de messagerie graphique

Par défaut, Debian utilise [mutt](http://www.mutt.org/), un client mail en ligne de commande.

~~~bash
$ sudo apt purge xsane
$ sudo apt install simple-scane
~~~

### Le reste en vrac

Et quelques paquets en plus:

~~~bash
$ sudo apt install texlive-base texlive-lang-french texlive-latex-extra gummi \
                   rhythmbox \
                   vim curl \
                   arc-theme
~~~


[debian]: http://www.debian.org/
[ubuntu]: https://www.ubuntu.com/
