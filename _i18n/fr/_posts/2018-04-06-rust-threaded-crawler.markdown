---
layout: post
title: Créer un Crawler multi-thread en Rust
description: nous allons pousser notre Crawler afin qu'il soit Mult-threadé
date:   2018-04-06 13:25:00 +0200
tags: rust crate crawler thread
categories: tutorial
thumbnail: /img/blog/rust2.svg
---

Dans un [précédent article][crawler_rust], nous avions crée un [Crawler en Rust][spider]. Dans cet article, nous allons pousser notre Crawler afin qu'il soit **multi-threadé**

>  l'utilisation de plusieurs threads permet de paralléliser le traitement, ce qui, sur les machines multiprocesseur, permet de l'effectuer bien plus rapidement. [Wikipedia][thread_wikipedia]

Dans notre cas, nous allons gagner un temps considérable lorsque notre Crawler effectuera des requêtes HTTP. A lieu d'attendre la réponse, un autre **worker** effectuera une autre requête HTTP en parrallèle

## Implémentation basique


Nous allons créer un **pool de worker** qui contient des **worker**. Un worker sera chargé de consulter une page en envoyant une requête HTTP et en récupérant la réponse.

Pour créer un **pool de workers**, nous utilisons un vecteur contenant des Thread `Vec<JoinHandle<String>>`. Chaque worker est un `thread::spawn` qui sera ajouté à ce tableau. Ceci nous donne quelque chose comme ça.

~~~rust
// création d'un pool de workers qui retournerons un string
let mut workers: Vec<JoinHandle<String>> = Vec::new();

workers.push(thread::spawn(move || {
    // on renvoie un string
    format!("Thread n°{}", i)
}));
~~~

Pour récupérer tous les thread, il faut lancer la méthode `worker.join()`

~~~rust
// on lance les workers
for worker in workers {
    // on affiche la valeur de retour
    match worker.join() {
        Ok(ret) => println!("{:?}", ret),
        Err(_) => (),
    }
}
~~~


Vous avez compris le principe? Maintenant, pour simuler une charge de travail, nous utiliserons `thread::sleep` qui stoppera l’exécution d'un processus. Voici le code complet:

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
    "lopp n°2"
    "lopp n°1"
    "lopp n°3"



## Utilisation des `struct`

Reprenons le [précédent tutoriel][crawler_rust] et utilisons des structures afin d'organiser le code.

La structure `Page` représente une **page crawlé** et donc un **worker**. La méthode `new` s'occuppera de faire la requête HTTP. Dans notre cas, afin de garder une simplicité, on déplace juste `thread::sleep(one_second)` afin de simuler le temps de chargement.

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

La structure `Website` represente une collection de `Page` à crawler et une liste d'URL à crawler. C'est donc notre **pool de worker**. Dans cet exemples, les URLs seront fixées mais dans la vraie vie vivante, on les récupères sur les liens des pages récupérées.

~~~rust
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
~~~

Et donc voici le code complet. Le code devient un peu plus long mais il est mieux découpé.

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

Tout fonctionne correctement, on voit bien que les pages ne sont pas récupérées dans le même ordre que celui que nous avons spécifié

    fetching... http://rousseau-alexandre.fr/blog
    fetching... http://rousseau-alexandre.fr/resume
    fetching... http://rousseau-alexandre.fr/
    fetching... http://rousseau-alexandre.fr/portfolio
    fetching... http://rousseau-alexandre.fr/contact


On a donc vu que Rust nous permet de mettre en place un script multi-thread très rapidement et très facilement.

Si vous souhaitez voir l'implémentation réele sur notre [précédent crawler][crawler_rust], jettez un coup d'oeuil au [commit][multithread_commit].


[spider]: https://github.com/madeindjs/spider
[multithread_commit]: https://github.com/madeindjs/spider/commit/5f20d73651530a83b4a7a68fbb588c458e098fbf
[crawler_rust]: /2018/02/07/rust-web-spider-crate.html
[thread_wikipedia]: https://fr.wikipedia.org/wiki/Thread_(informatique)
