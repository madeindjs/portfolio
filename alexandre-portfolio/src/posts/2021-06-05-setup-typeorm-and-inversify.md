---
title: Setup dependency injection with Node.js / Typescript
description: This tutorial show you how to setup dependency injection with
  TypeORM and Inversify libraries
layout: post
date: 2021-06-05 15:00:00 +0200
tags:
  - typeorm
  - node.js
  - typescript
categories: programming
thumbnail: /img/blog/postgres.svg
modified: 2021-06-10T12:46:39.739Z
lang: en
---

In this tutorial I will show how what is dependency injection, why you should care about and how you can implement it easily with [TypeORM](https://typeorm.io/) and [inversify](http://inversify.io/).

## Initialize a basic project with Typescript

Let's start by creating a basic Typescript application:

```sh
mkdir dependecy-injection-example
cd dependecy-injection-example
npm init
git init # Initialize Git repository (optional)
```

Now we need to install Typescript:

```sh
npm add typescript @types/node --save-dev
```

We have added two libraries :

- `typescript`, which will give us the tools for _transpilation_.
- `@types/node` which will add the definition of the types of Node.js

So let's add our first Typescript file :

```ts
// src/main.ts
function say(message: string): void {
  console.log(`I said: ${message}`);
}
say("Hello");
```

This code is really basic and will just be used to check that the transpilation works.

To use Typescript transpilation, we need to define a configuration file `tsconfig.json`. Here is a basic one:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "module": "commonjs",
    "types": ["node"],
    "target": "es6",
    "esModuleInterop": true,
    "lib": ["es6"],
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

That's much code but the two directives to remember here are: `rootDir` and `outDir`. They will specify where the Typescript files are (`rootDir`) and where the Javascript files resulting from the transpilation are (`outDir`).

```jsonc
// package.json
{
  // ...
  "scripts": {
    "start": "tsc && node dist/main.js"
  }
  // ...
}
```

Now you can try everything works with:

```sh
npm start
> dependecy-injection-example@1.0.0 start /home/alexandre/github/madeindjs/dependecy-injection-example
> tsc && node dist/main.js

I said: Hello
```

Great! We do not need to much more for the moment!

## Setup TypeORM

To makes a better example, I will setup [Typeorm](https://typeorm.io): a great ORM to interact with many king of database manager. The purpose of an ORM is to interact with the database and save you from writing SQL queries by hand. It also allows us to add an abstraction layer to the database type and not worry about the differences between PostgreSQL and SQLite, for example.

To install it is straightforward. We are going to install the TypeORM library but also `sqlite3` which will allow us to dialogue with our Sqlite database.

Here we go:

```bash
npm add typeorm sqlite3 --save
```

## Dependency injection

Here I will try to summarize what dependency injection is and what it is used for. Let's imagine a `User` class with a `UserService` class who can initialize a connection and create many users. We would try to make the following code:

```ts
// src/main.ts
import "reflect-metadata";
import /* ... */ "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  email: string;
}

class Logger {
  log(message: string): void {
    const time = new Date().toISOString();
    console.log(`${time} -- ${message}`);
  }
}

class UserService {
  private connection: Connection;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  async createUsers(qty: number): Promise<User[]> {
    if (this.connection === undefined) {
      this.logger.log("Initialize connection");
      this.connection = await createConnection();
    }

    const users: User[] = [];

    for (let i = 0; i < qty; i++) {
      const user = new User();
      user.email = `user${i}@example.org`;
      users.push(user);
    }

    return this.connection.manager.save(users);
  }
}
```

This causes several problems:

1. The `User` class depends on the `Database` class. If you change the implementation of the `Database` class, you will have to change the `User` class.
2. the code is much less testable because to test a user, I need to know how `User` class works.

To accentuate the problem, let's add a `Logger` class that allows you to log events in the app. Let's say we need to log the database connection. The code becomes:

```ts
class Logger {
  log(message: string): void {
    const time = new Date().toISOString();
    console.log(`${time} -- ${message}`);
  }
}

class Database {
  constructor(connectionString: string) {
    const logger = new Logger();
    logger.log(`Connected to ${connectionString}`);
  }
}

class User {
  private database: Database;

  constructor(public email: string, databaseString: string) {
    this.database = new Database(databaseString);
  }
}

const user = new User("john@doe.io", "./user.sqlite");
```

We can see that the situation is getting worse because all classes are becoming dependent on each other. To correct this, we are going to inject the `Database` class directly into the `User` constructor:

.The `Database` class is now injected in the constructor.

```ts
class Logger {
  /* ... */
}

class Database {
  constructor(logger: Logger, connectionString: string) {
    logger.log(`Connected to ${connectionString}`);
  }
}

class User {
  constructor(private database: Database) {}
}

const logger = new Logger();
const database = new Database(logger, "db.sqlite");
const user = new User(database);
```

This code becomes stronger because the `User`, `Database`, and `Logger` classes are decoupled.

> OK, but it becomes harder to instantiate a `User`.

Yes, it does. That's why we use a `Container` that will record the classes that can be injected and offer us to create instances easily:

.An example of a container used to instantiate classes

```ts
class Logger {
  /* ... */
}
class Database {
  /* ... */
}
class User {
  /* ... */
}

class Container {
  getLogger(): Logger {
    return new Logger();
  }

  getDatabase(): Database {
    return new Database(this.getLogger(), "db.sqlite");
  }

  getUser(): User {
    return new User(this.getDatabase());
  }
}

const container = new Container();
const user = container.getUser();
```

The code is longer, but everything gets cut out. Rest assured, we are not going to implement all this by hand. Excellent libraries exist. The one I chose is https://github.com/inversify/InversifyJS[Inversify].

In this section, we are going to concretely implement a complete dependency injection system.

We will set up a Logger that can be injected into all classes of our application. It will allow us to handle HTTP requests, for example, but also many other events.

So let's install `inversify`:

```bash
npm install inversify --save
```

And let's create a simple event logging class:

NOTE: We could use a library like https://github.com/winstonjs/winston[Winston] or https://www.npmjs.com/package/morgan[Morgan], but for the example, I will create a fairly basic class:

```ts
// src/services/logger.service.ts
export class Logger {
  public log(level: "DEBUG" | "INFO" | "ERROR", message: string): void {
    const time = new Date().toISOString();
    console.log(`${time} - ${level} - ${message}`);
  }
}
```

To make it injectable, you need to add a `@injectable` decorator to it. This decorator will simply https://github.com/inversify/InversifyJS/blob/master/src/annotation/injectable.ts#L12[add metadata] to our class so that it can be injected into our future dependencies.

```ts
import {injectable} from "inversify";

@injectable()
export class Logger {
  /* ... */
}
```

And there you go. Now we just have to create the container that will register this service. https://github.com/inversify/InversifyJS#installation[The documentation] recommends creating a `TYPES` object that will simply store the identifiers of our services. We will create a `core` folder that will contain all the code that is transversal to our entire application.

```ts
// src/core/types.core.ts
export const TYPES = {Logger: Symbol.for("Logger")};
```

NOTE: A https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol[`Symbol`] is a primitive type that allows you to have a unique reference.

Now we can use this symbol to save our logger in a new `container.core.ts` file. Just instantiate a `Container` and add our service with the `bind()` method. We then export this instance for use in the application:

```ts
// src/core/container.core.ts
import {Container} from "inversify";
import {Logger} from "../services/logger.service";
import {TYPES} from "./types.core";

export const container = new Container();
container.bind(TYPES.Logger).to(Logger);
```

And there you go.

### Creating a controller

Let's leave aside this class that we will use later in our first controller. Controllers are part of the _design patern_ _MVC: Model, View, Controller_. Their purpose is to intercept the request and call the dedicated services. There is an official Inversify library to integrate dependency injection directly into our controllers: https://github.com/inversify/inversify-express-utils[`inverisfy-express-utils`].

We start by installing the library. We'll also add `body-parser`, which will allow us to process the HTTP request parameters (we'll talk about this later).

To install it, it's straightforward. Just follow the https://github.com/inversify/inversify-express-utils[official documentation]. So we start by installing some libraries.

```bash
npm install inversify-express-utils reflect-metadata body-parse --save
```

- `reflet-metadata` allows Inversify to add metadata on our class. This import must be located at the very beginning of the first file.
- `body-parse` will give us the possibility to extract parameters from HTTP requests (we'll talk about it later).

Before writing our first controller, it is necessary to make some modifications to the creation of our HTTP server. Let's create a new file `core/server.core.ts`, which will simply define our HTTP server with `inversify-express-utils`:

.The definition of our HTTP server with `inversify-express-utils`.

```ts
// src/core/server.ts
import * as bodyParser from "body-parser";
import {InversifyExpressServer} from "inversify-express-utils";
import {container} from "./container.core";

export const server = new InversifyExpressServer(container);
server.setConfig((app) => {
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
});
```

As you can see, we are now using an instance of `InversifyExpressServer`. The `setConfig` method allows you to add _middleware_ (we'll return to this later). Let's move on to the `main.ts` file, which we'll modify a bit:

```ts
// src/main.ts
import "reflect-metadata";
import {container} from "./core/container.core";
import {server} from "./core/server";
import {TYPES} from "./core/types.core";

const port = 3000;

server
  .build()
  .listen(port, () => console.log(`Listen on http://localhost:${port}/`));
```

And there you go. Now we can tackle our first controller.

The controller is a class like any other. It simply goes to the `@controller` decorator. This decorator will also declare this controller as `@injectable` but also offer us special features.

Let's go straight to the implementation to make it more meaningful:

```ts
// src/controllers/home.controller.ts
import {controller, httpGet} from "inversify-express-utils";

@controller("/")
export class HomeController {
  @httpGet("")
  public index(req: Request, res: Response) {
    return res.send("Hello world");
  }
}
```

As you can see, the implementation is obvious, thanks to the decorators:

- The `@controller("/")` tells us that all the routes of this controller will be prefixed with `/`.
- The second decorator `@httpGet("/")` defines that this method will be accessible on the URL `/` via the HTTP POST verb.

Now let's try to inject the `Logger` to display a message when this route is used:

```ts
// src/controllers/home.controller.ts
// ...
import {TYPES} from "../core/types.core";
import {Logger} from "../services/logger.service";

@controller("/")
export class HomeController {
  public constructor(@inject(TYPES.Logger) private readonly logger: Logger) {}

  @httpGet("")
  public index(req: Request, res: Response) {
    this.logger.log("INFO", "Get Home.index");
    return res.send("Hello world");
  }
}
```

There you go!

The `@inject` decorator takes care of everything. Just specify the symbol. It's magic.

The last step is to manually import this controller into the container. It's really very easy to do:

```ts
// src/core/container.core.ts
// ...
import "../controllers/home.controller";
```

You can now start the server with `npm run start` or wait for the transpilation to be done automatically if you have not stopped the previous server.

If everything works as before, you can commit the changes:

```bash
git add .
git commit -m "Add inversify"
```

## Setup TypeORM

In the previous chapter, we managed to set up the basics for the configuration of our application. This chapter will perfect this base and add the _Model_ layer, which will store the data and add the first tests.

In the next chapters, we will deal with user authentication using authentication tokens and defining permissions to limit access to connected users. We will then link products to users and give them the ability to place orders.

As you can already imagine, there are many authentication solutions for Node.js, such as http://www.passportjs.org/[Passport.js], https://github.com/ianstormtaylor/permit[Permit], and https://github.com/simov/grant[Currency]. These solutions are turnkey libraries, meaning that they allow you to manage many things like authentication, password forgetting functionality, validation, etc.

We won't use them to better understand the authentication mechanism. This will allow you to discover nothing magic behind password encryption and the creation of authentication tokens.

This chapter will be complete. It may be long, but I will try to cover as many topics as possible. Feel free to grab a coffee, and let's go. By the end of this chapter, you will have built all the user logic, validation, and error handling.

## Setting up TypeORM

Here we will put the _Model_ layer of the _design patern_ MVC. This is the layer related to the database.

We will now generate our configuration file. By default, `dotenv` will look for a file named `.env`. Let's create it:

```bash
touch .env
```

And let's start by defining https://github.com/typeorm/typeorm/blob/master/docs/using-ormconfig.md#using-environment-variables[TypeORM environment variables] for a basic connection to an SQLite database:

```console
TYPEORM_CONNECTION=sqlite
TYPEORM_DATABASE=db/development.sqlite
TYPEORM_LOGGING=true
TYPEORM_SYNCHRONIZE=true
TYPEORM_ENTITIES=src/entities/*.entity.ts,dist/entities/*.entity.js
```

As you can see, we define that we will use SQLite and that the database will be stored in the `db/` folder. `TYPEORM_SYNCHRONIZE` allows us to avoid not worrying about migrations and so let TypeORM do the modifications on our database schema if necessary. We then specify where our entities are located with `TYPEORM_ENTITIES`.

All we have to do is configure `dotenv` to load this file. To do this, I use Node.js flag `--require`, which allows us to pre-load a library. You just have to modify the `package.json`:

```jsonc
{
  // ...
  "scripts": {
    "start": "tsc && node dist/main.js -r dotenv/config",
    "start:watch": "nodemon"
    // ...
  }
  // ...
}
```

We will now create a `DatabaseService` that will take care of connecting TypeORM to our database. As we have implemented dependency injection, this service will also be injectable. Here is the complete implementation. Don't panic. I'll detail the logic next.

```ts
// src/services/database.service.ts
// ...
@injectable()
export class DatabaseService {
  private static connection: Connection;

  public constructor(@inject(TYPES.Logger) private readonly logger: Logger) {}

  public async getConnection(): Promise<Connection> {
    if (DatabaseService.connection instanceof Connection) {
      return DatabaseService.connection;
    }

    try {
      DatabaseService.connection = await createConnection();
      this.logger.log("INFO", `Connection established`);
      return DatabaseService.connection;
    } catch (e) {
      this.logger.log("ERROR", "Cannot establish database connection");
      process.exit(1);
    }
  }

  public async getRepository<T>(repository: ObjectType<T>): Promise<T> {
    const connection = await this.getConnection();
    return await connection.getCustomRepository<T>(repository);
  }
}
```

This class has two methods:

- `getConnection` : this method will initialize a new connection to the database. This one will call the `createConnection` method, which will look for https://typeorm.io/#/using-ormconfig[an ormconfig file] (in our case, the environment variables loaded by `dotenv`) and establish a connection. Once the connection is made, it is stored in a static property, which will be returned the next time directly.
- `getRepository`: this method will allow us to manipulate our models via the repository. We will talk about it in details later

NOTE: It is good practice to hide the logic of the library from our own class. This will allow us to depend on the library and to be able to migrate more easily if one day, we want to change.

Now that our service is created, we need to add it to our container:

.Add the `Symbol` linked to the `DatabaseService` service.

```ts
// src/core/types.core.ts
export const TYPES = {
  // ...
  DatabaseService: Symbol.for("DatabaseService"),
};
```

```ts
// src/core/container.core.ts
import {Container} from "inversify";
import {DatabaseService} from "../services/database.service";
// ...
export const container = new Container();
// ...
container.bind(TYPES.DatabaseService).to(DatabaseService);
```

And there you go.

We can now create our first `User` model. Using the _patern Data Mapper_, we will have to create two classes :

- the _entity_ : it will define fields attributes to be saved in the database. In our case, I will simply create two attributes: `email` and `password` (the password will be encrypted later).
- the _repository_: it will add some logic to save our entities.

To simplify the example, I will put these two classes in the same file, but you can separate them very well :

```ts
// src/entities/user.entity.ts
import /* ... */ "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  email: string;

  @Column()
  password: string;
}

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
```

And there you go. The result is really very simple, thanks to the `@columns` decorators offered by TypeORM. They can also define the type of information stored (text, date, etc...). The implementation of this model is sufficient for the moment.

Our work is not very visible but hold on because you will see the result in the next section.

We can commit the changes made so far:

```bash
git add .
git commit -m "Setup TypeORM"
```

## Creating the user controller

Now it's time to get to the concrete part and create the controller to manage the users. This controller will respect the REST standards and propose classic CRUD actions. I.e. _**C**reate_, _**R**ead_, _**U**pdate_ and _**D**elete_.

### List users

We will start with the `index` method, which is the simplest.

As we saw earlier, controllers can inject our services. So we will inject the `DatabaseService` to be able to retrieve the `UserRepository`. Then we will just have to call the `userRepository.find` method to get the list of all users (which is empty for the moment).

Here is the implementation of our controller:

```ts
// src/controllers/users.controller.ts
import {Request, Response} from "express";
import {inject} from "inversify";
import {controller, httpGet} from "inversify-express-utils";
import {TYPES} from "../core/types.core";
import {UserRepository} from "../entities/user.entity";
import {DatabaseService} from "../services/database.service";

@controller("/users")
export class UsersController {
  public constructor(
    @inject(TYPES.DatabaseService) private readonly database: DatabaseService
  ) {}

  @httpGet("/")
  public async index(req: Request, res: Response) {
    const userRepository = await this.database.getRepository(UserRepository);

    const users = await userRepository.find();
    return res.json(users);
  }
}
```

And of course, don't forget to add the import of this new controller in the container:

```ts
// src/core/container.core.ts
// ...
import "../controllers/users.controller";
```

And there you go. Run the command `npm run start:watch` to start the server if you have stopped it and let's test the functionality with `cURL`:

```bash
curl http://localhost:3000/users
```

Command's output indicates an empty result: this is normal because there is no user yet. On the other hand, the server terminal tells us that a lot has happened:

```sql
query: BEGIN TRANSACTION
query: SELECT _ FROM "sqlite_master" WHERE "type" = 'table' AND "name" IN ('user')
query: SELECT _ FROM "sqlite_master" WHERE "type" = 'index' AND "tbl_name" IN ('user')
query: SELECT \* FROM "sqlite_master" WHERE "type" = 'table' AND "name" = 'typeorm_metadata'.
query: CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL)
query: COMMIT
2020-11-15T22:09:25.476Z - INFO - Connection established - {}
query: SELECT "User". "id" AS "User_id", "User". "email" AS "User_email", "User". "password" AS "User_password" FROM "user" "user" "User" "User".
```

These are TypeORM logs. These tell us that:

. TypeORM tried to see if there was a table named `user`.
. TypeORM created this table since it didn't exist
. the connection to the database has been established
. The SQL query to retrieve all users has been executed.

This tells us that everything is working perfectly! But I feel a bit disappointed because we don't have a user yet. Let's move on!

### Create

Now that our entire structure has been put in place, the rest will go much faster. Let's go straight to the implementation, and I'll explain the code next:

```ts
// src/controllers/home.controller.ts
// ...
import {
  controller,
  httpGet,
  httpPost,
  requestBody,
} from "inversify-express-utils";
// ...

interface CreateUserBody {
  email: string;
  password: string;
}

@controller("/users")
export class UsersController {
  // ...
  @httpPost("/")
  public async create(
    @requestBody() body: CreateUserBody,
    req: Request,
    res: Response
  ) {
    const repository = await this.database.getRepository(UserRepository);
    const user = new User();
    user.email = body.email;
    user.password = body.password;
    repository.save(user);
    return res.sendStatus(201);
  }
}
```

It's a bit of code but don't panic. `CreateUserBody` is an interface that defines the HTTP parameters that can be received. We take these parameters and send them directly to the repository.

Let's test that it all works:

```bash
curl -X POST -d "email=test@test.fr" -d "password=test" http://localhost:3000/users
```

Perfect. You can see that everything is working properly!

Let's move on to retrieve the information of this user.

### Show

The `show` method will take care of retrieving a user's information. This method will take the user's ID. We will then use the `repository` to retrieve the user.

Here is the implementation :

```ts
// src/controllers/home.controller.ts
// ...
@controller("/users")
export class UsersController {
  // ...
  @httpGet("/:userId")
  public async show(@requestParam("userId") userId: number) {
    const repository = await this.database.getRepository(UserRepository);
    return repository.findOneOrFail(userId);
  }
}
```

The implementation is really very simple. Just return an object, and `inversify-express-utils` will take care of converting the JavaScript object to JSON.

Let's try it to see:

```bash
curl http://localhost:3000/users/1
{"id":1, "email": "test@test.fr", "password": "test"}.
```

And there you go. Everything is working properly. Now let's try to update this user.

### Update

The `update` method will take care of recovering, modifying, and registering the user. As for the previous method, TypeORM makes our task much easier:

.Implementation of user update

```ts
// src/controllers/home.controller.ts
// ...
interface UpdateUserBody {
  email: string;
  password: string;
}

@controller("/users")
export class UsersController {
  // ...
  @httpPut("/:userId")
  public async update(
    @requestBody() body: UpdateUserBody,
    @requestParam("userId") userId: number,
    req: Request,
    res: Response
  ) {
    const repository = await this.database.getRepository(UserRepository);
    const user = await repository.findOneOrFail(userId);
    user.email = body.email ?? user.email;
    user.password = body.password ?? user.password;
    await repository.save(user);
    return res.sendStatus(204);
  }
  // ...
}
```

And there you go. As before, let's see if it works:

```bash
curl -X PUT -d "email=foo@bar.com"  http://localhost:3000/users/1
```

Perfect! You can even see, our user has been updated and it is sent back to us in JSON format. You can even see the SQL query that TypeORM performed in the terminal logs.

```sql
query: SELECT "User"."id" AS "User_id", "User"."email" AS "User_email", "User"."password" AS "User_password" FROM "user" "User" WHERE "User"."id" IN (?) -- PARAMETERS: [1]
query: BEGIN TRANSACTION
query: UPDATE "user" SET "email" = ? WHERE "id" IN (?) -- PARAMETERS: ["foo@bar.com",1]
query: COMMIT
```

### Delete

The `delete` method is the easiest. Just retrieve the user and call the `repository.delete` method. Let's do it:

```ts
// src/controllers/home.controller.ts
// ...
@controller("/users")
export class UsersController {
  // ...
  @httpDelete("/:userId")
  public async destroy(
    @requestParam("userId") userId: number,
    req: Request,
    res: Response
  ) {
    const repository = await this.database.getRepository(UserRepository);
    const user = await repository.findOneOrFail(userId);
    await repository.delete(user);
    return res.sendStatus(204);
  }
}
```

The `delete` method is the easiest. Just retrieve the user and call the `repository.delete` method. Let's do it:

```bash
curl -X DELETE  http://localhost:3000/users/1
```

Here again, we can verify that the user has been deleted by looking at the TypeORM logs:

```sql
query: SELECT "User"."id" AS "User_id", "User"."email" AS "User_email", "User"."password" AS "User_password" FROM "user" "User" WHERE "User"."id" IN (?) -- PARAMETERS: ["1"]
query: DELETE FROM "user" WHERE "id" = ? AND "email" = ? AND "password" = ? -- PARAMETERS: [1,"foo@bar.com","test"]
```

And there you go.

## Conclusion

And that's it, this tutorial is coming to an end.

I hope that this article has helped demystify dependency injection and/or that you have learned some things here.
