---

title: Migrer une application Rails vers MariaDB
description: Participez au développement de votre navigateur preéferé
date: 2017-09-22 12:00:00 +0200
tags: [ruby, rails, mysql, mariadb, raspberrypi]
categories: development
comments: true
lang: fr
---

Je ne me suis jamais posé la question et j'ai toujours utilisé **MySQL** pour mes projets **Ruby on Rails**. Jusqu'au jour ou j'ai acheté un **Raspberry Pi 3** pour remplacer mon serveur **Raspberry Pi 2**. Et là.. impossible de remettre la même configuration... Au lieu de m'en têter à installer MySSQL, j'ai décidé de migrer vers **MariaDB** qui est officiellement supporté par **Raspbian**.

On commence donc par installer **MariaDB** sur le Raspberry Pi.

```bash
sudo apt install mariadb-server libmariadb-dev
```

La petite subtilité par rapport à MySQL est que rien n'est affiché pour spécifié l'utilisateur par défault. Pour se connecter il suffit de lancer `mariadb` avec `sudo`:

```bash
sudo mariadb
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 6
Server version: 10.1.23-MariaDB-9+deb9u1 Raspbian 9.0

Copyright (c) 2000, 2017, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]>
```

On commence donc par sécuriser notre serveur avec la commande

```bash
sudo mysql_secure_installation
# on peut aussi le faire à la main
sudo mysql -e "CREATE USER 'pi'@'localhost' IDENTIFIED BY 'pi'"
sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO 'pi'@'localhost' WITH GRANT OPTION"
```

Et pour tester que tout c'est bien passé, on se connecte de la même façon qu'on le faisait avec **MySQL**

```bash
mariadb -u pi -ppi
```

La bonne nouvelle, c'est qu'au niveau de l'application **Ruby On Rails** nous n'avons pas besoin de changer quoique ce soit:

```ruby

# Gemfile

gem 'mysql2'

```

```yml
# config/database.yml
development:
  adapter: mysql2
  database: fooder
  pool: 5
  encoding: utf8
  username: pi
  password: pi
  host: localhost
```

Donc il suffit de lancer les migrations et lancer notre serveur de développement.

```bash
bundle install
rake db:create
rake db:migrate
rails s
```

Si tout pouvait être aussi simple...
