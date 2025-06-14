import { useEffect } from 'react';

// Type for the SEO props
interface TitleSEOProps {
  title: string;
  description?: string;
  image?: string;
  keywords?: string | string[];
  showTitle?: boolean;
  type?: 'website' | 'article';
}

/**
 * React hook to update document title and meta tags for SEO
 *
 * @param titleOrProps - Page title string or SEO props object
 * @param showTitle - Whether to show the title (used only with string version)
 *
 * @example
 * // Basic usage
 * useTitle('Pokémon - Search');
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
export const useTitle = (titleOrProps: string | TitleSEOProps, showTitle = true) => {
  useEffect(() => {
    // Handle both string and object props for backward compatibility
    const isObjectProps = typeof titleOrProps === 'object';

    const title = isObjectProps ? titleOrProps.title : titleOrProps;
    const description = isObjectProps ? titleOrProps.description : undefined;
    const image = isObjectProps ? titleOrProps.image : undefined;
    const keywords = isObjectProps ? titleOrProps.keywords : undefined;
    const type = isObjectProps ? titleOrProps.type || 'website' : 'website';
    const shouldShowTitle = isObjectProps ? titleOrProps.showTitle !== false : showTitle;

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
    updateCanonicalUrl();
  }, [titleOrProps, showTitle]);
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
const updateCanonicalUrl = () => {
  const canonicalUrl = document.getElementById('canonical-url');
  if (canonicalUrl) {
    const path = window.location.pathname;
    const origin = window.location.origin;
    canonicalUrl.setAttribute('href', `${origin}${path}`);
  }
};
