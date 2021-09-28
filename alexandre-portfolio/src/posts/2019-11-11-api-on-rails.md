---
title: Feedback about writing a technical book
layout: post
date: 2019-11-11 0:30:00 +0200
tags: [rails, leanpub, book]
thumbnail: /img/blog/api_on_rails.png
categories: story
lang: en
---

Early this year I was contacted by [Developpez.com](https://www.developpez.com/) to find people to write articles. So I answered to participate on the subject of the Ruby on Rails framework.

I was asked to translate part of Abraham Kuri Vargas's book [APIs on Rails Building REST APIs with Rails](http://apionrails.icalialabs.com/). This book is a large tutorial of more than 200 pages to build a scalable API with Ruby on Rails following best practices.

I thought it could be a good experience so I started.

The project was not maintained and the version of the framework studied was obsolete. Examples were therefore no longer valid and had to be repeated. **The mess**. I tried to contact the author but to no response.

So I started to rewriting the book from scratch. As long as I was rewriting, I thought about translate it into Molière's language.

Here is my feedback on the writing of a book of more than 200 pages in English and French.

{% include promote-apionrails-en.html %}

## How to write a book?

If you want to write a book, know that it's a timeless thing. So I made sure it took me as little time as possible. I don't pretend to have the best solution. This is just mine.

#### Writing

For the writing I wanted a system that would allow me to **version my work** and that it could include pieces of code. **A lot of code pieces**.

So I first turned to LaTeX which proved to be **too rigid**. My main problem was to have good syntax highlighting. Some solutions exist but they are still quite limited.

So I turned to the Markdown format with the [Pandoc](http://pandoc.org/) tool. This tool is absolutely brilliant but I ended up facing the same problems as with LaTeX since Pandoc relies on a conversion to LaTeX and then the conversion to PDF.

And then I discovered [Asciidoctor](https://asciidoctor.org). This is a syntax that provides additional features to the Markdown such as file management, footnotes, internal notes, comments and so on. In short, it's the Markdown syntax with the power of LaTeX. It also allowed me to export my book in PDF, EPUB and MOBI easily and to customize the theme of my book.

To write, all you need is a classic text editor like VSCode, Atom or even a Notebook on Windows. For the versioning I use Git and I [publish on Github][repo] .

#### Workflow

The workflow I followed was as follows:

1. redo the code examples on my side in [a separate Github project](https://github.com/madeindjs/market_place_api_6)
2. rework the English version according to the changes I had just made
3. paste the English version into a file
4. make translations in copy/paste mode in [Deepl](https://deepl.com)
5. correct the translation (because it is far from perfect)
6. paste the French version into a file

The first problem I encountered was managing this whole process that involves writing the book in English and French. Adding the management of the project created throughout this book it was difficult. Looking back I should have left everything in English and maybe translated at the end.

Then I fixed myself:

- two **rewriting** per chapter in which I wrote quite quickly
- two **reviews** per chapter (including one from my girlfriend who helped me a lot)
- a promotion part (I will talk about it later)

## Open Source

The workflow of publishing articles on développez.com seemed really complicated to use and discouraged me. So I thought I would make it Open Source on Github, quoting of course the original work.

I was really surprised by the help of the open source community. Here are the figures of the [Github project][repo].

- 8 contributors
- 17 pull requests
- 92 stars
- 21 fork

I received pull requests that corrected syntax errors, broken links and questionable formulations. I also received s and bad feedback. For an anecdote, I was even contacted by a Russian who was interested in translating the book. He just needed to forge the project and create a `ru` folder. That's great.

Open source really gives the feeling that **the book is alive**.

When the book is finished or I have fixed things, I do a _release_ on Github and attach the PDF, EPUB and MOBI files. So anyone can read it **free of charge** on the **support of his choice**.

## Publication of the book

I thought that as long as I had to do, I would publish the book. It gave me visibility and also allowed me to get some money back.

I looked a little bit at Amazon but it seemed more complicated to me to create an account, choose the right tax and publish. Commissions are also much higher. So I gave up quickly, too bad for good old Jeff.

I chose Leanpub for its ease and also the fact that the price can be free.

So I published a total of 4 versions:

- one [English version](https://leanpub.com/apionrails5) and one [French version](https://leanpub.com/apionrails5-fr) for Ruby on Rails 5
- one [English version](https://leanpub.com/apionrails6) and one [French version](https://leanpub.com/apionrails6-fr) for Ruby on Rails 6

In the end, here are all the royalty figures, i.e. what goes in my pocket after the Leanpub commissions.

| Book                                                      | Royalties |
| --------------------------------------------------------- | --------- |
| [API on Rails 5 (EN)](https://leanpub.com/apionrails5)    | \$160.63  |
| [API on Rails 5 (FR)](https://leanpub.com/apionrails5-fr) | \$15.98   |
| [API on Rails 6 (EN)](https://leanpub.com/apionrails6)    | \$473.22  |
| [API on Rails 6 (FR)](https://leanpub.com/apionrails6-fr) | \$20.78   |
| Total                                                     | \$670.61  |

I was really surprised to sell "so much". These figures really motivate me to keep the project going.

The figures are also to be put into context. It took a lot of work on my part, which is difficult to quantify. From the nose I would say between **500 and 1000 hours**. This gives an hourly wage of \$1.34 / hour**. So yes, clearly I'm not doing this for the money. But it was for me plus an excellent **paid experience\*\*.

We also see that the English version sells **17 times better** than the French version. The first sad conclusion I can give is that **you have to translate your book into Shakespeare's language**.

## Promotion

Once the book is finished, the promotion begins. It's a pretty foreign part for me and I did a little bit of a feeling. So I just talked on specialized social networks. That is to say:

- [Hacker New](https://news.ycombinator.com/item?id=20736819) which is a very demanding community where I have had very little feedback
- [Le journal du Hacker](https://www.journalduhacker.net/s/3b7gms/api_on_rails_6) which is a French community and therefore much smaller
- [Reddit](https://www.reddit.com/r/rails/comments/csfjjf/api_on_rails_6/), which is the most active community where I have had the most feedback

## Conclusion

In conclusion I think I made the mistake of wanting to go too fast because I started this promoting when my book had small spelling mistakes and syntax errors. The specialized community (in particular Hacker News) is quite uncompromising on this. I have had some negative feedback but also some excellent feedback by email which are very rewarding.

On the other hand, it was an exceptional experience that gave me a lot of personal satisfaction. This project also allowed me to set foot in open source and maintain a small project.

[asciidoctor]: https://asciidoctor.org
[repo]: https://github.com/madeindjs/api_on_rails
