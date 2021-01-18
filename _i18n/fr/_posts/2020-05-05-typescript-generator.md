---
title: Les générateurs en Javascript
description: Utiliser les générateur Javascript afin d'optimiser la consommation mémoire de ton script ou de ton application.
layout: post
date: 2020-05-04 19:00:00 +0200
tags: typescript nodejs javascript
thumbnail: /img/blog/typescript.jpg
categories: programming
---

Récemment, j'ai du faire un script pour calculer les données de tous nos utilisateurs. J'ai rencontré quelques problèmes de performances liées à la quantité de données que cela représente (plusieurs milliers d'utilisateurs). J'ai réussi à régler ce problème en utilisant les **générateurs** qui permettent dans certains cas de réduire considérablement l'empreinte mémoire. Si ce terme ne te dis rien, je t'invite à lire la suite de cet article.

{% include promote-restapits-fr.html %}

## Exemple simpliste

Afin que tu saisisse le problème, je vais recréer un exemple simple. Basique.

Imagine une classe qui représente un utilisateur avec un `firstname`, `lastname`, une `birthDate`. Voici une implémentation en TypeScript avec un constructeur qui définit des données factices et une méthode `age` afin de calculer l'âge de l'utilisateur:

```ts
class User {
  public birthDate: Date;

  public constructor(
    public readonly firstname: string = "Alexandre",
    public readonly lastname: string = "Rousseau"
  ) {
    const birthYear = Math.floor(Math.random() * 50 + 1970);
    this.birthDate = new Date(birthYear, 1, 1);
  }

  get age(): number {
    return new Date().getFullYear() - this.birthDate.getFullYear();
  }
}
```

Maintenant imagine que tu ais dix millions d'utilisateurs et que tu souhaite calculer leur ages. La première idées qui te viendrais à l'esprit serait de construire un tableau contenant les utilisateurs et de boucler sur le tableau avec un `for`. En gros quelque chose de ce genre:

```ts
function get10MUsers(): User[] {
  const users: User[] = [];

  for (let i = 0; i < 10_000_000; ++i) {
    users.push(new User());
  }

  return users;
}

for (const user of get10MUsers()) {
  console.log(`${user.firstname} ${user.lastname} has ${user.age}`);
}
```

Ce code est simple et lisible mais il ne fonctionnera pas car Node.js ne te laissera pas stocker en mémoire tes dix millions d'utilisateurs. Tu obtiendra l'erreur suivante:

> FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory

Node.js s'arrêtera après avoir alloué 2048MB en mémoire ([ou 1400MB en fonction de la version que tu utilise](https://github.com/nodejs/node/issues/28202)). On pourrait surcharger ce paramètre avec le _flag_ `—-max-old-space-size` afin de pouvoir stocker plus d'objets mais ce n'est vraiment pas optimal.

C'est là qu'interviennent les [Générateurs][iterators_and_generators].

Le générateurs permettent de ne stocker qu'un utilisateur à la fois et de "mettre en pause" le code jusqu'à ce que la boucle `for` passe à l'utilisateur suivant. Je ne rentre pas dans le détail du fonctionnement, [la documentation de Mozilla le fait très bien][iterators_and_generators].

Dans notre cas, pour l'utiliser il suffit de préfixer sa fonction par une étoile `*` et d'utiliser le mot clé de retour `yield` au lieu de pousser dans un tableau. Cela donne donc le code suivant:

```ts
function* get10MUsersGenerator(): Generator<User> {
  for (let i = 0; i < LOOPS; ++i) {
    yield new User();
  }
  return;
}

for (const user of get10MUsersGenerator()) {
  console.log(`${user.firstname} ${user.lastname} has ${user.age}`);
}
```

> en fonction de ta config TypeScript, il faudra activer le flag `downlevelIteration` afin d'autoriser cette fonctionnalité.

Ce code va te pourrir ton terminal et bouffer ton CPU mais il va fonctionner ! Il fonctionnera que tu boucle sur dix millions d'utilisateurs ou dix milliards d'utilisateurs. La différence réside dans le fait que Node.js ne va stocker qu'un utilisateur dans la mémoire à la fois.

Le code complet est disponible ici: <https://gist.github.com/madeindjs/f6a2f9e30181f3bf50167bd46ba4f850>.

## Exemple concret avec un ORM

"OK, mais je ne vais jamais volontairement boucler autant de fois." penses-tu. Détrompes-toi, un ORM le fera pour toi sans que tu n'y prête attention.

Comme tous les ORM qui utilisent le [patern Active Record](https://en.wikipedia.org/wiki/Active_record_pattern), il est assez facile de récupérer une grande quantité de données en faisant `User.findAll()` par exemple. L'ORM s'occupera de récupérer tes données, hydrater les objets et même les associations. Sans crier garde, l'empreinte mémoire de ton script devient vite gigantesque et tu rencontrera le problème décris plus haut avec "quelques" milliers d'utilisateurs comportant quelques associations.

Heureusement, il est assez facile d'utiliser les [`AsyncGenerator`][for-await...of] qui fonctionnent de la même manière que les générateurs précédents. En utilisant l'ORM [Sequelize](https://sequelize.org/) par exemple on peut:

1. récupérer les 20 premiers utilisateurs via une requête
2. `yield` les résultats
3. refaire une requête pour récupérer les 20 utilisateurs suivants
4. et ainsi de suite

En faisant cela le code fera plus de requêtes SQL mais il sera plus performants car Node.js ne stockera que 20 utilisateurs en mémoire à la fois.

Voici donc un exemple plus parlant:

```ts
async function* getUsers(
  perPage: number = 20
): AsyncGenerator<User, void, unknown> {
  const userCount = await User.count({ where });
  let nbFetched = 0;

  while (nbFetched < userCount) {
    nbFetched += perPage;

    for (const user of await Company.unscoped().findAll({
      limit: perPage,
      offset: nbFetched,
    })) {
      yield user;
    }
  }
}

for await (const user of getUsers()) {
  // do something
}
```

Ainsi, en regardat de plus près, on utilise les paramètres `limit` et `offset` de Sequelize afin de limiter les `User` qu'on récupère. On utilise aussi une boucle `while` pour boucler jusquèà avoir parcouru tous les utilisateurs.

En faisant cela le code fera plus de requêtes SQL mais il sera plus performants car Node.js ne stockera que 20 utilisateurs en mémoire. Ton script sera donc parfaitement capable de s'adpater a tes données en base.

[iterators_and_generators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
[for-await...of]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
