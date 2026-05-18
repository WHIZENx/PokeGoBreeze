// Define the window.SEO interface for TypeScript
declare global {
  interface Window {
    SEO?: {
      setKeywords: (keywords: string | string[]) => void;
      addKeywords: (keywords: string | string[]) => void;
      updateLdJson: (data: { name?: string; description?: string; url?: string; image?: string }) => void;
    };
  }
}

export default window.SEO;
