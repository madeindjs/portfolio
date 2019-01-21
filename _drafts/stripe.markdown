---
layout: post
title:  Connecter une application Rails avec Stripe
date:   2019-01-15 11:23:00 +0200
comments: true
---

Pour mon projet [iSignif](https://isignif.fr) j'ai voulu implémenter la fonctionnalité d'accès restreint au site uniquement si l'utilisateur bénéficie d'un compte premium. Le but final est que l’utilisateur doit souscrire un compte premium afin d'accéder à certaines pages.

Afin d'implémenter cette fonctionnalité, le comportement attendu est le suivant:

- le client bénéficie d'un mois de découverte dès son inscription afin de tester l'outil
- une fois son _solde de jours premium_ épuisé, il reçois un mail lui indiquant qu'il va falloir racheter des jours
- l'utilisateur met à jour sont solde en effectuant un *paiement ponctuel* ou il souscris un abonnement qui effectuera un paiement automatique au début du mois.

Afin d'implémenter cela, j'ai rapidement fais le tour des solutions de paiement existantes (Paypal, BNP, etc..). Il s'est avéré que https://stripe.com[Stripe] était le meilleur compromis.

![Logo de Stripe](/img/blog//stripe.svg)

Stripe est une société américaine qui simplifie les paiements qui lève 2 millions de dollars en 2011 (un an après ça création) et puis 150 millions de dollars 2016 après avoir séduit des investisseurs comme Google. Stripe est aujourd'hui valorisé à plus de 10 milliards!

J'ai choisis Stripe car ses avantages sont:

- le client peut payer sans avoir un compte ouvert chez Stripe
- les tarifs footnote:[Les prix de Stripe sont 1,4% + 0,25€ par transaction pour les cartes européennes et
2,9 % + 0,25 € pour les cartes non européennes.] qui sont assez raisonnable.
- la facilité de mise en place

Dans cet article je vais donc retracer la mise en place de la fonctionnalité décrite plus haut.

**TLDR**: Stripe est très simple à mettre en place.

## Sommaire

* TOC
{:toc}

## Implémentation du mode premium

### Modification du modèle `User`

Ici nous voulons juste mettre en place un système de restriction de certaines pages aux utilisateurs premium. L'idée est d'ajouter un attribut `premium_until` de type https://api.rubyonrails.org/classes/DateTime.html[`DateTime`] qui contiendra la date de validité du compte premium.

On commence donc par ajouter la colonne `premium_until` à la table `users`.

~~~bash
$ rails g migration addpremiumuntil_to_users premium_until:date
~~~

Cette commande va générer la migration suivante:

~~~ruby
# db/migrate/20190116132207_addpremiumuntil_to_users.rb
class AddPremiumUntilToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :premium_until, :date
  end
end
~~~

Nous allons créer une autre migration afin d'offrir un mois à tous les utilisateurs existants:

~~~bash
$ rails g migration offer_one_monthspremiumto_users
~~~

~~~ruby
# db/migrate/20190116132207_addpremiumuntil_to_users.rb
class OfferOneMonthsPremiumToUsers < ActiveRecord::Migration[5.2]
  def up
    premium_until_offer = DateTime.now + 1.month

    User.all.each do |user|
      user.premium_until = premium_until_offer
      user.save
    end
  end

  def down; end
end
~~~

Et voilà.

### Création de la logique premium

Nous avons maintenant une belle colonne `premium_until`. Nous voulons créer une méthode `User#increment_premium` qui ajoutera un mois à l'attribut `premium_until`. Créons les tests unitaires:

~~~ruby
# test/models/user_test.rb
# ...
class UserTest < ActiveSupport::TestCase

  # vérifie que lors de l'inscription, nous offrons un mois
  test 'should offer one month premium to new user' do
    user = User.create!(
      email: Faker::Internet.email,
      premium_until: Date.today + 5.days
      # ...
    )

    assert_equal (Date.today + 1.month + 5.days), user.premium_until
  end

  # vérifie que l'on ajoute un mois au solde courant
  test 'should add one month for increment on last day' do
    user = User.new(premium_until: Date.today)

    assert_difference('user.premium_until', 1.month) do
      user.increment_premium
    end
  end

  # vérifie que l'on ajoute un mois au solde courant
  test 'should set correct premium_until for never premium user' do
    user = User.new
    user.increment_premium
    assert_equal (Date.today + 1.month), user.premium_until
  end

  # vérifie que l'on ajoute un mois à partir d’aujourd’hui pour un utilisateur qui viens de réactiver son compte après une inactivité
  test 'should set correct premium_until for past-premium user' do
    user = User.new(premium_until: (Date.today - 1.year))
    user.increment_premium
    assert_equal (Date.today + 1.month), user.premium_until
  end
end
~~~

ça fait beaucoup de test mais, encore une fois, nous avons écris beaucoup de tests mais l'implémentation est très rapide:

~~~ruby
# app/models/user.rb
class User < ApplicationRecord
  before_create :increment_premium

  def increment_premium
    if premium_until.nil? || (premium_until < Date.today)
      self.premium_until = Date.today
    end
    self.premium_until += 1.month
  end

  # ...
end
~~~

Et voilà. les tests passent désormais:

~~~bash
$ bin/rails test test/models/user_test.rb
# Running:

....
~~~

### Restrictions actions

L'implémentation de la restriction est vraiment facile mais commençons par écrire les tests unitaires. On va donc créer deux _fixtures_ footnote:[Les _fixtures_ sont des données insérées dans la base de données afin de tester l'application]: une représentant un utilisateur premium et un autre un utilisateur expiré.

~~~yml
# test/fixtures/users.yml
premium_advocate:
  email: premium@advocates.fr
  premium_until: <%= DateTime.now + 1.month %>
  # ...

expired_advocate:
  email: expired@advocates.fr
  premium_until: <%= DateTime.now - 1.month %>
  # ...
~~~

Maintenant imaginons une page autorisé seulement aux utilisateurs premium. Le test est assez facile:

1. On connecte un utilisateur
2. On accède à la page
3. on vérifie que la réponse est 200 (= _success_) si l'utilisateur est premium et sinon on vérifie que l'utilisateur est redirigé vers la page de paiement Stripe

Voici donc l'implémentation des tests:

~~~ruby
# test/controllers/acts_controller_test.rb
class ActsControllerTest < ActionDispatch::IntegrationTest

  test 'should forbid get index for non-premium user' do
    login users(:expired_advocate)
    get acts_url
    assert_redirected_to new_charge_url
  end

  test 'should get index for premium user' do
    login users(:premium_advocate)
    get acts_url
    assert_response :success
  end

  # ...
end
~~~

A ce moment, si vous lancez les test vous obtiendrez une erreur de ce type:

~~~
ActsControllerTest#test_should_forbid_get_index_for_non-premium_user
Expected response to be a <3XX: redirect>, but was a <200: OK>
~~~

L'implémentation pour le faire passer est assez facile. Il suffit de créer une méthode qui va vérifier que l'attribut `premium_until` de l'utilisateur connecté est supérieur à `DateTime.now`. Ensuite il suffit d’appeler cette méthode en utilisant un [_hook_ dans le contrôleur](https://api.rubyonrails.org/classes/AbstractController/Callbacks/ClassMethods.html#method-i-before_action). Voici le code

~~~ruby
# app/controllers/acts_controller.rb
class ActsController < ApplicationController
  before_action :redirect_if_not_premium, only: %i[index]

  # ...

  private

  def redirect_if_not_premium
    redirect_to new_charge_path if current_user.nil? or current_user.premium_until < DateTime.now
  end
end
~~~

Et voilà. Le test devrait désormais passer

## Mise en place de Stripe

Nous avons donc mis en place la logique pour restreindre certaines pages aux utilisateurs premium. Nous avons aussi créer la méthode qui ajoutera un mois de compte premium à un utilisateur. Il ne reste plus qu'à appeler cette méthode lorsqu'un paiement est effectué.

Tout d'abord, pour utiliser Stripe, il faut se créer un compte qui vous permettra d'obtenir une *clé d'API*. Une fois ceci fait, l'intégration à votre application Rails est très facile care https://github.com/stripe/stripe-ruby/[Stripe propose une gemme] déjà toute faite facile à mettre en place. Nous allons le faire ici.

Commençons donc par ajouter cette gemme à notre projet:

~~~
$ bundle add stripe
~~~

### Paiement ponctuel

Dans cette première version nous allons simplement mettre en place un paiement Stripe et appeler `User#increment_premium` si tout se passe bien. Dans le jargon de Stripe, un simple paiement est une _charge_.

On va donc créer un contrôleur `charges` qui va contenir deux actions:

- `new` qui va simplement proposer un formulaire pour payer
- `create` qui recevra la réponse de Stripe

Générons donc tout ça avec la commande `rails generate`:

~~~bash
$ rails generate controller charges new create
~~~

Il ne nous reste qu'à modifier un peu le code généré par Rails. Tout d'abord on modifie les routes:

~~~ruby
# config/routes.rb
Rails.application.routes.draw do
  # ...
  resources :charges, only: %i[new create]
  # ...
end
~~~

On implémente ensuite les actions dans le contrôleur:

~~~ruby
# app/controllers/charges_controller.rb
class ChargesController < ApplicationController
  # display Stripe form to make a new payment
  def new; end

  #  & check all data from Sripe
  def create
    # Amount in cents
    @amount = 500

    # get customer from POST params
    customer = Stripe::Customer.create(
      email: params[:stripeEmail],
      source: params[:stripeToken]
    )

    begin
      charge = Stripe::Charge.create(
        customer: customer.id,
        amount: @amount,
        description: 'Rails Stripe customer',
        currency: 'eur'
      )
      current_user.increment_premium!
    rescue Stripe::CardError => e
      flash[:error] = e.message
      redirect_to new_charge_path
    end
  end
end
~~~

La méthode `Stripe::Charge.create` va s'occuper de faire toutes les vérifications pour nous (il va vérifier la validité de carte, les informations transmises, le statut de la transaction, etc...). A la suite de cette méthode, nous pouvons donc ajouter sereinement notre code qui va gérer l'après paiement.

On modifie un peu les vues et on génère un formulaire:

~~~erb
<!-- app/views/charges/new.html.erb -->
<h1>Souscrire à un abonnement mensuel</h1>
<p>Actuellement, votre compte premium est disponible jusqu'au <%= current_user.premium_until.strftime('%d/%m/%Y') %></p>
<%= form_tag charges_path do %>
  <script src="https://checkout.stripe.com/checkout.js" class="stripe-button"
          data-key="<%= Rails.application.secrets.stripe[:publishable_key] %>"
          data-description="A month's subscription"
          data-amount="500"
          data-locale="auto"></script>
<% end %>
~~~

~~~erb
<!-- app/views/charges/create.html.erb -->
<h1>Votre paiement a été accepté</h1>
<p>Le paiement a été effectué. Votre compte premium à été étendu au <%= current_user.premium_until.strftime('%d/%m/%Y') %></p>
~~~

On termine par la configuration. Il suffit de récupérer les clés API via l'interface Stripe et des les ajouter dans le fichier `secrets.yml`

~~~yaml
# config/secrets.yml
development:
  stripe:
    publishable_key: pk_test_azerty
    secret_key: sk_test_clef_a_ne_pas_commiter

test: &development

production:
  stripe:
    publishable_key: pk_live_azerty
    secret_key: sk_live_clef_a_ne_pas_commiter
~~~

NOTE: Évidement, il faut renseigner *votre* propre clé ici

Et maintenant de créer la configuration nécessaire dans un _initializer_ spécifique à Stripe:

~~~ruby
# config/initializers/stripe.rb
Rails.configuration.stripe = {
  publishable_key: Rails.application.secrets.stripe[:publishable_key],
  secret_key: Rails.application.secrets.stripe[:secret_key]
}

Stripe.api_key = Rails.application.secrets.stripe[:secret_key]
~~~

Une fois la première version mise en place, il suffit de tester que tout ce passe bien.

Jusqu'ici je n'ai rien inventé. La [document de Stripe pour Rails](https://stripe.com/docs/checkout/rails) fait à peu de chose près la même chose.

Pour tester, on lance le serveur Rails et on se connecte sur <http://localhost:3000/charges/new> . Un bouton vous emmènera sur le formulaire de Stripe:

![Formulaire de paiement de Stripe](/img/blog/first_form.png)

NOTE: J'ai volontairement utilisé le numéro de carte `4242 4242 4242 4242` qui est une carte de test. Certaines carte vous permettent de simuler des erreurs. La liste complète des cartes de test est disponible https://stripe.com/docs/testing#cards[ici]

Une fois le formulaire envoyé, vous êtes redirigé vers la page `charges#create` qui vous confirme votre achat. Vous pouvez retrouver le paiement sur Stripe dans la section _payments_:

![Formulaire de paiement de Stripe](/img/blog/first_payment.png)

### Sauvegarde du _cutomer token_

Nous allons effectuer une petite modification à l'implémentation proposé par Stripe. Nous voulons sauvegarder le _customer_ créer par Stripe afin de le reutiliser s'il paie une nouvelle fois.

On va donc ajouter une colonne `users.stripe_token`.

~~~
$ rails g migration add_stripe_token_to_users stripe_token:string
~~~

Il et maintenant nous allons créer un _concern_ qui va s'occuper de récupérer ou créer un _customer_ Stripe:

> Si vous n'êtes pas à l'aise avec les _concerns_, j'en parle dans un http://rousseau-alexandre.fr/tutorial/2018/12/03/zip-active-storage.html#factorisation[précédent article].

~~~ruby
# app/controllers/concerns/stripe_concern.rb
module StripeConcern
  extend ActiveSupport::Concern

  protected

  # Try to retreive Stripe customer and create if not already registered
  # @params [User]
  # @return [Stripe::Customer]
  def create_or_retrieve_customer(user)
    customer = retrieve_stripe_customer(user)

    if customer.nil?
      customer = Stripe::Customer.create email: params[:stripeEmail], source: params[:stripeToken]
      user.update! stripe_token: customer.id
    end

    customer
  end

  private

  # @params [User]
  # @return [Stripe::Customer|Nil]
  def retrieve_stripe_customer(user)
    return nil if user.stripe_token.nil?

    begin
      customer = Stripe::Customer.retrieve user.stripe_token
      return customer
    rescue Stripe::InvalidRequestError
      # if stripe token is invalid, remove it!
      user.update! stripe_token: nil
      return nil
    end
  end
end
~~~

Il suffit maintenant de modifier un peu notre contrôleur pour l'utiliser.

~~~ruby
# app/controllers/charges_controller.rb
class ChargesController < ApplicationController
  include StripeConcern
  # ...

  def create
    # Amount in cents
    @amount = 500

    customer = create_or_retrieve_customer(current_user)

    begin
      charge = Stripe::Charge.create(
        customer: customer.id,
        amount: @amount,
        description: 'Rails Stripe customer',
        currency: 'eur'
      )
      current_user.increment_premium!
    rescue Stripe::CardError => e
      flash[:error] = e.message
      redirect_to new_charge_path
    end
  end
end
~~~

Et voilà! Le fonctionnement est identique mais désormais nous récupérons le client s'il existe déjà. Nous pouvons aussi nous passer du bouton Stripe si l'utilisateur a déjà un token:

~~~erb
<!-- app/views/charges/new.html.erb -->
<h1>Souscrire à un abonnement mensuel</h1>
<p>Actuellement, votre compte premium est disponible jusqu'au <%= current_user.premium_until.strftime('%d/%m/%Y') %></p>
<%= form_tag charges_path do %>
  <% if current_user.stripe_token %>
    <%= submit_tag 'Payer avec votre compte Stripe' %>
  <% else %>
    <script src="https://checkout.stripe.com/checkout.js" class="stripe-button"
            data-key="<%= Rails.application.secrets.stripe[:publishable_key] %>"
            data-description="A month's subscription"
            data-amount="500"
            data-locale="auto"></script>
  <% end %>
<% end %>
~~~

### Abonnement

Nous avons presque terminé. Une des dernière fonctionnalité à créer est de proposer un abonnement. L'utilisateur pourra ainsi souscrire un abonnement qui enclenchera un paiement automatique au début du mois. Dans le jargon de Stripe, cela s'appelle une https://stripe.com/docs/billing/subscriptions/products-and-plans[*subscriptions*].

> Chaque plan est joint à un produit qui représente (...) le service offert aux clients. Les produits peuvent avoir plus d'un plan, reflétant les variations de prix et de durée - comme les prix mensuels et annuels à des taux différents. Il existe deux types de produits: les biens et les services. (...) qui sont destinés aux abonnements.

#### Création du plan

Créons donc notre premier produit [la](https://stripe.com/docs/api/plans/create?lang=ruby) en utilisant [la gemme Stripe](https://github.com/stripe/stripe-ruby/). Voici un exemple avec la console Rails (Vous pouvez faire la même chose en utilisant l'interface d'administration).

~~~ruby
2.6.0 :001 > product= Stripe::Product.create name: 'Abonnement compte premium', type: 'service'
 => #<Stripe::Product:0x3fe4f20a1420 id=prod_EMb13PJreiAcF2> JSON: {
2.6.0 :002 > plan = Stripe::Plan.create amount: 5000, interval: 'month', product: product.id, currency: 'eur', id: 'premium-monthly'
 )
  => #<Stripe::Plan:0x2ab3e0b46d24 id=premium-monthly> JSON: {
~~~

> Là encore je n'ai rien inventé, tout est https://stripe.com/docs/api/subscriptions/object?lang=ruby[Dans la documentation de Stripe]


Nous obtenons donc un belle instance Ruby correspondant à un _Plan_. Nous allons juste noter l' `id` et le noter dans le fichier `secret.yml`:

~~~yaml
# config/secrets.yml
development:
  stripe:
    premium_plan_id: premium-monthly
    # ...
~~~

### Création de la logique

Comme nous avons crée un contrôleur `charges`, nous allons en créer un nouveau contrôleur nommé `subscriptions` avec deux méthodes:

- `new` qui va simplement proposer un formulaire pour payer
- `create` qui recevra la réponse de Stripe

Utilisons une fois de plus la commande `rails generate`

~~~bash
$ rails generate controller subscriptions new create
~~~

Cette méthode n'est pas parfaite, il faut modifier un peu les routes

~~~ruby
# config/routes.rb
Rails.application.routes.draw do
  resources :subscriptions, only: %w[new create]
  # ...
end
~~~

L'implémentation du `SubscriptionsController` est quasiment identique au `ChargesController`. Nous devons juste appeler la méthode `Stripe::Charge.create`

~~~ruby
class SubscriptionsController < ApplicationController
  include StripeConcern

  before_action :check_login
  before_action :only_advocates

  def new; end

  def create
    customer = create_or_retrieve_customer(current_user)

    begin
      Stripe::Subscription.create(customer: customer.id, items: [{ plan: Rails.application.secrets.stripe[:premium_plan_id] }])
    rescue Stripe::CardError => e
      flash[:error] = e.message
      redirect_to new_subscription_path
    end
  end
end
~~~

Et les vues:

~~~erb
<!-- app/views/subscriptions/new.html.erb -->
<h1>Souscrire à un abonnement mensuel</h1>
<p>Abonner vous afin de recharger votre compte automatiquement tous les mois</p>
<%= form_tag subscriptions_path do %>
  <% if current_user.stripe_token %>
    <p class="text-center">
      <%= submit_tag t('premium.pay'), class: 'btn btn-primary btn-lg' %>
    </p>
  <% else %>
    <script src="https://checkout.stripe.com/checkout.js" class="stripe-button"
        data-key="<%= Rails.application.secrets.stripe[:publishable_key] %>"
        data-image="<%= image_url 'favicon.png' %>"
        data-name="iSignif SAS"
        data-description="Compte premium pendant un mois"
        data-email="<%= current_user.email %>"
        data-locale="auto"></script>
  <% end %>
<% end %>
~~~

~~~erb
<!-- app/views/subscriptions/create.html.erb -->
<h1><%= @title %></h1>
<p>Le prélèvement automatique est maitenant configuré</p>
~~~

Et voilà. Nous pouvons désormais souscrire un abonnement.

#### _Webhook_

Nous avons mis en place un paiement mensuel mais nous voulons être notifié des paiement effectué au début du mois. pour cela nous devons utiliser des *Webhook*. Les _webhook_ sont des routes qui vont recevoir des requêtes de la par de Stripe et effectuer des actions.

Dans notre cas, le fonctionnement est le suivant



----

[_Tracking active subscriptions_](https://stripe.com/docs/billing/webhooks#tracking)


Lorsque l'abonnement est renouvelé (c-à-d. lorsque Stripe facture le client et qu'il est facturé de nouveau), Stripe envoie une requête pour signaler que le paiement a été effectué par le biais du _hook_:

1. Quelques jours avant le renouvellement, votre site reçoit un événement `invoice.upcoming`
2. Votre site reçoit un événement `invoice.payment_succeeded`.

On va donc s'appuyer sur le signal `invoice.payment_succeeded` afin d'effectuer les mêmes actions qui sont effectuées lorsqu'un payement ponctuel est effectué




[serveo.net](https://serveo.net/)
