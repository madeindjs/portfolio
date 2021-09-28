---
title: Authentification Google OAuth avec cURL
description: Ce tutoriel montre comment obtenir et régénérer un jeton d'authentification Google en ligne de commande.
layout: post
date: 2020-10-28 20:00:00 +0200
tags: [google, oauth, curl]
categories: programming
lang: fr
---

Ce billet a pour but de vous montrer (et m'aider à me souvenir) comment utiliser [Google OAuth](https://oauth.net/) sans librairies en 3 étapes :

1. obtenir un _token_ `code` directement via le navigateur
2. utilisez `cURL` pour obtenir un `access_token` valide
3. utiliser `cURL` à nouveau pour échanger `refresh_token` contre un tout nouveau `access_token` sans interaction de l'utilisateur

Bien qu'il existe de [nombreuses bibliothèques](https://developers.google.com/identity/protocols/oauth2#libraries) pour le faire, je vais vous montrer comment faire une requête OAuth en utilisant uniquement les outils en ligne de commande (cURL, Bash, etc...). Cela m'a aidé à comprendre le fonctionnement d'OAuth et vous permettra de reproduire cet exemple complet sur n'importe quel environnement.

Je n'expliquerai pas comment fonctionne Oauth car [de nombreuses ressources existent](https://duckduckgo.com/?q=oauth+expliqué). Je suppose donc que vous avez quelques bases sur le fonctionnement de Oauth. Vous êtes prêts ?

Je commence à définir quelques variables Bash pour les utiliser pendant cette session (cela fonctionnera aussi avec ZSH) :

```bash
# client id and secret obtained from Google API Console: https://console.developers.google.com/apis/credentials
export G_CLIENT_ID="xxxx-xxxx.apps.googleusercontent.com"
export G_CLIENT_SECRET="EW_iOOxxxx"
# redirect URL. You do not need any webserver for now because this will only allow us to copy the redirection URL provided by Google
export G_REDIRECT="http://localhost"
# Scope, that means actions you'll be able to make with obtained token (this is a space separated list)
export G_SCOPE="https://www.googleapis.com/auth/webmasters.readonly"
```

Ouvrez maintenant un onglet avec votre navigateur pour vous connecter à votre compte Google :

```bash
firefox "https://accounts.google.com/o/oauth2/auth?client_id=$G_CLIENT_ID&redirect_uri=$G_REDIRECT&scope=$G_SCOPE&response_type=code&access_type=offline"
```

Google redirige l'utilisateur dès que vous acceptez le condition. Copiez rapidement l'URL de redirection et extrayez les paramètres HTTP du `code` tel quel et exportez-les dans une session Bash :

```bash
export G_CODE="4/5gxxxx"
```

Ce `code` nous permet uniquement d'obtenir un `access_token` et un `refresh_token` une fois avec cette commande cURL :

```bash
curl https://accounts.google.com/o/oauth2/token \
  -d code=$G_CODE \
  -d client_id=$G_CLIENT_ID \
  -d client_secret=$G_CLIENT_SECRET \
  -d redirect_uri=$G_REDIRECT \
  -d access_type=offline \
  -d grant_type=authorization_code
```

Vous devriez obtenir quelque chose de ce genre :

```json
{
  "access_token": "ya29.a0xxxx-xxxxx",
  "expires_in": 3599,
  "refresh_token": "1//03rWf_xxxx",
  "scope": "https://www.googleapis.com/auth/webmasters.readonly",
  "token_type": "Bearer"
}
```

Quelques notes à propos de ce qui vient de ce passer :

1. Google ne vous enverra cette réponse qu'une seule fois. Si vous relancez cette commande, vous obtiendrez [une difficile à interpreter: `invalid_grant`](https://blog.timekit.io/google-oauth-invalid-grant-nightmare-and-how-to-fix-it-9f4efaf1da35).
2. Il se peut que vous ne receviez pas de `refresh_token`. En effet, il n'est fourni que lors de la **première autorisation** de l'utilisateur. Si c'est le cas, allez à la page [pour gérer les accès tiers à votre compte Google](https://myaccount.google.com/permissions) et supprimez l'accès à votre application. Ensuite reprenez tout depuis le début

Très bien, exportons la valeur et validons le jeton :

```bash
export G_ACCESS_TOKEN="ya29.a0xxxx"
export G_REFRESH_TOKEN="1//03rWf_xxxx"
```

```bash
curl -H "Authorization: Bearer $G_ACCESS_TOKEN" https://www.googleapis.com/oauth2/v3/tokeninfo
```

Vous devriez avoir une réponse de ce type :

```json
{
  "azp": "659549366751-xxxx.apps.googleusercontent.com",
  "aud": "659549366751-xxxx.apps.googleusercontent.com",
  "scope": "https://www.googleapis.com/auth/webmasters.readonly",
  "exp": "1603813145",
  "expires_in": "3162",
  "access_type": "offline"
}
```

Essayons maintenant d'échanger le `refresh_token` pour obtenir un tout nouveau `access_token` avec cette commande cURL :

```bash
curl https://accounts.google.com/o/oauth2/token \
  --request POST \
  -d client_id=$G_CLIENT_ID \
  -d client_secret=$G_CLIENT_SECRET \
  -d refresh_token=$G_REFRESH_TOKEN \
  -d grant_type=refresh_token
```

Si ça a fonctionné, vous devriez obtenir une réponse de ce type.

So you'll obtain a response like this :

```json
{
  "access_token": "ya29.a0xxxx-xxxxx",
  "expires_in": 3599,
  "scope": "https://www.googleapis.com/auth/webmasters.readonly",
  "token_type": "Bearer"
}
```

Et voilà !

## Links

- [Curl bash script for getting a Google Oauth2 Access token](https://gist.github.com/LindaLawton/cff75182aac5fa42930a09f58b63a309#file-googleauthenticationcurl-sh)
- [Using OAuth 2.0 to Access Google APIs - Google Identity Platform](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In JavaScript client reference](https://developers.google.com/identity/sign-in/web/reference#googleauthgrantofflineaccessoptions)
- [Using OAuth 2.0 for Web Server Applications - Google Identity Platform](https://developers.google.com/identity/protocols/oauth2/web-server#obtainingaccesstokens)
- [OAuth 2.0 protocol](https://tools.ietf.org/html/rfc6749)
- [Google OAuth “invalid_grant” nightmare — and how to fix it](https://blog.timekit.io/google-oauth-invalid-grant-nightmare-and-how-to-fix-it-9f4efaf1da35)
