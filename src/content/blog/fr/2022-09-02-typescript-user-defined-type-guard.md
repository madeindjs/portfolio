---
title: Améliorer un code TypeScript avec les User defined Type Guard
description: Pourquoi les User defined Type Guard sont une fonctionnalité puissante de Typescript
tags:
  - typescript
  - quick
lang: fr
translations:
  en: typescript-user-defined-type-guard
date: 2022-09-02T10:00:00
---

## Context

Imaginons que nous recevons des événements de Stripe ([j'ai déjà parlé de l'intégration Stripe avec Rails](./2019-02-04-stripe.md)). Pour cet exemple, nous recevrons deux types d’événements: un utilisateur a été prélevé et une facture a été créée.

```ts
enum StripeEventType {
  ChargedUser = "chargedUser",
  BillCreated = "billCreated",
}
```

Nous avons aussi une `interface` générique qui représente un événement Stripe qui peut contenir n'importe quoi:

```ts
interface StripeEvent<TYPE extends StripeEventType = StripeEventType, DATA = any> {
  type: TYPE;
  data: DATA;
}
```

Et, bien sûr, tous les événements Stripe implémentent cette `interface`

```ts
type User = { email: string };
type Bill = { user: User; total: number };

type ChargedUserEvent = StripeEvent<StripeEventType.ChargedUser, { user: User; amount: number }>;
type BillCreatedEvent = StripeEvent<StripeEventType.BillCreated, { bill: Bill }>;
```

## Problème

Maintenant, imagine que tu doit implementer un _webhook_ qui reçoit tous ces événements pour les traiter. facile! Je paris que tu penses à un truc de ce genre:

```ts
function stripeWebhook(event: StripeEvent) {
  switch (event.type) {
    case StripeEventType.BillCreated:
      const { bill } = (event as BillCreatedEvent).data;
      console.log(`Created bill for ${bill.total}€`);
      break;
    case StripeEventType.ChargedUser:
      const { user, amount } = (event as ChargedUserEvent).data;
      console.log(`Charged ${user.email} for ${amount}€`);
      break;
  }
}
```

OK, ça marche. Mais cet opérateur `as` est vraiment moche. Tu dois le spécifier pour signifier à TypeScript "t'inquiète, je suis sûr de ce que je fais, cet `event` est un `BillCreatedEvent`".

Ce n'est pas optimal car:

1. c'est verbeux
2. tu devras dupliquer cet `as BillCreatedEvent` si tu es amené à traiter un événement générique
3. si tu reçois cet élément de l’extérieur, tu n'est pas sûr à 100% qu'il sera correct à l'interface

## Solution

C'est là qu'interviennent les [_User defined Type Guard_][ts-doc]! Une fonction _user-defined type guard_ est une fonction qui n'a qu'un rôle: Définir le type d'une variable.

Laisse moi te montrer:

```ts
function isBillCreatedEvent(event: StripeEvent): event is BillCreatedEvent {
  return event.type === StripeEventType.BillCreated;
}

function isChargeUserEvent(event: StripeEvent): event is ChargedUserEvent {
  return event.type === StripeEventType.ChargedUser;
}
```

C'est très facile. Maintenant utilisons cette fonction dans `stripeWebhook`:

```ts
function stripeWebhook(event: StripeEvent) {
  if (isBillCreatedEvent(event)) {
    console.log(`Created bill for ${event.data.bill.total}€`);
  }

  if (isChargeUserEvent(event)) {
    console.log(`Charged ${event.data.user.email} for ${event.data.amount}€`);
  }
}
```

Tu vois ? C'est beaucoup plus clair. Vue que notre fonction assigne le type, tu n'as rien besoin de faire à l'intérieur du `if`. C'est aussi plus robuste car la vérification est faite lors de la compilation de TypeScript **ET** lors de l’exécution du code JavaScript.

### Test complet

Nous pouvons aller plus loin en faisant une vérification complète de l'objet pour être à 100% sûr qu'il correspond à la définition:

```ts
function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && typeof (obj as User).email === "string";
}

function isChargeUserEvent(event: unknown): event is ChargedUserEvent {
  if (typeof event !== "object" && event === null) return false;

  if ((event as StripeEvent).type !== StripeEventType.ChargedUser) return false;

  return isUser((event as ChargedUserEvent).data.user) && typeof (event as ChargedUserEvent).data.amount === "number";
}
```

### Test unitaire

Un autre point sympa est l'implémentation des tests unitaires est très facile avec ce genre de fonction:

```ts
describe(isChargeUserEvent.name, () => {
  it("should detect it is a ChargedUser event", () =>
    expect(
      isBillCreatedEvent({
        type: StripeEventType.ChargedUser,
        data: { user: user1, amount: 1 },
      })
    ).toBeTruthy());

  it("should not detect it is a ChargedUser event for an another event", () =>
    expect(
      isBillCreatedEvent({
        type: StripeEventType.BillCreated,
        data: {
          bill: { user: user1, total: 2 },
        },
      })
    ).toBeFalsy());

  it("should not detect it is a ChargedUser event for null", () => expect(isBillCreatedEvent(null)).toBeFalsy());

  it("should not detect it is a ChargedUser event for empty obj", () => expect(isBillCreatedEvent({})).toBeFalsy());
});
```

### Ré-utilisation

Et pour finir, ces fonctions sont ré-utilisables. Par exemple, elle fonctionnent très bien avec `Array.filter`. Imagine que tu veux calculer le montant total des montant prélévés à tes utilisateurs à partir d'un tableau d’événements:

```ts
const computeTotalCharge = (events: StripeEvent[]) =>
  events.filter(isChargeUserEvent).reduce((total, event) => total + event.data.amount, 0);
```

[ts-doc]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
