---
title: Improve TypeScript code with User defined Type Guard
description: Why User defined Type Guard is a really powerful feature of Typescript
tags:
  - typescript
  - quick
lang: en
translations:
  fr: typescript-user-defined-type-guard
date: 2022-09-02T10:00:00
---

## Context

Let's pretend we receive events from Stripe (I [already spoke about Stripe integration in Rails](./2019-02-04-stripe.md)). We have two kinds of events: one is about bill created, one is about user charged:

```ts
enum StripeEventType {
  ChargedUser = "chargedUser",
  BillCreated = "billCreated",
}
```

We have this generic `interface` who represent an Event and can contains any data:

```ts
interface StripeEvent<TYPE extends StripeEventType = StripeEventType, DATA = any> {
  type: TYPE;
  data: DATA;
}
```

And of course, all kinds of events implement this interface

```ts
type User = { email: string };
type Bill = { user: User; total: number };

type ChargedUserEvent = StripeEvent<StripeEventType.ChargedUser, { user: User; amount: number }>;
type BillCreatedEvent = StripeEvent<StripeEventType.BillCreated, { bill: Bill }>;
```

## Problem

Now imagine you implement a Webhook who receive all events we want to handle. Easy, right? I guess you think about something like this:

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

OK, it works. But those `as` operator are ugly. You have to explicitly tell to TypeScript that you know that `event` is `BillCreatedEvent` or `ChargedUserEvent`.

It's annoying because:

1. it's verbose
2. you'll start to duplicate this kind of code if you
3. as you receive data from outside, you are not 100% sure that the data will be well formated

## Solution

Lucky you, there is the [User defined Type Guard][ts-doc] to improve this! A user-defined type guard function is a function that simply returns `arg is aType`.

Let me show you:

```ts
function isBillCreatedEvent(event: StripeEvent): event is BillCreatedEvent {
  return event.type === StripeEventType.BillCreated;
}

function isChargeUserEvent(event: StripeEvent): event is ChargedUserEvent {
  return event.type === StripeEventType.ChargedUser;
}
```

Ok, so it's pretty straightforward. Now let's use it in `stripeWebhook`:

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

Do you see? It's much cleaner. So the good advantage is Typescript will know the type inside the `if`. It's also more robust because the type of event are check at the compilation time **AND** at the runtime.

### Complete check

We can improve the code because we can make a complete check of the object if you don't trust the source

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

### Testing

The good things with this kind of function is it's really easy to make unit testing about them. Here an example

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

### Other usage

But also, those function are reusable and it works also in `Array.filter` for example. So, if you want to compute the amount of money you earn from a list of random event, it's possible

```ts
const computeTotalCharge = (events: StripeEvent[]) =>
  events.filter(isChargeUserEvent).reduce((total, event) => total + event.data.amount, 0);
```

[ts-doc]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
