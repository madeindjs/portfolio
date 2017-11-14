---
layout: post
title:  Introduction à Rust
description:  Participez au développement de votre navigateur préféré
date:   2017-11-06 12:00:00 +0200
tags: rust
categories: tutorial
---
Rust est un langage avancé, je vous déconseille de suivre ce tutoriel si vous n'avez pas de notions avancée en prgramation.

### [Ownership][ownership]

Rust gère la mémoire pour nous mais n'utilise pas de **garbage collector**. Il utilise un système d'[apartenance][ownership].

~~~rust
fn main() {
    // create a simple word
    let word: String = String::from("hello");
    // try to copy it
    let word_copy = word;
    println!("{:?}", word_copy);
}
~~~

Ce code génerera une erreur

> use of moved value: `word`

Pour que ce code fonctionne nous devons utiliser la méthode `clone` qui va créer une copie.

~~~rust
fn main() {
    // create a simple word
    let word: String = String::from("hello");
    // copy it
    let word_copy = word.clone();
    println!("{:?}", word_copy);
}
~~~


### Reference

Comme tous les langages bas niveaux, Rust utilise beaucoup de **pointeurs**. Au lieu de copier la variable, nous travaillons directement sur une **réference** de celle-ci. Pour créer une référence, il suffit de préfixer la variable d'un `&`.

~~~rust
let mut hello = "Bonjour";
println!("{:?}", hello); // => "Bonjour"
println!("{:?}", &hello);// => "Bonjour"
hello = "Holla";
println!("{:?}", &hello);// => "Holla"
~~~

Ceci à l'avantage d'économiser une variable. Voici une utilisation plus complexe:

~~~rust
// get length of a word passed by reference
fn length(word: &str) -> usize {
    word.len()
}

fn main() {
    let hello = "Bonjour";
    println!("{:?}", length(hello));// => 7
}
~~~


[ownership]: https://doc.rust-lang.org/book/second-edition/ch04-01-what-is-ownership.html