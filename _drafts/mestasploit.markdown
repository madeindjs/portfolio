---
title: Scanner les vulnérabilité pas avec Metasploit
layout: post
---

[Metasploit Framework][metasploit] est un logiciel écrit en Ruby permettant le développement et l’utilisation d'_exploit_. Les _exploits_ sont des vulnérabilités qui permettent d’exécuter du code sur une machine distante (sans que l'hôte ne le sache, c'est mieux).

J'ai donc décidé de prendre en main l'outil afin de faire moi même un audit de sécurité sur mon serveur.

## Configuration de l'environnement

Ici nous allons mettre en place un environnement permettant de faire des tests avec deux machines virtuelles.

### La cible

Lorsqu'on veut faire des tests d'intrusions, mieux vaut le faire sur une **machine virtuelle**. En effet, les tests de vulnérabilité sont illégal sur une machine qui ne vous appartiennent pas.

C'est ici qu'arrive **Metasploitable**.

**Metasploitable** est une machine virtuelle proposée par Metasploit afin de vous entraîner. Il s'agit d'une version Ubuntu 14.04 qui contient volontairement plusieurs failles de sécurités sur des logiciels bien connu comme:

- le serveur d'intégration continue **Jenkins**
- Des serveur de base de données **ElasticSearch** ou **MySQL**
- des application web CMS comme **Wordpress**

> Il existe aussi une variante pour Windows Server 2008: [Winsploitable][winsploitable]

On retrouve beaucoup en téléchargement la version 2 [en téléchargement sur SourceForge][metasploitable2] mais actuellement la dernière [version est la 3][metasploitable3]. Cette version possède une particularité: elle utilise [Vagrant][vagrant].

[Vagrant][vagrant] est un logiciel libre et open-source qui gère la création et la configuration des machines virtuelles. Pour l'installer, il suffit de télécharger le paquet via [le site officiel](https://www.vagrantup.com/downloads.html). Par exemple, pour Debian:

```bash
$ wget https://releases.hashicorp.com/vagrant/2.1.5/vagrant_2.1.5_x86_64.deb
$ sudo dpkg -i vagrant_2.1.5_x86_64.deb
```

Ensuite, il suffit de télécharger le fichier [Vagrant][vagrant] et le lancer directement avec `vagrant up`:

```bash
$ curl -O https://raw.githubusercontent.com/rapid7/metasploitable3/master/Vagrantfile && vagrant up
```

[Vagrant][vagrant] va donc s’occuper de créer la machine virtuelle pour nous. Pour se connecter, le login par défaut est:

- user: `vagrant`
- password: `vagrant`

### Installer [Metasploit][metasploit]

Il est possible d'installer [Metasploit][metasploit] sur votre OS mais de mon côté je préfère utiliser [Kali Linux][kali] dans une machine virtuelle. [Kali Linux][kali] est une distribution Linux basée sur Debian qui intègre de base qui apporte des outils de “hacking” pré-installé.

Si vous voulez faire comme quoi, suivez mon tutoriel pour [installer Kali Linux dans une machine virtuelle avec KVM](/tutorial/2018/10/02/kvm.html).

---

## Le hacking

Les étapes d'un "hack" bien réussi sont les suivantes:

- Collecte d’**informations** comme l'adresse IP, les services activé, le système d'exploitation, etc..
- **Repérage** des failles de sécurités sur les logiciels installés
- **Exploitation** d’une faille
<!-- - Compromission -->
- Installation d’une **porte dérobée** pour facilité l'accès plus tard
- **Nettoyage** des traces que l'on a laissé

### Collecte d’informations

Nous sommes donc dans la première partie qui est la **reconnaissance** de la cible. Cette étape cruciale consiste à obtenir le maximum d'informations sur la victime. Nous devons idéalement passer le plus de temps possible sur cette étape.

Ici, nous allons seulement effectuer un scan des ports ouverts avec `nmap`, **un scanner de port**. Les ports sont en quelques sortent des portes qui sont ouvertes sur le réseaux. Une porte correspond souvent à un **type de logiciel** utilisé sur la machine:

- 22 pour un serveur SSH
- 80 pour un serveur web (Apache par exemple)
- 3306 pour un serveur SQL

Ces "portes ouvertes" nous donne donc beaucoup d'indications sur la machines et sur **son utilisation**. Malgré sur ce qu'on peut lire, le scan de port est d'ailleurs [tout à fait légal](http://www.infond.fr/2010/09/legalite-du-scan-de-port.html)

`nmap` possède beaucoup d'options, mais nous pouvons utiliser la version la plus simple

```bash
$ sudo nmap 172.28.128.3

Starting Nmap 7.40 ( https://nmap.org ) at 2018-10-05 23:12 CEST
Nmap scan report for 172.28.128.3
Host is up (0.00018s latency).
Not shown: 992 filtered ports
PORT     STATE  SERVICE
21/tcp   open   ftp
22/tcp   open   ssh
80/tcp   open   http
445/tcp  open   microsoft-ds
631/tcp  open   ipp
3000/tcp closed ppp
3306/tcp open   mysql
8181/tcp open   intermapper
MAC Address: 08:00:27:0E:30:35 (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 5.17 seconds
```

> L'utilisation de `sudo` donne plus de liberté à `nmap` et ainsi nous donne plus d'information. Attention néanmoins car le scan de port est facilement détectable.

Ici nous voyons donc que pas mal de ports sont ouverts. Dans la vrai vie vivante, il s'agit plutôt d'une **mauvaise pratique** car les ports peuvent être au **filtrés**. Nous pouvons aussi changer le port par défaut de SSH par exemple et ainsi brouiller les pistes.

Mais ici c'est normal car

### Repérage des failles

Ici nous allons scanner les vulnérabilités. **Attention** cette action est **illégale** sur un serveur qui ne vous appartient pas. Si vous voulez le faire sur un serveur d'un tiers, il faut son accord. C'est pour cela que nous avons commencé par installer une machine virtuelle prévue à cet effet.

#### Installer OpenVAS

[OpenVAS][openvas] est un **scanner de vulnérabilités**. Il est issu d'un fork de Nessus qui est passé sous licence propriétaire à partir de la version 3 en 2005. C'est donc un logiciel très complet qui permet de scanner les vulnérabilité d'une machine. Il s'utilise d’ailleurs très bien sans Metasploit.

[OpenVAS][openvas] est disponible dans les paquets Debian donc il s'installe très facilement.

```bash
$ sudo  apt install openvas
```

Une fois installé, il nous pouvons effectuer la configuration automatique avec `openvas-setup`. Cette commande va s’occuper de mettre à jour la base de données des failles que Open

```bash
$ sudo openvas-setup
```

> **Attention**, à la fin `openvas-setup` va créer un compte admin avec un **mot de passe aléatoire** qu'il faudra noter.

Pour vérifier que tout s'est bien passé, il suffit de lancer la commande suivante:

```bash
$ sudo openvas-check-setup
```

Pour plus tard, il suffira de démarrer le service simplement avec la commande `openvas-start` et on peut aussi mettre à jour la base de données des vulnérabilités connues avec `openvas-feed-update`.

Ce service va automatiquement démarrer et écouter sur le port 9390 & 9391. On se rend donc sur <https://localhost:9390> et on accède à l'interface d'administration:

![interface d'administration d'OpenVAS](/img/blog/kali_msf_openvas.png)

Cela nous indique que l’installation c'est bien passée. Nous n'allons cependant pas utiliser cette interface car Metasploit permet d'utiliser OpenVAS via notre outils

C'est ici qu'on ouvre Metasploit.

#### Connexion au serveur OpenVAS

Metasploit possède plusieurs interfaces. Nous allons utiliser **Msfcli**, l'interface en console. Cette interface à l'avantage d'être gratuite et elle permet de comprendre nos actions.

![Les différentes interfaces de Metasploit](/img/blog/kali_msf_interfaces.jpg)

On ouvre donc la console avec `msfconsole`. Ceci va nous ouvrir un mode interactif pour interagir directement avec Metasploit:

```bash
$ msfconsole
msf >
```

On charge donc le module d'OpenVAS dans Metasploit avec la commande `load`

```bash
msf > load openvas
```

Il faut donc se connecter à notre serveur OpenVAS avec la commande `openvas_connect` _(si le serveur OpenVAS n'est pas démarré, il faut utiliser `openvas-start`)_.

```bash
msf > openvas_connect admin <password> 127.0.0.1 9390
```

##### Création de la cible

Maintenant que nous sommes connecté à OpenVAS, nous allons créer une **target** ("cible" pour les puristes). Il s'agit de la cible pour notre scan. On utilise la commande `openvas_target_create` qui prend en paramètre:

- le nom de la cible (on met ce que l'on veut)
- l'adresse IP de la cible
- un commentaire (obligatoire)

```bash
msf > openvas_target_create "Metasploitable" 192.168.70.128 "This is Metasploitable"
```

La commande nous retournes une **liste des cibles** existantes (une seule si c'est votre première cible).

##### Création de la tâche

Nous allons ensuite créer une **tâche**. Une tâche est en fait un scan qui sera programmé pour une **cible** avec une **configuration** donnée. Pour créer une tâche, il faut utiliser la commande `openvas_target_create`.

- le nom de la tâche (on met ce que l'on veut)
- un commentaire
- un configuration (Pour connaître les configurations disponibles, il faut utiliser `openvas_config_list`)

```bash
msf > openvas_task_create "Local Scan" "Scan My Local Machine" 0 1
```

On utilise ensuite la commande `openvas_task_list` pour retrouver l'identifiant de la tâche que l'on vient de créer. Pour la lancer, vous l'auriez deviné, on utilise `openvas_task_start` suivit de l'identifiant de la tâche.

```bash
msf > openvas_task_start <id_de_la_tache>
```

### Exploitation d’une faille

## Liens

- <https://www.kali.org/penetration-testing/openvas-vulnerability-scanning/>
- <https://www.offensive-security.com/metasploit-unleashed/>
- <https://www.thebaud.com/openvas-audit-de-vulnerabilites/>

[openvas]: http://www.openvas.org/
[metasploit]: https://www.metasploit.com/
[metasploitable2]: https://sourceforge.net/projects/metasploitable/files/Metasploitable2/
[metasploitable3]: https://github.com/rapid7/metasploitable3
[vagrant]: https://www.vagrantup.com
[kali]: https://www.kali.org/
[winsploitable]: https://mega.nz/#!XwYGjSjY!egVGg5celP3VSScDJbiKUuojeJwczzSgt65niQLqIB8
