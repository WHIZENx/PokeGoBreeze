import { useEffect } from 'react';
import { TitleSEOProps } from '../models/hook.model';

export const useTitle = (props: TitleSEOProps) => {
  useEffect(() => {
    const path = window.location.pathname;
    const origin = window.location.origin;
    const fullPath = `${origin}${path}`;

    const { title, description, keywords, isShowTitle } = props;
    const image = props.image || `${origin}/og-image.png`;
    const url = props.url || fullPath;
    const type = props.type || 'website';

    // Browser tab title
    if (isShowTitle !== false) {
      document.title = title;
    }

    // <title id="page-title">
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      pageTitle.textContent = title;
    }

    // Meta description
    if (description) {
      setMeta('meta-description', description);
      setMeta('og-description', description);
      setMeta('twitter-description', description);
    }

    // Title tags
    setMeta('og-title', title);
    setMeta('twitter-title', title);

    // og:type (Twitter Cards have no type field — twitter:card is static in HTML)
    setMeta('og-type', type);

    // URL tags
    setMeta('og-url', url);
    setMeta('twitter-url', url);

    // Canonical URL
    const canonical = document.getElementById('canonical-url');
    if (canonical) {
      canonical.setAttribute('href', fullPath);
    }

    // Keywords
    if (keywords && window.SEO) {
      window.SEO.setKeywords(keywords);
    }

    // Images — og-image and twitter-image use content attr; image-src link uses href
    setMeta('og-image', image);
    setMeta('twitter-image', image);
    const imageSrc = document.getElementById('image-src');
    if (imageSrc) {
      imageSrc.setAttribute('href', image);
    }

    // Image alt text — use page title as a descriptive label for the image
    setMeta('og-image-alt', title);
    setMeta('twitter-image-alt', title);

    // JSON-LD structured data — update per-page so Google rich results reflect current page
    if (window.SEO?.updateLdJson) {
      window.SEO.updateLdJson({ name: title, description, url, image });
    }
  }, [props]);
};

const setMeta = (id: string, content: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.setAttribute('content', content);
  }
};
