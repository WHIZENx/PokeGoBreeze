import React, { Fragment } from 'react';
import loading from '../../assets/loading.png';
import './Spinner.scss';
import { clearLocalStorageExcept } from '../../utils/configs/local-storage.config';
import useSpinner from '../../composables/useSpinner';

const Spinner = () => {
  const { spinnerIsLoading, spinnerIsError, spinnerMessage } = useSpinner();

  return (
    <Fragment>
      {spinnerIsLoading && (
        <div className="spinner-container">
          <div className="loading-group-spin" />
          <div className="loading-spin-container">
            <div className="loading-spin text-center">
              <img
                className={spinnerIsError ? '' : 'loading'}
                width={64}
                height={64}
                alt="Pokémon Image"
                src={loading}
              />
              <span className="caption text-white text-shadow-black u-fs-3">
                <b>
                  {spinnerIsError ? (
                    <Fragment>
                      Oops
                      <br />
                      Something went wrong on our end.
                      <p
                        className="reload-text"
                        onClick={() => {
                          clearLocalStorageExcept();
                          window.location.reload();
                        }}
                      >
                        Retry Again
                      </p>
                      {spinnerMessage && process.env.REACT_APP_DEPLOYMENT_MODE === 'development' && (
                        <p className="text-danger">{spinnerMessage}</p>
                      )}
                    </Fragment>
                  ) : (
                    <Fragment>
                      Loading<span id="p1">.</span>
                      <span id="p2">.</span>
                      <span id="p3">.</span>
                    </Fragment>
                  )}
                </b>
              </span>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Spinner;
