---
title: Retour d'expérience sur la rédaction d'un livre technique
layout: post
date: 2019-11-11 0:30:00 +0200
tags: rails leanpub book
thumbnail: /img/blog/api_on_rails.png
categories: story
---

En début d'année 2019 j'ai été contacté par [Developpez.com](https://www.developpez.com/) qui cherchait des personnes pour écrire des articles. J'ai donc répondu positivement pour participer sur le sujet du framework Ruby on Rails.

On m'a ainsi proposé de traduire une partie du livre [APIs on Rails Building REST APIs with Rails](http://apionrails.icalialabs.com/) de Abraham Kuri Vargas. Ce livre est un grand tutoriel de plus de 200 pages pour construire une API évolutive avec Ruby on Rails en suivant les bonnes pratiques.

Je me suis dit que ça pouvait être une bonne expérience et je me suis lancé dans cette aventure.

Le projet était non maintenu et la version du framework étudié obsolète. Les exemples n'étaient donc plus valides et il fallait les reprendre. **Le bordel**. J'ai essayé de contacter l'auteur mais en vain.

Je suis donc reparti de zéro et je me suis lancé dans la réécriture du livre. Et tant qu'à réécrire, je me suis dit que j'allais aussi le traduire dans la langue de Molière.

Voici donc mon retour d'expérience sur la rédaction d'un livre de plus de 200 pages en anglais et en français.

## Comment écrire un livre?

Si tu veux écrire un livre, sache que c'est **chronophage**. J'ai donc fait en sorte que ça me prenne le moins de temps possible. Je ne prétends pas avoir la meilleure solution. Voici juste la mienne.

### Rédaction

Pour la rédaction je voulais un système qui me permette de **versionner mon travail** et qu'il puisse inclure des morceaux de code. **Beaucoup de morceaux de code**.

Je me suis donc tout d'abord tourné vers LaTeX qui s'est avéré **trop rigide**. Mon principal problème était d'avoir une bonne coloration syntaxique. Quelques solutions existent mais elles restent assez limitées.

Je me suis donc tourné vers le format Markdown avec l'outil [Pandoc](http://pandoc.org/). Cet outil est absolument génial mais j'ai fini par rencontrer les mêmes problèmes qu'avec LaTeX puisque Pandoc s'appuie sur une conversion en LaTeX pour ensuite la convertir en PDF.

Et puis j'ai découvert [Asciidoctor](https://asciidoctor.org). Il s'agit d'une syntaxe qui apporte des fonctionnalités supplémentaires au Markdown comme la gestion de différents fichiers, les notes de bas de page, les notes internes, les commentaires et j'en passe. Bref, c'est la syntaxe Markdown avec la puissance de LaTeX. Cela m'a aussi permis d'exporter mon livre en PDF, EPUB et MOBI facilement et de personnaliser le thème de mon livre.

Pour écrire, il suffit ensuite juste d'avoir un éditeur de texte classique comme VSCode, Atom ou même un Bloc Note sur Windows. Pour le versionner j'utilise Git et je [publie sur Github][repo] .

### Workflow

Le workflow que j'ai suivi était le suivant:

1. refaire les exemples de code de mon côté dans [un projet Github séparé](https://github.com/madeindjs/market_place_api_6)
2. retravailler la version anglaise en fonction des modifications que je venais d'apporter
3. coller la version anglaise dans un fichier
4. faire des traductions en mode copié / collé dans [Deepl](https://deepl.com)
5. corriger la traduction (car c'est loin d'être parfait)
6. coller la version française dans un fichier

Le premier problème que j'ai rencontré a été de gérer tout ce processus qui mêle l'écriture du livre en anglais et en français. En rajoutant la gestion du projet créé tout au long de ce livre ça a été difficile. Avec le recul j'aurais dû tout laisser en français et peut être traduire à la fin.

Ensuite je me suis fixé:

- deux **réécritures** par chapitre : une assez rapide et une plus approfondie
- deux **relectures** par chapitre (dont une de ma copine qui m'a beaucoup aidé)
- une partie promotion (j'en parlerai plus loin)

## Open Source

Le workflow de publication d'article sur développez.com m'a semblé vraiment compliqué a utiliser et il m'a découragé. Je me suis donc dit que j'allais le rendre Open Source sur Github en citant bien sûr l'oeuvre originale.

J'ai été vraiment surpris de l'aide de la communauté open source. Voici les chiffres du [projet sur Github][repo].

- 8 contributeurs
- 17 pull requests
- 92 stars
- 21 fork

J'ai reçu des pull request qui corrigeaient des erreurs de syntaxe, des liens cassés et des formulations douteuses. Pour anecdote, j'ai même été contacté par un russe qui était intéressé pour traduire le livre. Il a juste eu besoin de forker le projet et créer un dossier `ru`. C'était top.

L'open source donne vraiment la sensation que **le livre est vivant**.

Lorsque le livre est terminé ou que j'ai fixé des erreurs, je fais une _release_ sur Github et j'attache les fichiers PDF, EPUB et MOBI. Ainsi n'importe qui peut le lire **gratuitement** sur le **support de son choix**.

## Publication du livre

Je me suis dit que tant qu'à faire, j'allais publier le livre. Cela m'a apporté une visibilité et m'a permis aussi de gagner un peu d'argent.

J'ai regardé un peu du côté d'Amazon mais cela m'a semblé trop compliqué car il fallait se créer un compte, choisir la bonne taxe et le publier. Les commissions sont aussi bien plus élevées. J'ai donc abandonné rapidement, tant pis pour ce bon vieux Jeff.

J'ai choisi Leanpub pour sa facilité et aussi le fait que le prix peut être libre.

J'ai donc publié au total 4 versions:

- une [version anglaise](https://leanpub.com/apionrails5) et une [version française](https://leanpub.com/apionrails5-fr) pour Ruby on Rails 5
- une [version anglaise](https://leanpub.com/apionrails6) et une [version française](https://leanpub.com/apionrails6-fr) pour Ruby on Rails 6

Au final, voici tous les chiffres des royalties, c'est à dire ce qui va dans ma poche après la commissions de Leanpub.

| Livre                                                     | Royalties |
| --------------------------------------------------------- | --------- |
| [API on Rails 5 (EN)](https://leanpub.com/apionrails5)    | \$160.63  |
| [API on Rails 5 (FR)](https://leanpub.com/apionrails5-fr) | \$15.98   |
| [API on Rails 6 (EN)](https://leanpub.com/apionrails6)    | \$473.22  |
| [API on Rails 6 (FR)](https://leanpub.com/apionrails6-fr) | \$20.78   |
| Total                                                     | \$670.61  |

J'ai été vraiment surpris de vendre "autant". Ces chiffres ont pour moi vraiment un côté motivant qui me pousse à maintenir le projet.

Les chiffres sont aussi à remettre dans le contexte. Cela ma demandé énormément de travail qu'il est difficile de quantifier. A vu de nez je dirais entre **500 et 1000 heures**. Cela donne donc un **salaire horaire de 1.34 \$ / heure**. Alors oui, clairement je ne fais pas ça pour l'argent. Mais ça a été pour moi plus une excellente **experience rémunérée**.

On voit aussi que la version anglophone se vend **17 fois mieux** que la version francophone. La première conclusion que je peux donner c'est qu' **il faut traduire votre ouvrage dans la langue de Shakespeare**.

## Promotion

Une fois le livre terminé commence la partie de la promotion. C'est une partie assez étrangère pour moi et j'ai fait un peu au feeling. J'en ai donc simplement parlé sur les réseaux sociaux spécialisés. C'est à dire:

- [Hacker New](https://news.ycombinator.com/item?id=20736819) qui est une communauté très exigeante où j'ai eu très peu de retours
- [Le journal du Hacker](https://www.journalduhacker.net/s/3b7gms/api_on_rails_6) qui est une communauté française donc beaucoup plus restreinte
- [Reddit](https://www.reddit.com/r/rails/comments/csfjjf/api_on_rails_6/), qui est la communauté la plus active où j'ai eu le plus de retours

J'ai eu des [retours négatifs](https://www.reddit.com/r/rails/comments/csfjjf/api_on_rails_6/exkbx5i) mais aussi d'excellents retour par mail qui sont très gratifiants.

## Conclusion

En conclusion je pense que j'ai fait l'erreur de vouloir aller trop vite car j'ai entamé la publication alors que mon livre comportait des petites fautes d'orthographe et des erreurs de syntaxe. La communauté spécialisée (en particulier Hacker News) est assez intransigeante là dessus.

C'est en revanche une expérience exceptionnelle qui m'a apporté beaucoup de satisfaction personnelle. Ce projet m'a aussi permis de mettre un pied dans l'open Source et de maintenir un petit projet.

[asciidoctor]: https://asciidoctor.org
[repo]: https://github.com/madeindjs/api_on_rails
