---
title: Migrate a website from Jekyll   to Gatsby
description: This article is my feedback on the migration of my site from Jekyll to Gatsby.
date: 2021-10-02 09:00:00 +0200
tags:
  - gatsby
  - jekyll
lang: en
---

I have just migrated my site from [Jekyll](https://jekyllrb.com/) to [Gatsby](https://www.gatsbyjs.com/). In this article I'll try to make an assessment of this migration:

- why I made this choice?
- how I could realize this migration?
- what were the benefits?

**TLDR**: Gatsby is a tool with a much longer learning curve than Jekyll. It doesn't do everything out of the box, but it's a pleasure to develop with this environment. If you want to make a simple site, it's better to go with Jekyll. If you want to work with a modern ecosystem, then Gatsby is a better choice.

## A static site

For my site I chose to use a static site generator tool.

If you don't know the principle, a static site generator consists in generating a site in the form of an HTML / CSS / JavaScript file during **a compilation step**. Once this is done, the site can run without any server side interpretation. In other words, no more need for PHP, Ruby or other. Just move the files to your static web server.

Static sites often propose you to write the content in [Markdown](https://www.markdownguide.org/cheat-sheet/) which is a very accessible markup language.

A static site has many advantages. **The main advantage is that there is no database or server-side interpreted language**. So

1. **Security is reinforced**. Most of the security flaws are based on the server side interpreted language.
2. **The server cost is reduced**. I use a simple [VPS at OVH](https://www.ovhcloud.com/fr/vps/) at 3€/month which also hosts other static sites. And before going to OVH, I was using [a Raspberry PI connected to my SFR box](../fr/2017-10-11-installer-bridge-sfr-box-4k.md)
3. **Performance is excellent** because the server doesn't need to interpret a language or make database queries.
4. **The SEO** which depends directly on the performance of the site and especially the response time

I can prove you the result with this cURL command which shows the response time of my site compared to <https://wordpress.com/> (which is site running with a CMS and a database):

```bash
curl -w %{time_total} -s -o /dev/null https://rsseau.fr      # 0.010383
curl -w %{time_total} -s -o /dev/null https://wordpress.com/ # 0.467470
```

So we can see that my site responds in 10ms while Wordpress in almost half a second. So a static site responds **45 times faster than a classic CMS** [^1].

[^1]: my test is not really advanced because it would be necessary to bombard several requests and smooth the results.

This performance is very well reflected in the results of [Google's PageSpeed tool](https://developers.google.com/speed/pagespeed/insights/?url=https%3A%2F%2Frsseau.fr) which speak for themselves:

![Screenshot of my PageSpeed result](./images/gastby-pagespeed.png)

In short, if your content is not destined to evolve every day and you have the possibility to write it in a static site generator is the solution.

## Jekyll

Being a fan of the Ruby language, I had initially chosen [Jekyll](https://jekyllrb.com/) to generate my site. Jekyll is one of the most popular tools to generate a static site quickly. It is also the tool used for [Github Pages](https://guides.github.com/features/pages/). It's a tool that I recommend for beginners because it's very easy to use, even without any knowledge of the Ruby language.

### But...

I set myself the goal of getting better at **design**. So I decided to completely redesign my site. I quickly encountered difficulties.

I am used to **frontend frameworks**. I don't know how to do HTML/CSS "the old way" anymore. I got used to the component-based architecture. Jekyll's philosophy to use native HTML/CSS slowed me down. Also, I work mostly with the JavaScript ecosystem. \*\*I don't like to write "old school" JavaScript (a.k.a `document.querySelector` and other gimmicks). This is totally objective but I wanted to go for a modern way of doing things.

My second point is that **Jekyll gets more complicated when you want to go outside the box**. Here are for example some features that were complicated for me to develop:

- integrating a quick search for articles
- manage internationalization properly
- adding a "related articles" section that automatically finds articles similar to the one displayed by the user

My third point is that I was looking to experiment with new technologies. If you are a developer, you know as well as I do that the web moves and very fast. The technologies of a few years ago are not obsolete.

To conclude, **Jekyll did the job very well** and remains a very suitable tool. It just **didn't** fit me anymore.

## Which static site generator to choose?

There are more than [300 static site generators](https://jamstack.org/generators/). It is very difficult to find the right one. The choice depends mainly on

1. your affinities on a particular language or framework
2. the complexity of the site you want to develop
3. the size of your site. Some tools are more adapted to very large sites.

I work a lot with the JavaScript ecosystem and **so I chose Gatsby!**

Gatsby is a tool based on React and GrahQL. In addition to React, it integrates an overlay that will improve performance and integrate tools to build your static site. Instead of describing you what Gatsby is, let me show you why I chose it.

### Using modern JavaScript without generating a heavy web application

At the time of [Green IT](https://www.google.com/url?q=https://en.m.wikipedia.org/wiki/Green_computing), we hear a lot about **eco-design of website**. This consists in limiting the server-side and client-side resources needed for our site. It was an important criterion for me because I want to do my best to make my site efficient [^2].

Modern web frameworks like React, Vue.js or Angular are great tools for web applications but they can generate sites that need to download and run **several megabytes of JavaScript**. I find this nonsense for a simple blog. The libraries that are loaded on a site represent a large amount of data.

The JavaScript libraries are heavy](./images/node-modules-meme.png)

[^2]: This is one of the reasons why I chose not to integrate a tracking module and that I [rely on logs](./2019-11-07-read-logs-with-go-access.md) to analyze the most visited pages.

Gatsby does this perfectly because it does a whole bunch of optimizations by default:

1. it relies on [Webpack](https://webpack.js.org/) to [break up the code](https://webpack.js.org/guides/code-splitting/) into small files that will only be downloaded when necessary
2. the code is transpiled during the compilation step, so the site works even if the user has disabled JavaScript
3. and [many others](https://www.gatsbyjs.com/guides/why-are-gatsby-sites-fast/)

### SEO friendly

Google indexes web pages with its robot that crawls the web from link to link. Because of the amount of resources this requires, Google sets an indexing budget per site and takes longer to index a site requiring JS.

Modern JavaScript frameworks suffer from this problem because without JavaScript, HTML content cannot be built. Here is an example with Twitter:

![Screenshot of Twitter with JavaScript disabled](./images/twitter-need-js.png)

There are several ways to get around this problem but it is often very complicated to implement.

The good news is that Gatsby does it all for us! Since React is executed on our computer during the compilation stage, the HTML is visible without JavaScript.

### Hackable

Gatsby offers [a lot of plugins](https://www.gatsbyjs.com/plugins) (2824 at the time of writing this article). Your need has already been coded by someone. Let's imagine for example that you want to:

- Use data from an existing CMS to create your articles? [gatsby-source-wordpress](https://www.gatsbyjs.com/plugins/gatsby-source-wordpress) / [gatsby-source-drupal](https://www.gatsbyjs.com/plugins/gatsby-source-drupal)
- Use Airtable data to create your articles? [gatsby-source-airtable](https://www.gatsbyjs.com/plugins/gatsby-source-airtable)
- Use data from your e-commerce site? [gatsby-source-shopify](https://www.gatsbyjs.com/plugins/gatsby-source-shopify)
- Generate a Sitemap? [gatsby-plugin-sitemap](https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap)
- Implement an advanced quick search? [gatsby-plugin-algolia](https://www.gatsbyjs.com/plugins/gatsby-plugin-algolia)

If you want to create your own plugin, the [documentation is here](https://www.gatsbyjs.com/docs/creating-plugins/)

## How to migrate from Jekyll

I developed the site from scratch with Gatsby in order to get it up and running. This was the biggest part of the work. However, it is possible to use [a ready-made blog template for Gatsby](https://www.gatsbyjs.com/starters/gatsbyjs/gatsby-starter-blog/). This avoids the pure development part.

Then, concerning the migration of the content is very easy because Jekyll and Gatsby are based on Markdown. So you just have to move the articles and edit them a bit. In my case I needed to:

- To standardize the _frontmater_ header of the Markdown files. All articles must have the same keys like `date`, `title`, etc...
- links between posts can change. Gatsby uses relative links like `[title](./other-post)`
- the URLs of the images can change too. In my case I created a folder `content/posts/images` and I use its images by doing `![alt](./images/dog.png)`

## Manage the transition for SEO

It is important to take into account the SEO when changing the architecture of a site [^3]. In my case I had several things to do:

[^3]: I chose to change the URLs of my articles but it is possible to reproduce the same architecture by pimping `gatsby-node.js`.

1. redirect the pages having changed URL with a HTTP status `301 - permanent redirect`.
2. indicate pages that have disappeared with a HTTP status `410 - Gone`

To send these statuses, it is possible to use a `.htaccess` file with Apache.

So I started by [exporting my indexed pages via Google Search Console](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Arsseau.fr&breakdown=page) and did the mapping in the `.htaccess` file. Here is an extract.

```htaccess
Redirect permanent /benchmarking/2018/11/12/benchmark-templates.html /2018-11-12-benchmark-templates
Redirect permanent /blog/page/2/ /blog
Redirect gone /books/api_on_rails_5-en.html
```

In order to set up the `.htaccess` file, I chose to use the [`gatsby-plugin-htaccess`](https://www.gatsbyjs.com/plugins/gatsby-plugin-htaccess/). plugin which I quickly configured like this

```js
// gatsby-config.js
module.exports = {
  // ..
  plugins: [
    // ...
    {
      resolve: "gatsby-plugin-htaccess",
      options: {
        custom: `
            Redirect permanent /benchmarking/2018/11/12/benchmark-templates.html /2018-11-12-benchmark-templates
            Redirect permanent /blog/page/2/ /blog
            Redirect gone /books/api_on_rails_5-en.html
            ...
        `,
      },
    },
  ],
};
```

You have to make sure that the apache configuration allows `.htaccess` and then you can test the redirection with cURL

```bash
curl https://rsseau.fr/blog/page/2/
```

```html
<!DOCTYPE html PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html>
  <head>
    <title>301 Moved Permanently</title>
  </head>
  <body>
    <h1>Moved Permanently</h1>
    <p>The document has moved <a href="https://rsseau.fr/blog">here</a>.</p>
  </body>
</html>
```

And that's it!

## Conclusion

Static site generators are great tools. Gatsby pushes the static site much further by giving the possibility to feed the content with external data (Wordpress, Airtable, etc..) while Jekyll simply allows to use Markdown.

In my case, using only Markdown, **the migration from Jekyll to Gatsby was not necessary**. If you are also using Jekyll and it suits you, stay with Jekyll. In my case, the motivation for this migration was really to learn new tools.

Developing with Gatsby required a lot of effort because **it is a much more complex tool**. However, I don't regret the time I invested in it. I will certainly use this tool for a future project.

Gatsby also gave me the opportunity to use modern technologies while giving me the performance I expected. It was really nice to be able to use React in my little project!

Today I have my own system that I can develop as I wish. I could very well make my site evolve as a [_digital garden_](https://www.dschapman.com/articles/using-dendron-and-gatsby-together) for example.
