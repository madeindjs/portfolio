---
title: Google OAuth with cURL
description: This tutorial show you how to use cURl to get a Google access_token and refresh it.

date: 2020-10-28 20:00:00 +0200
tags: [google, oauth, curl]
categories: programming
lang: en
---

This post purpose is to show you how (and help me to remember) how to use [Google OAuth](https://oauth.net/) without library. So I made theses steps :

1. obtain a `code` token from browser
2. use `cURL` to get a valid `access_token`
3. use `cURL` again to exchange `refresh_token` to a brand new `access_token` without user interaction

Although [it exists many client libraries](https://developers.google.com/identity/protocols/oauth2#libraries) to do so, I will show you how to make an OAuth request using command line tools only (cURL, Bash, etc..) without library. This helped me to understood OAuth workflow and it will allow you to reproduce this complete example on any environment.

I do not explain how Oauth works because [many ressources exist](https://duckduckgo.com/?q=oauth+explained). So I suppose you have some basis about Oauth workflow. Ready ?

I begin to set some Bash variables to use them during this session (this will also work with ZSH) :

```bash
# client id and secret obtained from Google API Console: https://console.developers.google.com/apis/credentials
export G_CLIENT_ID="xxxx-xxxx.apps.googleusercontent.com"
export G_CLIENT_SECRET="EW_iOOxxxx"
# redirect URL. You do not need any webserver for now because this will only allow us to copy the redirection URL provided by Google
export G_REDIRECT="http://localhost"
# Scope, that means actions you'll be able to make with obtained token (this is a space separated list)
export G_SCOPE="https://www.googleapis.com/auth/webmasters.readonly"
```

Now open a tab with your browser to connect with your Google Account. Google will ask you to select a Google user :

```bash
firefox "https://accounts.google.com/o/oauth2/auth?client_id=$G_CLIENT_ID&redirect_uri=$G_REDIRECT&scope=$G_SCOPE&response_type=code&access_type=offline"
```

Google redirect once you accept scope. Quickly copy redirect URL and extract `code` HTTP params as is and export in Bash session :

```bash
export G_CODE="4/5gxxxx"
```

This `code` allow us to obtain an `access_token`. You can't use it to now to have access of specified scope. So let's obtain an `access_token` with this cURL command :

```bash
curl https://accounts.google.com/o/oauth2/token \
  -d code=$G_CODE \
  -d client_id=$G_CLIENT_ID \
  -d client_secret=$G_CLIENT_SECRET \
  -d redirect_uri=$G_REDIRECT \
  -d access_type=offline \
  -d grant_type=authorization_code
```

You may obtain something like this:

```json
{
  "access_token": "ya29.a0xxxx-xxxxx",
  "expires_in": 3599,
  "refresh_token": "1//03rWf_xxxx",
  "scope": "https://www.googleapis.com/auth/webmasters.readonly",
  "token_type": "Bearer"
}
```

Some note about this command and result :

1. Google will only send you this answer **once**. If you re-run this command you'll get [a tedious `invalid_grant` error](https://blog.timekit.io/google-oauth-invalid-grant-nightmare-and-how-to-fix-it-9f4efaf1da35).
2. You may not receive `refresh_token` in this response. The `refresh_token` is only provided on the **first authorization** from the user. If so go to the page [showing Apps with access to your account](https://myaccount.google.com/permissions) and remove access of your application. The retry previous steps

Alright, let's export value and validate token :

```bash
export G_ACCESS_TOKEN="ya29.a0xxxx"
export G_REFRESH_TOKEN="1//03rWf_xxxx"
```

```bash
curl -H "Authorization: Bearer $G_ACCESS_TOKEN" https://www.googleapis.com/oauth2/v3/tokeninfo
```

You may obtain a response like this :

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

So let's try to get a brand new `access_token` using `refresh_token` using this cURL command :

```bash
curl https://accounts.google.com/o/oauth2/token \
  --request POST \
  -d client_id=$G_CLIENT_ID \
  -d client_secret=$G_CLIENT_SECRET \
  -d refresh_token=$G_REFRESH_TOKEN \
  -d grant_type=refresh_token
```

So you'll obtain a response like this :

```json
{
  "access_token": "ya29.a0xxxx-xxxxx",
  "expires_in": 3599,
  "scope": "https://www.googleapis.com/auth/webmasters.readonly",
  "token_type": "Bearer"
}
```

So that's it !

## Links

- [Curl bash script for getting a Google Oauth2 Access token](https://gist.github.com/LindaLawton/cff75182aac5fa42930a09f58b63a309#file-googleauthenticationcurl-sh)
- [Using OAuth 2.0 to Access Google APIs - Google Identity Platform](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In JavaScript client reference](https://developers.google.com/identity/sign-in/web/reference#googleauthgrantofflineaccessoptions)
- [Using OAuth 2.0 for Web Server Applications - Google Identity Platform](https://developers.google.com/identity/protocols/oauth2/web-server#obtainingaccesstokens)
- [OAuth 2.0 protocol](https://tools.ietf.org/html/rfc6749)
- [Google OAuth “invalid_grant” nightmare — and how to fix it](https://blog.timekit.io/google-oauth-invalid-grant-nightmare-and-how-to-fix-it-9f4efaf1da35)
