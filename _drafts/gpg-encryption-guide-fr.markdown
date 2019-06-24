---
origin: https://www.tutonics.com/2012/11/gpg-encryption-guide-part-1.html
---

# Guide du Chiffrement avec GPG - Partie 1

Apprenez à utiliser le chiffrement de niveau militaire à l'aide de GPG. Ceci est le premier d'une série de guides qui vous apprendront à utiliser GPG pour le chiffrement symétrique et asymétrique.

## Présentation de _GNU Privacy Guard_ (GPG)

_GNU Pirvacy Guard_ est une implémentation du standard **OpenPGP**. Ubuntu, et d'autres distributions Linux, inclue _GNU Privacy Guard_ de base via la commande `gpg`.

La commande `gpg` peut être utilisée pour le chiffrement symétrique et asymétrique de vos fichiers et données (y compris les e-mails). Il peut également être utilisé pour effectuer des signatures numériques. Si vous n'êtes pas familier avec ces concepts, ne vous inquiétez pas: nous allons vous expliquer toute la terminologie et les concepts que vous devez connaître en langage simple.

Nous vous montrerons ensuite comment générer une paire de clés et comment l'importer et l'exporter (et pourquoi vous devriez le faire). Alors commençons par la terminologie...

## Chiffrement symétrique

Le chiffrement symétrique implique un processus de chiffrement et de déchiffrement qui utilisent la même clé. Dans ce cas, la clé est considérée comme un secret partagé et doit être gardé confidentielle à la fois par le crypteur et par le décrypteur. Voici quelques exemples d'algorithmes supportés par `gpg` pour le chiffrement symétrique: AES, Blowfish, Twofish, et Triple Des

## Chiffrement asymétrique

Le chiffrement asymétrique implique l'utilisation d'une **clé publique** et d'une **clé privée**. Comme on peut le deviner d'après les noms, seule la clé privée doit rester privée. La clé publique est mise à la disposition de quiconque souhaite chiffrer des données pour les envoyer au propriétaire de la clé publique.

Exemple avec Alice et Bob: Si Bob voulait envoyer un fichier crypté ou un courriel à Alice, Bob crypterait les données à l'aide de la clé publique d'Alice, puis les enverrait à Alice. Alice peut alors déchiffrer les données à l'aide de sa clé privée à laquelle elle seule a accès. Une fois que Bob a crypté les données, personne d'autre qu'Alice ne peut les décrypter.

> Notez qu'une clé privée est généralement protégée par une **phrase de chiffrement**, donc même sur sa propre boîte Ubuntu où se trouve la clé, Alice devra quand même entrer une phrase de chiffrement pour "déverrouiller" la clé privée.

Bob aura sa propre paire de clés publiques/privées pour que les gens puissent lui envoyer des données cryptées. Ainsi, si Alice voulait envoyer des données cryptées à Bob, elle les crypterait à l'aide de la clé publique de Bob, tandis que Bob pourrait les décrypter à l'aide de sa propre clé privée. Le meilleur algorithme cryptographique asymétrique supporté par GPG est appelé **RSA**.

## Condensé (_Hashes_) ou hachage (_Digests_)

Un condensé ou hachage est un algorithme cryptographique unidirectionnel qui, lorsqu'il est appliqué aux données, produit une sortie de taille fixe spécifique. En d'autres termes, vous pouvez utiliser une fonction de hachage pour obtenir l'_"empreinte digitale"_ d'un bloc de données arbitraire. Si vous recevez des données et un hachage cryptographique pour ces données, si un nouveau calcul de ce hachage ne correspond pas à celui fourni, alors vous savez que les données ont été altérées.

Quelques exemples d'algorithme de _hashes_ et de _Digests_ supportés par GPG sont: SHA1, SHA256 et SHA512.

## Signatures numériques

Lorsque Alice reçoit des données de Bob, il est parfois utile pour Alice de s'assurer que les données envoyées n'ont pas été **altérées**. Dans de tels cas, un **hachage cryptographique** est effectué sur les données du côté de l'expéditeur, et crypté à l'aide de la clé privée de l'expéditeur

> notez que parfois les données elles-mêmes n'ont pas besoin d'être cryptées bien qu'elles puissent l'être

Le hachage signé prouve dans les deux cas que les données proviennent de Bob, l'expéditeur. Alice peut maintenant déchiffrer la signature en utilisant la clé publique de Bob pour produire le hachage cryptographique des données envoyées. Puis, du côté d'Alice, le hachage cryptographique des données est recalculé. Si le nouveau calcul correspond à celui fourni par Bob, cela prouve que les données n'ont pas été modifiées et qu'elles proviennent bien de Bob.

## Générer une paire de clés GPG

Une **paire de clés** est nécessaire pour le chiffrement asymétrique (et donc la signature numérique). Si vous voulez seulement utiliser GPG pour le chiffrement symétrique, ce processus n'est pas nécessaire.

Pour générer une paire clé publique/clé privée, exécutez la commande suivante:

    gpg --full-generate-key

Et voici un exemple de l'affichage que vous pouvez obtenir en générant une paire de clés GPG:

    $ gpg --full-generate-key
    gpg (GnuPG) 2.2.8; Copyright (C) 2018 Free Software Foundation, Inc.
    This is free software: you are free to change and redistribute it.
    There is NO WARRANTY, to the extent permitted by law.

    Sélectionnez le type de clef désiré :
    (1) RSA et RSA (par défaut)
    (2) DSA et Elgamal
    (3) DSA (signature seule)
    (4) RSA (signature seule)
    Quel est votre choix ? 1
    les clefs RSA peuvent faire une taille comprise entre 1024 et 4096 bits.
    Quelle taille de clef désirez-vous ? (3072)
    La taille demandée est 3072 bits
    Veuillez indiquer le temps pendant lequel cette clef devrait être valable.
         0 = la clef n'expire pas
      <n>  = la clef expire dans n jours
      <n>w = la clef expire dans n semaines
      <n>m = la clef expire dans n mois
      <n>y = la clef expire dans n ans
    Pendant combien de temps la clef est-elle valable ? (0)
    La clef n'expire pas du tout
    Est-ce correct ? (o/N) o

    GnuPG doit construire une identité pour identifier la clef.

    Nom réel : Jean-Luc Mélanchon
    Adresse électronique : jean-luc@melanchon.fr
    Commentaire : Je suis la république.
    Vous utilisez le jeu de caractères « utf-8 ».
    Vous avez sélectionné cette identité :
    « Jean-Luc Mélanchon (Je suis la république.) <jean-luc@melanchon.fr> »

    Changer le (N)om, le (C)ommentaire, l'(A)dresse électronique
    ou (O)ui/(Q)uitter ? o
    De nombreux octets aléatoires doivent être générés. Vous devriez faire
    autre chose (taper au clavier, déplacer la souris, utiliser les disques)
    pendant la génération de nombres premiers ; cela donne au générateur de
    nombres aléatoires une meilleure chance d'obtenir suffisamment d'entropie.
    De nombreux octets aléatoires doivent être générés. Vous devriez faire
    autre chose (taper au clavier, déplacer la souris, utiliser les disques)
    pendant la génération de nombres premiers ; cela donne au générateur de
    nombres aléatoires une meilleure chance d'obtenir suffisamment d'entropie.
    gpg: clef 1B245ED01C72E00B marquée de confiance ultime.
    gpg: revocation certificate stored as '/home/arousseau/.gnupg/openpgp-revocs.d/643B0C08FCE76FB743F2BD521B245ED01C72E00B.rev'
    les clefs publique et secrète ont été créées et signées.

    pub   rsa3072 2018-12-10 [SC]
      643B0C08FCE76FB743F2BD521B245ED01C72E00B
    uid                      Jean-Luc Mélanchon (Je suis la république.) <jean-luc@melanchon.fr>
    sub   rsa3072 2018-12-10 [E]

Comme vous pouvez le constater, plusieurs options vous seront proposées en cours de route.

Tout d'abord, vous devrez choisir un algorithme, l'algorithme par défaut de RSA et RSA est le meilleur donc utilisez l'option 1.

La taille de clé par défaut de 2048 est suffisamment forte, donc utilisez-la aussi en appuyant sur retour.

Notez que le choix d'une taille de clé plus grande (donc encore plus forte) ralentira les processus de chiffrement/déchiffrement. C'est donc un compromis entre une clé qui est assez forte par rapport à la vitesse (et une taille de clé de 2048 est plus que suffisante).

L'expiration par défaut de la clé (qui n'expire jamais) est également adaptée aux besoins de la plupart des gens.

Il vous sera alors demandé d'entrer votre "Vrai nom", une adresse électronique, et un commentaire (qui pourrait être un simple rappel sur l'utilisation prévue des touches). Vous aurez alors la possibilité de modifier ces valeurs avant de procéder à la création de la paire de clés GPG.

Une fois que vous aurez confirmé ces valeurs, vous serez invité à entrer et entrer à nouveau la phrase de chiffrement (qui est utilisée pour protéger votre clé privée).

Faites attention lors du choix de votre phrase de passe:

- n'utilisez jamais de mots du dictionnaire
- incluez toujours un mélange de lettres majuscules et minuscules ainsi que quelques chiffres et symboles
- assurez-vous que ce n'est pas un mot court

Après cela, aucune autre entrée n'est nécessaire. Vous n'aurez qu'à attendre que les clés soient créées, ce qui peut prendre quelques minutes s'il n'y a pas assez de données aléatoires disponibles comme le montre la capture d'écran ci-dessous.

> Hein ? Qu'est-ce que ça veut dire ?

Ne vous inquiétez pas de la génération de données aléatoires: c'est juste informatif. Ce qui est important c'est que votre clé a maintenant été générée sur la base de données aléatoires.

La dernière partie de la sortie montrée dans la capture d'écran ci-dessus inclut les détails de la paire de clés. C'est ainsi que vous serez en mesure d'identifier votre clé lorsque vous en aurez besoin.

Si vous n'êtes pas familier avec les clés GPG les choses à noter à ce stade sont:

1. Le vrai nom utilisé : Jean-Luc Mélanchon
2. Le porte-clés: `01C72E00B` (en fait de la dernière partie de l'empreinte digitale)
3. L'empreinte de la clé : `643B0C08FCE76FB743F2BD521B245ED01C72E00B`

Plus tard, vous pourrez vous référer à la paire de clés par n'importe laquelle d'entre elles en fonction du contexte de ce que vous faites.

### Vos porte-clés

Avec GPG vient le concept de porte-clés. Vous avez un **porte-clés public** et un **porte-clés privé**. Les clés que vous venez de générer sont maintenant sur dans leurs porte-clés respectifs. Pour vérifier que la clé publique a été ajoutée au porte clés publiques entrez:

    gpg --list-keys

ou

    gpg --list-public-keys

Pour visualiser vos clés privées entrez

    gpg --list-secret-keys

Vous pouvez bien sûr simplement afficher les détails d'une ou plusieurs touches spécifiques en plaçant simplement leur nom d'utilisateur ou leur code d'accès après les commandes ci-dessus. Par exemple pour afficher uniquement la clé publique `jean-luc@melanchon.fr` vous pouvez utiliser :

    gpg --list-public-keys jean-luc@melanchon.fr

ou

    gpg --list-public-keys 01C72E00B

et pour voir la clé privée, vous l'avez deviné, c'est

    gpg --list-secret-keys jean-luc@melanchon.fr

or

    gpg --list-secret-keys 01C72E00B

> Notez qu'en ce qui concerne la paire de clé que vous venez de générer, la sortie des commandes des touches de la liste ci-dessus doit être la même (sauf `pub` vs `sec` et `sub` vs `ssb`). La raison pour laquelle ils sont les mêmes qu'ils se réfèrent simplement à l'identité de la clé plutôt qu'à la clé elle-même.

## Faire connaître votre clé publique aux autres

Pour résumer, votre clé publique sera utilisée par d'autres personnes lorsqu'elles voudront chiffrer des données à vous envoyer. Vous utiliserez votre clé privée pour déchiffrer ces données.

C'est pourquoi la clé privée est si importante et doit rester privée. Votre ami générera sa propre paire de clés. Si vous voulez chiffrer des données et les leur envoyer, vous les chiffrerez à l'aide de leur clé publique. Ils le déchiffrerons ensuite pour eux-mêmes à l'aide de leur propre clé privée.

Pour que vos amis puissent obtenir votre clé publique, vous pouvez:

1. Leur donner le fichier
2. Leur envoyer par courriel.
3. Le mettre le en ligne sur votre site Web ou votre blogue
4. La stocker sur un "serveur de clés" pour que d'autres puissent la récupérer.

Pour (1), (2) et (3), vous devez d'abord exporter votre clé publique en utilisant l'option `--export`. Cependant, vous devrez exporter vers un format gérable. C'est-à-dire que vous ne devriez pas utiliser les données binaires brutes qui peuvent causer toutes sortes de problèmes (y compris ne pas être portable par courriel). Pour résoudre ce problème, GPG peut générer une sortie blindée ASCII pour vous lorsque vous utilisez l'option `--armor` (ou `-a`)

Donc pour exporter, lancez cette commande :

    gpg --armor --export jean-luc@melanchon.fr > public_key.asc

Notez que le nom du fichier _public_key.asc_ est arbitraire, mais informatif dans ce cas. Vous avez maintenant une copie de votre clé publique. Dans notre cas, le contenu de la clé publique jean-luc@melanchon.fr est indiqué ci-dessous :

    -----BEGIN PGP PUBLIC KEY BLOCK-----

    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
    DxsALDz9/ZwK0opDn5xSPpKxW3C06UNrLQ==
    =lF3m
    -----END PGP PUBLIC KEY BLOCK-----

Pour que votre ami puisse utiliser ces données avec GPG, il devra **ajouter la clé** à son trousseau de clés publiques en les important avec l'option `--import`:

    gpg --import public_key.asc

Notez que vous utiliseriez la même commande pour importer une clé publique formatée en ASCII d'un ami dans votre porte-clés publique:

    gpg --import my_friends_public_key.asc

Notez également que lorsqu'une clé publique est importée, vous devez la signer comme indiqué ci-dessous.

## Validation des clés publiques importées par signature

Lorsque vous importez la clé publique d'une personne dans votre trousseau de clés, vous devez la valider en vérifiant l'**empreinte digitale** avec elle (par exemple, par téléphone). Une fois que vous êtes certain qu'il s'agit de leur clé publique, vous devez la **signer**.

Par exemple, pour signer la clé publique de _Jean-Luc Mélanchon_, un utilisateur édite la clé en exécutant cette commande :

    gpg --edit-key jean-luc@melanchon.fr

Cela vous amènera à une **interface** de ligne de commande GPG à partir de laquelle vous pouvez afficher l'empreinte digitale en utilisant :

    fpr

Une fois vérifiée auprès du propriétaire, vous pouvez signer la clé à l'aide de:

    sign

Ensuite, pour vérifier qu'il est signé, vous pouvez exécuter:

    check

Pour sortir de l'interface en ligne de commande de GPG entrez : _"Quitter"_ ou appuyez sur _Ctrl+d_. On vous demandera si vous voulez _"Sauvegarder les modifications ? (y/N)"_: entrez _"y"_. Maintenant que vous avez validé cette clé publique.

## Sauvegarde de votre clé privée (ou copie pour utilisation sur une autre machine)

Pour sauvegarder une copie de données brutes ou une copie ASCII de la clé privée, vous pouvez utiliser l'option `--export-secret-keys`. Voici un exemple de données brutes (inclure `--armor` pour la version ASCII) :

    gpg --export-secret-keys jean-luc@melanchon.fr > private_key

> Notez que la clé privée exportée est toujours protégée par le mot de passe que vous avez utilisé lors de sa création.

Pour importer la clé privée dans votre porte-clés privé sur une autre boîte (ou une boîte reconstruite dans le cas où votre disque dur a été perdu), vous utiliseriez l'option `--import`. Donc dans notre cas, pour _jean-luc@melanchon.fr_, nous utiliserions:

    gpg --import private_key

Encore une fois, notez que la clé privée est toujours protégée par le mot de passe que vous avez utilisée lors de sa création.

## Utilisation d'un serveur de clés

Pour stocker votre clé publique sur un serveur de clés, utilisez l'option `--keyserver` avec l'option `--send-keys`:

    gpg --keyserver servername --send-keys key-id

Ainsi, par exemple, nous avons utilisé:

    gpg --keyserver keyserver.ubuntu.com --send-keys jean-luc@melanchon.fr

> Il existe d'autres serveurs de clés, mais ils se parlent entre eux, donc peu importe à qui vous les envoyez.

Si quelqu'un veut importer cette clé publique depuis le serveur de clés, il peut utiliser l'option `--recv-keys` comme ça:

    gpg --keyserver keyserver.ubuntu.com --recv-keys jean-luc@melanchon.fr

## Key Revocation

Si vous pensez que votre clé publique n'est plus valide (par exemple si vous ne l'utilisez plus ou si vous pensez que votre clé privée a été compromise), vous pouvez la **révoquer** en utilisant un **certificat de révocation**. EVous pouvez créer un certificat de révocation en utilisant :

gpg --output revocation_cert.asc --gen-revoke jean-luc@melanchon.fr

> Notez que vous ne pouvez pas créer ce certificat de révocation après avoir perdu votre clé privée! Il est donc recommandé d'en créer un en même temps que vous créez la paire de clés, puis de le conserver dans un endroit vraiment sûr.

Si vous deviez utiliser ce certificat de révocation, vous feriez ce qui suit pour mettre à jour votre trousseau de clés :

    gpg --import revocation_cert.asc

Exécutez ensuite cette commande pour mettre à jour le serveur de clés:

    gpg --keyserver keyserver.ubuntu.com --send-keys jean-luc@melanchon.fr

## Whats next?

OK, c'était beaucoup d'infos à absorber. Dans la prochaine partie du Guide GPG, nous vous montrerons comment utiliser la commande GPG pour le **chiffrement asymétrique**.

Merci à tous ceux qui ont travaillé sur _GNU Privacy Guard_ (l'implémentation des projets GNU du standard OpenPGP)

---

# Guide du Chiffrement avec GPG - Partie 2 (Chiffrement Asymétrique)

Ici, nous couvrons le chiffrement asymétrique et le déchiffrement des données à l'aide de la commande GPG.

Pour rafraîchir rapidement la mémoire, le chiffrement asymétrique implique l'utilisation d'une **paire de clés publiques/privées**. La clé publique est distribuée aux personnes qui souhaitent vous envoyer des données cryptées. Vous utilisez ensuite votre clé privée (à laquelle personne d'autre n'a accès) pour déchiffrer ces données.

## chiffrement asymétrique

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

## Déchiffrement de textes chiffrés de façon asymétrique

Pour que le destinataire décrypte les données cryptées créées dans les étapes ci-dessus, il doit spécifier le fichier de sortie en utilisant `-o` et aussi utiliser l'option `-d` (ou `--decrypt`):

    gpg -o file.txt -d file.txt.gpg

Le destinataire sera invité à entrer la phrase de passe de sa clé privée. Si la phrase de chiffrement correcte est utilisée, l'algorithme de déchiffrement se poursuit et les données d'origine sont stockées dans le _fichier.txt_.

Il est important de noter que si aucun fichier de sortie n'est spécifié, le chiffrement décrypté, c'est-à-dire le texte en clair (les données d'origine) est envoyé en sortie standard. Ainsi, à moins que vous ne le transfériez vers un fichier ou un autre programme, il sera affiché dans votre terminal et non stocké dans un fichier.

## Et ensuite?

Dans la prochaine partie du Guide GPG, nous vous montrerons comment le crypteur peut utiliser la commande GPG pour signer numériquement les données et comment le destinataire peut vérifier cette signature.

---

# Guide du Chiffrement avec GPG - Partie 3 (Signature numérique)

Cette partie va vous expliquer comment signer numériquement des données de diverses manières et aussi comment les vérifier.

## Le but des signatures numériques

Lorsqu'un expéditeur utilise une clé publique pour crypter les données d'un destinataire, comment ce dernier est-il censé savoir si l'expéditeur est bien celui qu'il prétend être?

La clé publique est à la disposition de tous, de sorte que l'expéditeur doit pouvoir prouver sans équivoque que les données proviennent d'eux. GPG fournit donc un moyen de le faire en combinant avec une signature (comme une empreinte digitale) aux données qui prouve que les données n'ont pas été trafiquées.

Les principales étapes de la signature numérique (et éventuellement du chiffrement) sont les suivantes:

1. L'expéditeur dispose d'une paire de clés publique et privée. Il a préalablement **envoyé sa clé** publique au destinataire.
2. L'expéditeur générera une **clé de hachage** (ou digest).
3. Ce hachage est chiffré à l'aide de la **clé privée** de l'expéditeur et il est ajouté aux données d'origine.
4. Ensuite, optionnellement, le tout peut être crypté à l'aide de la clé publique du destinataire.
5. Côté destinataire (si l'étape précédente a été effectuée), les données chiffrées signées numériquement sont **déchiffrées** à l'aide de la clé privée du destinataire.
6. La **signature numérique** est déchiffrée à l'aide de la clé publique de l'expéditeur pour révéler un **hachage/digest des données originales** (il s'agit du hachage ou du digest fourni).
7. Un **nouveau calcul** du hachage/digest des données originales (sans la signature jointe) est effectué du côté du destinataire, si cela correspond au hachis fourni, alors la seule personne qui aurait pu envoyer les données est le véritable propriétaire de la clé publique utilisée pour signer. Notez que le hachage correspondant prouve à la fois l'intégrité des données et l'identité du propriétaire, prouvant ainsi que les données sont authentiques.

Une signature numérique fournit également ce qu'on appelle la **non-répudiation**, c'est-à-dire que le signataire ne peut pas prétendre qu'il n'a pas signé les données et que sa clé privée reste privée.

Bien que ce type de signature numérique ne soit pas nécessaire chaque fois qu'un expéditeur envoie des données, dans certains cas, il est vital que le destinataire puisse prouver l'identité et l'authenticité des données envoyées, auquel cas une signature numérique doit être utilisée.

## Utilisation d'une signature sans chiffrement

Si un document, un logiciel ou d'autres données sont disponibles pour la consommation publique, il n'est pas nécessaire de les chiffrer.
Dans un tel cas, cependant, il peut toujours y avoir de bonnes raisons pour les personnes de vouloir prouver que les données sont authentiques (proviennent du créateur ou du propriétaire spécifié et n'ont pas été trafiquées). C'est là que les signatures numériques peuvent être utiles.

> L'utilisation d'une signature numérique seule (sans chiffrement) n'implique que les étapes 1, 2, 3, 6 et 7.

Il existe deux types de signature numérique que GPG peut applique:

- Une **signature normale**, où les données binaires brutes de la signature sont incluses avec les données d'origine
- Une **signature d'enseigne** claire où la signature est ajoutée comme texte lisible (une signature _base64 ascii-armor_)

Les commandes pour utiliser ces deux types de signature sont décrites ci-dessous.

### Using A Clear Sign Digital Signature

Pour utiliser gpg pour une signature numérique en texte clair, utilisez l'option `--clearsign`. Par exemple, pour signer _file.txt_ en utilisant cette méthode, vous devriez utiliser :

    gpg --clearsign -u jean-luc@melanchon.fr file.txt

> L'option `-u` permet de spécifier quel clé privée utiliser

Si l'on regarde le contenu du fichier _file.txt.asc_ généré, on retrouve le contenu du fichier ("toto") et la signature numérique

    -----BEGIN PGP SIGNED MESSAGE-----
    Hash: SHA512

    toto
    -----BEGIN PGP SIGNATURE-----

    iQHKBAEBCgA0FiEEa9I6rhl90CBcRhoqQWWdFwbmn38FAlwSCEUWHGplYW4tbHVj
    QG1lbGFuY2hvbi5mcgAKCRBBZZ0XBuaff+zqC/9FgndYyTKnRQ8JthO/iOaoYSlw
    CZzG6eK8GFL5He1SCxpkmc4Q8twuxfCvOctvsET9vdRHBkBOlr/TREIhol6bZ4KG
    CB2m4pIbbTZIHrSb8eVM9l05HUCzodFlg0t/kb0fgONxJbDt5pjDPeGI0kVY4ySh
    +rpOJv2stdR1wM5nPfRxtJWQxfix/3tsMquk7K0XmtLlpH2NW6KNfOwiEPv2lqLa
    69nBTrzmfYdgcS953+aTCBeLJ20vcDFyxkuW/sI7+GErAIvIls8e1IMJ9IRFXvGD
    x0igJpgZxnWUWcbRnLPo/JmOkn51rB6REv+9RxiHOLEG8noIIMRIVUBBrBzbiJu2
    43iN/lXSsZ7jmdM1fuzPYA9bcDC9QgdUSVfJ6LkCY1eQf2ImvlK+qNqa67ZSyUsB
    EOFPkgBf12Og3bPvxlD51SBjJIIKBeFVsz/iG1iGLH3lUkaDc2BCy89+1+dVvb8e
    lbnlZUd+nXNIdxxmw2t+mcTS0vhkLS+0VVM9LIE=
    =LlJf
    -----END PGP SIGNATURE-----

La capture d'écran ci-dessous montre cette commande en action, et un dump du résultat (le fichier original file.txt ne contient qu'une seule ligne de texte disant "Ce fichier n'est pas destiné à être crypté, juste signé", file.txt.asc inclut cela avec la signature numérique).

> Notez que par défaut le nom du fichier signé a un _.asc_ en annexe, vous pouvez contrôler le nom en utilisant l'option `-o` (ou `--output`).

Du côté destinataire, le destinataire peut vérifier la signature (à condition d'avoir la clé publique de l'expéditeur sur son porte-clés).

    $ gpg --verify file.txt.asc

L'affichage devrait alors être comme l'exemple suivant:

    gpg: Signature faite le jeu. 13 déc. 2018 08:22:00 CET
    gpg:                avec la clef RSA 6BD23AAE197DD0205C461A2A41659D1706E69F7F
    gpg:                issuer "jean-luc@melanchon.fr"
    gpg: Bonne signature de « Jean-Luc <jean-luc@melanchon.fr> » [ultime]

### Utilisation d'une signature numérique binaire

Pour signer les données normalement, utilisez l'option `-s` (ou `--sign`). En utilisant le même _fichier.txt_ que celui que nous avons utilisé ci-dessus, nous pouvons signer ainsi :

    $ gpg --sign -u jean-luc@melanchon.fr file.txt

Cela produira le fichier _file.txt.gpg_, dont le contenu contiendra nos données (lisibles) ainsi que ce qui ressemble à des déchets illisibles (ceci est la signature brute). Quelqu'un avec la clé publique de l'expéditeur peut le vérifier exactement de la même manière qu'une signature de signe clair en utilisant l'option `--verify`

    gpg --verify file.txt.gpg

### Utilisation d'une signature numérique avec chiffrement asymétrique des données

Lorsque l'expéditeur chiffre également les données à décrypter pour le destinataire, l'expéditeur doit simplement combiner les commandes utilisées pour le chiffrement asymétrique avec l'option `-s` (ou `--sign`).

La commande ci-dessous signe et crypte pour le destinataire Jean-Luc:

    gpg -o file.enc --sign -e -r jean-luc@melanchon.fr file.txt

Afin de vérifier sans décrypter, le destinataire peut s'exécuter:

    gpg --verify file.txt.gpg

> Notez qu'ils auront besoin de la clé publique de l'expéditeur sur leur porte-clés !

Pour décrypter et vérifier, l'option `-d` (ou `--decrypt`) fera les deux (c'est-à-dire qu'elle essaiera automatiquement de vérifier la signature s'il y en a une).

    gpg --decrypt file.txt.gpg

Si le destinataire n'a pas la clé publique de l'expéditeur sur son porte-clés pour vérification, le déchiffrement fonctionnera toujours comme d'habitude, mais le message suivant sera affiché:

    gpg: Can't check signature: public key not found

Notez également que leur clé publique n'est peut-être pas fiable, auquel cas vous obtiendrez un message comme:

    gpg: WARNING: This key is not certified with a trusted signature!
    gpg:          There is no indication that the signature belongs to the owner.

Si vous connaissez le propriétaire (et que vous lui faites vraiment confiance) et que vous avez déjà vérifié l'empreinte digitale de sa clé publique avec lui, vous voudrez peut-être ajuster le paramètre "confiance" pour sa clé.

Faites-le en utilisant l'option `--edit-key`, puis à partir de l'interface en ligne de commande de GPG, lancez:

    trust

Réglez le niveau de confiance à 5 : _"I trust ultimately"_ (si c'est vraiment le cas!).

L'avertissement ne se reproduira plus si vous utilisez leur clé publique.

### Utilisation d'une signature numérique détachée

Si vous souhaitez laisser le fichier original tel-quel et créer un fichier de signature binaire séparé, vous pouvez utiliser l'option `--detach-sign`. Par exemple, en utilisant l'exécution du _fichier.txt_:

    gpg --detach-sign file.txt

Cela produira le fichier _file.txt.sig_, qui est mis à la disposition des autres avec les données d'origine (_file.txt_ dans ce cas). Pour vérifier l'authenticité de _file.txt_, vous devez exécuter la commande suivante (qui suppose que _file.txt_ est dans le répertoire courant avec _file.txt.sig_) :

    gpg --verify file.txt.sig

ou, si vous avez changé le nom du _fichier.txt_ en nom de fichier entre-temps ou si vous l'avez dans un autre répertoire, vous pouvez spécifier l'emplacement du fichier de données original de cette façon:

    gpg --verify file.txt.sig /path/to/filename

## What's next?

Dans le prochain chapitre, nous parlerons de l'utilisation de GPG pour le chiffrement symétrique en utilisant différents algorithmes.

---

# chiffrement symétrique

Ce guide GPG explique comment utiliser la commande GPG pour un chiffrement symétrique simple mais puissant en utilisant différents algorithmes de chiffrement par blocs.

## Chiffrement sans tracas

Un autre type de solution cryptographique fournie par _Gnu Privacy Guard (GPG)_ est le chiffrement à clé symétrique, également connu sous le nom de chiffrement par blocs.

Les chiffres utilisés pour le chiffrement à clé symétrique utilisent la même clé pour les étapes de chiffrement et de déchiffrement. Cette clé est aussi appelée un **secret partagé**.

La raison pour laquelle les chiffres sont appelés des chiffres de bloc est parce que les données à chiffrer sont chiffrées en **morceaux** ou en blocs.

Si vous souhaitez simplement crypter certains fichiers ou données et que vous ne souhaitez pas mettre en place une paire de clés (nécessaire pour le chiffrement asymétrique et les signatures numériques), alors la cryptographie à clé symétrique est votre réponse.

Ci-dessous, nous allons couvrir plusieurs des chiffres disponibles, y compris : AES256, TWOFISH et CAMELLIA256.

Pour voir une liste des chiffres disponibles, lancez

    gpg --version

> Si vous utilisez la version anglaise, la partie que vous recherchez utilise le mot _"Cypher"_ plutôt que _"cipher"_ (les deux sont valides en anglais, le chiffre est l'orthographe américaine).

Vous verrez quelque chose comme ça:

    Chiffrement : IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256,
                  TWOFISH, CAMELLIA128, CAMELLIA192, CAMELLIA256

Chaque fois que vous utilisez un chiffre symétrique pour crypter des données, il vous sera demandé de fournir une phrase de chiffrement (deux fois pour la confirmer). Cette phrase de passe est utilisée pour aider à générer une clé qui est ensuite utilisée avec l'algorithme choisi pour crypter les données.

> Il va sans dire (mais nous le dirons quand même) que vous devez utiliser une phrase de passe forte et n'oubliez pas ce que vous avez choisi!

Lorsque vous allez déchiffrer les données, vous serez invité à entrer cette phrase de passe.

> Notez que pour indiquer à la commande GPG que vous voulez utiliser le chiffrement à clé symétrique, utilisez l'option `--symmetric` (ou `-c`).

## AES256 Cipher

Si vous n'êtes pas sûr du chiffrement à utiliser, AES est le choix sûr car il est recommandé par le gouvernement américain et c'est le plus couramment utilisé (notez que cela ne signifie pas nécessairement qu'il est le plus fort et le plus rapide dans tous les cas).

AES a une taille de bloc de 128bits. Le 256 dans le nom est en relation avec la taille de clé de AES256, qui est plus sûr 256bits (32 octets).

Pour crypter les données à l'aide de 256 bits AES, utilisez l'option `--cipher-algo AES256`. Par exemple, pour crypter un fichier appelé _file.txt_ en utilisant ce chiffrement, utilisez :

    gpg --symmetric --cipher-algo AES256 file.txt

Ceci produira le fichier _file.txt.gpg_ contenant les données cryptées. Vous pouvez appeler le fichier résultant comme vous voulez en utilisant l'option `-o` (ou `--output`).

    gpg -o filename --symmetric --cipher-algo AES256 file.txt

Pour décrypter le fichier _file.txt.gpg_ (ou quel que soit son nom), exécutez :

    gpg -o original_file.txt -d file.txt.gpg

## Twofish

Twofish a une taille de bloc de 128 bits. Avec GPG, si `TWOFISH` est utilisé comme algorithme, il utilise une taille de clé de 256 bits (32 octets).
Pour crypter à l'aide du chiffrement Twofish (qui est considéré comme fort), utilisez la commande suivante :

    gpg --symmetric --cipher-algo TWOFISH file.txt

Pour décrypter exécutez la commande:

    gpg -d file.txt.gpg

## CAMELLIA256

CAMELLIA a également une taille de bloc de 128 bits et si vous utilisez CAMELLIA256 comme algorithme de chiffrement, vous utiliserez une taille de clé de 256 bits (32 bytes). Pour crypter à l'aide de ce chiffre, utilisez la commande:

    gpg --symmetric --cipher-algo CAMELLIA256 file.txt

Pour décrypter exécutez la commande:

    gpg -d file.txt.gpg

## CAST5 - Le chiffrement par défaut de GPG

Si vous ne spécifiez pas quel algorithme utiliser, CAST5 sera utilisé par défaut. CAST5 a une taille de bloc de 64 bits. Il s'agit d'un chiffrement décent que certains, comme le gouvernement canadien, considèrent comme sécuritaire. Cependant, de nombreux cryptographes de haut niveau, comme Bruce Schneier, recommanderaient qu'il soit préférable d'utiliser un chiffrement avec une taille de bloc plus grande que 64 bits.

Ainsi, si vous souhaitez choisir un algorithme encore meilleur comme Twofish ou AES256 (qui ont tous deux une taille de bloc de 128bits), vous pouvez configurer la valeur par défaut en éditant _~/.gnupg/gpg.conf_ et en ajoutant une ligne comme celle ci-dessous:

    cipher-algo AES256

Si vous utilisez CAST5 ou n'importe quel chiffre dont la taille de bloc est inférieure ou égale à 64 bits (3DES est un autre exemple de taille de bloc 64 bits), vous devez également utiliser l'option `--force-mdc`. Cela impose l'utilisation d'un chiffrement avec un code de détection de modification. Sans l'utilisation d'un mdc, le message crypté devient vulnérable à une attaque de modification de message.

Donc, juste pour être clair: pour les chiffres de taille de bloc de 64 bits ou moins, vous obtiendrez l'avertissement suivant lors du déchiffrement sauf si vous utilisez l'option `--force-mdc`:

    gpg: WARNING: message was not integrity protected

Vous pouvez ajouter `--force-mdc` à votre _~/.gnupg/gpg.conf_ pour ne pas avoir à spécifier `--force-mdc` sur la ligne de commande à chaque fois (le comportement `--force-mdc` est déjà fait pour les chiffres de plus grande taille, donc il sera simplement ignoré si utilisé avec eux). En supposant que vous n'avez pas touché vos valeurs par défaut dans _~/.gnupg/gpg.conf_, pour crypter un fichier appelé _file.txt_ en utilisant le chiffrement CAST5 que vous n'aurez qu'à utiliser :

    gpg --symmetric --force-mdc file.txt

Ceci produira le fichier _file.txt.gpg_ contenant les données cryptées. Comme d'habitude, vous pouvez appeler le fichier résultant comme vous voulez en utilisant l'option `-o` (ou `--output`). Donc pour l'appeler _file.enc_, vous utiliseriez :

    gpg -o file.enc --symmetric --force-mdc file.txt

Ensuite, pour le décrypter, il vous suffit d'utiliser l'option `-d` avec le nom de votre fichier crypté (par exemple _file.txt.gpg_).

    gpg -o original_file.txt -d file.txt.gpg

Notez que si vous n'utilisez pas `-o` pour sortir vers un fichier, les données décryptées sont envoyées vers la sortie standard, ce qui, à moins de les rediriger vers un fichier ou de les transférer vers un autre programme, sera affiché sur votre écran.

## Format de données convivial

Si vous devez copier et coller vos données cryptées (par exemple dans un e-mail), utilisez l'option `--armor`. Cela produira du texte blindé ASCII (encodé en base64) qui est très portable. En prenant AES256 comme exemple, vous l'utiliseriez simplement comme ceci:

    gpg --armor --symmetric --cipher-algo AES256 file.txt

Par défaut, cela produira le fichier _file.txt.asc_ comme fichier blindé crypté ASCII. Vous décrypteriez alors normalement en utilisant quelque chose comme :

    gpg -o file.txt -d file.txt.asc

## Signer numériquement des données codées symétriquement de façon symétrique

Si vous avez configuré une paire clé publique/clé privée, vous pouvez utiliser votre clé privée pour signer les données avant de les chiffrer de façon symétrique. Par exemple, pour signer et crypter symétriquement le fichier.txt en utilisant AES256, utilisez l'option `--sign` comme ceci :

    gpg --sign --symmetric --cipher-algo AES256 file.txt

Ensuite, pour vérifier la signature et décrypter, vous utiliseriez :

    gpg -d file.txt.gpg

> L'option `-d`essaiera automatiquement de vérifier toute signature et aussi de décrypter.
