import { useEffect } from 'react';

// Type for the SEO props
interface TitleSEOProps {
  title: string;
  description?: string;
  image?: string;
  keywords?: string | string[];
  url?: string;
  type?: 'website' | 'article';
  showTitle?: boolean;
}

/**
 * React hook to update document title and meta tags for SEO
 *
 * @param props - SEO props object
 *
 * @example
 * // Advanced usage with SEO props
 * useTitle({
 *   title: 'Pokémon - Search',
 *   description: 'Search for any Pokémon by name, type, or abilities',
 *   keywords: ['pokemon search', 'find pokemon', 'pokemon database'],
 *   image: 'https://example.com/pokemon-search.jpg'
 * });
 */
export const useTitle = (props: TitleSEOProps, showTitle = true) => {
  useEffect(() => {
    const path = window.location.pathname;
    const origin = window.location.origin;
    const fullPath = `${origin}${path}`;

    const title = props.title;
    const description = props.description;
    const image = props.image;
    const keywords = props.keywords;
    const url = props.url || fullPath;
    const type = props.type || 'website';
    const shouldShowTitle = props.showTitle !== false;

    if (!shouldShowTitle) {
      return;
    }

    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      pageTitle.textContent = title;
    }
    document.title = title;

    // Update meta description if provided
    if (description) {
      updateMetaContent('meta-description', description);
      updateMetaContent('og-description', description);
      updateMetaContent('twitter-description', description);
    }

    // Update OpenGraph and Twitter titles
    updateMetaContent('og-title', title);
    updateMetaContent('twitter-title', title);

    // Update OpenGraph and Twitter types
    updateMetaContent('og-type', type);
    updateMetaContent('twitter-type', type);

    // Update OpenGraph and Twitter URLs
    updateMetaContent('og-url', url);
    updateMetaContent('twitter-url', url);

    // Update keywords if provided
    if (keywords && window.SEO) {
      window.SEO.setKeywords(keywords);
    }

    // Update image if provided
    if (image) {
      const ogImage = document.getElementById('og-image');
      const twitterImage = document.getElementById('twitter-image');

      if (ogImage) {
        ogImage.setAttribute('content', image);
      }

      if (twitterImage) {
        twitterImage.setAttribute('content', image);
      }
    }

    // Update canonical URL to include the current path
    updateCanonicalUrl(fullPath);
  }, [props, showTitle]);
};

/**
 * Helper function to update meta tag content
 */
const updateMetaContent = (id: string, content: string) => {
  const metaTag = document.getElementById(id);
  if (metaTag) {
    metaTag.setAttribute('content', content);
  }
};

/**
 * Helper function to update the canonical URL
 * This ensures search engines understand the preferred URL for the current page
 */
const updateCanonicalUrl = (path: string) => {
  const canonicalUrl = document.getElementById('canonical-url');
  if (canonicalUrl) {
    canonicalUrl.setAttribute('href', path);
  }
};
