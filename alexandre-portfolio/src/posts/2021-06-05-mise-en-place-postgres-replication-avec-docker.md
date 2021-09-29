---
title: Réplication de PostgreSQL avec Docker
description: Ce tutoriel montre comment mettre en place la réplication des
  données à travers un exemple avec Docker
layout: post
date: 2021-06-05 12:00:00 +0200
tags:
  - docker
  - postgres
  - bash
categories: devops
thumbnail: /img/blog/postgres.svg
modified: 2021-06-05T13:55:09.822Z
lang: fr
---

Récemment j'ai été amené à travailler avec le gestionnaire de base de données [PostgreSQL](https://postgresql.org/) et plus précisément la réplication des données sur plusieurs instance.

La réplication des données est un stratégie qui permet de mettre en place une [**scalabilité horizontale**](https://fr.wikipedia.org/wiki/Extensibilit%C3%A9). En d'autres termes, cela évite d'augmenter les ressources de son serveur principal mais plutôt de déporter une partie de la charge sur d'autres serveurs. Mettre en place une telle infrastructure est très intéressant lorsqu'on reçois beaucoup de requêtes et qu'on souhaite distribuer sur plusieurs serveurs.

Je te propose de découvrir un peu cette infrastructure et de la mettre en place ensuite avec Docker.

Allez c'est partit!

## Le fonctionnement de la réplication

Avec PostgreSQL, la réplication des données se matérialise avec un serveur **principal** et des serveurs **secondaires**.

Le serveur principal, dit `master`, contient toutes les données. Lui seul a le droit d'écriture sur celles-ci. Il s'agit donc d'une instance PostgreSQL assez classique.

Le serveur secondaire, dit `standby`, possède une copie des données. Lorsqu'une modification est effectuée sur le serveur `master`, il reproduit les mêmes changements sur sa copie. Il s'agit d'une instance en lecture seule de la base de données et permet d'effectuer uniquement des requêtes de lectures. Si tu effectue une requête de type `INSERT`, `UPDATE`, `DELETE` mais aussi `CREATE TABLE/ROLE/DATABASE` ou `ALTER TABLE/ROLE/DATABASE`, tu obtiendra une erreur.

Il existe plusieurs types de réplication mais celle que nous allons utiliser est la **réplication au fil de l’eau** dit "[streaming replication](https://www.postgresql.org/docs/current/warm-standby.html#STREAMING-REPLICATION)". Ce type de réplication repose sur les [Write-Ahead Logging](https://www.postgresql.org/docs/current/wal-intro.html) qui représente en quelques sorte un journal de modifications. Ce sont ces journaux qui seront envoyés a l'instance `standby`.

Concrètement, pour mettre cela en place, nous aurons besoin de

- sur le serveur `master`, créer un utilisateur dédié à la réplication qui devra avoir le rôle `REPLICATION` et `LOGIN`. Mais aussi modifier un peu la configuration pour autoriser la connexion du serveur `standby` sur le serveur `master`
- Sur serveur `standby`, initialiser la base avec un backup à chaud de `master`.

Si tout n'est pas encore très clair dans ta tête, ne t'inquiète pas car je vais le détailler juste après.

## Construction de l'image

Le but est de construire une image générique qui pourras être utilisée comme `master` ou `standby`. Le rôle sera définit par une [variable d'environement](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file) qui pourra aussi être utilisée avec [Docker Compose](https://docs.docker.com/compose/environment-variables/).

Notre image va s'appuyer sur [l'image PostgreSQL officielle sur DockerHub](https://hub.docker.com/_/postgres). Nous aurons donc accès à toutes les variables d’environnement proposées par l'image officielle.

### `Dockerfile`

Commençons donc par écrire le `Dockerfile` en initialisant toutes les variables d’environnement nécessaires. Ces variables doivent être écrite dans `Dockerfile` avec la syntaxe suivante:

```dockerfile
ENV <VARIABLE_NAME> <DEFAULT_VALUE>
```

Dans notre cas nous allons initialiser les variables suivantes:

- `REPLICATION_ROLE` qui peut être sur `master` ou `slave` (`slave` étant l'ancienne dénomination de `standby`)
- `REPLICATION_USER` et `REPLICATION_PASSWORD` qui correspondent à l'utilisateur en charge de la réplication des données
- `POSTGRES_MASTER_SERVICE_HOST` et `POSTGRES_MASTER_SERVICE_PORT` qui seront utilisé par le serveur `standby` pour savoir comment communiquer avec le serveur `MASTER`
- `WAL_KEEP_SEGMENTS`, `WAL_KEEP_SEGMENTS` et `MAX_WAL_SENDERS` qui vont nous permettre d'ajuster la réplication si besoin

Nous obtenons donc ceci:

```dockerfile
# Dockerfile
FROM postgres:12.3

ENV MAX_CONNECTIONS 500
ENV WAL_KEEP_SEGMENTS 256
ENV MAX_WAL_SENDERS 100
# master/slave settings
ENV REPLICATION_ROLE master
ENV REPLICATION_USER replication
ENV REPLICATION_PASSWORD ""
# slave settings
ENV POSTGRES_MASTER_SERVICE_HOST localhost
ENV POSTGRES_MASTER_SERVICE_PORT 5432
# postgres settings
ENV POSTGRES_USER postgres
```

NOTE: Nous utilisons la version 12 de PostgreSQL qui possède [quelques changements](https://www.cybertec-postgresql.com/en/recovery-conf-is-gone-in-postgresql-v12/) au niveau de la mise en place de la réplication avec les version précédentes

Il suffit ensuite de définir deux scripts Bash qui seront exécutés à l'initialisation du container. Ces fichiers doivent être copié dans le dossier `/docker-entrypoint-initdb.d` comme le spécifie [la documentation de l'image Docker PostgreSQL](https://hub.docker.com/_/postgres):

```dockerfile
# Dockerfile
# ...
COPY 10-config.sh /docker-entrypoint-initdb.d/
COPY 20-replication.sh /docker-entrypoint-initdb.d/

RUN sed -i 's/set -e/set -e -x\nPGDATA=$(eval echo "$PGDATA")/' /docker-entrypoint.sh
```

Quelques explications:

- Le script `10-config.sh` sera en charge de mettre la configuration commune au rôles `master` et `standby`
- Le script `20-replication.sh` sera en charge de mettre la configuration au rôles `master` ou `standby`. Il sera constitué d'un `if [ $REPLCATION_ROLE = "master" ]` qui adaptera le comportement en fonction
- La dernière ligne est un peu plus complexe mais elle nous permet simplement de définir la variable `$PGDATA` qui est très utile puisqu'elle correspond au dossier ou est situé la configuration de PostgreSQL.

Passons maintenant aux script.

### `10-config.sh`

Le premier script va se charger de modifier le fichier `postgresql.conf` en ajoutant les paramètres que nous avons passé comme variables d’environnement. Le fichier `postgresql.conf` est situé dans le dossier `/var/lib/postgres` mais nous pouvons utiliser la variable `$PGDATA`.

Voici donc le script complet que je détaille après:

```bash
#!/bin/bash
set -e

echo [*] configuring $REPLICATION_ROLE instance

# 1. set replication configuration
echo "max_connections = $MAX_CONNECTIONS" >> "$PGDATA/postgresql.conf"
echo "wal_level = hot_standby" >> "$PGDATA/postgresql.conf"
echo "wal_keep_segments = $WAL_KEEP_SEGMENTS" >> "$PGDATA/postgresql.conf"
echo "max_wal_senders = $MAX_WAL_SENDERS" >> "$PGDATA/postgresql.conf"
# 2. standby_seeting, ignored on master
echo "hot_standby = on" >> "$PGDATA/postgresql.conf"
# 3. allow replication user to communicate with other instance
echo "host replication $REPLICATION_USER 0.0.0.0/0 trust" >> "$PGDATA/pg_hba.conf"
# 4. restart
pg_ctl -D "$PGDATA" -m fast -w reload
```

Et voici les explications:

1. nous mettons en place les paramètres relatifs au comportement de la réplication
2. TODO utile ?
3. On rajoute une entrée à `pg_hba.conf` pour permettre à l'utilisateur en charge de la réplication de communiquer avec les autres. Cet utilisateur sera crée dans le prochain script sur le serveur `master` uniquement
4. on redémarre le serveur pour s'assurer que les paramètres soient chargés

### `20-replication.sh`

Comme je l'ai dit plus haut, ce fichier va effectuer des actions différentes en fonction de `$REPLICATION_ROLE`. Il va donc se caractériser comme ceci:

```bash
#!/bin/bash
set -e

if [ $REPLICATION_ROLE = "master" ]; then
  # ...
elif [ $REPLICATION_ROLE = "slave" ]; then
  # ...
fi

echo [*] $REPLICATION_ROLE instance configured!
```

#### Le serveur `master`

Pour le serveur `master` c'est très simple, il suffit de créer l'utilisateur en charge de la réplication avec le rôle `REPLICATION` et `LOGIN`. On peut le faire directement en une seule ligne avec la commande `psql`:

```bash
# ...
if [ $REPLICATION_ROLE = "master" ]; then
  psql -U $POSTGRES_USER -c "CREATE ROLE $REPLICATION_USER WITH REPLICATION PASSWORD '$REPLICATION_PASSWORD' LOGIN"
elif [ $REPLICATION_ROLE = "slave" ]; then
    # ...
fi
# ...
```

#### Le serveur `standby`

Le serveur `standby` (appelé ici `slave`) va être un peu plus compliqué.

Le principe est d'importer les données existante du serveur `master` avec `pg_basebackup`. Nous avons besoin de spécifier les _flags_ suivants:

- `--write-recovery-conf` afin de spécifier à l’outil que nous souhaitons faire cette sauvegarde pour une réplication.
- `--pgdata=$PGDATA` qui spécifie ou écraser les données

Mais avant de pouvoir écraser les données, nous devons stopper l'instance et supprimer le dossier `$PGDATA`.

Voici donc le script complet:

```bash
# ...
if [ $REPLICATION_ROLE = "master" ]; then
  # ...
elif [ $REPLICATION_ROLE = "slave" ]; then
  # stop postgres instance and reset PGDATA,
  # confs will be copied by pg_basebackup
  pg_ctl -D "$PGDATA" -m fast -w stop
  # make sure standby's data directory is empty
  rm -r "$PGDATA"/*

  pg_basebackup \
        --write-recovery-conf \
        --pgdata="$PGDATA" \
        --wal-method=fetch \
        --username=$REPLICATION_USER \
        --host=$POSTGRES_MASTER_SERVICE_HOST \
        --port=$POSTGRES_MASTER_SERVICE_PORT \
        --progress \
        --verbose

  # useless postgres start to fullfil docker-entrypoint.sh stop
  pg_ctl -D "$PGDATA" \
        -o "-c listen_addresses=''" \
        -w start
fi
# ...
```

Et voilà. Notre script est maintenant complet

## Tester notre image

Maintenant que tout est en place, nous allons tester que tout fonctionne.

### Avec Docker Compose

Pour tout tester manuellement, nous pouvons utiliser Docker compose. Avant d'écrire le `docker-compose.yml`, nous devons construire l'image avec `docker build`:

```bash
docker build  -t "postgres-replication:12.3" .
```

Voici donc le fichier `docker-compose.yml`.

```yml
postgres-slave:
  image: postgres-replication:12.3
  ports:
    - 5433:5432
  links:
    - postgres-master
  environment:
    POSTGRES_USER: arousseau
    POSTGRES_PASSWORD: password
    REPLICATION_USER: arousseau_rep
    REPLICATION_PASSWORD: password
    REPLICATION_ROLE: slave
    POSTGRES_MASTER_SERVICE_HOST: postgres-master
    POSTGRES_HOST_AUTH_METHOD: trust

postgres-master:
  image: postgres-replication:12.3
  ports:
    - 5432:5432
  environment:
    POSTGRES_USER: arousseau
    POSTGRES_PASSWORD: password
    REPLICATION_USER: arousseau_rep
    REPLICATION_PASSWORD: password
    POSTGRES_HOST_AUTH_METHOD: trust
```

Il suffit ensuite de lancer `docker-compose up` et d'admirer les logs.

Un fois que tout est initialisé, essayons de lancer quelques commandes sur le serveur `master`. Pour ce connecter à l'instance il suffit de lancer la commande suivante:

```bash
docker exec -it docker-postgres-replication_postgres-master_1 psql -U arousseau
```

Créons une base de données avec une table et quelques données

```sql
arousseau=# create database test;
arousseau=# \c test
test=# create table posts (title text);
test=# insert into posts values ('it works');
```

Pour vérifier que les changement on été fait sur le serveur `standby`, nous pouvons exécuter la requête suivante:

```bash
docker exec docker-postgres-replication_postgres-slave_1 psql -U arousseau test -c 'select * from posts'
  title
----------
 it works
(1 row)
```

Ourah!

### Automatisé

En programmation, on aime bien mettre en place des tests unitaires qui vérifie que tout se déroule correctement. Comment le mettre en place des tests pour notre image Docker ? C'est très simple, nous allons simplement encore créer un script Bash! Celui-ci sera découpé comme ceci:

1. on commence par supprimer les container en cours
2. on créer l'image
3. on lance le `master` et on attends un peu
4. on lance le `standby` et on attends un peu
5. on insère des données sur le `master` et on attends quelques secondes pour la réplication se fasse
6. on vérifie que les données sont présente sur le `standby`

Voici donc le résultat.

```bash
#!/usr/bin/env bash

IMAGE="postgres-replication:test"
CONTAINER_PREFIX="postgres-replication-test"
POSTGRES_USER='postgres'
POSTGRES_PASSWORD=''
POSTGRES_DB='postgres'

docker container rm -f "$CONTAINER_PREFIX-master"
docker container rm -f "$CONTAINER_PREFIX-slave"

docker build -t $IMAGE .

docker run -e POSTGRES_USER=test \
           -e POSTGRES_PASSWORD=password \
           -e REPLICATION_USER=test_rep \
           -e REPLICATION_PASSWORD=password \
           -e POSTGRES_MASTER_SERVICE_HOST=postgres-master \
           -e REPLICATION_ROLE=master \
           --name "$CONTAINER_PREFIX-master" \
           --detach \
           $IMAGE

sleep 5

docker run  --link "$CONTAINER_PREFIX-master" \
           -e POSTGRES_USER=test \
           -e POSTGRES_PASSWORD=password \
           -e REPLICATION_USER=test_rep \
           -e REPLICATION_PASSWORD=password \
           -e POSTGRES_MASTER_SERVICE_HOST=$CONTAINER_PREFIX-master \
           -e REPLICATION_ROLE=slave \
           --name "$CONTAINER_PREFIX-slave" \
           --detach \
           $IMAGE

sleep 5

docker exec "$CONTAINER_PREFIX-master" psql -U test postgres -c 'CREATE TABLE replication_test (a INT, b INT, c VARCHAR(255))'
docker exec "$CONTAINER_PREFIX-master" psql -U test postgres -c "INSERT INTO replication_test VALUES (1, 2, 'it works')"

sleep 5

result=$(docker exec "$CONTAINER_PREFIX-slave" psql -U test postgres -c "SELECT COUNT(*) FROM replication_test" -X -A -t)

if [ "$result" = "1" ]
then
    exit 0
else
    exit 1
fi
```

## Conclusion

Le sujet est très complexe mais j'ai volontairement effleuré le sujet afin de pouvoir avoir quelques bases. Je me suis appuyé d'un [projet déjà existant](https://github.com/nebirhos/docker-postgres-replication) mais qui me semblait abandonné.

Le code complet est disponible sur ce [repository Github](https://github.com/madeindjs/docker-postgres-replication) et si tu veux l'utiliser, l'[image sur Dockerhub](https://hub.docker.com/repository/docker/arousseau/postgres-replication).

Cette image m'a permis de reproduire un environnement semblable à l’environnement de production. Il est aussi possible d'aller plus loin en créant plusieurs serveur `standby`. Si tu as des idées pour améliorer l'image, n'hésite pas à _forker_ le _repository_ et proposer une PR.

Si tu veux en savoir plus, voici quelques liens:

- [Managing PostgreSQL Replication and PostgreSQL Automatic Failover for High Availability](https://www.enterprisedb.com/postgres-tutorials/postgresql-replication-and-automatic-failover-tutorial)
- [PostgreSQL : la streaming replication en 12. – Capdata TECH BLOG](https://blog.capdata.fr/index.php/postgresql-la-streaming-replication-en-12/)
- [How to set up PostgreSQL for high availability and replication with Hot Standby](https://cloud.google.com/community/tutorials/setting-up-postgres-hot-standby)
