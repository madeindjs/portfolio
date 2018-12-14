


## Chiffrer une archive avec un mot de passe

On commence donc par se créer un dossier avec quelques données:

~~~bash
$ mkdir folder
$ echo 'Lorem Ipsum' > folder/foo.txt
$ echo 'Dolor Sit Amet' > folder/bar.txt
~~~

Si l'on suit la logique UNIX,

~~~bash
$ tar czvf - folder | gpg --symmetric --cipher-algo aes256 -o /tmp/folder.tar.gz.gpg
folder/
folder/bar.txt
folder/foo.txt
~~~

~~~bash
$ rm -r folder
~~~

~~~bash
$ gpg -d /tmp/folder.tar.gz.gpg | tar xzvf -
gpg: données chiffrées avec AES256
gpg: chiffré avec 1 phrase secrète
folder/
folder/bar.txt
folder/foo.txt
~~~

~~~bash
$ cat folder/foo.txt
Lorem Ipsum
~~~


## Chiffrer une archive avec une clé

Il faut commencer par créer une clé pour encrypter le fichier avec une clé (logique):

~~~bash
$ gpg --gen-key
...
Nom réel : merdive
Adresse électronique : merdive@l-astuce.fr
~~~

Ensuite, il nous faut un fichier

~~~bash
$ echo 'foo' > bar.txt
~~~

Et maintenant, nous pouvons utiliser notre clé pour chiffrer notre fichier:

~~~bash
$ gpg --encrypt --recipient merdive bar.txt
~~~

 Cette commande aura pour effet de créer un fichier _bar.txt.gpg_. Pour le lire il faut

~~~bash
 $ gpg --decrypt bar.txt.gpg
 gpg: chiffré avec une clef RSA de 3072 bits, identifiant 36757201BC370907, créée le 2018-12-05
       « merdive <merdive@l-astuce.fr> »
 foo
 ~~~

 On voit


### Chiffrer depuis un autre ordinateur

> La cryptographie de clé publique est un procédé **asymétrique** utilisant une paire de clés pour le cryptage : une clé **publique** qui **crypte** des données et une clé **privée** correspondante pour le **décryptage**. Vous pouvez ainsi publier votre clé publique tout en conservant votre clé privée secrète. Tout utilisateur possédant une copie de votre clé publique peut ensuite crypter des informations que vous êtes le seul à pourvoir lire. Même les personnes que vous ne connaissez pas personnellement peuvent utiliser votre clé publique.

> Tout utilisateur possédant une clé publique peut crypter des informations, mais est dans l'impossibilité de les décrypter. Seule la personne disposant de la clé privée correspondante peut les décrypter.


Dans mon cas des sauvegardes sur le serveur distant, je veux donc que mon serveur


~~~bash
$ gpg --export --armor merdive > merdive.gpg_pubkey
$ scp merdive.gpg_pubkey  pi3:/tmp/
~~~

~~~bash
$ ssh pi3
$ gpg --import /tmp/merdive.gpg_pubkey
$ echo 'Hello from Raspberry' > /tmp/hello.txt
$ gpg --encrypt --recipient merdive /tmp/hello.txt
~~~

~~~bash
$ gpg --decrypt hello.txt.gpg
gpg: chiffré avec une clef RSA de 3072 bits, identifiant 36757201BC370907, créée le 2018-12-05
      « merdive <merdive@l-astuce.fr> »
Hello from Raspberry
~~~

## isignif


$ gpg --export --armor 'Alexandre Rousseau' > isignif.gpg_pubkey
$ scp isignif.gpg_pubkey isignif:/home/isignif/

## Liens

- <http://laurent.flaum.free.fr/pgpintrofr.htm>
- <https://openclassrooms.com/fr/courses/1112771-la-cryptographie-facile-avec-pgp>
- <http://openpgp.vie-privee.org/gnupg-faq-fr.html#q1.2>

[LXC][LXC]
[précédent article](/tutorial/2017/11/16/installer-apache.html)


[aes]: https://fr.wikipedia.org/wiki/Advanced_Encryption_Standard
[aes_nsa]: https://fr.wikipedia.org/wiki/Advanced_Encryption_Standard#Recommandations_de_la_NSA
[LXC]: https://linuxcontainers.org/fr/
