---
layout: post
title: Création d'un projet sous Symfony 4 avec Vagrant
date:   2018-06-20 19:00:00 +0200
tags: php symfony vagrant
categories: tutorial
---

[Symfony][symfony] est le framework PHP le plus populaire en France. La version 4 est sortie en décembre et se veut plus légère et moins complexe que la précédente version. Voyons donc comment comment l'installer avec une machine virtuelle qui fera tourner un [serveur Apache](https://httpd.apache.org/). 

## Vagrant

### Installation

[Vagrant][vagrant] est un outil qui permet de configurer et ainsi de reproduire facilement des **machines virtuelles**. L'environnement est exactement le même pour tous les développeurs, quel que soit le système d'exploitation de la machine hôte.

[Vagrant][vagrant] utilise [Virtual Box][virtual_box]. Il faut donc commencer par installer les deux outils via leurs sites officiels. Voici un exemple pour l'OS **Ubuntu 18.04**.

- installation de [Virtual Box][virtual_box]
~~~bash
$ wget https://download.virtualbox.org/virtualbox/5.2.12/virtualbox-5.2_5.2.12-122591~Ubuntu~bionic_amd64.deb
$ dpkg -i virtualbox-5.2_5.2.12-122591~Ubuntu~bionic_amd64.deb
~~~
- installation de [Vagrant][vagrant]
~~~bash
$ wget https://releases.hashicorp.com/vagrant/2.1.1/vagrant_2.1.1_x86_64.deb
$ dpkg -i vagrant_2.1.1_x86_64.deb
~~~

Une fois [Vagrant][vagrant] & [Virtual Box][virtual_box] installés, on peut initialiser un nouveau projet avec la commande `vagrant`

```bash
$ mkdir RentMyRoom
$ cd RentMyRoom
$ vagrant init
```

### Configuration

`vagrant init` a créé un nouveau fichier _Vagrantfile_ qui contient toute la **configuration** de notre machine virtuelle. La directive  

On met à jour la configuration de Vagrant pour notre projet

```ruby
# Vagrantfile
Vagrant.configure("2") do |config|
  # charge une machine virtuelle pré-configurée téléchargeable sur https://app.vagrantup.com/boxes/search
  # cette VM contient Ubuntu 18.04, PHP 7.2, MYSQL 5.7, memcached, Composer
  config.vm.box = "secalith/bionic64"
  # configure le réseaux
  config.vm.network "private_network", ip: "192.168.33.10"
  # on utilise un sous-dossier contiendra notre projet
  config.vm.synced_folder "./RentMyRoom/", "/var/www/html", owner: "www-data", group: "www-data", id: 'source'
  # on crée écrase la configuration par défault d'Apache
  config.vm.synced_folder "./apache2/", "/etc/apache2/sites-enabled", owner: "root", group: "root", id: 'vhost'
  # on force le redémarrage une fois la configuration d'Apache écrasée 
  config.vm.provision :shell, run: "always", inline: "/etc/init.d/apache2 restart"
end
```

et notre **Vhost Apache** spécifique

```apache
# apache2/000-default.conf

<VirtualHost *:80>
    ServerName rent-my-room.local
    ServerAlias www.rent-my-room.local

    DocumentRoot /var/www/html/public
    <Directory /var/www/html/public>
        AllowOverride None
        Order Allow,Deny
        Allow from All

        <IfModule mod_rewrite.c>
            Options -MultiViews
            RewriteEngine On
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteRule ^(.*)$ index.php [QSA,L]
        </IfModule>
    </Directory>

    <Directory /var/www/project/public/bundles>
        <IfModule mod_rewrite.c>
            RewriteEngine Off
        </IfModule>
    </Directory>
    ErrorLog /var/log/apache2/project_error.log
    CustomLog /var/log/apache2/project_access.log combined

</VirtualHost>
```

et on démarre notre machine virtuelle

```bash
$ vagrant up
```

Cette commande va télécharger notre machine virtuelle et la démarrer.

### Symfony

On initialise le projet avec **composer**. Pour cela, on se connecte à la machine virtuelle avec `vagrant ssh`

```bash
$ vagrant ssh
$ cd html
```

et on installe les dépendances

```
$ composer install
```

Il suffit ensuite de se rendre à l'adresse [192.168.33.10](http://192.168.33.10) et la page d’accueil s'affiche!!

## Prise en main de [Symfony][symfony]

Imaginons une application web permettant de louer des salles `Room` à des utilisateurs `User`.

### Gestion des utilisateurs

[Symfony][symfony] utilise des **bundle** qui sont des "morceaux d'applications" utilisables dans d'autres projets. Dans notre cas, au lieu de partir de zéro, nous utiliserons [FOSUserBundle](https://github.com/FriendsOfSymfony/FOSUserBundle/). Ce **Bundle** gère

- la **création** d'utilisateur
- la **confirmation** de son adresse mail
- la **connexion** de l'utilisateur

Pour l'installer il suffit de suivre les indications de la [documentation officielle](http://symfony.com/doc/current/bundles/FOSUserBundle/index.html).

### Création de notre entité

#### Création du modèle

Nous allons ici créer notre modèle `Room` et créer les actions _CRUD_. Dans un premier temps, il faut **créer notre entité**. Pour cela on utilise la commande `doctrine:generate:entities`

```bash
$ php bin/console doctrine:generate:entities Room
```

Cette commande va créer:

- *RentMyRoom/src/Entity/Room.php*
- *RentMyRoom/src/Repository/RoomRepository.php*

Pour mettre à jour notre base de données, deux options existent:

- Mettre à jour la base de donnée **automatiquement** 
```bash
$ php bin/console doctrine:schema:update
```
- Créer une **migration** contenant les différences depuis la dernière migration
```bash
$ php bin/console doctrine:migration:diff
```
Et pour lancer toutes les migrations non-jouées, on utilise
```bash
$ php bin/console doctrine:migration:migrate
```

#### Création de tout le reste

Il suffit ensuite d'utiliser `make:crud` afin de **générer automatiquement** le _controller_, le formulaire et les vues en **fonction de notre modèle**:

```bash
$ php bin/console make:crud Room
```

Cette commande va créer ces fichiers

- *src/Controller/RoomController.php* contenant le _controller_ et toutes les actions CRUD
- *src/Form/RoomType.php* contenant le formulaire
- *templates/room/* contenant les vues CRUD

### Utiliser [Bootstrap][bootstrap] pour le formulaire

Il suffit d'éditer le formulaire contenu dans *RentMyRoom/src/Form/RoomType.php*. La fonction `FormBuilderInterface::add` permet de **spécifier le type du champ** et de spécifier la **classe CSS**.

```php
// RentMyRoom/src/Form/RoomType.php
<?php

namespace App\Form;

// uses ..

class RoomType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('address', TextType::class, ['attr'   => ['class' => 'form-control']])
            ->add('start_at', DateTimeType::class, ['widget' => 'single_text', 'attr'   => ['class' => 'form-control']])
            ->add('end_at', DateTimeType::class, ['widget' => 'single_text', 'attr'   => ['class' => 'form-control']])
            ->add('price', NumberType::class, ['attr'   => ['class' => 'form-control']])
            ->add('size', NumberType::class, ['attr'   => ['class' => 'form-control']])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['data_class' => Room::class,]);
    }
}
```

> Ne pas oublier d'ajouter [Bootstrap][bootstrap] au fichier _Template/base.html.twig_

### Créer la relation *User has many Rooms*

Il suffit de se rendre dans notre entité `Room` et d'ajouter la liaison

~~~php
<?php
// Entity/Room.php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\RoomRepository")
 */
class Room
{
    // ...

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User")
     */
    private $user;

    public function getUser() : User
    {
        return $this->user;
    }

    public function setUser(User $user): void
    {
        $this->user = $user;
    }
}
~~~

On génère ensuite la migration

~~~bash
$ php bin/console doctrine:migrations:diff
~~~

Cette commande va nous générer automatiquement un migration qui va ajouter

- la colonne `user_id` dans la table `room`
- la clé primaire afin de vérifier l'existence de l'`user`

~~~php
<?php 
// src/Migrations/Version20180619075756.php

// ..

public function up(Schema $schema) : void
{
    // this up() migration is auto-generated, please modify it to your needs
    $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

    $this->addSql('ALTER TABLE room ADD user_id INT DEFAULT NULL');
    $this->addSql('ALTER TABLE room ADD CONSTRAINT FK_729F519BA76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
    $this->addSql('CREATE INDEX IDX_729F519BA76ED395 ON room (user_id)');
}
~~~

Pour modifier notre base de données, il faut lancer la commande

~~~bash
$ php bin/console doctrine:migrations:migrate
~~~

### Modifier le _controller_

On modifie ensuite notre _controller_ afin d'ajouter l'`user` connecté à la `room` créée

~~~php
<?php
// src/Controller/RoomController.php

/**
 * @Route("/room")
 */
class RoomController extends Controller
{
    // ..

    /**
     * @Route("/new", name="room_new", methods="GET|POST")
     */
    public function new(Request $request): Response
    {
        $room = new Room();
        $form = $this->createForm(RoomType::class, $room);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $room->setUser($this->getUser());
            $em->persist($room);
            $em->flush();

            return $this->redirectToRoute('room_index');
        }

        return $this->render('room/new.html.twig', [
            'room' => $room,
            'form' => $form->createView(),
        ]);
    }

    // ...

}
~~~

Afin de restreindre les actions `edit` et `destroy` à l'utilisateur qui possède

~~~php
<?php
// src/Controller/RoomController.php

/**
 * @Route("/room")
 */
class RoomController extends Controller
{

    // ...

    /**
     * @Route("/{id}/edit", name="room_edit", methods="GET|POST")
     */
    public function edit(Request $request, Room $room): Response
    {
        $this->checkRoomOwner($room);
        // ...
    }

    /**
     * @Route("/{id}", name="room_delete", methods="DELETE")
     */
    public function delete(Request $request, Room $room): Response
    {
        $this->checkRoomOwner($room);
        // ...
    }


    private function checkRoomOwner(Room $room)
    {
        $currentUser = $this->getUser();
        if(is_null($currentUser)) {
            // should not happens because of security bundle
            throw $this->createAccessDeniedException('You must be connected to access on this pas');
        }elseif($currentUser != $room->getUser()){
            // user should own this room
            throw $this->createAccessDeniedException('You do not own this room');
        }
    }
}
~~~


[vagrant]: https://www.vagrantup.com/
[virtual_box]: https://www.virtualbox.org/
[symfony]: https://symfony.com/
[bootstrap]: http://getbootstrap.com/
