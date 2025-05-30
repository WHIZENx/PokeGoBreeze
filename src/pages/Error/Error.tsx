import React, { useEffect } from 'react';
import { Location, useLocation } from 'react-router-dom';

import './Error.scss';
import { useDispatch, useSelector } from 'react-redux';
import { SpinnerState } from '../../store/models/state.model';
import { useChangeTitle } from '../../util/hooks/useChangeTitle';
import { SpinnerActions } from '../../store/actions';
import { LocationState } from '../../core/models/router.model';
import { LinkToTop } from '../../util/hooks/LinkToTop';
import { IErrorPage } from '../models/page.model';
import { isUndefined } from '../../util/extension';

const Error = (props: IErrorPage) => {
  const dispatch = useDispatch();
  const location = useLocation() as unknown as Location<LocationState>;
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  useChangeTitle(
    location.state?.url && location.state?.id ? `#${location.state.id} - Not Found` : 'Page Not Found',
    props.isShowTitle
  );

  useEffect(() => {
    if (spinner.isLoading) {
      dispatch(SpinnerActions.HideSpinner.create());
    }
  }, [spinner.isLoading, dispatch]);

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
