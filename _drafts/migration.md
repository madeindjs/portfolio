---
title: Test de Rails 6.0.0.beta
layout: post
thumbnail: /img/blog/rails6_migrate_fail.jpg
---
La sortie de Rails 6 est prévue pour [le 30 avril](https://weblog.rubyonrails.org/2018/12/20/timeline-for-the-release-of-Rails-6-0/) et apporte son [lot de nouveautés](https://edgeguides.rubyonrails.org/6_0_release_notes.html) comme:

- le [Parallel Testing](https://edgeguides.rubyonrails.org/testing.html#parallel-testing) qui permet de parraléliser les tests et ainsi d'exploiter toute la puissance de votre machine pour lancer les tests.
- [Action Text](https://edgeguides.rubyonrails.org/action_text_overview.html), développé par [Basecamp](https://basecamp.com/), il permet d'inclure un éditeur de texte riche
- l'utilisation de plusieurs bases de données distinctes pour une seule application
- [et bien d'autres..](https://weblog.rubyonrails.org/2019/1/18/Rails-6-0-Action-Mailbox-Action-Text-Multiple-DBs-Parallel-Testing/) que Drivy a listé dans un [excellent article](https://drivy.engineering/rails-6-unnoticed-features/)

Impatient, j'ai décidé de tester un peu les améliorations et de basculer [isignif](https://isignif.fr) depuis la version 5.2 vers 6.0.

Si vous souhaitez faire cela, je vous conseille fortement d'avoir une base de test solides qui teste l'intégralité du comportement de votre application. Et avant de se lancer dans la migration, je vous rappelle que Rails 6 a besoin de Ruby 2.5 ou supérieur. 


## Mise  jour de toutes vos dépendances

Lorsque vous ajoutez une gemmes, Bundler va _locker_ la version de la gemme que vous avez installé dans le fichier _Gemfile.lock_. La première étape est donc de mettre à jour toutes vos dépendances en vérifiant si de nouvelles versions de vos gemmes installés existes. Pour cela, il faut lancer la commande suivante:

~~~
$ bundle update
~~~

Maintenant que vos dépendances sont à jour, nous pouvons relancer nos tests pour être sûr que cela n'a rien cassé.

~~~
$ rake test
Run options: --seed 47553

# Running:

........................................................................................................................................................................................................................................................................................................

Finished in 38.105956s, 7.7678 runs/s, 12.2291 assertions/s.
296 runs, 466 assertions, 0 failures, 0 errors, 0 skips
~~~

## Mise à jour de votre projet

Maintenant que vos dépendances sont à jour, nous pouvons mettre à jour notre projet.
Ensuite lancer `rails app:update` qui va poser beaucoup de questions:


~~~
$ rails app:update
    conflict  config/boot.rb
Overwrite ~/website/config/boot.rb? (enter "h" for help) [Ynaqdhm] Y
       force  config/boot.rb
       exist  config
    conflict  config/routes.rb
Overwrite ~/website/config/routes.rb? (enter "h" for help) [Ynaqdhm] Y
       force  config/routes.rb
    conflict  config/application.rb
Overwrite ~/website/config/application.rb? (enter "h" for help) [Ynaqdhm] Y
...
~~~

A ce moment, Rails essaie (tant bien que mal) de mettre à jour vos fichiers de configuration. C'est une étape très importante et je vous conseille fortement de vérifier les changements que Rails effectue. Par exemple, de mon côté, cette commande m'a supprimé tout la configuration de mon serveur mail en production:


~~~diff
diff --git a/config/environments/production.rb b/config/environments/production.rb
index e8b7926..dadfd68 100644
--- a/config/environments/production.rb
+++ b/config/environments/production.rb

@@ -83,36 +83,12 @@ Rails.application.configure do
   # require 'syslog/logger'
   # config.logger = ActiveSupport::TaggedLogging.new(Syslog::Logger.new 'app-name')

-  config.action_mailer.perform_caching = false
-
-  Rails.application.routes.default_url_options[:host] = 'https://isignif.fr'
~~~

ou encore de supprimer toutes les routes:

~~~diff
diff --git a/config/routes.rb b/config/routes.rb
index e24bfb3..787824f 100644
--- a/config/routes.rb
+++ b/config/routes.rb
@@ -1,68 +1,3 @@
 Rails.application.routes.draw do
   # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
-  get 'home'       => 'pages#home'
-  get 'map'        => 'pages#map'
-  get 'news'       => 'pages#news'
-  get 'dashboard'  => 'pages#dashboard'
-  get 'legal'      => 'pages#legal'
~~~

Il faut donc être très attentifs aux changements proposés. Une fois ceci fais, vous pouvez passer à la suite.

## Mettre a jour Rails

Rails donne quelques conseille pour mettre à jour. l'un d'eux conseille d'y aller par étapes. nous allons donc commencer par essayer la dernière version **stable** de Rails.

> When changing Rails versions, it's best to move slowly, one minor version at a time, in order to make good use of the deprecation warnings.

### 5.2 vers 5.2.2


Afin de vérifier qu'il n'y a pas de régression, commençons par mettre à jour vers la version la plus récente de Rails (La [version 5.2.2](https://rubygems.org/gems/rails/versions/5.2.2) au moment ou je rédige cet article).

~~~ruby
# Gemfile
gem 'rails', '~> 5.2.2'
# ...
~~~

Et ensuite lancer la mise à jour.

~~~
$ bundle update rails
~~~

Une fois ceci fais, il faut vérifier qu'aucune régression n'existe en lançant un coup tout vos tests unitaires.

~~~
$ rake test
Run options: --seed 47553

# Running:

........................................................................................................................................................................................................................................................................................................

Finished in 38.105956s, 7.7678 runs/s, 12.2291 assertions/s.
296 runs, 466 assertions, 0 failures, 0 errors, 0 skips
~~~


### 5.2.2 vers 6.0.0.beta1

ça y est, nous y somme presque. Nous pouvons maintenant faire le grand saut vers la version 6.0.0.beta1. Pour cela, nous éditons encore une fois notre _Gemfile_ ..

~~~ruby
# Gemfile
gem 'rails', '6.0.0.beta1'
# ...
~~~

Et nous relançons la mise à jour de Rails.

~~~
$ bundle update rails
~~~

Cette mis à jour est beaucoup plus importante et risque de produire quelques comportements inatendus.

De mon côté, j'ai simplement eu quelques Notices:

~~~
$ rake test
Run options: --seed 23444

# Running:

..........................DEPRECATION WARNING: update_attributes is deprecated and will be removed from Rails 6.1 (called from destroy at website/app/models/user.rb:139)
...................................................................................................................................................DEPRECATION WARNING: update_attributes is deprecated and will be removed from Rails 6.1 (called from destroy at website/app/models/user.rb:139)
....DEPRECATION WARNING: update_attributes is deprecated and will be removed from Rails 6.1 (called from update at website/app/controllers/users_controller.rb:33)
.........DEPRECATION WARNING: update_attributes is deprecated and will be removed from Rails 6.1 (called from destroy at website/app/models/user.rb:139)
.....................................................................DEPRECATION WARNING: update_attributes is deprecated and will be removed from Rails 6.1 (called from update at website/app/controllers/password_resets_controller.rb:36)
..DEPRECATION WARNING: update_attributes is deprecated and will be removed from Rails 6.1 (called from update at website/app/controllers/password_resets_controller.rb:36)
.............DEPRECATION WARNING: update_attributes is deprecated and will be removed from Rails 6.1 (called from update at website/app/controllers/users_controller.rb:33)
...........DEPRECATION WARNING: update_attributes is deprecated and will be removed from Rails 6.1 (called from update at website/app/controllers/users_controller.rb:33)
...........DEPRECATION WARNING: update_attributes is deprecated and will be removed from Rails 6.1 (called from update at website/app/controllers/users_controller.rb:33)
...DEPRECATION WARNING: update_attributes is deprecated and will be removed from Rails 6.1 (called from destroy at website/app/models/user.rb:139)
.

Finished in 38.299336s, 7.7286 runs/s, 12.1673 assertions/s.
296 runs, 466 assertions, 0 failures, 0 errors, 0 skips
~~~

Vous

https://edgeguides.rubyonrails.org/upgrading_ruby_on_rails.html#upgrading-from-rails-5-2-to-rails-6-0
