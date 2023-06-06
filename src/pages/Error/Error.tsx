import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './Error.scss';
import { useDispatch, useSelector } from 'react-redux';
import { SpinnerState } from '../../store/models/state.model';
import { hideSpinner } from '../../store/actions/spinner.action';

const Error = () => {
  const dispatch = useDispatch();
  const thisLocation = useLocation();
  const spinner = useSelector((state: SpinnerState) => state.spinner);

  useEffect(() => {
    document.title = 'Page Not Found';
  }, []);

  useEffect(() => {
    if (spinner.loading) {
      dispatch(hideSpinner());
    }
  }, [spinner.loading]);

  return (
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
            It looks like nothing was found at <p style={{ color: 'yellow' }}>{thisLocation.pathname}</p>
          </span>
          <span>Maybe try one of the links in the menu or press Back to Home to go to the home page.</span>
          <div style={{ marginTop: 15 }}>
            <Link className="btn btn-danger" to="/">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;
