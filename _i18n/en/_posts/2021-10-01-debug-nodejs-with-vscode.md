---
title: Debug a Node.js / Typescript with Visual Studio Code
description: Here all VSCode configuration that I set to configurate VScode debugger with Node.js
date: 2021-10-01 16:00:00 +0200
tags:
  - nodejs
  - typescript
  - docker
  - vscode
lang: en
image: /img/blog/debugging-using-console-log.png
---

I always have trouble using the VSCode debugger when I want to put breakpoints in a script or a Node.js application. In some cases I even end up putting `console.log`.

So I made this post which gives the configuration for the cases I encountered.

## Node.js

The case where you just have Node.js and that's it. Let's say you have a script named `./src/index.js`.`

### Attach

Run your script with

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

Use VScode to run script

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

## Node.js with Docker

The container must give `--inspect=0.0.0.0:9229` flag to node:

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

The VSCode configuration must specify `localRoot` and `remoteRoot` to map between remote and local files.

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

## Typescript with `ts-node`

Let's complicate stuffs with Typescript:

```bash
npm init -y
npm install --save-dev ts-node typescript
npx tsc --init
```

### Attach

```bash
node -r ts-node/register --inspect src/index.ts
```

The rest is identical to the example with Node.js

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

## Typescript with `ts-node` inside a Docker container

Just copy the above command into the docker-compose definition

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

And the configuration is similar to the previous example with Docker

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
