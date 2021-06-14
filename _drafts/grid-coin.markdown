---
layout: post
title: Le GridCoin
description: Participez au développement de votre navigateur preéferé
date: 2017-11-06 12:00:00 +0200
tags: cryptocurrencies gridcoin boinc
categories: software
---

[Ethereum][ethereum], [Monero][monero], [Zcash] [zcash]: Les cryptomonnaies poussent comme des champignons. L'engouement autour du [Bitcoin][bitcoin] à créé une **envollée des prix** et d'autres _forks_ du [Bitcoin][bitcoin] apparaissents sasn cesse.

Leurs **qualités techniques** sont indéniable

> Litecoin est une devise Internet peer-to-peer, qui permet des paiements instantanés, avec des coûts proches de zéro à quiconque dans le monde. Litecoin est un réseau de paiement mondial open source, qui est entièrement décentralisé sans autorités centrale.
>
> [Litecoin, _page d'acceuil_][litecoin]

Le principale reproche fait à ces monnaies sont leur **gaspillage énergétique** du à leur conception. La majorité des calculs réalisés sont inutilse car seul une poignée de mineurs crypte réelement la transaction.

C'est là qu'intervient le [GridCoind][gridcoin] qui propose de mettre à profit votre puissance de calcul à la science. Lors du "minage", une partie du calcul est proposé au [BOINC][boinc] _( infrastructure ouverte de Berkeley dédiée au calcul en réseau)_

> La plupart des projets recensés sont des projets de recherche (...) sur le cancer, de nouveaux médicaments, la physique des hautes énergies, le contrôle des maladies ou le réchauffement climatique.
>
> [GridCoind - Wikipedia][grc_wp]

## L'instalation

Le début est assez facile car `boinc-manager` est présent dans les dépots officiels. Un petit `apt install` et c'est reglé:

```bash
sudo apt install boinc-manager
```

Ensuite rendez-vous sur [la page de création d'un compte BOINC][boinc_register] et remplissez le formulaire (assez moche). Confirmez votre email et aller sur la [page de sélection d'un projet][boinc_signup].

Pour ma part, j'ai choisis [SETI@home][setiahome] qui recherche un signe de vie extra-terrestre. Un lien me mène vers une page de télecargement d'un fichier bash

http://boinc.berkeley.edu/download.php

[setiahome]: http://setiathome.berkeley.edu/
[boinc]: http://boinc.berkeley.edu/
[bitcoin]: https://bitcoin.org/
[boinc_register]: https://boincstats.com/en/bam/register
[boinc_signup]: https://boincstats.com/en/bam/signup/
[ethereum]: https://www.ethereum.org/
[gridcoin]: http://www.gridcoin.us/
[grc_wp]: https://fr.wikipedia.org/wiki/Gridcoin
[litecoin]: https://litecoin.org/fr/
[monero]: https://getmonero.org/
[zcash]: https://z.cash/
