
~~~bash
$ sudo prosodyctl adduser user@domain.com
~~~

## Extrieur

[shaula/rpi-prosody: Prosody XMPP server for Raspberry Pi](https://github.com/shaula/rpi-prosody)

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
