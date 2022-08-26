---
title: Mettre à jour un Package Pypi
description: Tutoriel pour mettre à jour un package sur Pypi
date: 2017-09-19 11:23:00 +0200
tags: [python, pipy]
categories: programming
comments: true
lang: fr
---

Récemment j'ai reçu un Pull request qui incrémentait la version d'un [vieux package Python que j'avais crée](https://github.com/madeindjs/Super-Markdown). Je l'ai accepté en deux minutes sur Github mais impossible de le mettre à jour sur Pypi!

Après quelques recherches, voici la procédure à suivre.

## Cloner le projet et installer les dépendances

```bash
git clone https://github.com/madeindjs/super-markdown.git
cd super-markdown
pip install -r requirements.txt
python setup.py install
```

## configuration pour Pypi

```bash
vi ~/.pypirc
```

```ini
[distutils]
index-servers = pypi
[pypi]
repository=https://upload.pypi.org/legacy/
username=your_username
password=your_password
```

On n'oublie pas de mettre les droit en lecture / ecriture uniquement pour l'utilisateur courant:

```bash
chmod 600 ~/.pypirc
```

## envoie du packet

On se connecte via la ligne de commande

```bash
python setup.py register
```

Et on envoie le packet

```bash
python setup.py sdist upload
```

Et le tour est joué.
