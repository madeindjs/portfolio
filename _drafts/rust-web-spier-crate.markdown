---
layout: post
title: Un Crawler en Rust
description: Créez votre premier crate en Rust
date:   2018-02-01 12:00:00 +0200
tags: rust crate crawler
categories: tutorial
---

Le but est de faire un **crawler** en [Rust][rust]. Un crawler est un script qui va naviguer sur un site donné. Cela permet de faire des analyses de SEO ou bien de repérer les pages qui mettent du temps à charger ou qui ne fonctionne pas (code 404 ou même 500).

Le principe est assez simple. Le crawler possède une file d'atente d'URL à **scraper** (= analyser le contenu HTML). Lorsqu'il **scrape** une page, il va chercher toutes les autres URLs du même nom de domaine sur cette page et les ajouter à sa **liste d'attente**. Une fois que la liste d'attente est vide, le crawler s'arrête.

Un language performant n'est pas nécessairement un bon crière ici, car le crawler passe la majorité de son temps à attendre la page du serveur. Le multi-threading est un des critères les plus importants. Vu qu'il s'agit d'un point fort de [Rust][rust] et vu que c'est mon post, j'ai choisit ce language.

## Création projet

On commence donc par utiliser **Cargo** pour initaliser notre nouveau projet. On précise le flag `--bin` afin de gérer un mode en ligne de commande mais nous allons créer un mode "librairie" aussi.

~~~bash
$ cargo new spider --bin
$ cd spider
~~~

Nous avons donc une architecture par défault

~~~
spider/
├── Cargo.toml
└── src
    └── main.rs
~~~

On aura besoin de quelques librairies afin de de réaliser

- [reqwest][reqwest] afin de récupérer les pages web
- [scraper][scraper] afin de **scraper** les pages HTML

On les ajoutes donc au fichier _Cargo.toml_

~~~toml
reqwest = "0.8.2"
scraper = "0.4.0"
~~~

## code

## Le publier sur [crates.io][crates.io]

Se créer un compte sur [crates.io][crates.io]. Il suffit ensuite de se rendre dans la section _Account Settings_ et de créer une nouvelle clée API.

~~~bash
$ cargo login abcdefghijklmnopqrstuvwxyz012345
~~~

Il suffit d'utiliser la commande `package` qui va créer un fichier _target/package/spider.crate_.

~~~bash
$ cargo package
~~~

Pour publier ce paquet il suffit d'utiliser la commande `publish` qui va s'occuper de tout envoyer sur [crates.io][crates.io].

~~~bash
$ cargo publish
~~~

## Test d'utilisation du Crate

Pour tester que tout fonctionne, essayons de créer un nouveau projet

~~~bash
$ cargo new test_spider --bin
$ cd test_spider
~~~

Il suffit 

~~~rust
// src/main.rs
extern crate spider;

use spider::website::Website;


fn main() {
    let mut localhost = Website::new("http://localhost:4000");
    localhost.crawl();

    for page in localhost.get_pages() {
        println!("- {}", page.get_url());
    }
}
~~~

et on lance pour vérifier que tout fonctionne

~~~bash
$ cargo run
~~~

Tout fonctionne parfaitement. D'autres paramètre sont possibles, si vous voulez en savoir plus, jettez un coup d'oeuil à la [documentation officielle][cargo_publishing].


[rust] https://www.rust-lang.org/
[crates.io] https://crates.io
[spider] https://github.com/madeindjs/spider
[cargo_publishing] https://doc.rust-lang.org/cargo/reference/publishing.html
[reqwest] https://github.com/seanmonstar/reqwest
[scraper] https://crates.io/crates/scraper