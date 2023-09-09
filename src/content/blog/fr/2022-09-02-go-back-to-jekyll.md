---
modified: 2022-08-29T08:44:09.701Z
title: J'abandonne Gatsby pour revenir à Jekyll
description: J'explique mon choix d'abandonner Gatsby pour revenir à une technologie plus simple.
lang: fr
tags: [jekyll, gatsby]
date: 2022-09-02T11:00:00
---

Il y a quelques mois, j'ai migré mon site depuis Jekyll vers Gatsby. Aujourd’hui je viens de faire machine arrière et je suis retourné vers Jekyll.

<!-- J'était très content de mon choix mais ça m'a demandé beaucoup de travail. En faisant la migration, je me suis dit que ça allait valoir le coup, mais voilà, quelques mois plus tard me voici a faire machine arrière.. -->

Gatsby et Jekyll sont deux générateurs de sites statistiques bien différents. Voici donc mon petit retour d'expérience et mes explications sur ce choix.

## La _hype_!

Pourquoi j'avais choisi Gatsby? Et bien, il faut se le dire, essentiellement **par effet de mode**.

Je code énormément en JavaScript. Si tu ne connais pas le monde JavaScript, tu dois savoir que tout évolue extrêmement vite. C'est a la fois ce qui fait que c'est excitant mais aussi épuisant à suivre. Cette évolution constante du JavaScript et cette grosse communauté fait que l'écosystème de plugin de Gatsby grossi très vite. Et beaucoup de choses intéressantes s'y passent. Je pense notamment à [Gatsby Image][gatsby-plugin-image].

L'excitation m'a poussé à choisir Gatsby, car j'avais envie je voulais retrouver cet écosystème dans mon petit site perso.

La philosophie de Jekyll est très différente de Gatsby.

## La philosophie de Jekyll

[Jekyll décrit sa philosophie](https://jekyllrb.com/philosophy/) en quatre points:

1. _No magic_
2. _Just works_
3. _Content is king_
4. _Stabilty_

### No magic & Just works

Jekyll va choisir la simplicité la ou Gatsby va aller beaucoup plus loin dans la technologies utilisées.

Concrètement, Gatsby intègre **React** qui permet de découper ton site sous forme de composants. Par dessus ça, Gatsby va te proposer le _Server Side Rendering_ (SSR) pour faire en sorte que tout soit compilé et que a la fin tu n'ai même plus besoin de JavaScript côté client. Et pour rajouter une couche, Gatsby intègre une abstraction **GraphQL** qui permet de récupérer et modéliser les données de ton site pour créer tes pages. Ça te paraît cool? Oui moi aussi.

Le problème c'est que [ce que fait Gatsby lors du build extrêmement complexe](https://www.gatsbyjs.com/docs/conceptual/overview-of-the-gatsby-build-process/#what-happens-when-you-run-gatsby-build). Et toute cette complexité est complètement démesurée pour un petit site comme le mien.

De l'autre côté, Jekyll ne propose pas de framework frontend, pas de language de requête. il propose juste un language de _templating_ simple ([Liquid](https://github.com/Shopify/liquid)) qui va convertir les pages en HTML, et c'est tout. Tout est fait en Ruby, et les plugins sont documentés. Alors oui, c'est moins fun, mais ça marche depuis des années.

Pour t'en rendre compte, le `package-lock.json`[^1] de mon site en Gatsby [faisait plus de 40 000 lignes pour 1.6Mb](https://github.com/madeindjs/portfolio/blob/c31aaa8eca8683fca3645da54649a6a884d2227a/package-lock.json) alors que le `Gemfile.lock`[^2] [fait actuellement 108 lignes](https://github.com/madeindjs/portfolio/blob/8e46164e40a13337e2ce3693a6a9d4560ad1b1e9/Gemfile.lock).

### Content is King

Avec Jekyll, il me suffit de lancer `jekyll new` et j'ai un template de site pour écrire un blog. Si j'ai besoin d'un design sympa, [il en existe plein](http://jekyllthemes.org/). Cela signifie que je peut obtenir un site fonctionnel en quelques minutes et commencer à écrire un article. Bref, me concentrer sur le contenu.

Avec Gatsby c'est plus compliqué. La courbe d'apprentissage est plus grande. Tu peux faire ce que tu veux mais tu dois découvrir cet outil.

### Stability

La stabilité est vraiment ce qui m'a fait quitter Gatsby. Lorsque j'ai utilisé Gatsby, j'étais sous version 2. Aujourd'hui, Gatsby a sorti la version 3, et [les breaking changes sont nombreux](https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v2-to-v3/).

Alors oui, rien d'insurmontable, mais pour un petit site comme le mien ou je sort un article tous les 6 mois, je n'ai pas envie de devoir lire des changelogs pour publier un nouvel article.

## Conclusion

Si je devait resumer mon choix, c'est [choisir la technologie la plus ennuyeuse](https://boringtechnology.club).

Ce que je veux dire par _boring technology_, c'est que Jekyll est mature et qu'il n'est plus amené à évoluer fondamentalement. Ce n'est plus un outils excitant mais il marche.

Jekyll a été un des premiers générateur de site statique et il est encore très present. Cela signifie que si tu te pose une question avec Jekyll, quelqu'un se l'est déjà posé.

[^1]: le fichier qui liste toutes les librairies a télécharger pour faire fonctionner le projet avec Node.js
[^2]: le fichier qui liste toutes les librairies a télécharger pour faire fonctionner le projet avec Ruby

[gatsby-plugin-image]: https://www.gatsbyjs.com/plugins/gatsby-plugin-image
