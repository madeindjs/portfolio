Je viens d'implementer une fonctionnalité qui s'appuie sur [Mistral][mistral] afin d'automatiser un formulaire sur mon SAAS [iSignif][isignif]. Et je vous promet qu'il ne s'agit pas simplement d'un Chatbot ou d'un serveur MCP.

J'ai été inspiré par cette vidéo _"Ne vous contentez pas de mettre en place un chatbot : construisez une IA qui fonctionne avant que vous ne le demandiez"_.

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/2cEGQEllBGc?si=BJkFXg9Gkv7oWoPL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Très bien, mais qu'est ce qu'on peut faire avec l'IA au fait ?

## Le cas d'usage

J'ai créé [iSignif.fr](https://isignif.fr) il y quelques années pour automatiser le processus de signification entre les avocats et les huissiers de justice. Le processus est le suivant:

1. un avocat dépose un acte, qui regroupe: un document PDF qui devra être remis en main propre par un huissier de justice à plusieurs destinataire
2. iSIgnif assigne un huissier de justice en fonction du code postal ou la demande doit être remise
3. l'huissier de justice est contacté et prend en charge la demande

Tout fonctionne très bien, mais la première étape est manuelle: l'avocat doit remplir un formulaire, renseigner les destinataire et charger ses fichiers. C'est un peut redondant car toutesses informations sont déjà présente sur le PDF qui est chargé sur [iSignif][isignif].

![Formulaire de création d'un acte sur iSignif](../../../assets/img/blog/isignif-act-new.png)

Peut-être que vous me voyez venir, mais les outils LLM peuvent très bien faire ce travail à la place de l'utilisateur.

Donc mon idée était de mettre en place une petite API qui va simplement recevoir le PDF, extraire les informations, et appeler l'[API d'iSignif][isignifSwagger] afin de créer la acte et les significations.

J'ai directement pensé à [Mistral][mistral] qui est un leader français / européen dans l'inteligence artificielle et les modèle de langues (LLM). Je l'ai choisi car

- c'est une entreprise française et cela rassure les utilisateur sur le traitement de leur données
- il possède [une librairie JavaScript][mistralNpm] qui permet de tout faire
- les prix sont très abordables

## Proof of concept

Avant de me lancer dans quelque chose de compliqué, je me suis dit que j'allais commencer par mettre en place un simple script qui devra prendre un fichier et faire les appels API à `isignif.fr/api/v1`.

Le script se décompose en trois étapes:

1. extraire le contenu du document de l'utilisateur. Je vais utiliser une API de _Reconnaissance optique de caractères_ (OCR) afin de convertir le document en text
2. envoyer le contenu du document avec un _prompt_ pour récupérer les information dans un format donné
3. appeler l'[API d'iSignif][isignifSwagger]

### 1 - Extraire le contenu du document

Extraire les information d'un document porte un nom: _Reconnaissance optique de caractères_ (OCR). Il s'agit de l'action de reconnaitre les charactère d'un document, ou d'extraire le texte encodé, et de renvoyer le contenu formaté.

[Mistral][mistralOcr] permet de faire ça

### 2 - Extraire les informations du document

### 3 - Connecter à l'API d'iSignif

## Mise en place d'une HTTP API

[mistral]: https://mistral.ai
[mistralNpm]: https://www.npmjs.com/package/@mistralai/mistralai
[mistralOcr]: https://docs.mistral.ai/capabilities/document/
[mistralJsonOut]: https://docs.mistral.ai/capabilities/structured-output/json_mode/
[isignif]: https://isignif.fr
[isignifSwagger]: https://isignif.fr/docs/openapi
