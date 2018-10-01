---
title: Utiliser KVM pour créer des machines virtuelles
---

Récement, pour installer Kali Linux sur une machine virtuel, j'ai eu quelques problèmes avec [Virtual Box](https://www.virtualbox.org/). J'ai donc regardé s'il existait une alternative et je suis tombé sur KVM

KVM, pour Kernel-based Virtual Machine, est maintenu par la communauté Linux et plus particulièrement par Red Hat.

L'avantage est qu'il est intégré au noyau Linux. Du coup, il existe pour la majorité des distributions classiques et il s'installe très facilement.

> QEMU est un système d'émulation complet(...) . Le CPU est émulé (...) cela permet au final d'exécuter un code original dans une machine totalement virtualisée. Il est par exemple tout à fait possible d'exécuter un code écrit pour un processeur ARM sur un ordinateur équipé d'un processeur Intel. Avec ce système, l'émulation est très lente car il est nécessaire de traduire chaque opcode original en série d'instructions compatibles. [source](https://www.eslot.fr/etude/difference-entre-qemu-et-kvm)


## Instalation

Disponible dans les dépôts Debian.

~~~bash
$ sudo apt-get install qemu qemu-kvm
~~~

## Créaton d'un machine virtuelle

On commence par créer une image vide _kali.img_ de 10Go.






~~~bash
$ qemu-system-x86_64 -hda kali.img -boot d -cdrom kali-linux-xfce-2018.3a-amd64.iso -m 640
~~~

- `-m` spécifie la quantité de mémoire vive (ici 640 Mo)
- `-cdrom` le fichier à insérer dans le lecteur du disuqe de la VM
- `-boot` ?

Une fois la distribution installé, on peut la démarrer en utilisant simplement

~~~bash
$ qemu-system-x86_64 create kali.img 10G
~~~

Si nous n'avons pas besoin d'émuler TODO


## Liens

- <https://doc.ubuntu-fr.org/qemu>
- <https://www.unixmen.com/how-to-install-and-configure-qemu-in-ubuntu/>
- <http://www.deltasight.fr/kvm-ou-virtualbox-pour-virtualiser-sous-linux/>
- <https://www.linuxjournal.com/content/qemu-vs-virtualbox>
- <https://medium.com/@dbclin/aws-just-announced-a-move-from-xen-towards-kvm-so-what-is-kvm-2091f123991>
