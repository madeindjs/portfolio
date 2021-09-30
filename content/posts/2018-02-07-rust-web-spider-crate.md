---
title: Un Crawler en Rust
description: Créez votre premier crate en Rust
date: 2018-02-07 12:00:00 +0200
tags: [rust, crate, crawler]
categories: tutorial
image: ./images/rust2.svg
lang: fr
---

Le but est de faire un **crawler** en [Rust][rust]. Un crawler est un script qui va **naviguer** sur un site donné. Cela permet de faire des **analyses de SEO** ou bien de repérer les pages qui mettent du temps à charger ou qui ne fonctionne pas (code 404, 500, etc..).

Le principe est assez simple. Le crawler possède une file d’attente d'URL à **scraper** (= analyser le contenu HTML). Lorsqu'il **scrape** une page, il va chercher toutes les autres URLs du même nom de domaine sur cette page et les ajouter à sa **liste d'attente**. Une fois que la liste d'attente est vide, le crawler s'arrête.

Un langage performant n'est pas nécessairement un bon critère ici, car le crawler passe la majorité de son temps à **attendre** la page du serveur. Le **multi-threading** est un des critères les plus importants. Vu qu'il s'agit d'un point fort de [Rust][rust] (et que je fais ce que je veux vu que c'est mon post), j'ai choisi ce langage.

> Si vous ne connaissez pas encore [Rust][rust], je vous invite à lire mon article sur [l'introduction à Rust](./2018-02-07-rust.html).

## Sommaire

- TOC
  {:toc}

## Création projet

Afin de pouvoir utiliser notre **Crawler** dans nos future projet, nous utiliserons **Cargo**. Cargo est le gestionnaire de dépendances de [Rust][rust].

### Importer les librairies

On commence donc par utiliser **Cargo** pour initialiser notre nouveau projet.

```bash
cargo new spider --bin
cd spider
```

Nous avons donc une architecture par défaut

```
spider/
├── Cargo.toml
└── src
    └── lib.rs
```

On aura besoin de quelques librairies afin de de réaliser notre crawler:

- [reqwest][reqwest] afin de **récupérer** les pages web
- [scraper][scraper] afin de **scraper** les pages HTML

On les ajoutes donc au fichier _Cargo.toml_

```toml
# Cargo.toml

# ...

[dependencies]
reqwest = "0.8.2"
scraper = "0.4.0"
```

Pour les utiliser, nous devons les charger dans le fichier _lib.rs_.

```rust
// src/lib.rs
extern crate reqwest;
extern crate scraper;
```

### Structure du projet

De plus, nous aurons besoin de deux nouveaux fichiers:

- _src/website.rs_ qui sera en quelque sorte le **crawler**
- _src/page.rs_ qui sera en quelque sorte le **scraper**

Pour les charger, il faut les importer dans le fichier _lib.rs_ grâce au mot clé `pub mod` (`mod` charge le fichier et `pub` le rend publique).

```rust
// src/lib.rs

// ...

pub mod website;
pub mod page;
```

## Le code

### Le scraper

On commence par créer une nouvelle structure `Page` qui contiendra l'URL de la page et le contenu HTML parsé.

```rust
// src/page.rs
use scraper::Html;

#[derive(Debug, Clone)]
pub struct Page {
    /// URL de la page
    url: String,
    /// HTML parsé par scrapper
    html: Html,
}
```

On implémente donc les **méthodes** pour notre scraper. La méthode `new` permettra de créer une récupérer le contenu HTML de la page avec **reqwest**. Lors de l'appel, nous récupérerons le contenu de la page et nous parserons le résultat avec la méthode `visit`.

```rust
// src/page.rs
use scraper::Html;
use reqwest;
use std::io::Read;

pub struct Page {/* ... */}

impl Page {

    pub fn new(url: &str) -> Self {
        Self {
            url: url.to_string(),
            html: Self::visit(url)
        }
    }

    /// Récupère le contenu HTML et le parse
    fn visit(url: &str) -> Html {
        let mut res = reqwest::get(url).unwrap();
        let mut body = String::new();
        res.read_to_string(&mut body).unwrap();

        Html::parse_document(&body)
    }
}
```

Afin de récupérer le contenu de la page web, nous utiliserons **reqwest**. D'autres librairies existent mais **reqwest** est simple à utiliser.

```rust
// src/page.rs
use scraper::Html;
use reqwest;
use std::io::Read;

pub struct Page {/* ... */}
impl Page {
    /* ... */

    /// Scrape la page et récpère tous les liens
    pub fn links(&self, domain: &str) -> Vec<String> {
        let mut urls: Vec<String> = Vec::new();
        // on lance une recherche de tous les liens sur la page
        let selector = Selector::parse("a").unwrap();
        for element in self.html.select(&selector) {
            // on se limite à ceux possédant un attribut `href`
            match element.value().attr("href") {
                Some(href) => {
                    // on se limite à ce domaine (les URLs commençants par `/`)
                    match href.find('/') {
                        Some(0) => urls.push(format!("{}{}", domain, href)),
                        Some(_) => (),
                        None => (),
                    };
                }
                None => (),
            };
        }

        urls
    }

}
```

Pour tester que tout fonctionne, il suffit de **créer un test**. La particularité de [Rust][rust] est que les tests ne sont pas forcément séparé de notre fichier testé.

Le test va simplement `assert!` qu'un lien donné a bien été trouvé parmi ceux scrapés.

```rust
// src/page.rs
use scraper::Html;
use reqwest;
use std::io::Read;

pub struct Page {/* ... */}
impl Page {/* ... */}

#[test]
fn parse_links() {
    let page : Page = Page::new("http://rousseau-alexandre.fr");
    assert!(page.links("http://rousseau-alexandre.fr").contains(
            &"http://rousseau-alexandre.fr/blog".to_string()
    ));
}
```

Maintenant on lance les tests et on vérifie que tout se passe bien.

```bash
cargo test
```

### Le Crawler

Le crawler sera une structure `Website`. Cette structure contiendra toutes les pages visitées et les URLS des pages à visiter.

```rust
// src/website.rs
use page::Page;

pub struct Website {
    /// Le nom de domaine du site
    domain: String,
    /// les URLs à visiter
    links: Vec<String>,
    /// les URLs visitées
    links_visited: Vec<String>,
    /// les pages visitées
    pages: Vec<Page>,
}
```

La méthode `new` permettra de créer un nouveau `Website` à partir du domaine.

```rust
// src/website.rs
use page::Page;

pub struct Website {/* ... */}
impl Website {

    pub fn new(domain: &str) -> Self {
        // on ajoute l'URL donnée aux URL à visiter
        let mut links: Vec<String> = vec!(format!("{}/", domain));

        Self {
            domain: domain.to_string(),
            links: links,
            links_visited: Vec::new(),
            pages: Vec::new(),
        }
    }
}
```

Il faut donc implémenter la méthode `crawl` qui va récupérer les `Page`s parmi les `links` restant et boucler sur toutes les `links` des pages récupérées

```rust
// src/website.rs
use page::Page;

pub struct Website {/* ... */}
impl Website {
    /* ... */

    pub fn crawl(&mut self) {
        // scrawl tant qu'il y a des liens à visiter
        while self.links.len() > 0 {
            let mut new_links: Vec<String> = Vec::new();
            for link in &self.links {
                // on vérifie que l'URL n'a pas déjà été visitée
                if self.links_visited.contains(link) {
                    continue;
                }
                // on récupère la page et on cherche les URLs afin de les
                // ajouter à celles à visiter
                let page = Page::new(link);
                for link_founded in page.links(&self.domain) {
                    // on vérifie avant que le lien n'a pas déjà été visité
                    if !self.links_visited.contains(&link_founded) {
                        new_links.push(link_founded);
                    }
                }
                // on ajoute la page à la structure
                self.pages.push(page);
                // on màj les URLs à visiter
                self.links_visited.push(link.to_string());
            }

            self.links = new_links.clone();
        }
    }
}
```

Pour tester que tout fonctionne, on crée un simple test pour vérifier qu'une page contenue dans un site existe:

```rust
// src/website.rs
use page::Page;

pub struct Website {/* ... */}
impl Website {/* ... */}


#[test]
fn crawl() {
    let mut website: Website = Website::new("http://rousseau-alexandre.fr");
    website.crawl();
    assert!(website.links_visited.contains(
        &"http://rousseau-alexandre.fr/blog".to_string(),
    ));
}
```

... et de lancer les tests:

```bash
cargo test
```

Notre librairie est donc complète!

## Le publier sur [crates.io][crates.io]

[Crates.io][crates.io] répertorie tous les librairies les plus utilisées et permet d'importer la librairie très simplement à l'aide de **Cargo**.

Une [liste d'attributs][cargo_publishing_list] est disponible pour notre fichier _Cargo.toml_ afin d'ajouter des informations complémentaires à notre librairie.

```toml
# Cargo.toml
[package]
name = "spider"
description = "Web spider framework that can spider a domain and collect pages it visits."
authors = ["madeindjs <contact@rousseau-alexandre.fr>"]
version = "1.0.3"
repository = "https://github.com/madeindjs/spider"
readme = "README.md"
# vous pouvez choisir jusquèà 5 mots clefs pour décrire votre librairie
keywords = ["crawler", "spider"]
# la liste des catégoires disponnibles est disponnible sur crates.io/category_slugs
categories = ["web-programming"]
# la licence (vos pouvez aussi spécifier un fichier via )
license = "MIT"
# la documentation est générée automatiquement une fois votre bibliothèque publiée
documentation = "https://docs.rs/spider"

[badges]
# quelques badges pour faire joli sur Github
maintenance = { status = "as-is" }

# ...
```

### L'envoyer sur [crates.io][crates.io]

Tout d'abord, il faut se créer un compte. Pour cela se rendre sur [crates.io][crates.io] et suivre les étapes classiques. Une fois connecté, allez sur dans la section _Account Settings_ et créer une nouvelle **clef API**. Une commande comme la suivante vous sera donnée.

```bash
cargo login abcdefghijklmnopqrstuvwxyz012345
```

Une fois Il suffit d'utiliser la commande `package` qui va créer un fichier _target/package/spider.crate_.

```bash
cargo package
```

Pour publier ce paquet il suffit d'utiliser la commande `publish` qui va s'occuper de tout envoyer sur [crates.io][crates.io].

```bash
cargo publish
```

### Test d'utilisation du Crate

Pour tester que tout fonctionne, essayons de créer un nouveau projet

```bash
cargo new test_spider --bin
cd test_spider
```

Il suffit

```rust
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
```

et on lance pour vérifier que tout fonctionne

```bash
cargo run
```

Tout fonctionne parfaitement. D'autres paramètre sont possibles, si vous voulez en savoir plus, jetez un coup d'oeuil à la [documentation officielle][cargo_publishing].

## Conclusion

Cargo permet facilement de créer des **petites librairie**. Cela permet de partager des **petits composants** utilisables dans de plus gros projets. Cela nous permet d'éviter de "réinventer la roue" en utilisant d'autres composants partagés par d'autres _rustaceans_!

N’hésitez pas à consulter / forker le dépôt complet sur ce [mon dépôt Github][spider_1.0.3].

[spider_1.0.3]: https://github.com/madeindjs/spider/tree/1.0.3
[rust]: https://www.rust-lang.org/
[crates.io]: https://crates.io
[spider]: https://github.com/madeindjs/spider
[cargo_publishing]: https://doc.rust-lang.org/cargo/reference/publishing.html
[cargo_publishing_list]: https://doc.rust-lang.org/cargo/reference/manifest.html#package-metadata
[reqwest]: https://github.com/seanmonstar/reqwest
[scraper]: https://crates.io/crates/scraper
