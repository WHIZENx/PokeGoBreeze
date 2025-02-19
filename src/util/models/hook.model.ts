import { LinkProps, NavigateOptions } from 'react-router-dom';

export interface NavigateToTopProps extends NavigateOptions {
  top?: number;
  left?: number;
  behavior?: ScrollBehavior;
}

export interface LinkPropsToTopProps extends LinkProps {
  top?: number;
  left?: number;
  behavior?: ScrollBehavior;
}
