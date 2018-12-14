---
origin: https://www.tutonics.com/2012/11/gpg-encryption-guide-part-1.html
---

# GPG Encryption Guide - Part 1

Learn how to use military-grade encryption using GPG. This is the first in a series of guides that will teach you about using gpg for both symmetric and asymmetric encryption.

## Introducing GNU Privacy Guard (GPG)

GNU Pirvacy Guard is an implementation of the OpenPGP standard (Pretty Good Privacy). Ubuntu and other Linux distributions already include GNU Privacy Guard via the gpg command.

The gpg command can be used for both symmetric encryption and asymmetric encryption of your files and data (including email). It can also be used to perform digital signatures. If you're not familiar with these concepts then fret not, as we'll explain all the terminology and concepts that you need to know for practical purposes , all in plain English.
We'll then show you how to generate a key pair and how to import and export keys (and explain why you would ever need to do so). So lets crack on and explain some terminology ...

## Symmetric Encryption

Symmetric encryption involves an encryption and decryption process that both use the same key. The key in this case is considered a shared secret, and must be kept private by both the encrypting party and the decrypting party. Examples of algorithms supported by gpg for symmetric encryption are: AES, Blowfish, Twofish, and Triple Des

## Asymmetric Encryption

Asymmetric encryption involves the use of a public key and a private key. As can be guessed from the names, only the private key needs to be kept private. The public key is made available for anybody that wants to encrypt data to send to the owner of the public key. Using the usual names Alice and Bob as examples: If Bob wanted to send an encrypted file or email to Alice, Bob would encrypt the data using Alice's public key then send the data to Alice. Alice can then decrypt the data using her private key that only she has access to. Once Bob has encrypted the data, nobody but Alice can decrypt it. Note that a private key is usually protected by a passphrase, so even on her own Ubuntu box where the key resides, Alice will still need to enter a passphrase to "unlock" the private key.

Bob will have his own public/private key pair so people can send encrypted data to him. So should Alice want to send encrypted data to Bob, she'd encrypt it using Bob's public key whilst Bob could then decrypt it using his own private key. The best asymmetric cryptographic algorithm supported by gpg is called RSA.

## Hashes and Digests

A digest or hash is a one way cryptographic algorithm which when applied to data will produce a specific fixed size output. In other words, you can use a hash function to get the "finger print" of an arbitrary chunk of data. If you are supplied with data and a cryptographic hash for that data, if a fresh recalculation of that hash doesn't match the one supplied, then you know that the data has been tampered with.
Examples of Hashes/Digests supported by gpg are: SHA1, SHA256, and SHA512.

## Digital Signitures

When Alice receives data from Bob, sometimes it is useful for Alice to be certain that the data sent has not been tampered with. In such cases, a cryptographic hash is performed on the data at the sender's side, and encrypted using the senders private key (note that sometimes the data itself isn't required to be encrypted though it could be, either way the signed hash proves that the data came from the sender Bob in this case). Alice can now decrypt the signature using Bob's public key to produce the sent cryptographic hash of the data. Then on Alice's side, the cryptographic hash of the data is recalculated. Should the recalculation match that provided by Bob, this proves that the data was not tampered with and did indeed come from Bob.

## Generating A GPG Key Pair

A key pair is required for asymmetric encryption (and thus digital signing). If you only want to use gpg for symmetric encryption, this process is not required.
To generate a public/private key pair, run the following command:

~~~
    gpg --gen-key
~~~

The screen shot below shows the progression of prompts that will be presented.


As you can see, you'll be prompted about several options along the way.

Firstly you'll need to choose an algorithm, the algorithm default of RSA and RSA is best so use option 1.

The default keysize of 2048 is sufficiently strong, so use that also by hitting return.

Note that choosing a larger (thus even stronger) key size will slow down the encryption/decryption processes. So its a trade off between a key being strong enough vs speed (and a keysize of 2048 is more than strong enough).

The default key expiry (never expires) is also suitable for most people's needs.
You'll then be asked to enter your "Real name", an email address, and a comment (which could just a reminder about what the intended usage of the keys is). You'll then have the opportunity to change these values before proceeding with the gpg key pair creation process.
Once you confirm these values (by entering 'O'), you'll be prompted to enter and re-enter the passphrase (which is used to protect your private key).
Take care when choosing your passphrase: never use dictionary words, and always include a mixture of upper and lower case letters along with some numbers and symbols (and make sure its not a short one!).
After that no more input is required. You'll just have to wait for the keys to be created which may take a couple of minutes if there is not enough random data available as shown in the screenshot below.

## Huh? What Does That Stuff Mean?

Don't worry about the random data generation blurb - its just informational, what is important is that your key has now been generated based on random data.
The last part of the output shown in the screenshot above includes the keypair details. This is how you'll be able to identify your key when required.
If your not familiar with gpg keys, things to take note of at this point are:

1. The real name used: Tutonics
2. The key-id: EE74D48D (actually from the last part of the fingerprint)
3. The key fingerprint: F2C7 C647 717B 0210 66E1 5EBA 92D8 9207 EE74 D48D

Later, you'll be able to refer to the keypair by any of these depending on the context of what you're doing.

### Your Keyrings

With GPG comes the concept of keyrings. You have a public keyring and a private keyring.
Those keys you just generated are now on the restpective keyring. To check what's on your public keyring, run:

~~~
    gpg --list-keys
~~~

or

~~~
    gpg --list-public-keys
~~~

To view the keys on your private (secret) keyring, run:

~~~
    gpg --list-secret-keys
~~~

You can of course just display details for one or more specific keys by simply placing their user name or key-id after the above commands, for example to show the Tutonics public key only, you could use:

~~~
    gpg --list-public-keys Tutonics
~~~

or

~~~
    gpg --list-public-keys EE74D48D
~~~

And to show the Tutonics private key you could use:

~~~
    gpg --list-secret-keys Tutonics
~~~

or

~~~
    gpg --list-secret-keys EE74D48D
~~~

Note that regarding the key pair you just generated, the output of the above list keys commands should be the same (apart from pub vs sec and sub vs ssb). The reason they are the same as they just refer to the identity of the key rather than the actual key itself.

## Letting Others Know Your Public Key

To recap, your public key will be used by others when they want to encrypt data to send to you.
You'll use your private key to decrypt that data.
This is why the private key is so important and must be kept private. Your friend will generate their own key pair. If you want to encrypt data and send it to them, you'll encrypt it using their public key. They'll then decrypt it for themselves using their own private key.
In order for your friends to get your public key, you can:

1. Hand it to them.
2. Email it to them.
3. Place it online (e.g. on your website or blog if you have one).
4. Store your key on a "keyserver" for others to retrieve.

For (1), (2), and (3) first you must export your public key using the `--export` option. However, you'll need to export to a manageable format: (i.e. you shouldn't use the raw binary data which can cause all sorts of issues including not being portable via email).
To solve this, gpg can generate ASCII armored output for you when you use the --armor (or -a) option
So to export, run this command:

~~~
    gpg --armor --export Tutonics > public_key.asc
~~~

Note that the name of the file (public_key.asc) is arbitrary, but informational in this case. You'll now have a copy of your public key. In our case, the contents of the Tutonics public key are shown below:

    -----BEGIN PGP PUBLIC KEY BLOCK-----
    Version: GnuPG v1.4.11 (GNU/Linux)

    mQENBFCRmmsBCADnFZIpbTQtu/eVVjG9cX+YrmjRAGonPKTBnJn/4EgpSYzQUSoe
    HksHNfPIu1nrS15bFBWNDetNyu4AR3xFgDM+6ZTfnNt9VwPPGtqGU4eDyTSamFZ+
    TUzBhYNoRS3UgWhGp6jH6XcDsSFlPCqGcJT8fVlxCsKcjvMJqlX7HBnNMhsNwfJ0
    cCgjYWE5ZNlYykMvPdku4D6dmBQGi8GFRMuaKainHW9g4FRcW3Oe4OPvm8ZxVzJx
    5GMStY3xDe3a89FV7rRuALLGXz4Dn0929ld2MRpNSWS3LM0lGfCfkXykFhT+02JP
    A/aK3xW+AEHu45xW6n9JNAGFSsWNqGVbmVW9ABEBAAG0QlR1dG9uaWNzIChUdXRv
    bmljcyAtIFVidW50dSBUdXRvcmlhbCBXZWJzaXRlKSA8dHV0b25pY3NAZ21haWwu
    Y29tPokBOAQTAQIAIgUCUJGaawIbAwYLCQgHAwIGFQgCCQoLBBYCAwECHgECF4AA
    CgkQktiSB+501I3WEwf/Y1FvYQdsy3csTih4S56ElvOyHv0/DyowIFsM3RNZmDGr
    dK95mXX4d/K3l+AgWeluIYrmbxzf+NTnLOkAH2g4vHYa6j9yk8MdsHeC5jeya4bQ
    MTaJ3O4GcWDV6t5PaqODZIfO4L86JvVEowCLzCJcqhBCMFRqyx56JkZyze+zNLmN
    70Clm6XDo5sF2Sx9DnXdEgS1oeDhyJAdYzjldS9kYWaVNZpn2vaBGqPVhZKGeVOj
    qvp9wiWj+rplITfq9BaqOkUxH9XLKvFcqVXAIsngsSAcvpDwnY5dPHA2Qo0swHKk
    d+3UVpigumNOYvr/+Vpu56AnX0F7elTqvR+IYYqOk7kBDQRQkZprAQgAluonk4VB
    uaAbor04djjY+Jt9YZWGupd3MwHvMRQmVui7JS2VOlF8uCRJJhWnHvGN1mWBxXOs
    VBSQMcWLxcXdQte9aSffSoQwl/1saEzWOe2BJkzlJ64m1FmtHKVWw1OMad1VFwbh
    +DIuR9k9NAJGRKssn4IhEI5qZPjTouu2+MCBEVWWfjRkxC8AirYQJtyghoNSLMKK
    1oDXD2LE5+fvWDPq4lH9EqSVlxgJltptOpkK4H7z7kei88pNdR35qLLFl/zhoGi4
    XrnUDZ7sXefwzYkhQdG9C96GslcvrP5PMjXU3Qpg7+ohUVP33Shz8eiJBmWZddak
    QQ0vpc3JTMb4+QARAQABiQEfBBgBAgAJBQJQkZprAhsMAAoJEJLYkgfudNSNyAcH
    /18Qz977aH8Ph0VCNGP8e3F1v1+YaVVSKTw/M++SGAX3H8eT6HGrFt2SR0WNiA3c
    19FqGXl8d8S2t/PVz0vupK4jMqA3FXK42Qn/enpQbux4ovt1B461QHF8R0rKdO0K
    26jiAg6YtuYPKTipbRk0KExVu9IzDtGQCXCUSA3p8lRa69bS6z/qDqNABTbHoxOl
    yVIB+oKBCyyc/wsDxRFYuqMYWRrHH2pU94flslrRZ3drdCv1y572D0eQQqGL5WpK
    B+u5CqbFagpaRFra3Hn9Kq0zdKxHey0c8AKt6y5WEVLIIStaCbwQ8V7krNWC+z5q
    XDM4B5TmmwLjVcIveQ6J9BU=
    =//JZ
    -----END PGP PUBLIC KEY BLOCK-----

For your friend to use that data with gpg, they'll need to add it to their public keyring by importing it using the --import option:

~~~
    gpg --import public_key.asc
~~~

Sample scenario output is shown in the screenshot below: Note that you would use the same command to import a friends ASCII armored formatted public key into your public keyring:

~~~
    gpg --import my_friends_public_key.asc
~~~

Also, note that when a public key is imported you should sign it as shown next.

## Validate Imported Public Keys By Signing

When you import someone's public key to your keyring, you should validate it by verifying the fingerprint with them (e.g. over the phone). Once your certain that this is their public key, you should sign it.
For example, to sign the Tutonics public key, a user would edit the key by running this command:

~~~
    gpg --edit-key Tutonics
~~~

This will bring you to a gpg command line interface from which you can display the fingerprint using:

~~~
fpr
~~~

Once verified with the owner, you can sign the key using:

~~~
sign
~~~

Then, to double check that it is signed, you can run:

~~~
check
~~~

To exit from gpg cli, enter: "quit" or hit _Ctrl+d_ You will be asked if you want to "Save Changes? (y/N)", enter `y` for this. Now you have validated that public key. The screenshot below shows a user "MyFriend" signing the Tutonics public key. Note that after signing, another call to "check" shows that their signature is now present (right at the bottom of the screenshot).

Backing Up Your Private Key (or Copying for use on your other boxes)

To save a raw data or ascii armored copy of the private key, you can use the --export-secret-keys option, below is a raw data example (include --armor for ascii version):

~~~
    gpg --export-secret-keys key-id > private_key
~~~

So in our case for Tutonics, we'd use:

~~~
    gpg --export-secret-keys EE74D48D > private_key
~~~

As usual you could also use the name:

~~~
    gpg --export-secret-keys Tutonics > private_key
~~~

Note that the exported private key is still protected by the passphrase you used when creating it (Thanks to Veeresh for highlighting this!). To import the private key to your private keyring on another box (or a rebuilt box in the case where your hard drive was lost), you would use the --import option like so:

~~~
    gpg --import private_key
~~~

Again, note that the private key is still protected by the passphrase you used when creating it.

## Using A Keyserver

To store your public key on a key server, use the --keyserver option along with the --send-keys option:

~~~
    gpg --keyserver servername --send-keys key-id
~~~

So for example, we used:

    gpg --keyserver keyserver.ubuntu.com --send-keys EE74D48D

There are other key servers out there, but they talk to each other so it doesn't matter which one you send to.
If someone wants to import that public key from the keyserver, they can use the --recv-keys option like so:

    gpg --keyserver keyserver.ubuntu.com --recv-keys EE74D48D

## Key Revocation

If you think that your public key is no longer valid (e.g. you don't use it anymore or you suspect your private key has been compromised), you can revoke it using a revocation certificate. Taking the key-id of EE74D48D as an example, you can create a revocation certificate using:

  gpg --output revocation_cert.asc --gen-revoke EE74D48D

Note that you cannot create this revocation certificate after you've lost your private key! So it is recommended to create one at the same time that you create the key pair, then keep it in a really safe place. If you had to use this revocation certificate, you would do the following to update your keyring:

    gpg --import revocation_cert.asc

Then run this command to update the keyserver:

    gpg --keyserver keyserver.ubuntu.com --send-keys EE74D48D

## Whats next?

OK, that was a lot of info to soak up. In the next part of the GPG Guide, we'll show you how to use the gpg command for asymmetric encryption.

Thanks to everyone who worked on GNU Privacy Guard (the GNU Projects implementation of the OpenPGP standard)

---

# GPG Encryption Guide - Part 2 (Asymmetric Encryption)

This is the next post in our series of GPG guides. Here, we cover asymmetric encryption and decryption of data using the gpg command.
A Quick Recap

If you don't know what asymmetric encryption or gpg are, or have not yet generated a gpg key pair, or don't you know how to obtain someone else's public key, then please take a look at part 1 of our GPG Guide.

As a quick refresher, asymmetric encryption involves using a public/private key pair. The public key is distributed to people who want to send you encrypted data.
You then use your private key (which nobody else has access to) to decrypt that data.
Asymmetric Encryption

Firstly, ensure that you have the public key for the person you want to encrypt data for. You can double check this by using the command:

    gpg --list-keys

If you have the public key, then you can proceed with the encryption commands, otherwise you'll need to obtain the public key first.

To encrypt a file you can use the -e (or `--encrypt`) option along with the `-r` (or `--recipient`) option, as shown below:

    gpg -e -r key-id|name filename

So if someone wanted to encrypt a file called file.txt for us here at Tutonics, they could use the user name "Tutonics":

    gpg -e -r Tutonics file.txt

or use the key-id "EE74D48D",

    gpg -e -r EE74D48D file.txt

This will produce an ecnrypted file called file.txt.gpg that only the recipient Tutonics can decrypt. If you need to change the name of the resulting encrypted file use the `-o` (or `--output`) option, e.g. to call it file.gpg, you could use:

    gpg -o file.gpg -e -r Tutonics file.txt

Note that if you had not verified the Tutonics public key yet (see GPG Guide Part 1 to find out how), you'll get a warning message to that effect when you try to encrypt data using that public key (this warning is shown in the screenshot below and won't happen if the key is properly verified by you).

## Decryption Of Asymmetrically Encrypted Ciphertext

For the recipient to decrypt the encrypted data created in the steps above, they need to specify the output file using -o and also use the -d (or --decrypt) option.

So to decrypt file.txt.gpg from above, the recipient (and owner of the private key) would execute this command:

    gpg -o file.txt -d file.txt.gpg

The recipient will be prompted to enter the passphrase for their private key.
If the correct passphrase is used, the decryption algorithm will proceed and the original data will be stored in file.txt.
It's quite important to note that if no output file is specified, the decrypted ciphertext i.e. the plaintext (the original data) gets sent to standard out. So unless you pipe it to a file or another program, it will be displayed in your terminal and not stored to file.

## Whats next?

In the next part of the GPG Guide, we'll show you how the encrypting party can use the gpg command to digitally sign data and how the recipient can verify this signature.

Thanks to everyone who worked on GNU Privacy Guard (the GNU Projects implementation of the OpenPGP standard)

---


# gpg Encryption Guide - Part 3 (Digital Signatures)

This GPG guide covers how to digitally sign data in various ways, explains the purpose of digital signatures, and shows how to verify them.

If you don't know much about GPG, it's worth starting with the first part of our GPG Guide which explains a lot of the background information which is required in order to understand what's going on.
The Purpose of Digital Signatures

When a sender uses a public key to encrypt data for a recipient, how is the recipient supposed to know if the sender is actually who they say they are?

The public key is available for anybody to use, so there needs to be a means for that sender to unequivocally prove that the data came from them.
    gpg provides a way to do the above in combination with generating a signature (like a fingerprint) of the data which proves the data has not been tampered with.
The gist of the steps involved for digitally signing (and optionally encrypting) are:

1. The sender also has their own public/private key pair and have previously made their public key available to the recipient.
2. The sender's side will generate a hash (aka digest) of the original data.
3. That hash is then encrypted using the sender's private key and appended to the original data.
4. Then (optionally, as you'll see later) the whole lot can be encrypted using the recipient's public key.
5. At the recipient side (if the step above was carried out), the encrypted digitally signed data is decrypted using the recipient's private key.
6. The digital signature is decrypted using the sender's public key to reveal a hash/digest of the original data (this is the supplied hash or digest).
7. A recalculation of the hash/digest of the original data (without the appended signature) is carried out at the recipient side, if that matches the supplied hash, then the only person that could have sent the data is the real owner of the public key used to sign. Note that the matching hash proves both the integrity of the data and the identity of the owner, thus proving the data is authentic.

A digital signature also provides what is called non-repudiation, i.e. the signer can't claim they didn't sign the data whilst also claiming that their private key remains private.

Though this sort of digital signature is not required every time a sender sends data, in some cases it is vital that the recipient can prove the identity and authenticity of the sent data, in which case a digital signature must be used.

## Using A Signature Without Encryption

If a document, software, or some other data is available for public consumption then there is no need to encrypt it.
In such a case however, there may still be good reason for people to want to prove that the data is authentic (Originates from the specified creator/owner and has not been tampered with). This is where digital signatures can come in handy.

Using a digital signature alone (without encryption) only involves steps 1, 2, 3, 6, and 7.

There are two types of digital signature that gpg can apply. A normal signature, where the raw binary data of the signature is included with the original data. And a clear sign signature where the signature is added as readable text (a base64 ascii-armor signature). Commands to use both of these signature types are described below.

## Using A Clear Sign Digital Signature

To use gpg for a clear text digital signature use the --clearsign option.
For example, to sign file.txt using this method you would use:

    gpg --clearsign file.txt

The screenshot below shows this command in action, and a dump of the result (the original file.txt only contains a single line of text saying "This file is not meant to be encrypted, just signed!", file.txt.asc includes that along with the digital signature).
Note that by default the name of the signed file has an appended .asc, you can control the name using the -o (or --output) option, eg:

    gpg --output filename --clearsign file.txt

On the receiving side, the recipient can verify the signature (provided they have the sender's public key on their keyring).

    gpg --verify file.txt.asc

A successful verification is shown in the screenshot below:

## Using A Binary Digital Signature

To sign data normally, use the -s (or --sign) option. Using the same file.txt that we used above, we can sign like so:

    gpg --sign file.txt

This will produce the file file.txt.gpg, the contents of which will contain our (readable) data along with what looks like unreadable garbage (this is the raw signature). Someone with the sender's public key can verify this in the exact same way as a clear sign signature by using the --verify option:

    gpg --verify file.txt.gpg

Using A Digital Signature With Asymmetrically Encrypted Data

When the sender also encrypts the data for the recipient to decrypt (i.e. all of the steps 1-7 above are carried out), the sender simply needs to combine the commands we used for asymmetric encryption with the -s (or --sign) option.
The command below signs and encrypts for recipient Tutonics :

    gpg -o file.enc -s -e -r Tutonics file.txt

In order to verify without decrypting, the recipient can run:

    gpg --verify file.enc

Note that they'll need the senders public key on their keyring!
To both decrypt and verify, the -d or --decrypt option will do both (i.e. it will automatically try to verify the signature if there is one present).

    gpg -o original_file.txt -d file.enc

If the recipient does not have the sender's public key on their keyring for verification, the decryption will still work as usual, but following message will be displayed:

    gpg: Can't check signature: public key not found

Also note that their public key may not be trusted, in which case you'll get a message like:

    gpg: WARNING: This key is not certified with a trusted signature!
    gpg:          There is no indication that the signature belongs to the owner.

If you know the owner (and really trust them) and have already verified their public key's fingerprint with them, then you may wish to adjust the "trust" setting for their key.
Do so by using the `--edit-key` option, then from the gpg cli, run:

    trust

Set the trust level to 5: _"I trust ultimately"_ (if that is actually the case!).
Now the warning won't happen again when using their public key.

## Using A Detached Digital Signature

If you wish to leave the original file as-is and create a separate binary signature file, you can use the --detach-sign option. For example, using file.txt run:

    gpg --detach-sign file.txt

This will produce the file file.txt.sig, which is made available to others along with the original data (file.txt in this case). To verify the authenticity of file.txt, you would run the following command (which assumes file.txt is in the current directory along with file.txt.sig):

    gpg --verify file.txt.sig

or, if you've change the name of the file.txt to filename in the meantime or have it in another directory, you can specify the location of the original data file this way:

    gpg --verify file.txt.sig /path/to/filename

Signing With A Different Private Key

Note that in each of the examples above, we could have signed using another private key (that's already on our private keyring) by using the --local-user option.

## What's next?

In the next GPG guide, we'll cover using gpg for symmetric encryption using various different algorithms.

Thanks to everyone who worked on GNU Privacy Guard (the GNU Projects implementation of the OpenPGP standard)

---


    gpg Encryption Guide - Part 4 (Symmetric Encryption)

This GPG guide covers how to use the gpg command for simple yet strong symmetric encryption using various different block cipher algorithms.
No Hassle Encryption

Another type of cryptographic solution provided by Gnu Privacy Guard (GPG) is symmetric-key encryption, also known as block cipher based encryption.
The ciphers used for symmetric-key encryption use the same key for both the encryption and decryption stages.
This key is also called a shared secret.
The reason the ciphers are called block ciphers is because the data to be encrypted is encrypted in chunks or blocks.

If you just want to encrypt some files or data and don't want to set up a key pair (required for asymmetric encryption and digital signatures), then symmetric-key based cryptography is your answer.

Below, we'll cover several of the available ciphers including: AES256, TWOFISH, and CAMELLIA256.
To see a list of available ciphers, run

    gpg --version

the part your looking for uses the word _"Cypher"_ rather than _"cipher"_ (both are valid English, cipher is the American spelling).
You'll see something like this:

    Cypher: 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH, CAMELLIA128,
        CAMELLIA192, CAMELLIA256

Each time you use a symmetric cipher to encrypt data, you'll be asked to supply a passphrase (twice to confirm it).
This passphrase is used to help generate a key which is then used with the chosen algorithm to encrypt the data.
It goes without saying (but we'll say it anyway) that you should use a strong passphrase and don't forget what you chose!.
When you get around to decrypting the data, you'll be prompted for that passphrase.

Note that to tell the gpg command that you want to use symmetric-key encryption, use the --symmetric (or -c) option.
We'll be using --symmetric in each of the examples below.

## AES256 Cipher

If you're not sure which cipher to use, AES is the safe choice as it's recommended by the US Government and the most commonly used (note that this does not necessarily mean it is the strongest and fastest in all cases).
AES has a block size of 128bits.
The 256 in the name is in relation to the key size of AES256, which is of course 256bits (32 bytes).
To encrypt data using 256 bit AES, use the --cipher-algo AES256 option. For example to encrypt a file called file.txt using this cipher, use:

    gpg --symmetric --cipher-algo AES256 file.txt

This will produce file.txt.gpg containing the encrypted data.
You can call the resulting file whatever you like by using the -o (or --output) option.

    gpg -o filename --symmetric --cipher-algo AES256 file.txt

To decrypt file.txt.gpg or whatever you called it, run:

    gpg -o original_file.txt -d file.txt.gpg

## Twofish Cipher

Twofish has a block size of 128bits. In gpg, if TWOFISH is used as the algorithm, it uses a key size of 256bits (32 bytes)
To encrypt using the Twofish cipher (which is considered strong), use the following command:

    gpg --symmetric --cipher-algo TWOFISH file.txt

To decrypt, use the command:

    gpg -d file.txt.gpg

## CAMELLIA256 Cipher

CAMELLIA also has a block size of 128bits and if you use CAMELLIA256 as your cipher algorithm, you'll be using a key size of 256bits (32 bytes). To encrypt using this cipher, use the command:

    gpg --symmetric --cipher-algo CAMELLIA256 file.txt

To decrypt, use:

    gpg -d file.txt.gpg

## CAST5 - The Default GPG Cipher

If you don't specify what algorithm to use then CAST5 will be used by default. CAST5 has a block size of 64 bits. This is a decent cipher which is considered safe to use by some, for example the Canadian government.
However, many top cryptographers such as Bruce Schneier would recommend that its better to use a cipher with a bigger block size than 64 bits.
So, if you wish to choose an even better algorithm such as Twofish or AES256 which both have a block size of 128bits, you can configure the default by editing ~/.gnupg/gpg.conf and adding a line like the one below, replacing "NAME" with the appropriate algorithm name from the above "Cypher" list:

    cipher-algo NAME

so to make AES256 your default, you would add the below line to ~/.gnupg/gpg.conf

    cipher-algo AES256

If you stick with CAST5 or any cipher with a block size less than or equal to 64bits (3DES is another example of a 64bit block size), you should also use the --force-mdc option. This forces "the use of encryption with a modification detection code". Without the use of an mdc, "the encrypted message becomes vulnerable to a message modification attack" according to the gpg man page.

So just to be clear: for ciphers with block size 64bits or less, you will get the following warning when decrypting unless you use the --force-mdc option:

    gpg: WARNING: message was not integrity protected

You could add force-mdc to your _~/.gnupg/gpg.conf_ so you don't have to specify `--force-mdc` on the command line each time (`--force-mdc` behaviour is already being done for ciphers with larger block sizes, so it will just be ignored if used with them). Assuming you've not touched your defaults in _~/.gnupg/gpg.conf_, to encrypt a file called file.txt using the CAST5 cipher you'll just need to use:

    gpg --symmetric --force-mdc file.txt

This will produce file.txt.gpg containing the encrypted data. As usual, you can call the resulting file whatever you like by using the `-o` (or `--output`) option.
So to call it file.enc, you'd use:

    gpg -o file.enc --symmetric --force-mdc file.txt

Then to decrypt it you just need to use the -d option along with whatever your encrypted file is called (e.g. file.txt.gpg).

    gpg -o original_file.txt -d file.txt.gpg

Note that if you don't use -o to output to file, the decrypted data gets sent to standard out, which unless you redirect it to a file or pipe it to another program, will end up being displayed on your screen.

User Friendly Data Format

If you need to copy and past your encrypted data (e.g. into an email), then use the `--armor` option.
This will produce ascii armored text (base64 encoded) which is very portable. Taking AES256 as an example, you would simply use it like this:

    gpg --armor --symmetric --cipher-algo AES256 file.txt

By default, this will produce file.txt.asc as the encrypted ascii armored file. You would then decrypt normally using something like:

    gpg -o file.txt -d file.txt.asc

Digitally Signing Symmetrically Encrypted Data

If you have set up a public/private key pair, you can use your private key to sign the data before symmetrically encrypting it.
For information about how to create your own public/private key pair, see GPG Encryption Guide - Part 1.
To learn more about digital signatures, see GPG Encryption Guide - Part 3.
For example, to sign and symmetrically encrypt file.txt using AES256, use the `--sign` option like this:

    gpg --sign --symmetric --cipher-algo AES256 file.txt

Then to verify the signature and decrypt, you would use:

    gpg -d file.txt.gpg

(The `-d` option will automatically try to verify any signature and also decrypt).

Thanks to everyone who worked on GNU Privacy Guard (the GNU Projects implementation of the OpenPGP standard)
