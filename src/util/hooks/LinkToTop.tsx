import React, { MouseEventHandler } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LinkToTopProps } from '../models/hook.model';
import { toNumber } from '../extension';

export const useNavigateToTop = () => {
  const navigate = useNavigate();
  const navigateAndReset = (props: LinkToTopProps) => {
    navigate(props.to, { ...props });
    window.scrollTo({
      top: toNumber(props.top),
      left: toNumber(props.left),
      behavior: props.behavior || 'instant',
    });
  };
  return navigateAndReset;
};

export const LinkToTop = (props: LinkToTopProps) => {
  const navigateToTop = useNavigateToTop();

  const navigateAndReset: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    navigateToTop(props);
  };

  return (
    <Link {...props} onClick={navigateAndReset}>
      {props.children}
    </Link>
  );
};
