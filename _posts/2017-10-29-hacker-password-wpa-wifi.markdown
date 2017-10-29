

Le principe est le suivant:

* **Analyse** du wifi cible
* **Capture** un **WPA handshake** *(une connexion au réseau Wifi)*
* **Attaque** du Wifi par *bruteforce*

La première étape est de mettre en place  **airmong-ng**. Pour cela on va devoir activer le **mode moniteur** de notre carte réseau. Pour cela on liste les cartes réseaux disponnibles.

```bash
# airmon-ng
```

> Si vous n'en n'avez pas, il faut vous en acheter une *(un dongle USB wifi suffit)*

Dans notre cas on voit que l'on peut utiliser notre carte réseau **wlan0**. On active donc le **mode moniteur**.

```bash
# airmon-ng start wlan0
```

A partir d'ici, la carte réseau **wlan0** n'est plus disponnible *(ne rechargez pas votre navigateur)*, et une nouvelle carte réseau apparait. On peut la retrouver en faisant un `ifconfig`. Dans mon cas, il s'agit de **wlan0mon**.

## Analyse du Wifi

 On peut donc analyser les réseaux qui se trouvent autour de nous.

```bash
# airdump-ng wlan0mon
```
Cette commande va trouver des informations supplémentaires sur les wifi dont:

* le **BSSID**, l'adresse MAC du routeur
* le **CH**annel
* l' **AUTH**, le mode d'authentification
* le **ESSID**, le nom du routeur

Parmis toutes les lignes, mon résau apparait. Pensez à noter les information car elles nous seront utiles.

## Capture d'un WPA handshake

Un **WPA handshake** se déroule lors de la connexion d'un péripérique sur le Wifi. Notre but est d'en capturer un. Pour cela nous allons:

1. scanner le wifi pour trouver les périphériques
2. déconnecter un péripérique et attendre qu'il se reconnecte automatiquement

### Scan du Wifi

On scan donc le réseau avec la commande `airdump-ng` et les options:

* `-c` pour spécifier le channel
* `--bssid` 18:D6:C7:85:7E:A0 
* `-w` le répertoire ou seront stocké les fichiers d'output

```bash
# airdump-ng -c 10 --bssid 18:D6:C7:85:7E:A0 wlan0mon
```


[ce dictionnaire WPA/WPA2](http://www.wirelesshack.org/wpa-wpa2-word-list-dictionaries.html) ou [là](http://www.4shared.com/rar/T-JIVEdyce/BIG-WPA-LIST-1.html)





