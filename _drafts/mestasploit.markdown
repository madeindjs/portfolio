---
title: Débuter avec Metasploit
---


## Présentation


## Metasploitable

Lorsqu'on veut faire des tests d'intrusions, mieux vaut le faire sur une **machine virtuelle**. Mestasploi met à disposition une machine virtuelle spécifiquement prévue à cet effet: **Mestasploitable**.

Il existe aussi une variante pour Windows [Winsploitable][winsploitable]


On retrouve beaucoup en téléchargement la version 2 [en téléchargement sur SourceForge][metasploitable2] mais actuellement la dernière [version est la 3][metasploitable3]. Cette OS inclu plusieurs versions de logiciels contenant des vulnérabilités comme par exemple:

- Tomcat
- Jenkins
- SSH
- ElasticSearch
- MySQL
- Wordpress
- PHPMyAdmin

La version 3 utilise [Vagrant][vagrant], un logiciel libre et open-source pour la création et la configuration des environnements de développement virtuel.

### Installer [Vagrant][vagrant]

Installer Vagrant via [le site officiel](https://www.vagrantup.com/downloads.html). Par exemple, pour Debian:

~~~bash
$ wget https://releases.hashicorp.com/vagrant/2.1.5/vagrant_2.1.5_x86_64.deb
$ sudo dpkg -i vagrant_2.1.5_x86_64.deb
~~~

### Installer Metasploitable

Il suffit de rélecarger

~~~bash
$ mkdir metasploitable3-workspace
$ cd metasploitable3-workspace
$ curl -O https://raw.githubusercontent.com/rapid7/metasploitable3/master/Vagrantfile && vagrant up
~~~

Cette commande va télécharger le fichier Vagrant et le lancer directement. Vagrant va donc s'occupper de créer la machine virtuelle pour nous. 


## Liens

* <https://www.offensive-security.com/metasploit-unleashed/>

[metasploitable2]: https://sourceforge.net/projects/metasploitable/files/Metasploitable2/
[metasploitable3]: https://github.com/rapid7/metasploitable3
[vagrant]: https://www.vagrantup.com
[winsploitable]: https://mega.nz/#!XwYGjSjY!egVGg5celP3VSScDJbiKUuojeJwczzSgt65niQLqIB8
