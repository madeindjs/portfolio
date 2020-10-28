---
title: Dossier de compétences
author: <contact@rousseau-alexandre.fr>
localisation: Lyon, France
# geometry: margin=2cm
pdf-engine: pdflatex
# links-as-notes: true
layout: main
---

## Compétences fonctionnelles

- Développement de fonctionnalités en autonomie
- Analyse fonctionnelle et technique des besoins
- Choix technique et architecturaux adaptés en fonction des besoins
- Rédaction (synthèses, ouvrages...)
- Adaptabilité en fonction de la technologie utilisée
- Développement dirigé par les tests
- Mise en place & administration serveur web sous Linux

## Expériences professionnelles

### Développeur / DevOps @ [Optimiz.me](https://optimiz.me/agence-referencement-lyon/) (depuis 2020)

Développement _from scratch_ de Optimiz Data

- Benchmark de base **PostgreSQL**, **MongoDB** et **Elastic Search** pour le stockage et la manipulation d'une grande quantité de données (+100M)
- Développement d'une job queue avec **Postgres**
- Mise en place d'une authentification automatisée avec [Keycloak](https://www.keycloak.org/) qui fait interface avec l'**OAuth de Google**
- Création d'un service automatisé pour récupérer les données de manière asynchrone en s'appuyant sur la _job queue_
- Création de l'interface sous **Angular 9/10**

Devops

- Mise en place de **Gitlab CI** avec lancement des _runners_ sous **Google Cloud Platform**
- Déploiement de l'application sous **Google Cloud Platform** avec **Kubernetes**
- Mise en place d'une sauvegarde régulière avec une CRONtab automatisée et chiffrée avec GnuPG

### Développeur @ [Dougs](https://dougs.fr) (2019/2020)

Développement d'une application SPA de comptabilité en ligne. Une partie à pour but de simplifier la gestion des gérant d’entreprise, l’autre à pour but d’automatiser et d’améliorer le travail des comptables..

Développement de l'interface d'administration destinée aux comptables sous **Node.js** / **Typescript** avec **Express.js**:

- Développement de règles de validation métiers via un système de Job délégué asynchrone sur une autre instance Heroku
- Développement d’une fonctionnalité qui automatise la demande d'informations au client via l'API et les _webhook_ d'Intercom
- Participation à la suppression de la dépendance du framework _Sails.js_

Développement de la partie interface client sous **Angular.js** / **Typescript**:

- Création d’un formulaire client dynamique piloté par un arbre de décisions entièrement personnalisable via des templates Javascript
- Création d'une fonctionnalité de prévisualisation des documents stockés chez Amazon S3
- Création de graphique diverses dans une page de type Dashboard

### Développeur @ [Gac Technology](https://www.gac-technology.com) (2017/2019)

Participation au développement d'une application de gestion de grande flotte automobile sous **PHP7** / **Zend Framework**

- Participation à la migration sous Docker
- Optimisation de requêtes SQL sous **MySQL**
- Mise en place d'une librairie de migration des données avec _Sphinx_
- Calcul de données via des services dédiés (moyenne des indemnités kilométriques, Taxe Véhicule Société, etc..)
- Création d'un script pour traduire l'application en utilisant Google API

Participation au développement d'une application de gestion de portefeuille immobilier **PHP7** / **Zend Framework**

- Migration de l'application sous un framework maison vers Zend Framework
- Communication avec les _products owner_ afin de définir la faisabilité des demandes

Développement d'une API de gestion de Workflow _from scratch_ avec **Laravel**:

- Participation au cahier des charges et choix des technologies et de l'architecture
- Utilisation de ce micro-service avec l'application principale via des appels HTTP
- Documentation de l'API avec **Swagger**
- Implémentation de la norme **REST** et **JSON:API**

### Bureau d'études / Développeur @ [Carrier](http://www.carrier.fr) (2013/2017)

Développement d'une solution de dessin 3D avec **Sketchup** et son API **Ruby**

- Placement des produits de Carrier sur le plan en fonction des données saisies par l'utilisateur
- Formation des utilisateurs de Carrier Europe en anglais
- Création de simulations 3D promotionnelles à partir de plans 2D

Développement d'une application SAAS de suivi des interventions techniques avec **ASP.NET MVC 5 / C#**

- Import des données automatiques via des exports SAP
- Mise en place du serveur sous **Windows IIS**
- Design de l'interface avec **Twitter Boostrap 3**

Assistant bureau d'études:

- Dessins des plans d'exécution sous **AutoCAD**
- Calculs et dimensionnements des installations frigorifiques avec des outils internes

### Apprentis Bureau d'études @ Carrier (2011/2013)

Assistant bureau d'études:

- Dessins des plan d'exécution sous **AutoCAD**
- Calculs et dimensionnements des installations frigorifiques avec des outils internes

## Experiences personnelles

### Freelance _(depuis 2020)_

Travail pour [Shipotsu](https://www.shipotsu.com/) (~50 heures)

- Refonte de l'application sous une architecture orienté API avec **ExpressJS** / **Typescript** / **MongoDB**
- Création de l'interface sous **Angular 9/10**
- Mise en place d'une sauvegarde régulière avec une CRONtab automatisée et chiffrée avec GnuPG

### Associé / Directeur technique @ [iSignif](https://isignif.fr) _(depuis 2018)_

Développement de l'application SAAS de mise en relation d'huissiers de justice et d'avocats pour simplifier le processus de signification sous **Ruby on Rails**:

- Intégration de la plateforme Stripe pour automatiser l'envoi de facture aux huissiers et gérer les abonnements mensuels des avocats
- Gestion de l'authentification avec la librairie **Authlogic**
- Design de l'interface avec **Twitter Boostrap 3**
- Création de tests unitaires et tests fonctionnels
- [Refonte de l'interface avec **Vue.js** / **Vuetify**](https://github.com/isignif/vue-app/)

Déploiement de l'application sur un serveur dédié (VPS) sous Ubuntu 18.04 chez OVH:

- Installation et configuration de Apache HTTP, Passenger et **MariaDB**
- Mise en place d'une sauvegarde régulière avec une CRONtab automatisée et chiffrée avec GnuPG
- Création d'un [rapport automatisé avec **GoAccess**](https://rousseau-alexandre.fr/devops/2020/03/02/automatic-report-with-goaccess.html)
- Déploiement automatisé avec Capistrano

Développement d'une API ouverte avec _Ruby on Rails_:

- Implémentation de la norme **REST** et **JSON:API**
- Mise en place de l'authentification avec des jetons JWT
- [Documentation de l'API avec Swagger](https://github.com/isignif/openapi-definition)
- Implémentation de la norme JSON:API avec la librairie `fast_jsonapi` de Netflix
- Création d'un [paquet NPM](https://github.com/isignif/isignif-client) qui permet de consommer l'API en Javascript dans le navigateur

## Diplômes

- 2019: Titre RNCP niveau Bac +4 Développeur Full Stack à IT-Akademy, Lyon
- 2013: BTS FEE: La Martinière Monplaisir, Lyon
- 2011: Bac STI Génie Énergétique: La Martinière Monplaisir, Lyon

## Open source

Une majorité de mes _sides-projects_ sont sur [mon Github](https://github.com/madeindjs). Voici quelque exemples:

- Rédaction & publication du livre [_APIs on Rails - Building REST APIs_](https://leanpub.com/apionrails6) (195\*)
- [`Crystagiri`](https://github.com/madeindjs/Crystagiri) Parseur de document HTML écrit en Crystal. (118\*)
- [`ActiveStorage::SendZip`](https://github.com/madeindjs/active_storage-send_zip), Librairie Ruby on Rails pour créer des ZIP (26\*)
- `Wi-fi_bruteforce`, Script Python pour se connecter aux Wi-fi des voisins (34\*)

<!-- ## LIENS

- https://rousseau-alexandre.fr
- https://www.linkedin.com/in/alexandre-r-a55a9464/ -->
