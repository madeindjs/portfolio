---
title: Organisation du Daily Stand Up avec Markdown
description: Comment j'utilise un simple fichier texte pour organiser mon Daily Stand-Up

date: 2020-10-13 12:00:00 +0200
tags: [organisation, plaintext, scrum, markdown]
categories: organization
lang: fr
---

Les Stand-up sont des réunions préconisées par la [méthodologie SCRUM](https://en.wikipedia.org/wiki/Stand-up_meeting). Dans ces petites réunions de quinze minutes max, tout le monde prend la parole pour dire rapidement sur quoi il a travaillé la veille, le travail prévu pour le jour même et les points bloquants (s'il y en a).

Le but est de rester concis car la principale dérive de ces réunions est de trainer en longueur et ainsi de [démotiver tout le monde](https://www.usehaystack.io/blog/we-cancelled-standups-and-let-the-team-build-heres-what-happened). C'est normalement le rôle du SCRUM master de gérer les temps de paroles mais afin de mieux gérer mon temps de parole j'utilise mon `daily.md`.

Je commence donc la journée par me définir des tâches que je compte faire dans la journée dans un [fichier Markdown](https://commonmark.org/) comme ceci :

```markdown
Lundi 1 septembre

- [ ] terminer feature
- [ ] définir besoins pour telle feature
```

Ensuite au fur et à mesure de la journée je coche les tâches réalisées. Si j'ai effectué des tâches en plus, je les rajoutes.

```markdown
Lundi 1 septembre

- [x] terminer feature
- [x] debugger problème sur serveur de staging
- [ ] définir besoins pour telle feature
```

Le lendemain, je fais la même chose en rajoutant la nouvelle journée. Toutes les tâches que je n'ai pas faite la veille peuvent se retrouver dans mes prévisions pour la journée.

```markdown
Lundi 1 septembre

- [x] terminer feature
- [x] debugger problème sur serveur de staging
- [ ] définir besoins pour telle feature

Mardi 2 septembre

- [ ] définir besoins pour telle feature
- [ ] commencer nouvelle feature
- [ ] prendre ticket QA
```

Ce qui est pratique, c'est que pour le Daily Stand je peux consulter ce fichier et ainsi être plus concis sur ce que j'ai fais sans essayer de me remémorer la veille ou le vendredi d'avant.

Je trouve que cette méthode à plusieurs avantages :

1. Elle permet de se fixer des objectifs pour la journée et ainsi de se motiver
2. Elle permet de se garder une trace de tout ce qu'on a réalisé et permettra plus tard de construire facilement un bilan de compétences
3. Elle est vraiment très rapide à mettre en place et ne requiert aucun logiciel

Je n'ai pas la prétention de dire qu'il s'agit de la méthode miracle mais elle me semble utile.
