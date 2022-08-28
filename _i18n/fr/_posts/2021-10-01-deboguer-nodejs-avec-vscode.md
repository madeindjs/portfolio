---
title: Deboguer un script Node.js / Typescript avec Visual Studio Code
description: Voici toutes les configuration VSCode que j'ai du faire pour configurer le deboggeur de VSCode avec Node.js
date: 2021-10-01 16:00:00 +0200
tags:
  - nodejs
  - typescript
  - docker
  - vscode
lang: fr
image: /img/blog/debugging-using-console-log.png
---

Je galère toujours à utiliser le débogueur de VSCode lorsque je souhaite mettre des points d'arrêts dans un script ou une application Node.js. Dans certains cas je finis même par mettre des `console.log`.

Je me suis donc fait ce post qui donne la configuration pour les cas que j'ai rencontrés.

## Node.js

Le cas ou tu as juste Node.js et c'est tout. Admettons que tu ais un script nommé `./src/index.js`

### Attach

Lancer le script avec la commande

```bash
node --inspect src/index.js
```

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Node.js - Attach",
      "port": 9229,
      "request": "attach",
      "cwd": "${workspaceRoot}",
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**"],
      "type": "node"
    }
  ]
}
```

### Launch

En utilisant VSCode pour lancer le script:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Node.js - Run & Debug",
      "args": ["${workspaceFolder}/src/index.js"],
      "sourceMaps": true,
      "cwd": "${workspaceRoot}",
      "protocol": "inspector"
    }
  ]
}
```

## Node.js avec Docker

Le container doit donner le flag `--inspect=0.0.0.0:9229` à node:

```yml
# docker-compose.yml
version: "3.3"
services:
  node:
    image: node:16-slim
    working_dir: /usr/src/app
    command: node --inspect=0.0.0.0:9229 src/index.js
    volumes:
      - ./:/usr/src/app
    ports:
      - 9229:9229
```

La configuration VSCode doit spécifier `localRoot` et `remoteRoot` pour faire le mapping entre les fichier distant et les fichier locaux.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Node.js & Docker - Attach",
      "port": 9229,
      "request": "attach",
      "cwd": "${workspaceRoot}",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/usr/src/app",
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**"],
      "type": "node"
    }
  ]
}
```

## Typescript avec `ts-node`

Compliquons les choses avec Typescript:

```bash
npm init -y
npm install --save-dev ts-node typescript
npx tsc --init
```

### Attach

```bash
node -r ts-node/register --inspect src/index.ts
```

Le reste est iddentique à l'exemple avec Node.js

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ts-node - Attach",
      "port": 9229,
      "request": "attach",
      "cwd": "${workspaceRoot}",
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**"],
      "type": "node"
    }
  ]
}
```

### Launch

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ts-node - Launch & debug",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["-r", "ts-node/register"],
      "runtimeExecutable": "node",
      "args": ["--inspect", "${workspaceFolder}/src/index.ts"],
      "cwd": "${workspaceRoot}",
      "skipFiles": ["<node_internals>/**", "node_modules/**"]
    }
  ]
}
```

## Typescript avec `ts-node` dans un container Docker

Il suffit de copier la commande précedente dans la définition du `docker-compose`

```yml
# docker-compose.yml
version: "3.3"
services:
  ts-node:
    image: node:16-slim
    working_dir: /usr/src/app
    command: node -r ts-node/register --inspect=0.0.0.0:9229 src/index.ts
    volumes:
      - ./:/usr/src/app
    ports:
      - 9229:9229
```

Et la configuration est similaire au précedent exemple avec Docker

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ts-node & Docker - Attach",
      "port": 9229,
      "request": "attach",
      "cwd": "${workspaceRoot}",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/usr/src/app",
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**"],
      "type": "node"
    }
  ]
}
```
