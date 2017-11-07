

Ruby On Rails est connu pour être un des framework web les plus lents. Ceci est nottament dût à:

* Ruby qui un langage interprété dynamiquement & faiblement typé. Donc lent
* Ruby on Rails qui gère beaucoup de choses pour nous en sacrifiants les performances

Cependant, on peut éviter 

## Les requêtes N+1

> T'inquiètes pas, je m'occuppe de tout. *Active Record*

Active Record est formidable et gère tout pour nous. Maleuresement, il lance une requête SQL à chaque utilisation dynamqiue des liaisons. Et comme disait ma grand-mère: "Une grosse requête SQL vaut mieux que plusieurs petites."" 

Voici un exemple ou l'on veut récupérer tous les utilisateurs qui on déjà crée une recette. Sans réfléchir, on serait tenté de faire plus ou moins comme ça:

~~~ruby
users = Recipe.all.map{|recipe| recipe.user}
# SELECT "recipes".* FROM "recipes"
# SELECT  "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 1]]
# SELECT  "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 1]]
# SELECT  "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 2]]
# SELECT  "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 2]]
~~~

Waaa! 5 requêtes sont génerées pour ça:

* 1 requête pour `Recipe.all`
* 1 requête par recette pour récupérer l'user associé `recipe.user`


C'est là que `includes` vient à la rescousse en précargeant les liaisons pour nous

~~~ruby
users = Recipe.includes(:user).all.map{|recipe| recipe.user}
# SELECT "recipes".* FROM "recipes"
# SELECT "users".* FROM "users" WHERE "users"."id" IN (1, 2)
~~~

Et voilà:

* 1 requête pour `Recipe.all`
* 1 requête pour récupérer TOUS les user associés `recipe.user`

## La consommation mémoire

Ici il n'y pas de règle particulière mais il faut éviter le chargement d'ojets Active Record pour rien.

### Exemple

Sur ma classe `Recipe` qui représente une recette qui peut-être notée par des `Comment`, j'avais implémenté une fonction `rate` qui calcule la moyenne des notes.

Un peu naif, j'ai utilisé toute la puissance d' *Active Record* et je chargeai toutes le liaisons:

~~~ruby
class Recipe
  has_many :comments

  def rate
    rates = []
    self.comments.each{|com| rates.append com.rate}
    return rates.size > 0 ? rates.reduce(:+) / rates.size.to_f : 0
  end

end
~~~

Ca fonctionne bien et le code est *(assez)* parlant. Le problème est que:

* On fait du N+1 (voir plus haut)
* On récupère beaucoup d'objets pour juste récupérer la notation

Pour améliorer ça, autant utiliser la fonction SQL [`AVG`](http://sql.sh/fonctions/agregation/avg) qui fait la moyenne pour nous.


~~~ruby
class Recipe
  has_many :comments

  def rate
    sql = "SELECT AVG(rate) as rate FROM comments WHERE recipe_id = :recipe_id"
    statement  = ActiveRecord::Base.connection.raw_connection.prepare sql
    results = statement.execute({recipe_id: self.id})
    average = results.first['rate'].to_i
    statement.close
    return average
  end

end
~~~


Le code est moins paralnt mais nous éviter de charger X objets `Comment`.

