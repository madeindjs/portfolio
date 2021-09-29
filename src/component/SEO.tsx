// src/components/seo.js
import {useLocation} from "@reach/router";
import {graphql, useStaticQuery} from "gatsby";
import React from "react";
import {Helmet} from "react-helmet";

interface Props {
  title?: string;
  image?: string;
  description?: string;
  article?: boolean;
  datePublished?: string;
  dateModified?: string;
  tags?: string[];
  meta?: string[];
}

const SEO: React.FC<Props> = ({
  title,
  image,
  description,
  article,
  datePublished,
  dateModified,
  tags = [],
  meta = [],
}) => {
  const location = useLocation();

  const {site} = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          lang
          logo
          description
          author
          siteUrl
          siteName
        }
      }
    }
  `);

  const defaultTitle = site.siteMetadata?.title;
  const defaultDescription = site.siteMetadata?.description;

  return (
    // @ts-ignore
    <Helmet
      htmlAttributes={{lang: site.siteMetadata.lang}}
      title={title || defaultTitle}
      meta={[
        {
          name: "description",
          content: description || defaultDescription,
        },
        {
          property: "og:url",
          content: location.href,
        },
        {
          property: "og:site_name",
          content: site.siteMetadata.siteName,
        },
        {
          property: "og:title",
          content: title || defaultTitle,
        },
        {
          property: "og:description",
          content: description || defaultDescription,
        },
        {
          property: "og:type",
          content: article ? "article" : "website",
        },
      ]}
    >
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": article ? "Article" : "WebSite",
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": site.siteMetadata?.siteUrl,
          },
          url: location.href,
          headline: title || defaultTitle,
          author: {
            "@type": "Person",
            name: site.siteMetadata.author,
          },
          publisher: {
            "@type": "Organization",
            name: site.siteMetadata.author,
            url: site.siteMetadata?.siteUrl,
            logo: {
              "@type": "ImageObject",
              url: site.siteMetadata.logo,
            },
          },
          description: description || defaultDescription,
          ...(image && {image}),
          ...(dateModified && {dateModified}),
          ...(datePublished && {datePublished}),
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
