---
layout: post
title: Implémenter Phinx dans une application PHP
date: 2018-08-03 12:00:00 +0200
tags: php phinx sql
categories: tutorial
thumbnail: /img/blog/cakephp.gif
---

Les migrations permettent de **versionner** les **changements apportés à la base de données**. Ainsi, lorsqu'on récupère une branche développée par quelqu'un, on peut facilement **jouer tous les changements** apporté à la base de données. Ceci permet d'être certains que nous avons **exactement** la même base de donnée qu'un autre développeur. Cela permet aussi de garder un historique des actions effectuées sur la base de données.

## Présentation de Phinx

De nombreux outils existe mais [Phinx][phinx] se démarque car il **n'impose pas d'ORM** et s'installe très facilement. Ceci le rend particulièrement adapté pour les vieux projets qui **possèdent déjà un ORM**.

De plus, [Phinx][phinx] est une librairie développée et utilisée par le framework [CakePHP](https://cakephp.org), ce qui le rend _très stable_. Il offre aussi des outils pour créer les migrations mais elle accepte aussi les **requêtes SQL brutes**.

Dans cet article nous allons faire deux migrations:

- Une pour créer une table
- Une pour insérer des données

## Configuration

Phinx utilise un **unique fichier de configuration**. Lors de l'utilisation en ligne de commande, il va chercher un fichier nommé _phinx_ avec une extension PHP, YAML ou JSON. La configuration spécifie juste la **base à utiliser**, ou son **stockées** les migrations, etc..

D'autres options sont [présenté via la documentation](http://docs.phinx.org/en/latest/configuration.html).

## Création de la migration

On commence par se placer dans le dossier @script@

```bash
cd script
```

Pour **créer une migration**, il suffit d'appeler [Phinx][phinx] et de donner un **nom explicite** à celle-ci:

```bash
vendor/bin/phinx create CreateExampleTable
```

Cette commande va simplement **créer un fichier de migration**. Dans ce fichier on retrouve une classe qui étend de `Phinx\Migration\AbstractMigration`:

```php
<?php
// sandbox/migrations/20180725124615_create_example_table.php
use Phinx\Migration\AbstractMigration;

class CreateExampleTable extends AbstractMigration
{

    public function change() { }
}
```

> Le code a été simplifié pour être plus concis

Cette classe possède **trois méthodes** qui peuvent êtres implémenté:

- **`up`**, contient les **modifications** à apporter sur la base de données
- **`down`**, permet de **revenir en arrière** et d'annuler les modifications apportées par `up`
- **`change`**, permet de déduire les méthodes `up` et `down` mais est limité à certaines action et oblige à utiliser [des méthodes implémentées par Phinx](http://docs.phinx.org/en/latest/migrations.html#the-change-method)

Dans notre cas, nous allons crer une nouvelle table avec la méthode `change` en utilisant les [méthodes pour créer une table de Phinx](http://docs.phinx.org/en/latest/migrations.html#creating-a-table)

```php
// sandbox/migrations/20180725124615_create_example_table.php

// ..

public function change()
{
    $this->table('example')
         ->addColumn('name', 'string', ['limit' => 20])
         ->addColumn('description', 'text')
         ->addIndex('name', ['unique' => true])
         ->save();
}
```

## Lancer la migration

Pour **jouer la migration**, il suffit de lancer la commande `phinx migrate`. Nous pouvons alors voir les requêtes SQL **générées** avec le flag `-vv`

```php
vendor/bin/phinx migrate -vv
```

```sql
 == 20180725124615 CreateExampleTable: migrating
START TRANSACTION
CREATE TABLE `example` (`id` INT(11) NOT NULL AUTO_INCREMENT, `name` VARCHAR(20) NOT NULL, `description` TEXT NOT NULL, PRIMARY KEY (`id`),  UNIQUE KEY (`name`)) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci;
COMMIT
INSERT INTO `phinxlog` (`version`, `migration_name`, `start_time`, `end_time`, `breakpoint`) VALUES ('20180725124615', 'CreateExampleTable', '2018-07-25 15:14:41', '2018-07-25 15:14:41', 0);
 == 20180725124615 CreateExampleTable: migrated 0.0051s
```

On voit donc que notre table a été créee et qu'un entrée a été ajouté à la table `phinxlog`.

## Revenir en arrière _(Rollback)_

A tout moment, nous pouvons décider d' **annuler la dernière migration** avec la commande `rollback`. Celli-ci va

- **déduire** l'action à effectuer en fonction de la méthode `change` si elle est implémentée
- lancer la méthode `down` si elle est implémentée

```bash
vendor/bin/phinx rollback -vv
```

```sql
 == 20180725124615 CreateExampleTable: reverting
START TRANSACTION
 -- Altering table example
ALTER TABLE `example` DROP INDEX `name`
    -> 0.1377s
 -- Altering table example
ALTER TABLE `example` DROP COLUMN `description`, DROP COLUMN `name`
    -> 0.3764s
COMMIT
DELETE FROM `phinxlog` WHERE `version` = '20180725124615'
 == 20180725124615 CreateExampleTable: reverted 0.5522s
```

## Insérer des données

On crée une nouvelle migration

```bash
vendor/bin/phinx create InsertSomeExamples
```

Cette fois ci, nous utilisons les méthodes `up` et `down`

```php
<?php
// sandbox/migrations/20180725132458_insert_some_examples.php

use Phinx\Migration\AbstractMigration;

class InsertSomeExamples extends AbstractMigration
{
    public function up()
    {
        $this->table('example')
             ->insert(['name' => 'My first example', 'description' => 'azertyuiop'])
             ->saveData();
    }


    public function down()
    {
        $this->execute('DELETE FROM example');
    }
}
```

[phinx]: https://phinx.org
