---
title: Apprendre à utiliser GPG avec Jean-Luc Mélanchon
---

Cette article va parcourir les diverses utilisations possible du chiffrement avec GPG au travers un exemple concret: la communication de Jean-Luc Mélanchon avec ses disciples.

<!-- La commande `gpg` peut être utilisée pour le chiffrement **symétrique** et **asymétrique** de vos fichiers et données. Il peut également être utilisé pour effectuer des signatures numériques. Si vous n'êtes pas familier avec ces concepts, ne vous inquiétez pas: nous allons vous expliquer toute la terminologie et les concepts que vous devez connaître en langage simple. -->

Dans une première partie nous verrons comment mettre en place GPG sur le PC de JLM. C'est à dire:

- créer une clé de chiffrement
- exporter la clé
- publier sa clé publique sur un serveur
- révoquer sa clé

Ensuite nous verrons comment JLM peut utiliser GPG afin de:

- chiffrer / signer ses emails
- chiffrer / signer ses fichiers
- chiffrer / déchiffrer une sauvegarde
- signer ses commits avec Git (et oui Jean-Luc fait un peu de dév de temps en temps)

Ca vous intéresse? C'est parti.

> Et avant de commencer: [**On dit chiffrer, et pas crypter.**](https://chiffrer.info/).

## Définitions

Pour commencer une petite piqûre de rappel sur les bases du chiffrement (Si vous trouvez que ce n'est pas complet ou un peu rapide, [d'innombrables articles détailles le sujet mieux que moi](https://duckduckgo.com/?q=chiffrement+informatique) :) ).

_GNU Pirvacy Guard_ est une implémentation du standard **OpenPGP**. Ubuntu, et d'autres distributions Linux, inclue _GNU Privacy Guard_ de base via la commande `gpg`.

GPG permet plusieurs type de chiffrement:

- Le **chiffrement symétrique** implique un processus de chiffrement et de déchiffrement qui utilisent **la même clé**. Dans ce cas, la clé est considérée comme un secret partagé et doit être gardée confidentielle à la fois par le crypteur et par le décrypteur.
- Le **Hashes** ou **Digests** est un algorithme cryptographique **unidirectionnel** qui utilise une fonction de hachage pour obtenir l' _"empreinte digitale"_ d'un bloc de données arbitraire. Il ets très utilisé pour les mots de passe car il permet de contrôler si un mot de passe est valide sans pouvoir le déchiffrer.
- Le **chiffrement asymétrique** implique l'utilisation d'une **clé publique** et d'une **clé privée**. La clé publique est mise à la disposition de quiconque souhaite chiffrer des données pour les envoyer au propriétaire de la clé publique. Exemple: Si Bob voulait envoyer un fichier chiffré à Alice, Bob chiffrerai les données à l'aide de la clé publique d'Alice, puis les enverrait à Alice. Alice peut alors déchiffrer les données à l'aide de sa clé privée. Une fois que Bob a chiffré les données, personne d'autre qu'Alice ne peut les déchiffrer.
- La **Signatures numériques** est utile lorsque Alice reçoit des données de Bob et qu'elle souhaite s'assurer que les données envoyées n'ont pas été **altérées**. Dans de tels cas, un **hachage** est effectué sur les données du côté de l'expéditeur, et chiffré à l'aide de la clé privée de l'expéditeur

Nous allons nous concentrer sur les deux derniers qui sont le chiffrement asymétrique et la signature numérique.

## Utilisation basique de GPG

### Générer une paire de clés GPG

Une **paire de clés** est nécessaire pour le chiffrement asymétrique. Voyons comment Jean-Luc Mélanchon peut créer sa propre paire clé publique/clé privée avec la commande `gpg --generate-key`:

    $ gpg --generate-key

    GnuPG doit construire une identité pour identifier la clef.

    Nom réel : Jean-Luc Mélanchon
    Adresse électronique : jean-luc@melanchon.fr
    Vous avez sélectionné cette identité :
    « Jean-Luc Mélanchon <jean-luc@melanchon.fr> »

    Changer le (N)om, le (C)ommentaire, l'(A)dresse électronique
    ou (O)ui/(Q)uitter ? o
    ...
    les clefs publique et secrète ont été créées et signées.

    pub   rsa3072 2018-12-10 [SC]
      643B0C08FCE76FB743F2BD521B245ED01C72E00B
    uid                      Jean-Luc Mélanchon <jean-luc@melanchon.fr>
    sub   rsa3072 2018-12-10 [E]

Comme vous pouvez le constater, plusieurs options lui sont proposées en cours de route afin de le guider. Une fois confirmé ces valeurs, il a été invité à entrer un mot de passe de chiffrement qui est utilisée pour protéger votre clé privée.

Faites attention lors du choix de votre phrase de passe:

- n'utilisez jamais de mots du dictionnaire
- incluez toujours un mélange de lettres majuscules et minuscules ainsi que quelques chiffres et symboles
- assurez-vous que ce n'est pas un mot court

La dernière partie de la sortie montrée dans la capture d'écran ci-dessus inclut les détails de la paire de clés. Si vous n'êtes pas familier avec les clés GPG les choses à noter à ce stade sont:

1. Le vrai nom utilisé : Jean-Luc Mélanchon
2. Le porte-clés: `01C72E00B` (en fait de la dernière partie de l'empreinte digitale)
3. L'empreinte de la clé : `643B0C08FCE76FB743F2BD521B245ED01C72E00B`

### Le porte-clés

Avec GPG vient le concept de porte-clés. JLM possède un **porte-clés public** et un **porte-clés privé**. Les clés que vous venez de générer sont maintenant dans leurs porte-clés respectifs. Pour vérifier que la clé publique a été ajoutée au porte clés publiques entrez:

    gpg --list-keys
    gpg --list-secret-keys

Vous pouvez bien sûr simplement afficher les détails d'une ou plusieurs touches spécifiques en plaçant simplement leur nom d'utilisateur ou leur code d'accès après les commandes ci-dessus. Par exemple pour afficher uniquement la clé publique `jean-luc@melanchon.fr` vous pouvez utiliser :

    gpg --list-public-keys jean-luc@melanchon.fr
    gpg --list-secret-keys jean-luc@melanchon.fr

### Faire connaître votre clé publique aux autres

Jean-Luc aimerait que sa clé soit disponible pour tous ses insoumis qui en ont besoin pour lui envoyer des ~conneries~ documents chiffrées. Afin de la partager, il dispose des solutions suivantes:

1. Leur donner le fichier via courriel, USB ou le partager sur son site personnel
2. La stocker sur un "serveur de clés" pour que d'autres puissent la récupérer.

Pour la première option, il lui suffit d'exporter sa clé publique en utilisant l'option `--export`. Il devrait aussi utiliser l'option `--armor` qui permet de l'exporter au format texte et évite donc certaines déconvenues.

Jean-Luc utilise donc la commande suivante:

    gpg --armor --export jean-luc@melanchon.fr > public_key.asc

Notez que le nom du fichier _public_key.asc_ est arbitraire, mais informatif dans ce cas. Vous avez maintenant une copie de votre clé publique. Dans notre cas, le contenu de la clé publique jean-luc@melanchon.fr est indiqué ci-dessous :

    -----BEGIN PGP PUBLIC KEY BLOCK-----
    mQGNBFwOlZQBDADJNbK7qFazzDo5E6yEmC6dvkycPifTh4kFTiWK8UqoZi0WLbCN
    // ...
    DxsALDz9/ZwK0opDn5xSPpKxW3C06UNrLQ==
    =lF3m
    -----END PGP PUBLIC KEY BLOCK-----

Pour que votre ami puisse utiliser ces données avec GPG, il devra **ajouter la clé** à son trousseau de clés publiques en les important avec l'option `--import`:

    gpg --import public_key.asc

### Sauvegarde de votre clé privée

Pour sauvegarder une copie de données brutes ou une copie ASCII de la clé privée, vous pouvez utiliser l'option `--export-secret-keys`. Voici un exemple de données brutes (inclure `--armor` pour la version ASCII) :

    gpg --export-secret-keys jean-luc@melanchon.fr > private_key

> Notez que la clé privée exportée est toujours protégée par le mot de passe que vous avez utilisé lors de sa création.

Pour importer la clé privée dans votre porte-clés privé sur une autre boîte (ou une boîte reconstruite dans le cas où votre disque dur a été perdu), vous utiliseriez l'option `--import`. Donc dans notre cas, pour _jean-luc@melanchon.fr_, nous utiliserions:

    gpg --import private_key

Encore une fois, notez que la clé privée est toujours protégée par le mot de passe que vous avez utilisée lors de sa création.

### Utilisation d'un serveur de clés

Pour stocker votre clé publique sur un serveur de clés, utilisez l'option `--keyserver` avec l'option `--send-keys`:

    gpg --keyserver keyserver.ubuntu.com --send-keys jean-luc@melanchon.fr

Il existe d'autres serveurs de clés, mais ils se parlent entre eux, donc peu importe à qui vous les envoyez.

Si quelqu'un veut importer cette clé publique depuis le serveur de clés, il peut utiliser l'option `--recv-keys` comme ça:

    gpg --keyserver keyserver.ubuntu.com --recv-keys jean-luc@melanchon.fr

### Key Revocation

Si vous pensez que votre clé publique n'est plus valide (par exemple si vous pensez que votre clé privée a été compromise), vous pouvez la **révoquer** en utilisant un **certificat de révocation**. EVous pouvez créer un certificat de révocation en utilisant :

gpg --output revocation_cert.asc --gen-revoke jean-luc@melanchon.fr

> Notez que vous ne pouvez pas créer ce certificat de révocation après avoir perdu votre clé privée! Il est donc recommandé d'en créer un en même temps que vous créez la paire de clés, puis de le conserver dans un endroit vraiment sûr.

Si vous deviez utiliser ce certificat de révocation, vous feriez ce qui suit pour mettre à jour votre trousseau de clés :

    gpg --import revocation_cert.asc

Exécutez ensuite cette commande pour mettre à jour le serveur de clés:

    gpg --keyserver keyserver.ubuntu.com --send-keys jean-luc@melanchon.fr

## Utilisation de GPG

Maintenant que nous avons vu comment rapidement vu comment utiliser GPG, nous allons appliquer cela à des exemples concrets.

<!-- TODO -->

### Chiffrer ses email

<!-- TODO -->

### Signer ses commit avec Git

<!-- TODO -->

### Chiffrer des fichiers

Tout d'abord, assurez-vous d'avoir la clé publique de la personne pour laquelle vous souhaitez crypter les données. Vous pouvez le vérifier deux fois à l'aide de la commande :

    gpg --list-keys

Si vous possédez la clé publique, vous pouvez alors procéder aux commandes de chiffrement, sinon vous devrez d'abord obtenir la clé publique.

Pour crypter un fichier, vous pouvez utiliser l'option `-e` (ou `--encrypter`) avec l'option `-r` (ou `--recipient`), comme indiqué ci-dessous :

    gpg -e -r name filename

Donc si quelqu'un voulait crypter un fichier appelé _file.txt_ pour Jean-Luc Mélanchon, il utiliserais le courriel _jean-luc@melanchon.fr_:

    gpg -e -r jean-luc@melanchon.fr file.txt

Cela produira un fichier crypté appelé _file.txt.gpg_ que seul le destinataire peut décrypter. Si vous avez besoin de changer le nom du fichier crypté résultant, utilisez l'option `-o` (ou `--output`). P ar exemple pour l'appeler _fichier.gpg_, vous pouvez utiliser :

    gpg -o file.gpg -e -r jean-luc@melanchon.fr file.txt

> Notez que si vous n'aviez pas encore vérifié la clé publique (voir la première partie pour savoir comment), vous recevrez un message d'avertissement à cet effet lorsque vous essayez de crypter les données en utilisant cette clé publique.

#### Déchiffrement de textes chiffrés de façon asymétrique

Pour que le destinataire décrypte les données cryptées créées dans les étapes ci-dessus, il doit spécifier le fichier de sortie en utilisant `-o` et aussi utiliser l'option `-d` (ou `--decrypt`):

    gpg -o file.txt -d file.txt.gpg

Le destinataire sera invité à entrer la phrase de passe de sa clé privée. Si la phrase de chiffrement correcte est utilisée, l'algorithme de déchiffrement se poursuit et les données d'origine sont stockées dans le _fichier.txt_.

Il est important de noter que si aucun fichier de sortie n'est spécifié, le chiffrement décrypté, c'est-à-dire le texte en clair (les données d'origine) est envoyé en sortie standard. Ainsi, à moins que vous ne le transfériez vers un fichier ou un autre programme, il sera affiché dans votre terminal et non stocké dans un fichier.

## Liens

- <https://www.tutonics.com/2012/11/gpg-encryption-guide-part-1.html>
