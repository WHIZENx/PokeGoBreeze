import { useEffect } from 'react';
import { TitleSEOProps } from '../models/hook.model';

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
export const useTitle = (props: TitleSEOProps) => {
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

    if (props.isShowTitle !== false) {
      document.title = title;
    }

    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      pageTitle.textContent = title;
    }

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
  }, [props]);
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
