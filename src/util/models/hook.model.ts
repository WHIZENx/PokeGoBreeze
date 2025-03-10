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
}
