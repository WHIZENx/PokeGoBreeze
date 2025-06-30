import React, { useEffect } from 'react';
import { Location, useLocation } from 'react-router-dom';

import './Error.scss';
import { useDispatch } from 'react-redux';
import { useTitle } from '../../utils/hooks/useTitle';
import { SpinnerActions } from '../../store/actions';
import { LocationState } from '../../core/models/router.model';
import { LinkToTop } from '../../utils/hooks/LinkToTop';
import { IErrorPage } from '../models/page.model';
import { isUndefined } from '../../utils/extension';
import useSpinner from '../../composables/useSpinner';

const Error = (props: IErrorPage) => {
  const dispatch = useDispatch();
  const location = useLocation() as unknown as Location<LocationState>;
  const { spinnerIsLoading } = useSpinner();
  if (props.isError && props.isShowTitle) {
    useTitle({
      title:
        location.state?.url && location.state?.id
          ? `PokéGO Breeze - #${location.state.id} Not Found`
          : 'PokéGO Breeze - Page Not Found',
      description: 'Error page - Something went wrong with your request. Please try again later.',
      keywords: ['error page', 'Pokémon GO error', 'page not found', 'PokéGO Breeze error'],
      type: 'website',
      isShowTitle: props.isShowTitle,
    });
  }

  useEffect(() => {
    if (spinnerIsLoading) {
      dispatch(SpinnerActions.HideSpinner.create());
    }
  }, [spinnerIsLoading, dispatch]);

  return (
    <>
      {props.isError || isUndefined(props.isError) ? (
        <div className="d-block position-relative">
          <div className="error-img">
            <div className="img" />
          </div>
          <div className="error-desc">
            <div className="desc">
              <h1 className="desc-head">
                <b>404</b>
              </h1>
              <h1>Page Not Found</h1>
              <span>
                {'It looks like nothing was found at '}
                <p style={{ color: 'yellow' }}>
                  {location.state?.url && location.state?.id
                    ? `${location.state.url}${location.state.id && `/${location.state.id}`}`
                    : location.pathname}
                </p>
              </span>
              <span>Maybe try one of the links in the menu or press Back to Home to go to the home page.</span>
              <div className="mt-3">
                <LinkToTop className="btn btn-danger" to="/">
                  Back to Home
                </LinkToTop>
              </div>
            </div>
          </div>
        </div>
      ) : (
        props.children || <></>
      )}
    </>
  );
};

export default Error;
