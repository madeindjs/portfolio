---
title: Dossier de compétences
author: Alexandre Rousseau - contact@rousseau-alexandre.fr
localisation: Lyon, France
# geometry: margin=2cm
pdf-engine: pdflatex
links-as-notes: true
layout: resume
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

### Associé / Directeur technique @ [iSignif](https://isignif.fr) _(depuis 2018)_

Développement de l'application SAAS de mise en relation d'huissiers de justice et d'avocats pour simplifier le processus de signification sous __Ruby on Rails__:

- Intégration de la plateforme Stripe pour automatiser l'envoi de facture aux huissiers et gérer les abonnements mensuels des avocats
- Gestion de l'authentification avec la librairie __Authlogic__
- Design de l'interface avec __Twitter Boostrap 3__
- Création de tests unitaires et tests fonctionnels
- [Refonte de l'interface avec __Vue.js__ / __Vuetify__](https://github.com/isignif/vue-app/)

Déploiement de l'application sur un serveur dédié (VPS) sous Ubuntu 18.04 chez OVH:

- Installation et configuration de Apache HTTP, Passenger et __MariaDB__
- Mise en place d'une sauvegarde régulière avec une CRONtab automatisée et chiffrée avec GnuPG
- Création d'un [rapport automatisé avec __GoAccess__](https://rousseau-alexandre.fr/devops/2020/03/02/automatic-report-with-goaccess.html)
- Déploiement automatisé avec Capistrano

Développement d'une API ouverte avec _Ruby on Rails_:

- Implémentation de la norme __REST__ et __JSON:API__
- Mise en place de l'authentification avec des jetons JWT
- [Documentation de l'API avec Swagger](https://github.com/isignif/openapi-definition)
- Implémentation de la norme JSON:API avec la librairie `fast_jsonapi` de Netflix
- Création d'un [paquet NPM](https://github.com/isignif/isignif-client) qui permet de consommer l'API en Javascript dans le navigateur

### Développeur / DevOps @ [Optimiz.me](https://optimiz.me/) (depuis 2020)

- Benchmark de base __PostgreSQL__, __MongoDB__ et __Elastic Search__ pour le stockage et la manipulation d'une grande quantité de données (+100M)
- Mise en place de __Gitlab CI__ qui se déploie automatiquement sur __Google Cloud Plateform__
- Développement d'une job queue avec __Postgres__
- Mise en place d'une authentification automatisée avec [Keycloak](https://www.keycloak.org/) qui fait interface avec l'OAuth de Google
- Création de service automatisée pour récupéerer les données de manière asynchrone en s'appuyant sur la _job queue_
- Création de l'interface sous __Angular 9__


### Développeur @ [Dougs](https://dougs.fr) (2019/2020)

Développement d'une application SPA de comptabilité en ligne. Une partie à pour but de simplifier la gestion des gérant d’entreprise, l’autre à pour but d’automatiser et d’améliorer le travail des comptables..

Développement de l'interface d'administration destinée aux comptables sous __Node.js__ / __Typescript__ avec __Express.js__:

- Développement de règles de validation métiers via un système de Job délégué asynchrone sur une autre instance Heroku
- Développement d’une fonctionnalité qui automatise la demande d'informations au client via l'API et les _webhook_ d'Intercom
- Participation à la suppression de la dépendance du framework _Sails.js_

Développement de la partie interface client sous __Angular.js__ / __Typescript__:

- Création d’un formulaire client dynamique piloté par un arbre de décisions entièrement personnalisable via des templates Javascript
- Création d'une fonctionnalité de prévisualisation des documents stockés chez Amazon S3
- Création de graphique diverses dans une page de type Dashboard

### Développeur @ [Gac Technology](https://www.gac-technology.com) (2017/2019)

Participation au développement d'une application de gestion de grande flotte automobile sous __PHP7__ / __Zend Framework__

- Participation à la migration sous Docker
- Optimisation de requêtes SQL sous __MySQL__
- Mise en place d'une librairie de migration des données avec _Sphinx_
- Calcul de données via des services dédiés (moyenne des indemnités kilométriques, Taxe Véhicule Société, etc..)
- Création d'un script pour traduire l'application en utilisant Google API

Participation au développement d'une application de gestion de portefeuille immobilier __PHP7__ / __Zend Framework__

- Migration de l'application sous un framework maison vers Zend Framework
- Communication avec les _products owner_ afin de définir la faisabilité des demandes

Développement d'une API de gestion de Workflow _from scratch_ avec __Laravel__:

- Participation au cahier des charges et choix des technologies et de l'architecture
- Utilisation de ce micro-service avec l'application principale via des appels HTTP
- Documentation de l'API avec __Swagger__
- Implémentation de la norme __REST__ et __JSON:API__


### Bureau d'études / Développeur @ [Carrier](http://www.carrier.fr) (2013/2017)

Développement d'une solution de dessin 3D avec __Sketchup__ et son API __Ruby__

- Placement des produits de Carrier sur le plan en fonction des données saisies par l'utilisateur
- Formation des utilisateurs de Carrier Europe en anglais
- Création de simulations 3D promotionnelles à partir de plans 2D

Développement d'une application SAAS de suivi des interventions techniques avec __ASP.NET MVC 5 / C#__

- Import des données automatiques via des exports SAP
- Mise en place du serveur sous __Windows IIS__
- Design de l'interface avec __Twitter Boostrap 3__

Assistant bureau d'études:

- Dessins des plans d'exécution sous __AutoCAD__
- Calculs et dimensionnements des installations frigorifiques avec des outils internes

### Apprentis Bureau d'études @ Carrier (2011/2013)

Assistant bureau d'études:

- Dessins des plan d'exécution sous __AutoCAD__
- Calculs et dimensionnements des installations frigorifiques avec des outils internes

## Diplômes

- 2019: Titre RNCP niveau Bac +4 Développeur Full Stack à IT-Akademy, Lyon
- 2013: BTS FEE: La Martinière Monplaisir, Lyon
- 2011: Bac STI Génie Énergétique: La Martinière Monplaisir, Lyon

## Open source

Une majorité de mes _sides-projects_ sont sur [mon Github](https://github.com/madeindjs). Voici quelque exemples:

- Rédaction & publication du livre [_APIs on Rails - Building REST APIs_](https://leanpub.com/apionrails6) (172*)
- [`Crystagiri`](https://github.com/madeindjs/Crystagiri) Parseur de document HTML écrit en Crystal.                (113*)
- [`ActiveStorage::SendZip`](https://github.com/madeindjs/active_storage-send_zip), Librairie Ruby on Rails pour créer des ZIP    (20*)
- `wifi_bruteforce`, Script Python pour se connecter aux wifi des voisins (21*)




<!-- ## LIENS

- https://rousseau-alexandre.fr
- https://www.linkedin.com/in/alexandre-r-a55a9464/ -->
