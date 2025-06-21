import { LinkProps, NavigateOptions } from 'react-router-dom';

export interface NavigateToTopProps extends NavigateOptions {
  top?: number;
  left?: number;
  behavior?: ScrollBehavior;
}

export interface LinkToTopProps extends LinkProps {
  top?: number;
  left?: number;
  behavior?: ScrollBehavior;
  options?: NavigateToTopProps;
  funcOnClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface TitleSEOProps {
  title: string;
  description?: string;
  image?: string;
  keywords?: string | string[];
  url?: string;
  type?: 'website' | 'article';
  isShowTitle?: boolean;
}
