---
title: Mise en place de l'injection de dépendance dans une API avec Inversify
description: Ce tutoriel vous montre comment mettre en place une API RESTfull
  complète en utilisant l'injection de dépendances Inversify.
layout: post
date: 2021-06-10 12:00:00 +0200
tags:
  - node.js
  - typescript
  - typeorm
  - expressjs
  - inversify
categories: programming
modified: 2021-06-10T12:53:20.368Z
---

Dans cet article nous allons voir pourquoi et comment mettre en place l'injection de dépendance dans une API.

Nous allons mettre en place une API complète [RESTfull](https://fr.wikipedia.org/wiki/Representational_state_transfer) pour gérer des utilisateurs avec les actions basiques (consultation, création, edition, suppression). Et tant qu'à faire, nous allons mettre des tests unitaires et fonctionnels.

Mais avant de commencer à tout mettre en place, je vais essayer ici de vous résumer ce qu'est l'injection de dépendance et à quoi ça sert.

## Pourquoi utiliser l'injection de dépendance

Imaginons une classe `User` qui a besoin d'une classe `Database` pour être sauvegardé. On serait tenter d'initialiser la connection à la base de donnée dans le constructeur de l'utilisateur :

```ts
class Logger {
  log(message: string): void {
    const time = new Date().toISOString();
    console.log(`${time} -- ${message}`);
  }
}

class Database {
  constructor(connectionString: string) {
    // do some stuff here
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

Cela pose plusieurs problème:

1. la classe `User` depends de la classe `Database`. Si on change l'implémentation de la classe `Database`, il faudra modifier la classe `User`
2. le code est beaucoup moins testable car pour tester un utilisateur, je dois connaître le fonctionnement de la classe user

Pour vous accentuer le problème, rajoutons une classe `Logger` qui permet de logger les événements dans l'appli. Imaginons que nous avons besoin de logger la connection à la base de donnée. Le code devient donc

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

On voit bien que la situation se dégrade car toutes les classes deviennent dépendantes entre elles. Pour corriger cela, nous allons injecter directement la classe `Database` dans le constructeur de `User` :

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

Ce code devient plus solide car la classe `User`, `Database` et `Logger` sont découplés.

> OK, mais ça devient plus pénible d'instancier une `User`.

Effectivement. C'est pourquoi nous utilisons un `Container` qui va enregistrer les classes qui peuvent être injectées et nous proposer de créer des instances facilement :

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

Le code est plus long mais tout devient découpé. Rassurez-vous, nous n'allons pas implémenter tout cela à la main. De très bonne librairies existent. Celle que j'ai choisi est [Inversify](https://github.com/inversify/InversifyJS).

## Initialisation de l'application avec Typescript

Maintenant que vous voyez un peu à quoi sert l'injection de dépendance, nous allons mettre en pratique dans un cas réel.

Nous allons utiliser [TypeORM](https://typeorm.io/) et [Express.js](https://expressjs.com/). J'ai choisi ces librairies car je les connais bien mais il est possible d'utiliser [Sequelize](https://sequelize.org/) à la place de [TypeORM](https://typeorm.io/), remplacer Express.js par [Fastify](https://www.fastify.io/) ou autre chose.

Commençons par créer un projet Node.js versionné avec Git:

```sh
mkdir dependecy-injection-example
cd dependecy-injection-example
npm init
git init # Initialize Git repository (optional)
```

Installons maintenant Typescript:

```sh
npm add typescript @types/node --save-dev
```

Nous avons ajouté deux librairies :

- `typescript` qui va nous offrir les outils de _transpilation_
- `@types/node` qui va ajouter la définition des types de Node.js

Ajoutons donc notre premier fichier Typescript :

```ts
// src/main.ts
function say(message: string): void {
  console.log(`I said: ${message}`);
}
say("Hello");
```

Ce code est vraiment très basique et va juste nous servir a vérifier que la transpilation fonctionne.

Afin d'utiliser la transpilation de Typescript, nous avons besoin de définir un fichier de configuration `tsconfig.json`. En voici un basique:

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

Cela fait beaucoup de code mais les deux directives a retenir ici sont: `rootDir` et `outDir`. Elles vont simplement spécifier ou sont les fichiers Typescript (`rootDir`) et ou placer les fichiers Javascript résultants de la transpilation (`outDir`).

Dans notre cas je place tous les fichiers Typescript dans le dossier `src` et le résultat de la transpilation dans `dist`.

On ajoute maintenant un script dans le `package.json` pour compiler et executer notre application:

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

On peut vérifier que tout fonctionne en executant le script:

```sh
npm start
> dependecy-injection-example@1.0.0 start /home/alexandre/github/madeindjs/dependecy-injection-example
> tsc && node dist/main.js
I said: Hello
```

Nous n'avons pas besoin d'aller plus loin pour le moment!

## Mise en place du serveur web

Jusqu'ici nous avons mis en place un environnement qui va nous permettre d'éviter les erreurs de syntaxe et de typage automatiquement avec Typescript. Il est temps d'enfin faire une vrai fonctionnalité: le serveur web.

Il existe plusieurs bibliothèque pour faire un serveur web avec Node.js. Dans mon cas je recommande [Express.js](https://expressjs.com/fr/) tout simplement car c'est celle qui a une plus grosse communauté et elle offre des fonctionnalités basique. Elle vous laisse aussi la liberté d'organiser votre code comme vous le souhaitez tout en offrant une tonne de plugin pour rajouter des fonctionnalités par dessus.

Pour l'ajouter c'est très facile:

```bash
npm add express --save
```

On va aussi ajouter les typages Typescript qui vont aider un peu votre éditeur de code :

```bash
npm add @types/express --save-dev
```

Et maintenant nous pouvons instancier notre serveur dans le fichier `main.ts`

```ts
// src/main.ts
import express, {Request, Response} from "express";

const app = express();
const port = 3000;

app.get("/", (req: Request, res: Response) => res.send("Hello World!"));
app.listen(port, () => console.log(`listen on http://localhost:${port}/`));
```

Vous pouvez lancer le serveur avec Nodemon (si ce n'est pas déjà fait) avec `npm run start:watch` et vous allez avoir le résultat suivant :

```
Server listen on http://localhost:3000/
```

Vous pouvez donc ouvrir votre navigateur a l'adresse http://localhost:3000 et voir que tout fonctionne. Voici ici le résultat en utilisant `curl`:

```bash
curl http://localhost:3000
```

```
Hello World!
```

Maintenant que tout fonctionne, commitons les changements:

```bash
git commit -am "Add express.js server"
```

## Mise en place de Inversify

Dans cette section nous allons (enfin) mettre en place le système d'_injection de dépendance_ avec [Inversify](https://inversify.io).

Nous allons commencer par mettre en place un Logger qui pourra être injecté dans toutes les classes de notre application. Il nous permettra de les requêtes HTTP par exemple mais aussi bien d'autres événements.

Installons donc `inversify`:

```sh
npm install inversify --save
```

Et créons une classe pour logger les événements toute simple:

NOTE: On pourrait utiliser une librairie comme [Winston](https://github.com/winstonjs/winston) ou [Morgan](https://www.npmjs.com/package/morgan) mais pour l'exemple je vais créer une classe assez basique :

```ts
// src/services/logger.service.ts
export class Logger {
  public log(level: "DEBUG" | "INFO" | "ERROR", message: string): void {
    const time = new Date().toISOString();
    console.log(`${time} - ${level} - ${message}`);
  }
}
```

Pour la rendre injectable, il faut lui ajouter un décorateur `@injectable`. Ce décorateur va simplement [ajouter une metadata](https://github.com/inversify/InversifyJS/blob/5.1.1/src/annotation/injectable.ts#L12) a notre classe afin qu'elle puisse être injectée dans nos futures dépendances.

```ts
import {injectable} from "inversify";

@injectable()
export class Logger {
  /* ... */
}
```

Et voilà. Il ne nous reste plus qu'à créer le container qui va enregistrer ce service. [La documentation](https://github.com/inversify/InversifyJS#installation) recommande de créer un objet `TYPES` qui va simplement stocker les identifiants de nos services. Nous allons créer un dossier `core` qui contiendra tout le code transverse à toute notre application.

```ts
// src/core/types.core.ts
export const TYPES = {Logger: Symbol.for("Logger")};
```

NOTE: Un [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) est un type primitif qui permet d'avoir une référence unique.

Maintenant nous pouvons utiliser ce symbole pour enregistrer notre logger dans un nouveau fichier `container.core.ts` Il suffit d'instancier un `Container` et d'ajouter notre service avec la méthode `bind()`. On exporte ensuite cette instance pour l'utiliser dans l'application:

```ts
// src/core/container.core.ts
import {Container} from "inversify";
import {Logger} from "../services/logger.service";
import {TYPES} from "./types.core";

export const container = new Container();
container.bind(TYPES.Logger).to(Logger);
```

Et voilà.

### Création d'un contrôleur

Laissons de côté cette classe que nous allons utiliser plus tard dans notre premier contrôleur. Les contrôleurs font partis du _design patern_ _MVC: Modèle, Vue, Contrôleur_. Leur but est d'intercepter la requête et d'appeler les services dédiés. Il existe une librairie officielle Inversify pour intégrer l'injection de dépendance directement dans nos contrôleurs: [`inverisfy-express-utils`](https://github.com/inversify/inversify-express-utils).

On commence par installer la librairie. On va aussi ajouter `body-parser` qui va nous permettre de traiter les paramètres de la requête HTTP (nous en reparlerons plus loins).

Pour l'installer, c'est très facile. Il suffit de suivre la https://github.com/inversify/inversify-express-utils[documentation officielle]. On commence donc par installer quelques librairies.

```sh
npm install inversify-express-utils reflect-metadata body-parse --save
```

- `reflet-metadata` permet à Inversify d'ajouter des metadata sur notre classe. Cet import doit être situé au tout débt du premier fichier.
- `body-parse` va nous donner la possibilité d'extraire les paramètres des requêtes HTTP (nous ren reparlerons plus tard)

Avant d'écrire notre premier contrôleur, il est nécessaire de faire quelques modifications à la création de notre serveur HTTP. Créons un nouveau fichier `core/server.core.ts` qui va simplement définir notre serveur HTTP avec `inversify-express-utils`:

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

Comme vous pouvez le voir, nous utilisons maintenant une instance de `InversifyExpressServer`. La méthode `setConfig` permet d'ajouter des _middleware_ (nous y reviendrons plus tard). Passons au fichier `main.ts` que nous allons modifier un peu:

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

Et voilà. Nous pouvons maintenant nous attaquer à notre premier contrôleur.

Le contrôleur est une classe comme les autres. Elle va simplement le décorateur `@controller`. Ce décorateur va lui aussi déclarer ce contrôleur comme `@injectable` mais aussi nos offrir des fonctionnalités spéciales.

Passons directement à l'implémentation afin que cela soit plus parlant:

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

Comme vous pouvez le voir, l'implémentation est très claire grâce aux décorateurs:

- Le `@controller("/")` nous indique que toutes les routes de ce contrôleur seront préfixées par `/`
- Le second décorateur `@httpGet("/")` définit que cette méthode sera accèssible sur l'URL `/` via le verbe HTTP POST.

Maintenant essayons d'injecter le `Logger` afin d'afficher un message lorsque cette route est utilisée:

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

Et voilà !

Le décorateur `@inject` s'occupe de tout, il suffit de spécifier le symbole. C'est magique.

La dernière étape est d'importer manuellement ce contrôleur dans le container. C'est vraiment très simple à faire :

```diff
// src/core/container.core.ts
import {Container} from 'inversify';

+ import '../controllers/home.controller';
import '../controllers/users.controller';
// ...
```

Vous pouvez maintenant démarrer le serveur avec `npm run start` ou attendre que la transpilation se fasse automatiquement si vous n'avez pas arrêté le précédent serveur.

## Mise en place de TypeORM

Ici nous allons mettre en place la couche _Model_ du _design patern_ MVC. Il s'agit de la couche relative à la base de données.

Afin d'accéder a la base de données, nous allons utiliser un ORM (Object Relational Mapper). Le but d'un ORM est de dialoguer avec la base de données et de vous éviter d'écrire les requêtes SQL à la main. Il nous permet aussi d'ajouter une couche d'abstraction au type de base de données et nous permet de ne pas nous soucier des différences entre PostgreSQL et SQLite par exemple.

Il existe plusieurs ORM pour Nodejs: [Sequelize](https://sequelize.org/), [Mongoose](https://mongoosejs.com/) et [TypeORM](https://typeorm.io/). J'ai choisis le dernier car c'est celui qui s'intègre le mieux avec Typescript. Il propose aussi une approche [Active Record ET Data Mapper](https://typeorm.io/#/active-record-data-mapper) que j'apprécie beaucoup.

Pour l'installer c'est très facile. Nous allons installer la librairie TypeORM mais aussi deux librairies supplémentaires :

- `sqlite3` qui va nous permettre de dialoguer avec notre base de données Sqlite
- [`dotenv`](https://www.npmjs.com/package/dotenv) qui va nous permettre de commencer à définir des _variables d'environnement_ comme la connexion à notre base de données.

C'est parti:

```sh
npm add typeorm sqlite3 dotenv --save
```

Nous allons maintenant générer notre fichier de configuration. Par défault, `dotenv` va chercher un fichier nomé `.env`. Créons le:

```sh
touch .env
```

Et commençons par définir [les variables d'environnement de TypeORM](https://github.com/typeorm/typeorm/blob/master/docs/using-ormconfig.md#using-environment-variables) pour une connexion basique à une base de donnée SQLite:

```console
TYPEORM_CONNECTION=sqlite
TYPEORM_DATABASE=db/development.sqlite
TYPEORM_LOGGING=true
TYPEORM_SYNCHRONIZE=true
TYPEORM_ENTITIES=src/entities/*.entity.ts,dist/entities/*.entity.js
```

Comme vous pouvez le voir on définis que nous utiliserons Sqlite et que la base de données sera stockée dans le dossier `db/`. `TYPEORM_SYNCHRONIZE` permet d'éviter de ne pas se soucier des migrations et ainsi laisser TypeORM faire les modifications sur le schéma de notre base de données si nécessaire. Nous spécifions ensuite ou sont situé nos entités avec `TYPEORM_ENTITIES`.

Il ne nous reste plus qu'a configurer `dotenv` pour charger ce fichier. Pour faire cela, j'utilise le _flag_ `--require` de Node.js qui permet de pré-charger une librairie. Il suffit donc de modifier le `package.json`:

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

Nous allons maintenant créer un service `DatabaseService` qu va s'occuper de connecter TypeORM à notre base de données. Comme nous avons mis en place l'injection de dépendance, ce service sera lui aussi injectable. Voici l'implémentation complète. Pas de panique, je vous détaille la logique ensuite.

```ts
// src/services/database.service.ts
import {inject, injectable} from "inversify";
import {Connection, createConnection, ObjectType} from "typeorm";
import {TYPES} from "../core/types.core";
import {Logger} from "./logger.service";

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
    } catch (e) {
      this.logger.log("ERROR", "Cannot establish database connection", e);
      process.exit(1);
    }

    return DatabaseService.connection;
  }

  public async getRepository<T>(repository: ObjectType<T>): Promise<T> {
    const connection = await this.getConnection();
    return await connection.getCustomRepository<T>(repository);
  }
}
```

Cette classe possède deux méthodes :

- `getConnection` : cette méthode va initialiser une nouvelle connection à la base de données. Celle-ci va appeler la méthode `createConnection` qui va chercher [un fichier de ormconfig](https://typeorm.io/#/using-ormconfig) (dans notre cas les variables d'environnement chargée par `dotenv`) et établir une connection. Une fois la connection effectuée, elle est stoquée dans une propriété statique qui sera retournée directement la prochaine fois
- `getRepository` : cette méthode va nous permettre de manipuler nos modèles via les repository. Nous en parlerons en détails plus loin

NOTE: C'est une bonne pratique de cacher la logique de la librairie par nos propres classe. Cela nous permettrai de moi dépendre de la librairie et de pouvoir migrer plus facilement si un jours nous souhaiterions changer.

Maintenant que notre service est créé, il faut l'ajouter à notre container :

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

Et voilà.

Nous pouvons maintenant créer notre premier modèle `User`. En utilisant le _patern Data Mapper_ il va falloir créer deux classe :

- l'_entity_ : elle va définir les attributs des champs à sauvegarder dans la base de donnée. Dans notre cas, je vais simplement créer deux attributs: `email` et `password` (le mot de passe sera chiffrée plus tards).
- le _repository_ : elle va ajouter certaines logiques pour sauvegarder nos entités.

Afin de simplifier l'exemple, je vais mettre ces deux classes dans le même fichier mais vous pouvez très bien les séparer :

```ts
// src/entities/user.entity.ts
import {
  Column,
  Entity,
  EntityRepository,
  PrimaryGeneratedColumn,
  Repository,
} from "typeorm";

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

Et voilà. Le résultat est vraiment très simple gràce aux décorateurs `@columns` proposées par TypeORM. Ceux-ci peuvent aussi définir le type d'information a stocker (Texte, date, etc..). L'implémentation de ce modèle est suffisante pour le moment.

Pour l'instant notre travail n'est pas très visible mais tenez bon car vous allez voir le résultat dans la prochaine section.

Nous pouvons commiter les changements effectuées jusqu'à maintenant:

```sh
git add .
git commit -m "Setup TypeORM"
```

## Création du contrôleur des utilisateurs

Il est maintenant temps d'entrer dans la partie concrète et de créer le contrôleur qui va gérer les utiliseurs. Ce contrôleur va respecter les normes REST et proposer les actions CRUD classiques. C'est à dire _**C**reate_, _**R**ead_, _**U**pdate_ et _**D**elete_.

### Lister les utilisateurs

Nous allons commencer par la méthode `index` qui est la plus simple.

Comme nous l'avons vu plutôt, les contrôleurs peuvent injecter nos services. Nous allons donc injecter le `DatabaseService` afin de pouvoir récupérer le `UserRepository`. Il suffira ensuite d'appeler la méthode `userRepository.find` afin de récupérer la liste de tous les utilisateur (qui est vide pour le moment).

Voici l'implémentation de notre contrôleur:

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

Et bien sûr, il ne faut pas oublier d'ajouter l'import de ce nouveau contrôleur dans le container:

```diff
// src/core/container.core.ts
import {Container} from 'inversify';
import "../controllers/home.controller";
+ import "../controllers/users.controller";
import {DatabaseService} from '../services/database.service';
import {Logger} from '../services/logger.service';
// ...
```

Et voilà. Lancez la commande `npm run start:watch` pour démarrer le serveur si vous l'avez arrêté et testons la fonctionnalité avec `cURL`:

```sh
curl http://localhost:3000/users
```

Le retour de la commande nous indique un tableau vide: c'est normal car il n'y a pas encore d'utilisateur. En revanche, le terminal du serveur nous indique qu'il s'est passé beaucoup de chose:

```
query: BEGIN TRANSACTION
query: SELECT _ FROM "sqlite_master" WHERE "type" = 'table' AND "name" IN ('user')
query: SELECT _ FROM "sqlite_master" WHERE "type" = 'index' AND "tbl_name" IN ('user')
query: SELECT \* FROM "sqlite_master" WHERE "type" = 'table' AND "name" = 'typeorm_metadata'
query: CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL)
query: COMMIT
2020-11-15T22:09:25.476Z - INFO - Connection established - {}
query: SELECT "User"."id" AS "User_id", "User"."email" AS "User_email", "User"."password" AS "User_password" FROM "user" "User"
```

Il s'agit des logs de TypeORM. Ceux-ci nous indiquent que:

. TypeORM a essayé de voir s'il existait une table nommée `user`
. TypeORM a crée cette table puisqu'elle n'existait pas
. la connexion a la base de données été établie
. La requête SQL pour retrouver tous les utilisateurs a été exécutée

Cela nous indique que tout fonctionne parfaitement ! Mais je vous sent un peu déçu car nous n'avons pas encore d'utilisateur. Passons à la suite !

### Create

Maintenant que toute notre structure a été mise en place, la suite va aller beaucoup plus vite. Passons directement à l'implémentation et je fous explique le code ensuite:

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

Cela fait un peut de code mais pas de panique. `CreateUserBody` est une interface qui définie les paramètres HTTP qui peuvent être reçu. Nous prenons ces paramètres et nous les envoyons directement au `repository`.

Testons que tout cela fonctionne:

```sh
curl -X POST -d "email=test@test.fr" -d "password=test" http://localhost:3000/users
```

Parfait. On voit que tout fonctionne correctement!

Passons à la suite pour récupérer les information de cet utilisateur.

### Show

La méthode `show` va s'occuper de retrouver les informations d'un utilisateur. Cette méthode va prendre l'identifiant de l'utilisateur. On va ensuite utiliser le `repository` pour récupérer l'utilisateur.

Voici l'implémentation :

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

L'implémentation est vraiment très simple. Il faut simplement retourner un objet et `inversify-express-utils` va s'occuper de convertir l'objet JavaScript en JSON.

Essayons pour voir:

```sh
curl http://localhost:3000/users/1
{"id":1,"email":"test@test.fr","password":"test"}
```

Et voilà. Tous fonctionne correctement. Essayons maintenant de modifier cet utilisateur.

### Update

La méthode `update` va s'occuper de récupérer, modifier et enregistrer l'utilisateur. Comme pour la méthode précédente, TypeORM nous facilite beaucoup la tâche :

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

Et voilà. Comme tout à l'heure, essayons de voir si cela fonctionne :

```bash
curl -X PUT -d "email=foo@bar.com"  http://localhost:3000/users/1
```

Parfait ! Vous pouvez même voir, notre utilisateur a été mis à jour et il nous est renvoyé sous format JSON. Vous pouvez même voir la requête SQL que TypeORM a effectué dans les logs du terminal

```sql
query: SELECT "User"."id" AS "User_id", "User"."email" AS "User_email", "User"."password" AS "User_password" FROM "user" "User" WHERE "User"."id" IN (?) -- PARAMETERS: [1]
query: BEGIN TRANSACTION
query: UPDATE "user" SET "email" = ? WHERE "id" IN (?) -- PARAMETERS: ["foo@bar.com",1]
query: COMMIT
```

Passons maintenant à la dernière méthode du controlleur.

### Delete

La méthode `delete` est la plus facile. Il suffit de récupérer l'utilisateur et d'appeler la méthode `repository.delete`. Allez c'est parti :

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

Et voilà. Nous pouvons aussi tester cette méthode :

```bash
curl -X DELETE  http://localhost:3000/users/1
```

Ici encore, nous pouvons vérifier que l'utilisateur a bien été supprimé en regardant les logs de TypeORM :

```sql
query: SELECT "User"."id" AS "User_id", "User"."email" AS "User_email", "User"."password" AS "User_password" FROM "user" "User" WHERE "User"."id" IN (?) -- PARAMETERS: ["1"]
query: DELETE FROM "user" WHERE "id" = ? AND "email" = ? AND "password" = ? -- PARAMETERS: [1,"foo@bar.com","test"]
```

Et voilà. Maintenant que nous arrivons à la fin de de notre controlleur, nous pouvons commiter tous ces changements:

```bash
git commit -am "Implement CRUD actions on user"
```

## Validation de nos utilisateurs

Tout semble fonctionner mais il rest une problème: nous ne validons pas les données que nous insérons en base. Ainsi, il est possible de créer un utilisateur avec un email faux :

```sh
curl -X POST -d "whatever" -d "password=test" http://localhost:3000/users
```

Encore une fois, nous allons avoir recours a une librairie toute faite: `class-validator`. Cette librairie va nous offrir https://github.com/typestack/class-validator/#table-of-contents[une tonne de décorateurs] pour vérifier très facilement notre instance `User`.

Installons la avec NPM :

```sh
npm install class-validator --save
```

Et il suffit ensuite d'ajouter les décorateurs `@IsEmail` et `@IsDefined` comme ceci :

```diff
// src/entities/user.entity.ts
+ import {IsDefined, IsEmail, validateOrReject} from 'class-validator';
- import {/* ... */} from 'typeorm';
+ import {BeforeInsert, BeforeUpdate, /* ... */} from 'typeorm';

@Entity()
export class User {
  // ...
+  @IsDefined()
+  @IsEmail()
  @Column()
  email: string;

+  @IsDefined()
  @Column()
  password: string;

+  @BeforeInsert()
+  @BeforeUpdate()
+  async validate() {
+    await validateOrReject(this);
+  }
}
// ...
```

Il n'a pas fallu beaucoup de code a ajouter. La partie la plus intéressante est la méthode `validate`. Elle possède deux décorateurs `BeforeInsert` et `BeforeUpdate` qui vont permettre d'appeler automatiquement la méthode `validate` lorsqu'on utilise la méthode `save` d'un repository. C'est très pratique et il n'y a rien a faire. Essayons maintenant de créer le même utilisateur avec l'email erroné :

```bash
curl -X POST -d "whatever" -d "password=test" http://localhost:3000/users
...
<pre>An instance of User has failed the validation:<br> - property email has failed the following constraints: isDefined, isEmail <br></pre>
...
```

On voit que c'est beaucoup mieux. Cependant nous souhaiterions envoyer une erreur formatée en JSON avec le code d'erreur correspondant à la norme REST. Modifions donc le contrôleur :

.Ajout de la validation des utilisateur dans le `UserController`

```ts
// src/controllers/home.controller.ts
// ...
@controller("/users")
export class UsersController {
  // ...
  @httpPost("/")
  public async create(/* ... */): Promise<User | Response> {
    // ...
    const errors = await validate(user);
    if (errors.length !== 0) {
      return res.status(400).json({errors});
    }

    return repository.save(user);
  }

  @httpPut("/:id")
  public async update(/* ... */): Promise<User | Response> {
    // ...
    const errors = await validate(user);
    if (errors.length !== 0) {
      return res.status(400).json({errors});
    }
    return repository.save(user);
  }
  // ...
}
```

Essayons maintenant :

```bash
curl -X POST -d "test@test.fr" -d "password=test"  http://localhost:3000/users
{"errors":[{"target":{"password":"test"},"property":"email","children":[],"constraints":{"isDefined":"email should not be null or undefined","isEmail":"email must be an email"}}]}
```

Le résultat est vraiment complet et permettra a un utilisateur de l'API d'interpréter rapidement l'erreur.

Commitons ces changements:

```bash
git commit -am "Validate user"
```

## Factorisation

Maintenant que nous avons un code qui fonctionne, il est temps de faire une passe pour _factoriser tout ça_.

Pendant la mise en place, vous avez sans doute remarqué que la méthode `show`, `update` et `destroy` possédait un logique commune: elles récupèrent toute l'utilisateur.

Pour factoriser ce code il y aurait deux solutions :

- déplacer le bout de code dans un méthode privée et l'appeler
- créer un _Middleware_ qui va être exécuté avant le contrôleur

J'ai choisi la deuxième option car elle permet de réduire le code et la responsabilité du contrôleur. De plus, avec `inversify-express-utils` c'est très facile. Laissez moi vous montrer :

```typescript
import {NextFunction, Request, Response} from "express";
import {inject, injectable} from "inversify";
import {BaseMiddleware} from "inversify-express-utils";
import {TYPES} from "../core/types.core";
import {User, UserRepository} from "../entities/user.entity";
import {DatabaseService} from "../services/database.service";

@injectable()
export class FetchUserMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.DatabaseService) private readonly database: DatabaseService
  ) {
    super();
  }

  public async handler(
    req: Request & {user: User},
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    const userId = req.query.userId ?? req.params.userId;
    const repository = await this.database.getRepository(UserRepository);
    req.user = await repository.findOne(Number(userId));

    if (!req.user) {
      return res.status(404).send("User not found");
    }

    next();
  }
}
```

Voici quelques explications sur ce code :

. `inversify-express-utils` nous donne accès a une classe abstraite `BaseMiddleware`. Nous devons aussi ajouter le décorateur `@injectable` pour l'utiliser plus tard dans notre contrôleur
. un middleware est une simple méthode `handle` qui prend en paramètre :

- `req`::
  la requête envoyée par l'utilisateur
  `res`::
  la réponse HTTP à renvoyer.
  `next`::
  un callback a appeler une fois que notre traitement est finit
  . la méthode `handle` s'occupe de récupérer l'utilisateur et de l'ajouter à l'objet `req` pour qu'il soit utilisé plus tard
  . si l'utilisateur n'existe pas, nous utilisons `res` pour renvoyer directement une réponse 404 sans même passer par l'utilisateur

Vu que nous avons défini un nouvel injectable, il faut l'ajouter à notre container :

```diff
// src/core/types.core.ts
export const TYPES = {
  Logger: Symbol.for("Logger"),
  DatabaseService: Symbol.for("DatabaseService"),
+   // Middlewares
+   FetchUserMiddleware: Symbol.for("FetchUserMiddleware"),
};
```

```diff
// src/core/container.core.ts
// ...
+ import {FetchUserMiddleware} from '../middlewares/fetchUser.middleware';

export const container = new Container();
// services
container.bind(TYPES.Logger).to(Logger);
container.bind(TYPES.DatabaseService).to(DatabaseService);
+ // middlewares
+ container.bind(TYPES.FetchUserMiddleware).to(FetchUserMiddleware);
```

Désormais nous pouvons utiliser ce middleware dans notre contrôleur en ajoutant `TYPE.FetchUserMiddleware` au décorateur. Voici donc la modification :

```ts
// src/controllers/home.controller.ts
// ...
@controller("/users")
export class UsersController {
  // ...
  @httpGet("/:userId", TYPES.FetchUserMiddleware)
  public async show(/* ... */) {
    return req.user;
  }

  @httpPut("/:userId", TYPES.FetchUserMiddleware)
  public async update(/* ... */) {
    // ...
    req.user.email = body.email ?? req.user.email;
    req.user.password = body.password ?? req.user.password;
    // ...
  }

  @httpDelete("/:userId", TYPES.FetchUserMiddleware)
  public async destroy(/* ... */) {
    // ...
    await repository.delete(req.user);
    // ...
  }
}
```

Pas mal non ? Commitons les modifications avant d'aller plus loin :

```bash
git add .
git commit -m "Factorize user controller with middleware"
```

## Hashage du mot de passe

### La théorie

Nous allons utiliser la librairie de base de Node.js : https://nodejs.org/api/crypto.html[Crypto]. Voici un exemple d'une méthode pour hasher le mot de pass:

```ts
import {createHash} from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

console.log(hashPassword("$uper_u$er_p@ssw0rd"));
// => 51e649c92c8edfbbd8e1c17032...
```

Et voilà! Pour savoir si le mot de passe correspond il suffit de vérifier si le hash correspond au précédent :

```ts
import {createHash} from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function isPasswordMatch(hash: string, password: string): boolean {
  return hash === hashPassword(password);
}

const hash = hashPassword("$uper_u$er_p@ssw0rd"); // => 51e649c92c8edfbbd8e1c17032...

isPasswordMatch(hash, "$uper_u$er_p@ssw0rd"); // => true
isPasswordMatch(hash, "wrong password"); // => false
```

Impeccable. Il y a néanmoins un petit problème avec ce type de méthode.

Si vos mots de passe fuite, il sera assez facile à retrouver le mot de passe correspondant en construisant un _bibliothèque de hash_. Concrètement, le malveillant utiliserait les mots de passe courant, les hasherai un par avec le même algorithme et les comparerait aux notre. Pour corriger cela, il faut utiliser un sel de hashage.

Le sel de hachage consiste a rajouter un texte définis à chaque mot de passe. Voici la modification :

```ts
import {createHash} from "crypto";

const salt = "my private salt";

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(`${password}_${salt}`).digest("hex");
}

function isPasswordMatch(hash: string, password: string): boolean {
  return hash === hashPassword(password, salt);
}

const hash = hashPassword("$uper_u$er_p@ssw0rd", salt); // => 3fdd2b9c934cd34c3150a72fb4c98...

isPasswordMatch(hash, "$uper_u$er_p@ssw0rd"); // => true
isPasswordMatch(hash, "wrong password"); // => false
```

Et voilà ! Le fonctionnement est le même mais notre application est plus sécurisée. Si quelqu'un accedait à notre base de données, il faudrait qu'il ait en possession le _sel de hachage_ pour retrouver les mots de passe correspondant.

### L'implémentation

Maintenant que nous avons vu la théorie, passons à la pratique. Nous allons utiliser les mêmes méthodes dans un fichier `password.utils.ts`. C'est parti:

```ts
// src/utils/password.utils.ts
import {createHash} from "crypto";

const salt = "my private salt";

export function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(`${password}_${salt}`).digest("hex");
}

export function isPasswordMatch(hash: string, password: string): boolean {
  return hash === hashPassword(password, salt);
}
```

Nous allons maintenant utiliser la méthode `hashPassword` dans l'entité `User`. Avec TypeORM c'est très facile en utilisant les hooks comme nous l'avons fait avec la validation.

```ts
// src/entities/user.entity.ts
// ...
import {hashPassword} from "../utils/password.utils";

@Entity()
export class User {
  // ...
  @IsDefined()
  @Column()
  hashedPassword: string;

  set password(password) {
    if (password) {
      this.hashedPassword = hashPassword(password);
    }
  } // ...
}
// ...
```

Quelques explications s'imposent :

- nous avons crée un attribut `hashedPassword` qui contient le mot de passe de l'utilisateur hashé. Cette valeur sera sauvegardée en base car nous avons ajouté le décorateur `@column`. Nous en aurons besoin plus tard pour savoir si le mot de passe fournis par l'utilisateur correspond a celui qu'il avait définit
- l'attribut `password` devient un _setter_. C'est comme un attribut virtuel qui va être appelé lors de l'assignation. Ainsi en faisant `user.password = 'toto'`, cette méthode sera appelé. C'est parfait car nous ne voulons plus le stocker le mot de passe au cas ou notre base de données fuite.

Maintenant essayons de créer un utilisateur via l'API:

```bash
curl -X POST -d "email=test@test.fr" -d "password=test"  http://localhost:3000/users
{"email":"test@test.fr","password":"test","hashedPassword":"8574a23599216d7752ef4a2f62d02b9efb24524a33d840f10ce6ceacda69777b","id":1}
```

Tout semble parfaitement fonctionner car on voit que l'utilisateur possède bien un mot de passe hashé. Si on change le mot de passe, le hash change correctement :

```bash
curl -X PUT   -d "password=helloWorld"  http://localhost:3000/users/4
{"id":4,"email":"test@test.fr","hashedPassword":"bdbe865951e5cd026bb82a299e3e1effb1e95ce8c8afe6814cecf8fa1e895d1f"}
```

Tout marche parfaitement bien. Faisons un commit avant d'aller plus loin.

```bash
git add .
git commit -m "Hash user password"
```

### Mise en place d'un test unitaire

Nous avons un code qui fonctionne et c'est cool. Si nous pouvons nous assurer qu'il fonctionne comme cela à chaque évolution c'est encore mieux. C'est donc ici qu'interviennent les _tests unitaires_.

Le rôle du test unitaire est de s'assurer que notre méthode fonctionne toujours de la même façon que nous l'avons décidé. Nous allons donc ici mettre en place un test simpliste pour s'assurer que tout fonctionne bien.

Il existe plusieurs librairie de tests en JavaScript. J'ai choisi `Mocha` car c'est une des librairie les plus populaire et elle se met très facilement en place. Nous installons aussi `ts-mocha` qui va transpiler le TypeScript à la volée :

```bash
npm install mocha ts-mocha @types/mocha --save-dev
```

Il faut aussi modifier un peut notre `tsconfig.json` pour ajouter les déclaration de de Mocha et spécifier à Typescript de ne pas compiler ces fichier :

```diff
{
  "compilerOptions": {
    // ..
    "types": [
      "node",
+      "mocha"
    ],
    // ...
  },
+   "exclude": ["./**/*.spec.ts"]
}
```

Nous voici prêt à créer notre premier test :

```ts
// src/entities/user.entity.spec.ts
import assert from "assert";
import {hashPassword} from "../utils/password.utils";
import {User} from "./user.entity";

describe("User", () => {
  it("should hash password", () => {
    const user = new User();
    user.password = "toto";
    const expected = hashPassword("toto");
    assert.strictEqual(user.hashedPassword, expected);
  });
});
```

Comme je vous le disait, c'est un test vraiment très simple. Ajoutons maintenant la commande qui va nous permettre de lancer ce test dans le fichier `package.json` :

```diff
{
  // ...
  "scripts": {
    "start": "tsc && node dist/main.js",
    "start:watch": "nodemon",
+     "test": "DOTENV_CONFIG_PATH=.test.env ts-mocha -r reflect-metadata -r dotenv/config src/**/*.spec.ts",
    "build": "tsc"
  },
  // ...
}
```

Quelques explications sur cette commande:

- `-r reflect-metadata` charge la librairie `reflect-metadata` et nous évite de l'importer manuellement
- `-r dotenv/config` charge la librairie `dotenv` pour ainsi avoir les variables d'environnement de TypeORM
- `DOTENV_CONFIG_PATH` va charger un fichier `.env` particulier que nous allons créer juste après

Lorsque nous testons notre application, nous ne voulons pas polluer notre base de données avec des données que nous créons pendant les tests. C'est donc une bonne pratique de créer une base de donnée dédiée. Dans notre cas, nous allons utiliser une base SQLite _in memory_. C'est a dire qu'elle n'est pas stockée sur le disque dur mais directement dans la mémoire vive. Voici donc le fichier `.test.env`:

```console
TYPEORM_CONNECTION=sqlite
TYPEORM_DATABASE=:memory:
TYPEORM_LOGGING=true
TYPEORM_SYNCHRONIZE=true
TYPEORM_ENTITIES=src/entities/*.entity.ts
```

NOTE: La directive `TYPEORM_ENTITIES` pointe aussi les fichier Typescript car `ts-mocha` transpile et execute directement ces fichiers.

Et voilà. Nous pouvons maintenant exécuter ce test :

```bash
npm test

  User
    ✓ should hash password


  1 passing (5ms)
```

Et tant qu'à faire, nous pouvons aussi ajouter un autre test unitaire sur la méthode de comparaison du mot de passe `isPasswordMatch` :

```ts
// src/utils/password.utils.spec.ts
import assert from "assert";
import {hashPassword, isPasswordMatch} from "./password.utils";

describe("isPasswordMatch", () => {
  const hash = hashPassword("good");
  it("should match", () => {
    assert.strictEqual(isPasswordMatch(hash, "good"), true);
  });
  it("should not match", () => {
    assert.strictEqual(isPasswordMatch(hash, "bad"), false);
  });
});
```

Encore une fois, ce genre de test peut vous sembler simpliste mais ils sont très rapide et permettent d'avoir une sécurité supplémentaire. Lançons les tests :

```bash
npm test
...
  User
    ✓ should hash password

  isPasswordMatch
    ✓ should match
    ✓ should not match


  3 passing (6ms)
```

Maintenant que vous êtes échauffé, commitons et passons à la suite :

```bash
git add .
git commit -m "Add unit test about password hash"
```

## Ajout des tests fonctionnels

Maintenant que nous avons mis en place des tests unitaires, il est temps de mettre en place les _tests fonctionnels_. Ce type de test va tester des fonctionnalités plutôt que des méthodes.

Une bonne pratique que j'ai appris en développant avec le _framework_ Ruby on Rails est de tester le comportement des contrôleurs. C'est très facile car il suffit d'appeler un _endpoint_ avec des paramètres et de vérifier le résultat. Ainsi par exemple, si j'envoie une requête de Type `GET` sur la route `/users` je dois m'attendre à recevoir une liste d'utilisateur. La librairie https://www.npmjs.com/package/supertest[supertest] nous permet de faire cela sans même démarrer le serveur.

Installons donc cette librairie:

```bash
npm install supertest @types/supertest --save-dev
```

Maintenant créons notre agent qui sera utilisé dans tous nos tests:

```ts
// src/tests/supertest.utils.ts
import supertest, {SuperTest, Test} from "supertest";
import {server} from "../core/server";

export const agent: SuperTest<Test> = supertest(server.build());
```

Et maintenant commençons pas créer notre premier test pour la méthode `index` par exemple:

```ts
// src/controllers/users.controller.spec.ts
import {container} from "../core/container.core";
import {TYPES} from "../core/types.core";
import {UserRepository} from "../entities/user.entity";
import {agent} from "../tests/supertest.utils";

describe("UsersController", () => {
  let userRepository: UserRepository;

  describe("index", () => {
    it("should respond 200", (done) => {
      agent.get("/users").expect(200, done);
    });
  });
});
```

Le test est vraiment très simple et la syntaxe de `supertest` rend le test très lisible. Ce test veut dire "envoie une requête HTTP de type `Get` et attends toi à recevoir une réponse de type `200`". Essayons de lancer les tests

```sh
npm test
...
  UsersController
    index
      ✓ should respond 200
...
```

NOTE: les requêtes SQL de TypeORM sont peut être loggé chez vous car nous avons laissé la directive `TYPEORM_LOGGING=true`. Vous pouvez la passer à `false` pour ne plus les voir.

Maintenant voici le même tests pour `create`. Celui-ci est différent car il envoie des paramètres HTTP.

```ts
// src/controllers/users.controller.spec.ts
// ...
describe("UsersController", () => {
  let userRepository: UserRepository;
  // ..
  describe("create", () => {
    it("should create user", (done) => {
      const email = `${new Date().getTime()}@test.io`;
      agent.post("/users").send({email, password: "toto"}).expect(201, done);
    });

    it("should not create user with missing email", (done) => {
      const email = `${new Date().getTime()}@test.io`;
      agent.post("/users").send({email}).expect(400, done);
    });
  });
});
```

NOTE: `new Date().getTime()` renvoie un `Number` du nombre de millisecondes écoulées depuis le 01/01/1970. Je l'utilise afin d'avoir un nombre unique. Nous verrons plus loins comment améliorer cela.

Ici nous testons deux choses:

1. si l'on envoie les bonnes informations, on doit avoir un retour de type `200`
2. si l'on ne spécifie pas de mot de passe, on doit avoir un retour de type `400`

Ce test est très simple et vous pouvez en rajouter d'autres comme _"should not create user with invalid email"_ par exemple. Ces tests sont faciles à mettre en place et _valident un comportement global_.

Vous pouvez maintenant commiter les changements:

```sh
git add && git commit -m "Add functional tests"
```

## Conclusion

Et voilà, ce tutoriel touche à sa fin.

J'espère que cet article aura permit de démystifier un peu l'injection de dépendance et/ou que vous aurez appris des choses ici.
