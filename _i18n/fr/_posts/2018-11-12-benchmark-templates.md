---
title: Un comparatif des librairies de templating

tags: [ruby, haml, slim]
categories: benchmarking
date: 2018-11-12 08:00:00 +0200
image: ./images/erb.png
lang: fr
---

Récemment, sur une application web, je me suis rendu compte que je commençais à avoir des **fichiers HTML** de plus en plus **compliqués**. HTML, étant un **langage de balisage** assez proche du XML, il est assez lourd. J'ai donc voulu tester et comparer les alternatives existantes.

## Templating?

Les frameworks web utilisent un **langage de templating** qui permet de **générer** du HTML. Ainsi l'exemple suivant

```erb
<h1><%= user.complete_name %></h1>
<ul>
  <% user.quotes.each do |quote| %>
    <li><%= user.description %></li>
  <% end %>
</ul>
```

donnera..

```html
<h1>Chuck Norris</h1>
<ul>
  <li>Chuck Norris counted to infinity. Twice.</li>
  <li>Chuck Norris knows Victoria's secret.</li>
</ul>
```

Utilisant Ruby on Rails, je ne m’étais jamais posé la question de me tourner vers autre chose que **ERB**. ERB fait d’ailleurs partie de la [librairie standard de Ruby][current_erb] (et elle est même présente [depuis Ruby 1.8][erb_1.8]).

Alors, pourquoi vouloir choisir autre chose?

ERB s'appuie sur des fichiers HTML et il est donc, lui aussi, assez verbeux... J'ai donc choisi d'étudier deux alternatives [**HAML**][haml] et [**Slim**][slim] qui ont pour principe d'offrir une syntaxe beaucoup plus **concise** et donc plus **claire**.

Ces deux librairies sont **écrites en Ruby**. J'ai utilisé ce même langage pour les étudier mais on aurait très bien pu le faire avec un autre langage.

## L'herbe des voisins

Commençons donc par comparer la syntaxe avec un exemple basique. Voici donc une barre de navigation en ERB:

```erb
<div id="sidebar">
  <ul class="main" aria-role="navigation">
    <li class="active"><%= link_to 'Accueil', home_path %></li>
    <li><%= link_to 'Nouvelles', news_path %></li>
    <% if current_user %>
      <li><%= link_to 'Mon profil', current_user %></li>
    <% end %>
  </ul>
</div>
```

Maintenant, la même chose en utilisant [HAML][haml]

```haml
#sidebar
  %ul.main{'aria-role' => 'navigation'}
    %li.active= link_to 'Accueil', home_path
    %li= link_to 'Nouvelles', news_path
    - if current_user
      %li= link_to 'Mon profil', current_user
```

Et c'est à peu de chose près la même chose pour [Slim][slim]

```haml
div#sidebar
  ul.main aria-role="navigation"
    li.active = link_to 'Accueil', home_path
    li = link_to 'Nouvelles', news_path
    - if current_user
      li = link_to 'Mon profil', current_user
```

C'est quand même beaucoup mieux, non? On voit donc que [HAML][haml] & [Slim][slim] utilisent l'**indentation** pour générer le HTML. Par conséquent, on **réduit le code** que l'on écrit et cela semble plus clair.

Je ne vais pas faire une description des fonctionnalités existantes, [Symbioz l'a déjà très bien fait pour HAML][symbioz_haml] et je vous laisse voir la documentation vous même.

## Parser un document

Afin de comparer les performances, nous allons simplement utiliser les trois librairies pour parser le même document. J'ai choisi de ne pas utiliser de framework et de le faire à la main afin que l'exemple soit facilement reproductible

### Parser un document ERB

Commençons donc par **parser** un document ERB. Voici un petit exemple

```ruby
require 'erb'

class Context
  attr_reader :title, :content

  def initialize title, content
    @title = title
    @content = content
  end

  def get_binding
    binding
  end
end

erb_content = <<-HTML
<html>
  <head>
    <meta charset="utf-8">
    <title><%= @title %></title>
  </head>
  <body>
    <h1><%= @title %></h1>
    <p><%= @content %></p>
  </body>
</html>
HTML

context = Context.new 'Hello world', 'Lorem ipsum'
puts ERB.new(erb_content).result(context.get_binding)
```

> Attend, c'est quoi ce foutu `binding`?!

Le **biding** est une notion assez avancée de Ruby. Cela correspond (plus ou moins) à un **contexte**. On passe donc un contexte à la méthode `ERB#result` qui l'utilise pour retrouver les propriétés demandées. Cependant, la méthode `binding` provient de `Kernel#binding` qui est une méthode privée. Il faut donc passer par une classe et lui implémenter la fonction `get_biding` qui va appeler la méthode `Kernel#binding` dans une méthode publique. C'est pourquoi on obtient

```ruby
class Context
  # ...
  def get_binding
    binding
  end
end
```

> Pour aller plus loin dans le biding, je vous recommande l'excellent [article de Medhi Farsi](https://medium.com/@farsi_mehdi/context-binding-in-ruby-fa118ea62269) à ce sujet.

### Parser un document en HAML

Maintenant que vous avez compris le biding, c'est plus simple. Tout d'abord, il faut commencer par installer la Gem:

```bash
gem install haml
```

Et le principe est exactement le même:

```ruby
require 'haml'

# ...

haml_content = <<-HAML
%html
  %head
    %meta{charset: 'utf-8'}
    %title= @title
  %body
    %h1= @title
    %p= @content
HAML

puts Haml::Engine.new(haml_content).render(context.get_binding)
```

On voit que l'on obtient le même résultat!

### Parser un document en Slim

C'est pareil, seul le nom des méthodes change:

```bash
gem install haml
```

```ruby
require 'slim'

# ...

slim_content = <<-SLIM
html
  head
    meta charset="utf-8"
    title = @title
  body
    h1 = @title
    p = @content
SLIM


puts Slim::Template.new { slim_content }.render(context)
```

> Attention, `Template#new` prend en paramètre un `block` qui correspond au contenu. Si le paramètre un `String`, cela correspond au chemin d'un fichier.

## Super, et les performances dans tout ça?

J'ai voulu m'intéresser à l'impact qu'avaient de telles librairies sur les performances d'une application. Je me doute bien que cela n'aura pas autant d'impact qu'une [requête N+1](./2018-06-22-kill-rails-n1-queries) mais c'est toujours intéressant de regarder d'un peu plus près (et puis c'est mon blog donc je fais ce que je veux).

Afin d'étudier les performances, j'ai utilisé la fonction `Benchmark#measure` et j'ai réalisé 50 000 conversions pour chaque:

```ruby
require 'erb'
require 'haml'
require 'benchmark'

# ...

puts Benchmark.measure {
  50_000.times do
    ERB.new(erb_content).result(context.get_binding)
  end
}
#=>   5.971182   0.000000   5.971182 (  5.974689)

puts Benchmark.measure {
  50_000.times do
    Haml::Engine.new(haml_content).render(context.get_binding)
  end
}
#=>  73.619234   0.019773  73.639007 ( 73.665570)

puts Benchmark.measure {
  50_000.times do
    Slim::Template.new { slim_content }.render(context)
  end
}
# => 138.663156   0.056433 138.719589 (138.883643)
```

> Vous pouvez retrouver le code complet [ici](https://gist.github.com/madeindjs/4ba21bf4bed03bf5dc278ab82707dc28)

On obtient donc ces résultats:

```txt
ERB  |=> 5.9 s                |
HAML |=======> 73.6 s         | 12x plus lent
SLIM |==============> 138.7 s | 23x plus lent
```

On voit donc bien que ces librairies ont un **impact énorme** sur les performances!

## Conclusion

Bon, ces résultats sont quand même à prendre avec du recul. On ne parse pas 50 000 fichiers dans une application. On peut donc se dire que l'impact sur les performances serait très **minime**.

De plus, il faut apprécier le service que ces outils nous rend. Le code est plus clair donc **plus maintenable**. De plus, avec Ruby on Rails par exemple, on peut très bien utiliser plusieurs langages de templating et donc utiliser [HAML][haml] sur des vues bien spécifiques.

Mais de mon côté, je pense que ces librairies répondent à un **non-problème**. Lorsqu'on a du mal à se repérer dans notre propre vue, c'est que notre vue est **trop chargée**. Il faut donc se tourner vers des helpers qui vont externaliser le code dans des fonctions réutilisables.

## Liens

- <http://jyaasa.com/blog/what-is-binding-object-in-ruby>
- <http://tutorials.jumpstartlab.com/topics/better_views/erb_and_haml.html>

[haml]: http://haml.info/
[slim]: http://slim-lang.com/
[haml_github]: https://github.com/haml/haml
[symbioz_haml]: https://www.synbioz.com/blog/gerer_vos_vues_et_vos_feuilles_de_style_avec_haml_et_sass
[current_erb]: https://ruby-doc.org/stdlib-2.5.3/libdoc/erb/rdoc/ERB.html
[erb_1.8]: https://github.com/ruby/ruby/blob/ruby_1_8/lib/erb.rb
[erb_2.5]: https://github.com/ruby/ruby/blob/ruby_2_5/lib/erb.rb
