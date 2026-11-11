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
  const { funcOnClick, options, ...restProps } = props;

  const navigateAndReset: MouseEventHandler<HTMLAnchorElement> = (event) => {
    funcOnClick?.(event);
    const target = event.currentTarget.getAttribute('target');
    const isPrimarySameWindowNavigation =
      !event.defaultPrevented &&
      event.button === 0 &&
      (!target || target === '_self') &&
      !event.metaKey &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.shiftKey;
    if (isPrimarySameWindowNavigation) {
      pendingNavigationScroll = {
        top: toNumber(options?.top),
        left: toNumber(options?.left),
        behavior: options?.behavior || 'instant',
      };
    }
  };

  return (
    <Link
      {...restProps}
      preventScrollReset={options?.preventScrollReset ?? restProps.preventScrollReset}
      relative={options?.relative ?? restProps.relative}
      replace={options?.replace ?? restProps.replace}
      state={options?.state ?? restProps.state}
      viewTransition={options?.viewTransition ?? restProps.viewTransition}
      onClick={navigateAndReset}
    >
      {props.children}
    </Link>
  );
};
