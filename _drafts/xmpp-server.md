---
title: Mettre en place un serveur XMPP sur un Raspberry PI
---

TODO: expliquer XMPP

TODO: expliquer Prosody

```bash
sudo apt-get install prosody
```

Générer un certificat pour chiffrer les connexions:

```bash
sudo prosodyctl cert generate rousseau-alexandre.fr
```

```lua
-- /etc/prosody/prosody.cfg.lua

VirtualHost rousseau-alexandre.fr"
ssl = {
        key = "/var/lib/prosody/rousseau-alexandre.fr.key";
        certificate = "/var/lib/prosody/rousseau-alexandre.fr.crt";
}
```

Ajouter un utilisateur:

```bash
sudo prosodyctl adduser alexandre@rousseau-alexandre.fr
```

## Extrieur

The following ports are exposed:

- 5000: proxy65 port used for file sharing
- 5222: c2s port (client to server)
- 5269: s2s port (server to server)
- 5347: XMPP component port
- 5280: BOSH / websocket port
- 5281: Secure BOSH / websocket port

Now foreward ports `5222` and `5269` on your router (Go ahead and foreward `5280` and `5281` as well if you want to upload and store files on your server).

## Links

- https://jacksonjs.github.io/2016/09/09/prosodyonpi/
- https://samhobbs.co.uk/2016/09/installing-prosody-instant-message-chat-server-raspberry-pi-ubuntu
- https://homebrewserver.club/configuring-a-modern-xmpp-server.html
- https://github.com/shaula/rpi-prosody

[prosody]: https://prosody.im
