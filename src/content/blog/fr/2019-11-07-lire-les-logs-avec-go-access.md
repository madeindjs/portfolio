---
title: Remplacement de Google Analytics par GoAccess
description: Analyser les logs d'un serveur web avec GoAccess
date: 2019-11-07 1:00:00 +0200
tags: [analytics, goaccess]
image: https://goaccess.io/images/goaccess-dashboard.png
categories: devops
lang: fr
---

J'ai décidé de supprimer Google Analytics de [iSignif](https://isignif.fr).

Bien que ce soit un outil vraiment pratique, deux choses me dérangeait:

1. Il est bien trop complexes pour mes besoins, c'est à dire suivre le visites et le temps de réponses
2. On nourrit la collecte de données de Google

Le problème est que ça reste un outil vraiment très simple à mettre en place. Une ligne à ajouter dans le HTML une une configuration. On peut difficilement faire plus simple.

Sur [raspberry-cook.fr](https://raspberry-cook.fr) j'avais déjà essayé [Matomo](https://matomo.org) (anciennement Piwik). Le principe est le même mais il peut être auto-hébergé sur un serveur LAMP classique. C'est à mon avis la meilleure alternative pour protéger la vie privée de vos utilisateurs. Mais il me semblait aussi disproportionné pour mes besoins.

Et puis j'ai découvert [GoAccess][goaccess].

[GoAccess][goaccess] prend les choses un peu différemment puisqu'il s'appuie sur les fichiers log au lieu de collecter des données. Et c'est top puisque vous pouvez switcher sur ce système du jour au lendemain et avoir déjà beaucoup de données.

Les avantages de [GoAccess][goaccess] sont:

1. ne repose pas sur JavaScript et fonctionne quoiqu'il arrive
2. ne charge pas une ressource supplémentaire donc la page est plus légère
3. ne collecte pas les données
4. est [Open source sous licence MIT](https://github.com/allinurl/goaccess)

Pour l'installer c'est très facile:

```bash
sudo apt install goaccess
```

Pour l'utiliser, rien de plus simple:

```bash
goaccess /var/log/apache2/isignif_fr_access.log
```

Et voilà.

Pour obtenir des données avec tout les logs Apache (dont ceux archivés), il suffit de créer un fichier avec tous les logs:

```bash
touch /tmp/complete_isignif_fr_access.log
cat /var/log/apache2/isignif_fr_access*.log >> /tmp/complete_isignif_fr_access.log
gzip -d /var/log/apache2/isignif_fr_access.log.*.gz --stdout >> /tmp/complete_isignif_fr_access.log
goaccess /tmp/complete_isignif_fr_access.log
```

Et il est même possible de faire un bel export HTML:

```
goaccess /tmp/complete_isignif_fr_access.log -o /tmp/isignif_report.html
```

Que demander de plus?

[goaccess]: https://goaccess.io/
