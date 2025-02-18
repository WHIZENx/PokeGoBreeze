import { LinkProps, NavigateOptions } from 'react-router-dom';

export interface LinkToTopProps extends LinkProps, NavigateOptions {
  top?: number;
  left?: number;
  behavior?: ScrollBehavior;
}
