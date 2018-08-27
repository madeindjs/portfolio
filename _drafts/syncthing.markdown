---
layout: post
title: Synchroniser ses fichier avec Syncthing
date:   2018-08-27 12:00:00 +0200
tags: sync rails
categories: development
---

Récemment j'ai voulu trouver une solution pour synchroniser mes documents vers plusieurs PC. Par exemple, lorsque j'ajoute une musique sur mon ordinateur personnel, elle s'ajoute automatiquement sur mon smartphone et mon ordinateur du boulot.

Cela se fait très facilement avec [Dropbox][dropbox] mais ça coûte [10€/mois](https://www.dropbox.com/buy) et puis Dropbox c'est déjà [fait pirater en 2016](https://motherboard.vice.com/en_us/article/nz74qb/hackers-stole-over-60-million-dropbox-accounts). De plus, c'est toujours intéressant d'auto-héberger ses services.

## Présentation de [Syncthing][syncthing]

J'ai donc choisis d'utiliser [**Syncthing**][syncthing] sur mon Raspberry PI. Ses avantages sont:

- **Open-source**: le code est disponible [sur Github](https://github.com/syncthing/syncthing)
- **Décentralisé**: chaque **nœud** possède sa propre copie du dossier partagé. Si un disque dur casse, tous les fichiers sont présents sur les autres nœuds
- **Sûr et privé**: [Syncthing][syncthing] utilise le Peer-to-peer et donc toutes vos données ne résident pas sur d'autres serveur. Toutes les communications sont chiffrées de bout en bout.

## Installation

### Ordinateur local

[Syncthing][syncthing] est disponible dans les packets Debian. Du coup, pour l'installer il suffit de

~~~bash
$ sudo apt install syncthing
~~~

Et pour le démarrer il suffit d'utiliser la commande `syncthing` en tâche de fond (avec le `&`).

~~~bash
$ syncthing &
~~~

Il suffit ensuite de se connecter à l'interface web <http://localhost:8384>.

~~~bash
$ ssh  ftp
$ syncthing &
~~~

### Raspberry PI

Mon Raspberry PI tourne sous [Raspbian](https://www.raspbian.org) donc l’installation se fait très de la même manière que mon desktop qui tourne sous [Xubuntu](https://xubuntu.org/).

Je me connecte donc à mon Raspberry en SSH et j'installe et lance [Syncthing][syncthing].

~~~bash
$ ssh ftp
$ sudo apt install syncthing
$ syncthing &
~~~

Il est aussi possible d'accéder à une interface web.

> Access the GUI via the following URL: http://127.0.0.1:41689/

Malheureusement ma Box SFR bloque la connection, je crée donc un [tunnel SSH ](https://wiki.korben.info/Tunnel_SSH) afin d'avoir le port 41689 sur mon desktop.

~~~bash
$ ssh ftp -L 41689:127.0.0.1:41689 -N
~~~

## Configuration

Maintenant que nous avons installé nos paquet, il suffit de les configurer ensemble. Pour cela, il faut accéder aux interface de chaque nœuds:

![Interface principale de Syncthing](/img/blog/syncthing_pi_home.png)

 Le plus simple est d'ouvrir deux onglets:

- <http://localhost:8384>: l'interface de mon desktop
- <http://localhost:41689>: l'interface du Raspberry PI

### Ajout du dossier

Je vais commencer par configurer le partage de mon dossier *Documents* de mon Raspberry. Pour cela, je commence par me connecter sur l'interface <http://localhost:41689> .

Rien de plus simple, on clique sur le bouton *add folder* et on spécifier le chemin du dossier à partager.

![Interface principale de Syncthing](/img/blog/syncthing_add_folder.png)

### Couplage des nœuds

Pour commencer il faut coupler nos deux nœuds. Pour cela, il faut se rendre sur un des deux nœud et de cliquer sur *add remote* et d'ajouter l’identifiant du deuxième nœud que l'on trouve sur l'interface.

![Interface principale de Syncthing](/img/blog/syncthing_add_device.png)

Quelques secondes plus tard, sur le nœud remote, un pop-up apparaît

![Pop-up du nouveau nœud à accepter](/img/blog/syncthing_new_device.png)

Et un autre popup nous signale qu'il est possible de synchroniser un dossier en spécifiant l'URL du dossier à créer. Quelques secondes plus tard, la synchronisation commence.

![la synchronisation commence](/img/blog/syncthing_syncing.png)



> Attention à ne pas oublier de le signaler en partageable avec les autres nœuds.



## Conclusion

[syncthing]: https://syncthing.net/
[dropbox]: https://www.dropbox.com/h
