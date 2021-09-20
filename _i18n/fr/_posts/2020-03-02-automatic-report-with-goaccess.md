---
title: Rapport automatisé par mail avec GoAccess
description: Envoyer des statistiques de ton site en respectant la vie privée de tes utilisateurs avec GoAccess.
layout: post
date: 2020-03-02 22:20:00 +0200
tags: bash goaccess
categories: devops
---

Chez [iSignif](https://isignif.fr), j'ai [récemment décidé de remplacer Google Analytics par GoAccess](/devops/2019/11/06/go-access.html). Là ou Google Analytics envoie toutes les statistiques de ton site web en temps réel au géant américain, GoAccess analyse le traffic du site en s'appuyant sur les logs du serveur web.

Au delà de respecter la vie privée de nos utilisateurs en évitant d'engrosser les californiens, cela permet aussi de [retirer le popup ultra-énervant pour accepter les cookies](https://www.cnil.fr/fr/cookies-traceurs-que-dit-la-loi). Cela contribue donc très certainement à faire d'internet un lieu plus sympa. Rien que ça!

Le seul inconvénient est que cela repose sur une action manuelle qui n'est pas réalisable par un moldus.

Je me suis donc posé afin d'automatiser tout ça en faisant un mail automatique qui envoie tous les jour le rapport d'utilisation de iSignif. Voici un exemple:

> Bonjour la team,
>
> Aujourd'hui il y a eu 1784 visiteurs. L'heure ou il y a eu le plus de traffic a été 17 heures. Sans surprise, la page la plus visitée a été https://isignif.fr/. Il y a eu 0.09% de requêtes qui on terminée en erreur 500.
>
> Les nom de domaines suivants non on amené du traffic:
>
> - rousseau-alexandre.fr : 207 requêtes
> - www.linkedin.com : 207 requêtes
> - www.qwant.com : 69 requêtes
> - www.google.co.za : 69 requêtes
>
> A demain.

Ça t'intéresse de faire la même chose ? Suis moi.

## Récupérer le Dashboard et l'envoyer par mail

La première chose facile à faire consiste à utiliser [GoAccess][goaccess] pour exporter le Dashboard au format HTML puis de se l'envoyer par mail avec la commande [`mail`](https://mailutils.org/) de Linux.

Tout cela se fait hyper facilement avec un script Bash qui:

1. concatène tous les logs de Apache en un seul gros fichier
2. utilise GoAccess pour générer le rapport au fichier HTML
3. envoie par mail l'export en pièce jointe

Cela donne donc ça:

```bash
# !/bin/bash

# concat logs
touch /tmp/complete_isignif_fr_access.log
cat /var/log/apache2/isignif_fr_access*.log >> /tmp/complete_isignif_fr_access.log
gzip -d /var/log/apache2/isignif_fr_access.log.*.gz --stdout >> /tmp/complete_isignif_fr_access.log

# generate HTML report
goaccess /tmp/complete_isignif_fr_access.log -o /tmp/goaccess_report.html

# send email
mail -s "Rapport d'utilisation de iSignif" support@isignif.fr -A /tmp/goaccess_report.html
```

> La commande [`mail`](https://mailutils.org/) fait référence à GNU Mailutils qui est disponible par défault dans les distribution Linux. Si ce n'est pas le cas, un petit `sudo apt install mailutils` fait l'affaire.

J'ai mis le script dans `/home/isignif/goaccess_report.sh` et il suffit ensuite de définir le CRON qui va bien. Pour le rajouter, il suffit d'utiliser la commande `crontab -e` et de coller la ligne suivante.

```bash
0 19 * * * /bin/bash /home/isignif/goaccess_report.sh
```

Et voilà, tous les jours à 19h on reçoit un petit mail avec le Dashboard de GoAccess en pièce joint.

## Un mail récapitulatif pour la journée

C'est top mais tous les jours il faut prendre le temps d'ouvrir le Dashboard et de le regarder, l'interpréter, etc.. Bref, on peut faire mieux.

GoAccess permet d'exporter les résultats au format JSON. Qui dit JSON, dit utilisable par un script. Je me suis dit que je pouvait rédiger le mail qui récapitule la journée en utilisant les données extraite dans le rapport au format JSON.

### Configurer les Logs de Apache2

Vu qu'on veut des statistiques par jour, on veut les logs d'apache découpés par jours (et non par taille comme le fait Apache2 par défault).

Apache gère ça nativement et c'est très simple.

```bash
sudo vim /etc/apache2/sites-enabled/isignif.fr.conf
```

```conf
CustomLog "|/usr/bin/rotatelogs -f /var/log/apache2/isignif.access.%Y-%m-%d.log 86400" combined
```

Donc pour avoir le rapport GoAccess du jour au format JSON, ce petit snippet suffit:

```bash
TODAY=$(date '+%Y-%m-%d')
goaccess "/var/log/apache2/isignif.access.${TODAY}.log" -o /tmp/daily_goaccess_report.json
```

Fantastique. Essayons de lire un peu ce fichier.

### Parser les résultats JSON avec `jq`

Afin de garder les choses les plus simples possibles, je me suis limité sur les choix des technos et j'ai préféré rester dans l'esprit UNIX, c'est à dire un outil pour chaque chose. J'ai donc choisis la librairie `jq`. Il s'installe avec:

```bash
sudo apt install jq
```

`jq` permet de parser un fichier JSON et de récupérer une valeur~dedans. Voici un petit exemple:

```bash
echo '{ "email": { "subject": "Hllo", "content": "Lorem ipsum" } }' | jq '.email.subject'
"Hllo"
```

Le résultat est étonnamment lisible et maintenable.`jq` s'utilise aussi parfaitement dans un script BASH et s'installe hyper facilement. C'est donc le parfait outil.

> Je passe un petit peu vite sur comment l'utiliser car [la documentation](https://stedolan.github.io/jq/manual/) le fait très bien donc [Read The Fucking Manual](http://readthefuckingmanual.com/).

Pour mon cas, j'ai trouvé les informations suivantes utiles:

- le nombre de visiteur du jour

```bash
cat /tmp/daily_goaccess_report.json | jq '.general.unique_visitors'
```

- L'heure ou l'affluence a été la plus forte

```bash
cat /tmp/daily_goaccess_report.json | jq '.visit_time.data | max_by(.visitors.percents) | .data'
```

- Le pourcentage de requêtes qui termine en erreur 500:

```bash
cat /tmp/daily_goaccess_report.json | jq '.status_codes[][] | select(.data == "5xx Server Error") | .hits.percent' 2> /dev/null
```

Je te laisse en trouver d'autres.

### La redaction du mail

Il suffit ensuite de mettre à Bash pour créer le corps du mail. On stock tout dans des variable et on construit notre message qu'on envoie par mail:

```bash
# ...

# generate daily JSON report
TODAY=$(date '+%Y-%m-%d')
goaccess "/var/log/apache2/isignif.access.${TODAY}.log" -o /tmp/daily_goaccess_report.json

# parsing daily JSON report
VISITORS=$(cat /tmp/daily_goaccess_report.json | jq '.general.unique_visitors')
RUSH_HOUR=$(cat /tmp/daily_goaccess_report.json | jq '.visit_time.data | max_by(.visitors.percents) | .data' | sed 's/"//g')
PERCENTAGE_500=$(cat /tmp/daily_goaccess_report.json | jq '.status_codes[][] | select(.data == "5xx Server Error") | .hits.percent' 2> /dev/null)
MOST_VIEWED_PAGE=$(cat /tmp/daily_goaccess_report.json | jq '.requests.data | max_by(.hits.count) | .data' | sed 's/"//g')
REFERRING_SITES=$(cat /tmp/daily_goaccess_report.json | jq '.referring_sites.data | sort_by(.hits.count) | reverse | .[] | "- \(.data) : \(.hits.count) requetes"' | sed 's/"//g')

# send email
cat <<EOF |
Bonjour la team,

Aujourd'hui il y a eu ${VISITORS} visiteurs. Ca a été le rush à ${RUSH_HOUR} heures (pensez y pour la com'). Sans surprise, la page la plus visitee a ete https://isignif${MOST_VIEWED_PAGE}. Il y a eu 0${PERCENTAGE_500}% de requetes qui ont terminees en erreur.

Les nom de domaines suivants nous ont amene du traffic:

${REFERRING_SITES}

A demain.
EOF
mail -s "Rapport de iSignif du ${TODAY}" support@isignif.fr
```

Et voilà. Le script final est [disponible sur mon Github](https://gist.github.com/madeindjs/bb56776947c84ff993eab86e32ceadb9).

## Conclusion

C'est plus compliqué mais complètement possible. Alors pourquoi c'est cool ? Plusieurs raisons :

1. Parce que c'est ton script et que c'est toi qui l'a fait
2. Cela fait apprend à maîtriser son serveur web
3. Tu ne dépend pas d'un service tiers de plus qui va siphonner tes donnés et celle de tes utilisateurs
4. C'est entièrement _customisable_

## Liens

- <https://stackoverflow.com/questions/17359/how-do-i-send-a-file-as-an-email-attachment-using-linux-command-line/9524359#9524359>
- <https://easyengine.io/tutorials/linux/ubuntu-postfix-gmail-smtp/>
- <https://clients.javapipe.com/knowledgebase/132/How-to-Test-Sendmail-From-Command-Line-on-Linux.html>
- <https://blog.lecacheur.com/2016/02/16/jq-manipuler-du-json-en-shell/>
- <https://cameronnokes.com/blog/working-with-json-in-bash-using-jq/>
- <https://serverfault.com/questions/27119/how-to-have-daily-error-and-access-logs-on-apache-for-windows>

[goaccess](https://goaccess.io/)
