import React, { MouseEventHandler } from 'react';
import { Link, To, useNavigate } from 'react-router-dom';
import { LinkToTopProps, NavigateToTopProps } from '../models/hook.model';
import { toNumber } from '../extension';

export const useNavigateToTop = () => {
  const navigate = useNavigate();
  const navigateAndReset = (to: To, options?: NavigateToTopProps) => {
    navigate(to, { ...options });
    window.scrollTo({
      top: toNumber(options?.top),
      left: toNumber(options?.left),
      behavior: options?.behavior || 'instant',
    });
  };
  return navigateAndReset;
};

export const LinkToTop = (props: LinkToTopProps) => {
  const navigateToTop = useNavigateToTop();

  const navigateAndReset: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    navigateToTop(props.to, props.options);
  };

  return (
    <Link {...props} onClick={navigateAndReset}>
      {props.children}
    </Link>
  );
};
