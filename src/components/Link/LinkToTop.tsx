import React, { MouseEventHandler, useCallback } from 'react';
import { Link, To, useNavigate } from 'react-router-dom';
import { LinkToTopProps, NavigateToTopProps } from '../../utils/models/hook.model';
import { toNumber } from '../../utils/extension';

interface PendingNavigationScroll {
  top: number;
  left: number;
  behavior: ScrollBehavior;
}

let pendingNavigationScroll: PendingNavigationScroll | undefined;

export const flushPendingNavigationScroll = () => {
  if (!pendingNavigationScroll) {
    return;
  }
  const scroll = pendingNavigationScroll;
  pendingNavigationScroll = undefined;
  window.scrollTo(scroll);
};

export const useNavigateToTop = () => {
  const navigate = useNavigate();
  const navigateAndReset = useCallback(
    (to: To, options?: NavigateToTopProps) => {
      const { top, left, behavior, ...navigateOptions } = options ?? {};
      pendingNavigationScroll = {
        top: toNumber(top),
        left: toNumber(left),
        behavior: behavior || 'instant',
      };
      navigate(to, navigateOptions);
    },
    [navigate]
  );
  return navigateAndReset;
};

export const LinkToTop = (props: LinkToTopProps) => {
  const { funcOnClick, ...restProps } = props;
  const navigateToTop = useNavigateToTop();

  const navigateAndReset: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    navigateToTop(props.to, props.options);
    funcOnClick?.(event);
  };

  return (
    <Link {...restProps} onClick={navigateAndReset}>
      {props.children}
    </Link>
  );
};
