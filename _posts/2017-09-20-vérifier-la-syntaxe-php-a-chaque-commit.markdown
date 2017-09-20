---
layout: post
title:  "Vérifier la syntaxe PHP à chaque commit"
title:  Apprennez à utiliser Bash et les Git Hooks
date:   2017-09-20 12:00:00 +0200
tags: git bash php
categories: programming
---

Afin d'automatiser et d'améliorer la qualité du code, il est possible de lancer certaines tâches lors de chaque commit avec Git. Des outils comme [GrumPHP](https://github.com/phpro/grumphp) permettent de faire cela mais il peut arriver qu'il soit incompatible avec votre projet PHP _(et puis c'est toujours intéressant de savoir le faire à la main)_.

## Les _hooks_

Les _hooks_ sont des petits scripts qui se lancent lors des différentes actions Git. Il en existe plusieurs et pour les connaitre il suffit de se rendre dans un dépot Git et de faire:


{% highlight bash %}
$ ls .git/hooks/
applypatch-msg.sample  pre-applypatch.sample          pre-commit.sample          pre-push.sample    update.sample
commit-msg.sample      post-update.sample             prepare-commit-msg.sample  pre-rebase.sample
{% endhighlight %}

Les fichiers _.sample_ sont des examples proposés par Git. Dans notre cas, on va partir de zéro en créant un script vide

{% highlight bash %}
$ touch .git/hooks/pre-commit
{% endhighlight %}

## Le script

Nous allons donc commencer par afficher les fichiers contenu dans le commit. Pour cela on s'appuie sur la commande `git diff --cached --name-only` qui affiche les uniquement le nom des fichiers modifié. On rajoute un petit `grep` par dessus pour filtrer uniquement les fichiers PHP et on boucle dessus. 

Voici le résultat:

{% highlight bash %}
#!/bin/bash
# .git/hooks/pre-commit

# loop on all commited PHP files
for file in $(git diff --cached --name-only | grep -E '.php$') ; do
  echo "[x] $file"
done
{% endhighlight %}

Il faut ensuite faire le tri dans ses fichiers car Git nous remonte aussi ceux supprimés, il faut donc rajouter une condition:

{% highlight bash %}
#!/bin/bash
# .git/hooks/pre-commit

# loop on all commited PHP files
for file in $(git diff --cached --name-only | grep -E '.php$') ; do
  # first we verify that file exists
  if [ -f $file ]; then
    echo "[x] $file"
  fi
done
{% endhighlight %}

Et pour terminer on vérifie la syntaxe à l'aide de la commande `php -l "$file"` et si on trouve une erreur, on stoppe l'execution avec un signal d'erreur à l'aide de la fonction `exit 1`.

{% highlight bash %}
#!/bin/bash
# .git/hooks/pre-commit

# loop on all commited PHP files
for file in $(git diff --cached --name-only | grep -E '.php$') ; do
  # first we verify that file exists
  if [ -f $file ]; then
    # check syntax & catch errors
    if ($( php -l "$file" 1> /dev/null  )); then
      echo "[x] $file"
    else
      # file contains syntax error, so we'll stop programm & cancel commit
      echo "[ ] $file"
      exit 1 
    fi
  fi
done
{% endhighlight %}


## Le test

Notre script étant prêt, il nous reste plus qu'à tester. On ajoute un fichier PHP valide et on vérifie qu'il est accepté

{% highlight bash %}
$ echo '<?php echo "test";' > valid.php
$ git add valid.php
$ git commit -m "Add valid file" 
{% endhighlight %}

Maintenant on teste avec un fichier PHP non valide

{% highlight bash %}
$ git reset --hard HEAD^ # on annule le précedent commit
$ echo '<?php echo "test;' > invalid.php
$ git add invalid.php
$ git commit -m "Add invalid file" 
{% endhighlight %}

Le script coupe l'ajout du commit!

## Axes d'améliorations

Nous avons vu à travers un exemple simple qu'il est possible d'automatiser les tâches les pluscourant. On pourrait aller plus loin et:

* Vérifier la syntaxe des fichier Ruby avec la commande `ruby -c file`
* Formatter automatiquement les fichier commité
* Lancer les test unitaires 