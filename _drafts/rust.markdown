---
layout: post
title:  Introduction à Rust
description:  Participez au développement de votre navigateur préféré
date:   2017-11-06 12:00:00 +0200
tags: rust
categories: tutorial
---


Rust est un language de programation **compilé** qui se veut **sûr** et **ultra-rapide**. Il est édité par la [fondation Mozilla][Mozilla] et il est utilisé nottament par Firefox qui l'utilise dans son moteur de rendu [Servo][Servo] .

## Sommaire

* TOC
{:toc}


## Introduction

### Pourquoi utiliser Rust?

Rust bénéficie d'une grande communauté et à d'ailleur été élu le [langage le plus apprécié des développeurs en 2016](https://insights.stackoverflow.com/survey/2016#technology-most-loved-dreaded-and-wanted) et même en [2017]((https://insights.stackoverflow.com/survey/2017#technology-most-loved-dreaded-and-wanted)).

> Il a été conçu pour être "un langage sécurisé, concurrent, pratique", supportant les styles de programmation purement fonctionnel, procédural et orienté objet.
>
> [Wikipedia](https://fr.wikipedia.org/wiki/Rust_(langage))

A l'inverse du **C** et du **C++**, Rust simplifie grandement de la **libération de la mémoire** avec son système d'apartenance. Concrètement cela signifie:

* Les performances du C sans la gestion de la mémoire
* protection contre les fuites de mémoire

Bénéficiant des même performances que le **C**, vous pouvez tout à fait développer votre nouvelle librairie en Rust.


### Pourquoi ne pas utiliser Rust?

Rust est un langage avancé, je vous déconseille de suivre ce tutoriel si vous n'avez pas de notions avancée en programation.

Si vous cherchez un boulot .......


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


### Les variables & les types

On retrouve tous les **types de base**:

* Entier
  * *unsigned*: `i8`, `i16`, `i32`, `i64`, `isize` (ne peut être négatif)
  * *signed*: `u8`, `u16`, `u32`, `u64`, `usize`
* Décimal `f32` et `f64`
* booléen: `bool`
* caractère: instancié avec des `'`

Les varibales s'instancies avec `let`:

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

Les **Array** sont des tableaux avec **taille fixe** et les élements doivent être de la **même famille**

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

Les **vecteur** sont des tableaux d'élements de la **même famille** mais sans contrainte de taille.

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

Un autre moyen consiste à utiliser le **shadowing** (je n'ai pas trouvé de traduction à ce terme). Cela consite à redéfinir la variable avec `let`. Ceci, à la différence du `mut`, permet de réfinir le type de la variable.

~~~rust
let mut x = 1;
let x = x + 1;
~~~

### Les conditions

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

Définies par le mot clé `fn`, les paramètres et la valeur de retour sont **typés**. La **valeur de retour** est la dernière ligne qui ne comporte pas de `;` à la fin. Pour plus de lisibilté, on peut utiliser le mot clé `return`.

~~~rust
fn multiply(a: i8, b: i8) -> i8 {
  a * b
}
~~~


### Les macros

### Documentation

~~~rust
/// Generate library docs for the following item.
//! Generate library docs for the enclosing item.
~~~


## Un peu plus loin

Nous avons vu toutes **les notions de base** de Rust. Jusqu'ici, il y avais beaucoup de similitudes par rapport au **C**. Attaquons les notions plus avancées (et il y en a!).

### Structure

### Gestion des erreurs

Considérons l'exemple suivant: un `Human` peut avoir un `Sex` ou non (c'est une `Option`). `

~~~rust
// les sexes disponnibles
enum Sex { Male, Femmale }

// une structure basique pour un humain
// avec un sexe optionnel
struct Human {
    sex: Option<Sex>,
}

impl Human {
    // création d'un humain sans sexe
    pub fn new() -> Human {
        Human { sex: None }
    }
}
~~~

Une fonction permet de savoir à tout moment s'il possède un `Sex` ou non. La ou dans la majorité des languages on test le résultat renvoyé par la fonction, avec Rust on utilise le **pattern matching** avec `match`. Voici l'implémentation:

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


On voit que qu'importe la situation, notre code gère la situation. Cette méthode peut sembler lourde mais ainsi notre code est **bulletproof**!


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
    // => missing lifetime specifier
}
~~~

Une des plus grande force de Rust est qu'il ne vous **laissera pas compiller** ce code.

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


## Liens utiles

* <https://blog.guillaume-gomez.fr/Rust>

[Rust]: https://www.rust-lang.org/
[Mozilla]: https://www.mozilla.org/fr/
[Servo]: https://fr.wikipedia.org/wiki/Servo_(moteur_de_rendu)

[ownership]: https://doc.rust-lang.org/book/second-edition/ch04-01-what-is-ownership.html
[dangling]: https://doc.rust-lang.org/book/second-edition/ch04-02-references-and-borrowing.html#dangling-references

[Result]: https://doc.rust-lang.org/stable/std/io/type.Result.html
