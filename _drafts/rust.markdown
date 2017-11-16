---
layout: post
title:  Introduction à Rust
description:  Participez au développement de votre navigateur préféré
date:   2017-11-06 12:00:00 +0200
tags: rust
categories: tutorial
---


Rust est un langage de programmation **compilé** qui se veut **sûr** et **ultra-rapide**. Il est édité par la [fondation Mozilla][Mozilla] et il est utilisé notamment par Firefox qui l'utilise dans son moteur de rendu [Servo][Servo] .

## Sommaire

* TOC
{:toc}


## Introduction

### Pourquoi utiliser Rust?

Rust bénéficie d'une grande communauté et à d’ailleurs été élu le [langage le plus apprécié des développeurs en 2016](https://insights.stackoverflow.com/survey/2016#technology-most-loved-dreaded-and-wanted) et même en [2017]((https://insights.stackoverflow.com/survey/2017#technology-most-loved-dreaded-and-wanted)).

> Il a été conçu pour être "un langage sécurisé, concurrent, pratique", supportant les styles de programmation purement fonctionnel, procédural et orienté objet.
>
> [Wikipedia](https://fr.wikipedia.org/wiki/Rust_(langage))

A l'inverse du **C** et du **C++**, Rust simplifie grandement de la **libération de la mémoire** avec son système d’appartenance. Concrètement cela signifie:

* Les performances du C sans la gestion de la mémoire
* protection contre les fuites de mémoire

Bénéficiant des même performances que le **C**, vous pouvez tout à fait développer votre nouvelle librairie en Rust.


### Pourquoi ne pas utiliser Rust?

Rust est un langage avancé, je vous déconseille de suivre ce tutoriel si vous n'avez pas de notions avancée en programmation.

Si vous cherchez un boulot .......


## Installation

~~~bash
curl https://sh.rustup.rs -sSf | sh
~~~

Ensuite pour vérifier que tout fonctionne on créée un Hello World

~~~rust
// hello_world.rs
fn main() {
    println!("Hello, world!");
}
~~~

On compile et on exécute:

~~~bash
$ rustc main.rs
$ ./main
~~~

Si tout fonctionne, vous obtenez un magnifique

    Hello, world!

## Les bases


### Les variables & les types

On retrouve tous les **types de base**:

* Entier
  * *unsigned*: `i8`, `i16`, `i32`, `i64`, `isize` (ne peut être négatif)
  * *signed*: `u8`, `u16`, `u32`, `u64`, `usize`
* Décimal `f32` et `f64`
* booléen: `bool`
* caractère: instancié avec des `'`

Les variables s’instancie avec `let`:

~~~rust
let message = "hello world";
~~~

Elles sont **typées**.

~~~rust
let number = 5;// un nombre entier
let number : i8 = 5;// un entier de 8 bytes
let number = 5i8;// un entier de 8 bytes
~~~

Pour les **constantes** on utilise `const` mais le type **doit être définit**:

~~~rust
const MAX_POINTS: u32 = 100_000;
~~~

### types pour grouper

Les **Tuples** sont des tableaux **sans limite de taille** et **sans contrainte de type**

~~~rust
let tup: (i32, f64, u8) = (500, 6.4, 1);
let first_element = tup.1;// => 6.4
~~~

Les **Array** sont des tableaux avec **taille fixe** et les éléments doivent être de la **même famille**

~~~rust
let array            = ['a', 'b', 'c'];
// s'écrit aussi
let array [String;3] = ['a', 'b', 'c'];
let first_element    = array[0];// => 6.4
~~~

Les **slices** sont des **pointeurs** vers une **zone** d'un array:

~~~rust
let array = ['a', 'b', 'c'];
println!("{:?}", &array[1..3]);// => ['b', 'c']
~~~

Les **vecteur** sont des tableaux d’éléments de la **même famille** mais sans contrainte de taille.

~~~rust
let mut vector: Vec<i8> = Vec::new();
vector.push(1);
vector.push(2);
vector.push(3);
println!("{:?}", vector);//[1, 2, 3]
println!("{:?}", &vector[2..3]);//[3]
~~~


### Mutabilité

Toutes les variables sont **immutables** par défaut. Si vous ne le spécifiez pas, elles ne pourrons être modifiés. Par exemple ce code ne pourra pas être compilé

~~~rust
let x = 1;
x = x + 1;
// => re-assignment of immutable variable `x`
~~~


Il faut déclarer la variable comme mutable avec le mot clé `mut`:

~~~rust
let mut x = 1;
x = x + 1;
~~~

Un autre moyen consiste à utiliser le **shadowing** (je n'ai pas trouvé de traduction à ce terme). Cela consiste à redéfinir la variable avec `let`. Ceci, à la différence du `mut`, permet de définir le type de la variable.

~~~rust
let mut x = 1;
let x = x + 1;
~~~

### Les conditions

Ici rien de spécifique à Rust, on retrouve le `if`, `else` et le `else if`. Cependant, contrairement à d'autres langages, la condition ne s'entoure pas de parenthèses

~~~rust
let number = 3;

if number < 5 {
    println!("superior to 5");
} else if number == 3  {
    println!("equals to 3");
} else {
    println!("something else");
}
~~~

Il est possible d'utiliser des valeurs de retour pour les conditions

~~~rust
let condition = true;
let number = if condition {
    5
} else {
    6
};
~~~

Pour lier plusieurs conditions, on peut utiliser le `match`:

~~~rust
let number = 3i8;

match number {
    10...100 => println!("La variable est entre 10 et 100 (inclus)"),
    5 | 8    => println!("Egal à 5 ou 8"),
    _ => println!("I don't know"),
}
~~~

### Les boucles

Là aussi, pas de différence. Nous pouvons utiliser le `while`:

~~~rust
let mut number = 3;

while number != 0 {
    println!("{}!", number);

    number = number - 1;
}
~~~

... ou la boucle `for`:

~~~rust
let a = [10, 20, 30, 40, 50];

for element in a.iter() {
    println!("the value is: {}", element);
}
~~~

### Les fonctions

Définies par le mot clé `fn`, les paramètres et la valeur de retour sont **typés**. La **valeur de retour** est la dernière ligne qui ne comporte pas de `;` à la fin. Pour plus de lisibilité, on peut utiliser le mot clé `return`.

~~~rust
fn multiply(a: i8, b: i8) -> i8 {
  a * b
}
~~~

### Les macros


## Un peu plus loin dans le langage

Nous avons vu toutes **les notions de base** de Rust. Jusqu'ici, il y avais beaucoup de similitudes par rapport au **C**. Attaquons les notions plus avancées (et il y en a!).

### [Ownership][ownership] et référence

Comme le **C** ou bien le **C++**, Rust utilise les **pointeurs**.

Au lieu de copier la variable, nous travaillons directement sur une **référence** de celle-ci. Pour créer une référence, il suffit de préfixer la variable d'un `&`.

~~~rust
let mut hello = "Bonjour";
println!("{:?}", hello); // => "Bonjour"
println!("{:?}", &hello);// => "Bonjour"
hello = "Holla";
println!("{:?}", &hello);// => "Holla"
~~~

Rust gère la mémoire pour nous mais n'utilise pas de **garbage collector** qui passe afin de libéré la mémoire. Il utilise un système d'[Ownership][ownership]. Les variables "vivent" dans un *scope* limité et la mémoire est libéré au fur et à mesure.

### Dandling pointers

L'un des plus gros problèmes des pointers sont les **Dandling pointers**.

Imaginez que vous utilisez un pointer vers une variable **définie dans un scope**. Nous avons vu qu'en sortant du scope *(`fn`, `if`, etc..)* cette variable est libérée. Nous obtenons donc un pointer vers une **référence nulle**. Ceci augmente la mémoire utilisée par votre programme et crée une **fuite de mémoire**.

Voici un exemple avec Rust.

~~~rust
// Fonction qui va créer un dangling pointer
fn dangle() -> &String {
    // on crée une variable limitée au scope de la fonction
    let s = String::from("hello");
    // on renvoie une réference qui pointe sur la variable
    // limitée au scope de la fonction
    &s
}
fn main() {
    let reference_to_nothing = dangle();
    // => missing lifetime specifier
}
~~~

Une des plus grande force de Rust est qu'il ne vous **laissera pas compiller** ce code.

### Structure

Si vous venez d'un langage orienté objet (Ruby, PHP, Java, etc..), les **structures** correspondent un peu aux **classes**.

Prenons une `Human` qui possède un `name` et un `sex` (jusque là ça se tient).

~~~rust
#[derive(Debug)]
struct Human {
    name: String,
    sex: String,
}

fn main() {
    let alex = Human {
        name: String::from("Alexandre"),
        sex: String::from("Big"),
    };
    println!("{:?}", alex);
    // => Human { name: "Alexandre", sex: "Big" }
}
~~~

Comme en POO, nous pouvons ajouter des **méthodes** sur ces structures avec les **implémentation**. Pour cela on utilise `impl`. Pour les fonctions, si elle prennent en paramètre `&self`, ce sont des **méthodes d'instances**. Si elle ne prennent pas en paramètre `&self`, ce sont des **métodes statiques**.

Essayons ça avec une une méthode `describe` aqui permet d'afficher les informations

~~~rust
struct Human {
    name: String,
    sex: String,
}

impl Human {
    fn describe(&self) {
        println!("My name is {} and my sex is {}", self.name, self.sex);
    }
}


fn main() {
    let alex = Human {
        name: String::from("Alexandre"),
        sex: String::from("Big"),
    };
    alex.describe();
    // => My name is Alexandre and my sex is Big
}
~~~

### Les `enum`

`alex` est bien sympa, mais au lieu de remplir le champs `sex` par `Male` ou `Femmale`, il a mis "big" (le con!).

Pour parer à ça, nous pouvons forcer le choix à des types définis avec un `enum` rassemblant à cela

~~~rust
#[derive(Debug)]
enum Sex {
    Male,
    Femmale
}
~~~

Et pour implémenter l'`enum` à notre classe, il suffit de changer le type de l'attribut `sex`:

~~~rust
struct Human {
    name: String,
    sex: Sex,
}

impl Human {
    fn describe(&self) {
        println!("My name is {} and my sex is {:?}", self.name, self.sex);
    }
}
~~~

Et maintenant l'instanciation de notre `alex` ne peut plus choisir autre chose que les deux sexes proposé:

~~~rust
fn main() {
    let alex = Human {
        name: String::from("Alexandre"),
        sex: Sex::Male,
    };
    alex.describe();
    // => My name is Alexandre and my sex is Male
}
~~~

### Les options

Imaginons qu'un `Human` puisse ne pas avoir de `sex` (pourquoi pas?). Rust implémente la notions d'`Option`

```rust
struct Human {
    name: String,
    sex: Option<Sex>,
}
```

Maintenant que le `sex` est optionnel, nous pouvons créer `alex` sans `sex`:

```rust
fn main() {
    let alex = Human {
        name: String::from("Alexandre"), 
        sex: None
    };
    alex.describe();
    // => My name is Alexandre and my sex is None
}
```

### pattern matching & Gestion des erreurs

Reprenons l'exemple précédent. Nous voulons implémenter une fonction d'instance `print_my_sex` afin de savoir à tout moment si l'`Human` possède un `Sex` ou non. Là ou dans la majorité des langages on test le résultat renvoyé par la fonction, avec Rust on utilise le **pattern matching** avec `match`. Voici l'implémentation:

~~~rust
impl Human {
    // affichage du sexe
    pub fn print_my_sex(&self) {
        match self.sex {
            Some(ref _sex) => println!("J'ai un sexe :)"),
            None => println!("Je n'ai pas de sexe :'("),
        }
    }
}
~~~

Maintenant on teste la fonction

~~~rust
fn main() {
    let mut alex = Human::new();
    alex.print_my_sex();// => "Je n'ai pas de sexe :'("
    // maintenant, on lui définit un sexe
    alex.sex = Some(Sex::Male);
    alex.print_my_sex();// => "J'ai un sexe :)"
}
~~~

Qu'importe la situation, notre code gère la situation. Cette méthode peut sembler lourde mais ainsi notre code est **bulletproof**!

### Le module

Essayons maintenant de créer un **Crate** afin que notre `Human` soit utilisable dans nos futurs projets. Pour cela on utilise **Cargo**, le **gestionnaire de dépendance** de Rust.

~~~bash
$ cargo new human
~~~

Cargo nous crée un **module** avec une arborescence de ce type

~~~
Human/
├── Cargo.toml
└── src
    └── lib.rs
~~~

...........


## Conclusion

Le compilateur Rust nous protège **vraiment** des *runtime* erreurs en empêchant la compilation.

## Liens utiles

* <https://blog.guillaume-gomez.fr/Rust>

[Rust]: https://www.rust-lang.org/
[Mozilla]: https://www.mozilla.org/fr/
[Servo]: https://fr.wikipedia.org/wiki/Servo_(moteur_de_rendu)

[ownership]: https://doc.rust-lang.org/book/second-edition/ch04-01-what-is-ownership.html
[dangling]: https://doc.rust-lang.org/book/second-edition/ch04-02-references-and-borrowing.html#dangling-references

[Result]: https://doc.rust-lang.org/stable/std/io/type.Result.html
