import { NavigateOptions } from 'react-router-dom';

export interface NavigateToTopProps extends NavigateOptions {
  top?: number;
  left?: number;
  behavior?: ScrollBehavior;
}
