---
layout: post
title: Améliorer notre Crawler en Rust
description: Créez votre premier crate en Rust
date:   2018-02-08 12:00:00 +0200
tags: rust crate crawler thread
categories: tutorial
---
## base

Un exemple basique. Nous créons un **pool de workers**. Chaque **worker** travaillera en parallèle. Pour simuler une charge de travail, nous utiliserons `thread::sleep` qui stoppera l’exécution du processus pendant une seconde.

~~~rust
// src/main.rs
use std::time;
use std::thread;
use std::thread::JoinHandle;

fn main() {
    // création d'un pool de workers qui retournerons un string
    let mut workers: Vec<JoinHandle<String>> = Vec::new();

    // trois worker vont travailler en parrallèle
    for i in vec![1, 2, 3] {
        workers.push(thread::spawn(move || {
            // on attend une seconde
            println!("wait...");
            let one_second = time::Duration::from_millis(1000);
            thread::sleep(one_second);
            // on renvoie un string
            format!("lopp n°{}", i)
        }));
    }

    // on lance les workers
    for worker in workers {
        // on affiche la valeur de retour
        match worker.join() {
            Ok(ret) => println!("{:?}", ret),
            Err(_) => (),
        }
    }
}
~~~

Si vous lancez le code suivant on voit que l’exécution du script à duré moins de trois secondes. Ceci est du au fait que chaque worker à travaillé en même temps.

Voici le retour du script.

    wait...
    wait...
    wait...
    "lopp n°1"
    "lopp n°2"
    "lopp n°3"



## Utilisation des `struct`

Reprenons le [précédent tutoriel](azaz)

Simulons une page qui va mettre une seconde à être récupérée

~~~rust
// src/main.rs
use std::time;
use std::thread;
use std::thread::JoinHandle;

/// représente une page récupérée depuis l'internet
struct Page {
    url: String,
}
impl Page {
    /// récupère la page depuis l'internet
    fn new(url: &String) -> Self {
        println!("fetching... {}", url);
        // on simule une seconde pour récupérer la page
        let one_second = time::Duration::from_millis(1000);
        thread::sleep(one_second);

        Self { url: url.to_string() }
    }
}

~~~

Mainteant simulons une page web qui comporte quelques URLs à crawler:

~~~rust
// src/main.rs

/* ... */

struct Website {
    pages: Vec<Page>,
    urls: Vec<String>,
}
impl Website {
    fn new() -> Self {
        Self {
            pages: Vec::new(),
            // TODO: récupérer les URLs avec le scraper
            urls: vec![
                "http://rousseau-alexandre.fr/".to_string(),
                "http://rousseau-alexandre.fr/blog".to_string(),
                "http://rousseau-alexandre.fr/resume".to_string(),
                "http://rousseau-alexandre.fr/portfolio".to_string(),
                "http://rousseau-alexandre.fr/contact".to_string(),
            ],
        }
    }

    fn crawl(&mut self) {
        // pool de worker qui vont s'occuper de créer les pages
        let mut workers: Vec<JoinHandle<Page>> = Vec::new();

        for url in &self.urls {
            // en redéfinissant un `let` on étend la portée de la variable
            let thread_url = url.to_string();
            workers.push(thread::spawn(move || Page::new(&thread_url)));
        }


        for worker in workers {
            match worker.join() {
                Ok(page) => self.pages.push(page),
                Err(_) => (),
            }
        }

    }
}

fn main() {
    let mut website = Website::new();
    website.crawl();
}
~~~

Pour l'instant tout fonctionne correctement, on voit bien que les pages ne sont pas récupérées dans le même ordre que celui que nous avons spécifié

    fetching... http://rousseau-alexandre.fr/blog
    fetching... http://rousseau-alexandre.fr/resume
    fetching... http://rousseau-alexandre.fr/
    fetching... http://rousseau-alexandre.fr/portfolio
    fetching... http://rousseau-alexandre.fr/contact


## Amélioration de notre script


J'avais initialement stocké directement le `scraper::Html`

[multithread_commit]: https://github.com/madeindjs/spider/commit/5f20d73651530a83b4a7a68fbb588c458e098fbf
[crawler_rust]: /2018/02/07/rust-web-spider-crate.html