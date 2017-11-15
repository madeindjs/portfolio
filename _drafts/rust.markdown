---
layout: post
title:  Introduction à Rust
description:  Participez au développement de votre navigateur préféré
date:   2017-11-06 12:00:00 +0200
tags: rust
categories: tutorial
---

## Sommaire

* TOC
{:toc}

## Pourquoi Rust?

    orientation bas niveau, avec la possibilité de choisir la gestion de la mémoire adaptée au programme : pile, tas (unique_ptr, shared_ptr) ;
    gestion de la concurrence intégrée dans le langage ;
    sûr par défaut, avec la possibilité de contourner cette sûreté dans les blocs unsafe :
        typage statique sans conversions implicites,
        accès mémoire validés statiquement par le compilateur,
        variables immuables par défaut,
        passage de messages entre tâches concurrentes pour éviter des erreurs liées aux accès concurrents à la mémoire ;
    inférence de types ;
    filtrage par motif ;
    généricité.


Rust est un langage avancé, je vous déconseille de suivre ce tutoriel si vous n'avez pas de notions avancée en prgramation.


> Rust est un langage de programmation compilé multi-paradigme conçu et développé par Mozilla. Il a été conçu pour être "un langage sécurisé, concurrent, pratique", supportant les styles de programmation purement fonctionnel, procédural et orienté objet.
>
> [Wikipedia](https://fr.wikipedia.org/wiki/Rust_(langage))

Concrètement cela signifie:

* Les performances du C sans la gestion de la mémoire
* protection contre les fuites de mémoire

## Instalation

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

On compile et on execute:

~~~bash
$ rustc main.rs
$ ./main
~~~

Si tout fonctionne, vous obtenez un magnifique

    Hello, world!

## Les bases

### Les variables

Les varibales s'instancies avec `let`:

~~~rust
let message = "hello world";
~~~

Elles sont **typées**. Nous pouvons forcer le type 

~~~rust
let message : i8 = 5;
// ou
let message = 5i8;
~~~

Si aucun type n'est spécifié, Rust le devine pour vous lors de la compilation.

Pour les **constantes** on utilise `const` mais le type **doit être définit**:

~~~rust
const MAX_POINTS: u32 = 100_000;
~~~

### Les types

On retrouve les **types de base**:

* Entier
  * *unsigned*: `i8`, `i16`, `i32`, `i64`, `isize` (ne peut être négatif)
  * *signed*: `u8`, `u16`, `u32`, `u64`, `usize`
* Décimal `f32` et `f64`
* booléen: `bool`
* caractère: instancé avec des `'`

Pour les **types pour grouper**, il existe deux types:

* les **Tuples**: Tableau sans limite de taille ni contrainte de type
~~~rust
let tup: (i32, f64, u8) = (500, 6.4, 1);
let first_element = tup.1;// => 6.4
~~~
* les **Array**: Tableau avec taille fixe et les élements doivent être de la même famille
~~~rust
let array            = ['a', 'b', 'c'];
// s'écrit aussi
let array [String;3] = ['a', 'b', 'c'];
let first_element    = array[0];// => 6.4
~~~


### Mutabilité

Ruste casse la convention et par défault les variables sont imutables. Par exemple ce code ne pourra pas être compilé

~~~rust
let x = 1;
x = x + 1;
~~~

    re-assignment of immutable variable `x`

Il faut déclarer la variable comme mutable avec le mot clé `mut`:

~~~rust
let mut x = 1;
x = x + 1;
~~~

Un autre moyen consiste à utiliser le **shadowing** (je n'ai pas trouvé de traduction à ce terme). Cela consite à redéfinir la variable avec `let`. Ceci, à la différence du `mut`, permet de réfinir le type de la variable.

~~~rust
let mut x = 1;
let x = x + 1;
~~~

### Logique

Ici rien de spécifique à Rust, on retrouve le `if`, `else` et le `else if`. Cependant, contrairement à d'autres languages, la condition ne s'entoure pas de parenthèses

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

### Boucles

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

Définies par le mot clé `fn`, les paramètres et la valeur de retour sont **typés**.

~~~rust
fn multiply(a: i8, b: i8) -> i8 {
  a * b
}
~~~

La **valeur de retour** est la dernière ligne qui ne comporte pas de `;` à la fin. Pour plus de lisibilté, on peut utiliser le mot clé `return`.

### Documentation

~~~rust
/// Generate library docs for the following item.
//! Generate library docs for the enclosing item.
~~~


## Un peu plus loin

Maintenant qu'on a les bases, nous pouvons nous attaquer aux notions plus avancées (et il y en a!).

### [Ownership][ownership] et réference

Comme le **C** ou bien le **C++**, Rust utilise les **pointeurs**.

Au lieu de copier la variable, nous travaillons directement sur une **réference** de celle-ci. Pour créer une référence, il suffit de préfixer la variable d'un `&`.

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

Imaginez que vous utilisez un pointer vers une variable **définie dans un scope**. Nous avons vu qu'en sortant du scope *(`fn`, `if`, etc..)* cette variable est libérée. Nous obtenons donc un pointer vers une **réference nulle**. Ceci augmente la mémoire utilisée par votre progremme et crée une **fuite de mémoire**.

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
}
~~~

Une des plus grande force de Rust est qu'il ne vous **laissera pas compiller** ce code.

    missing lifetime specifier


### Structure


### Enum

~~~rust
#[derive(Debug)]
enum CarBrand {
    Smart,
    Renault,
    Peugeot
}

#[derive(Debug)]
struct Car{
    brand: CarBrand,
    model: String
}

fn main() {
    let my_car = Car{
        brand: CarBrand::Smart, 
        model:  String::from("Roaster")
    };

    println!("My car is a {:?}", my_car);
    // => My car is a Car { brand: Smart, model: "Roaster" }
}
~~~

Ceci peut être d'ailleur simplifié en faisant dirrectement

~~~rust
#[derive(Debug)]
enum Car {
    Smart{model: String},
    Renault,
    Peugeot
}

fn main() {
    let my_car = Car::Smart{
        model:  String::from("Roaster")
    };

    println!("My car is a {:?}", my_car);
    // => My car is a Smart { model: "Roaster" }
}
~~~



## Exemple

~~~rust
fn first_word(s: &String) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}
fn main() {
    let lorem = String::from("Lorem ipsum dolor sit amet, consectetur adipisicing elit");
    println!("First word is {:?}", first_word(&lorem));
}
~~~


Avec les

~~~rust
struct Sentence {
    content: String
}

impl Sentence {
    // add code here
    // return the first word
    fn first_word(&self) -> &str{
        // renvoie un tableau des bytes
        let bytes = &self.content.as_bytes();
        // enumerate renvoie l'iterable avec l'index associé
        for (i, &item) in bytes.iter().enumerate() {
            // si la valeur est un espace, c'est qu'on vient de passer le 1er mot
            if item == b' ' {
                return &self.content[0..i];
            }
        }
        // on n'as pas trouvé d'espaces, on renvoie donc toute le string sous forme
        // de slice
        &self.content[..]
    }
}

fn main() {
    let lorem_string = String::from("Lorem ipsum dolor sit amet, consectetur adipisicing elit");
    let sentence = Sentence{content: lorem_string}; 
    println!("First word is {:?}", sentence.first_word());
}
~~~

[Rust]: https://www.rust-lang.org/

[ownership]: https://doc.rust-lang.org/book/second-edition/ch04-01-what-is-ownership.html
[dangling]: https://doc.rust-lang.org/book/second-edition/ch04-02-references-and-borrowing.html#dangling-references
