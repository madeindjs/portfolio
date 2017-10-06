---
layout: post
title:  Afficher les erreurs d'un formulaire en AJAX avec Twitter Bootstrap et Rails
description:  Participez au développement de votre navigateur preéferé
date:   2017-09-22 12:00:00 +0200
tags: ruby rails twitter-bootstrap-3 jquery javascript
categories: development
---

![](/img/blog/ajax_error_form.gif)

Voici mon controller avec deux simples actions *(j'ai volontairement simplifié l'exemple)*.

{% highlight ruby %}
# app/controllers/dishes_controller.rb

class DishesController < ApplicationController

  # affiche le formulaire
  def edit
    render '_form', locals: {dish: @dish}, layout:  false
  end

  # met à jour le plat
  def update
    if @dish.update(dish_params)
      # renvoie la liste des plats avec la modification
      render 'dishes/_list', locals: {dishes: @restaurant.dishes_ordered}, layout: false
    else
      # renvoie le formulaire avec un status d'erreur
      render '_form', locals: {dish: @dish}, layout:  false, status: :unprocessable_entity
    end
  end
end
{% endhighlight %}


Et voici mon formulaire

{% highlight erb %}
<!-- app/views/dishes/_form.html.erb -->
<%= bootstrap_form_for dish, remote: true do |f| %>
  <%= render 'shared/errors_form', model: dish %>
  <%= f.text_field :name, hide_label: true, placeholder: 'Nom' %>
  <!-- d'autres champs ici -->
  <%= f.submit 'Confirmer' %>
<% end %>
{% endhighlight %}

**Rails** nous simplifie largement la vie car l'attribut `remote: true` gère pour nous l'envoie du formulaire en AJAX. Il nous reste donc "juste" à implémenter les actions à effectuer lorsque 

* le plat est mis à jour

{% highlight javascript %}
// app/assets/javascripts/dishes.js
$(document).on('ajax:success', 'form.edit_dish', function(e, data, status, xhr){
  // le formulaire a été envoyé correctement et le plat a été mis à jour
  // on récupère donc le résultat et on met à jour la liste des plats
  $('#dishes-list').html(xhr.responseText);
  // on ferme le jquery-ui dialog
  $('.ui-dialog').remove();
});
{% endhighlight %}

* le formulaire contient une erreur.

{% highlight javascript %}
// app/assets/javascripts/dishes.js
$(document).on('ajax:error', 'form.edit_dish', function(e, xhr, status, error){
  // le plat n'a pas été mis à jour, sûrement à cause d'une erreur de donnée, 
  // on récupère donc le formulaire renvoyé par notre controlleur et on écrase l'ancien
  var form = $(this);
  form.parent().html(xhr.responseText);
});
{% endhighlight %}


**Ruby on Rails** est magique!