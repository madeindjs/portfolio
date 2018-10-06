---
title: Premiers pas avec Metasploit
layout: post
---

[Metasploit Framework][metasploit] est un logiciel écrit en Ruby permettant le développement et l’utilisation d'_exploit_. Les _exploits_ sont des vulnérabilités qui permettent d’exécuter du code sur une machine distante (idéalement sans que l'hôte ne le sache évidement).

## Configuration de l'environnement

### Metasploitable

Lorsqu'on veut faire des tests d'intrusions, mieux vaut le faire sur une **machine virtuelle**. Mestasploit met à disposition une machine virtuelle spécifiquement prévue à cet effet: **Mestasploitable**. Il s'agit d'une version Ubuntu 14.04 qui contient volontairement plusieurs failles de sécurités sur des logiciels bien connu comme:

- le serveur d'intégration continue **Jenkins**
- Des serveur de base de données **ElasticSearch** ou **MySQL**
- des application web CMS comme **Wordpress**

> Il existe aussi une variante pour Windows Server 2008: [Winsploitable][winsploitable]

On retrouve beaucoup en téléchargement la version 2 [en téléchargement sur SourceForge][metasploitable2] mais actuellement la dernière [version est la 3][metasploitable3]. Cette version possède une particularité: elle utilise [Vagrant][vagrant].

[Vagrant][vagrant] est un logiciel libre et open-source qui gère la création et la configuration des machines virtuelles. Pour l'installer, il suffit de télécharger le paquet via [le site officiel](https://www.vagrantup.com/downloads.html). Par exemple, pour Debian:

~~~bash
$ wget https://releases.hashicorp.com/vagrant/2.1.5/vagrant_2.1.5_x86_64.deb
$ sudo dpkg -i vagrant_2.1.5_x86_64.deb
~~~

Ensuite, il suffit de télécharger le fichier [Vagrant][vagrant] et le lancer directement avec `vagrant up`:

~~~bash
$ curl -O https://raw.githubusercontent.com/rapid7/metasploitable3/master/Vagrantfile && vagrant up
~~~

[Vagrant][vagrant] va donc s’occuper de créer la machine virtuelle pour nous. Pour se connecter, le login par defaut est:

- user: `vagrant`
- password: `vagrant`

## Utiliser [Metasploit][metasploit]

Il est possible d'installer [Metasploit][metasploit] sur votre OS mais de mon côté je préfère utiliser [Kali Linux][kali] dans une machine virtuelle. [Kali Linux][kali] est une distribution Linux basée sur Debian qui intègre de base qui apporte des outils de “hacking” pré-installé.

Si vous voulez faire comme quoi, suivez mon tutoriel pour [installer Kali Linux dans une machine virtuelle avec KVM](/tutorial/2018/10/02/kvm.html).

### La reconnaissance

Nous sommes donc dans la première partie qui est la **reconnaissance** de la cible. Cette étape cruciale consiste à obtenir le maximum d'informations sur la victime.

Pour cela on utilise `nmap`, un scanner de port. Les ports sont en quelques sortent des portes qui sont ouvertes sur le résaux. Une porte correspond souvent à un logiciel utilisée sur la machine:

- 22 pour un serveur SSH
- 80 pour un serveur web (Apache par exemple)
- 3306 pour un serveur SQL

Ces "portes ouvertes" nous donne donc beaucoup d'indications sur la machines et sur son utilisation. Le scan de port est d'ailleurs [tout à fait légal](http://www.infond.fr/2010/09/legalite-du-scan-de-port.html)

`nmap` possède beaucoup d'options, mais nous pouvons utiliser la version la plus simple

~~~bash
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
~~~

> Attantion car NMAP

### Le scan de vulnérabilités

[OpenVAS][openvas] est un **scanner de vulnérabilités**. Il est issu d'un fork de Nessus qui est passé sous licence propriétaire à partir de la version 3 en 2005. C'est donc un logiciel très complet qui permet de scanner les vulnérabilité d'une machine. Il s'utilise d’ailleurs très bien sans Metasploit.

[OpenVAS][openvas] est disponible dans les paquets Debian donc il s'installe très facilement.

~~~bash
$ sudo  apt install openvas
~~~

Une fois installé, il nous pouvons effectuer la configuration automatique avec `openvas-setup`:

~~~bash
$ sudo openvas-setup
~~~

Pour plus tard, il suffira de démarrer le service simplement avec la commande `openvas-start`. Ce service va automatiquement démarrer et écouter sur le port 9390 & 9391.

Et c'est ici qu'on commence à utiliser Metasploit.


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
