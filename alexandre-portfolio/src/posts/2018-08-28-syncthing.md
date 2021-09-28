---
layout: post
title: Synchroniser ses fichiers avec Syncthing
date: 2018-08-28 12:00:00 +0200
tags: [sync, selfhosted]
categories: tutorial
thumbnail: https://syncthing.net/images/logo-horizontal.svg
---

Récemment j'ai voulu trouver une solution pour synchroniser mes documents vers plusieurs PC. Par exemple, lorsque j'ajoute une musique sur mon ordinateur personnel, je veux qu'elle s'ajoute automatiquement sur mon smartphone et mon ordinateur professionnel.

[Dropbox][dropbox] fait ça très bien mais:

- ça coûte [10€/mois](https://www.dropbox.com/buy)
- il s'est déjà [fait pirater en 2016](https://motherboard.vice.com/en_us/article/nz74qb/hackers-stole-over-60-million-dropbox-accounts)
- c'est toujours intéressant d'auto-héberger ses services.

J'ai donc cherché une alternative et je suis tombé sur [**Syncthing**][syncthing].

[Syncthing][syncthing] est un projet **Open-source** (le code est disponible [sur Github](https://github.com/syncthing/syncthing)) écrit principalement en [Go](https://golang.org/). Son principal avantage est qu'il est **Décentralisé**. Chaque **nœud** possède sa propre copie du dossier partagé. Si un disque dur casse, tous les fichiers sont présents sur les autres nœuds.

[Syncthing][syncthing] utilise donc la méthode du **Peer-to-peer**. Toutes vos données ne résident pas sur d'autres serveur. Toutes les communications sont chiffrées de bout en bout.

Cerise sur le gateau, [Syncthing][syncthing] est **Multi-plateforme**. Il est disponible pour [Windows](https://github.com/canton7/SyncTrayzor/releases/latest), [Mac](https://github.com/syncthing/syncthing-macos/releases/latest), [Linux](https://github.com/syncthing/syncthing-gtk/releases/latest) et même [Android](https://github.com/syncthing/syncthing-android).

## Installation

### Ordinateur local

[Syncthing][syncthing] est disponible dans les packets Debian. Du coup on l'installer facilement avec `apt`

```bash
sudo apt install syncthing
```

Et pour le démarrer il suffit d'utiliser la commande `syncthing`.

```bash
syncthing
```

Il suffit ensuite de se connecter à l'interface web <http://localhost:8384>.

![Interface principale de Syncthing](/img/blog/syncthing_pi_home.png)

### Raspberry PI

Mon Raspberry PI tourne sous [Raspbian](https://www.raspbian.org) donc l’installation se fait très de la même manière que mon desktop qui tourne sous [Xubuntu](https://xubuntu.org/).

Je me connecte donc à mon Raspberry en SSH et j'installe et lance [Syncthing][syncthing].

```bash
ssh ftp
sudo apt install syncthing
syncthing &
```

> le `&` permet de lancer Syncthing en tâche de fond et donc de fermer la connexion SSH sans mettre fin au processus

Ici, l'url de l'interface de l'administration est <http://127.0.0.1:41689>. Malheureusement ma Box SFR bloque la connexion, je crée donc un [tunnel SSH ](https://wiki.korben.info/Tunnel_SSH) afin d'avoir le port 41689 sur mon desktop.

```bash
ssh ftp -L 41689:127.0.0.1:41689 -N
```

## Configuration

Maintenant que nous avons installé Syncthing sur nos deux poste, il suffit de les configurer ensemble. Pour cela, il faut accéder aux interfaces de chaque nœuds:

Le plus simple est d'ouvrir deux onglets:

- <http://localhost:8384>: l'interface de mon desktop
- <http://localhost:41689>: l'interface du Raspberry PI

### Ajout du dossier

Je vais commencer par configurer le partage de mon dossier _Documents_ de mon Raspberry. Pour cela, je commence par me connecter sur l'interface <http://localhost:41689> .

Rien de plus simple, on clique sur le bouton _add folder_ et on spécifier le chemin du dossier à partager.

![Interface principale de Syncthing](/img/blog/syncthing_add_folder.png)

### Couplage des nœuds

Pour commencer il faut coupler nos deux nœuds. Pour cela, il faut se rendre sur un des deux nœud et de cliquer sur _add remote_ et d'ajouter l’identifiant du deuxième nœud que l'on trouve sur l'interface.

![Interface principale de Syncthing](/img/blog/syncthing_add_device.png)

Quelques secondes plus tard, sur le nœud remote, un pop-up apparaît

![Pop-up du nouveau nœud à accepter](/img/blog/syncthing_new_device.png)

Et un autre popup nous signale qu'il est possible de synchroniser un dossier en spécifiant l'URL du dossier à créer. Quelques secondes plus tard, la synchronisation commence.

![la synchronisation commence](/img/blog/syncthing_syncing.png)

## Conclusion

[Syncthing][syncthing] permet de se passer très simplement de [Dropbox][dropbox]. La configuration est très simple mais son fonctionnement n'en reste pas moins très puissant.

Pour mon usage personnel je synchronise sans problèmes toutes mes musiques (+ 40 GO) et mes documents (> 1 GO) vers 4 nœuds (2 PC, 1 RPI & mon smartphone)!

[syncthing]: https://syncthing.net/
[dropbox]: https://www.dropbox.com/h
