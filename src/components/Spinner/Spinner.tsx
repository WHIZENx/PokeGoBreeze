import React, { Fragment } from 'react';
import loading from '../../assets/loading.png';
import './Spinner.scss';
import { clearLocalStorageExcept } from '../../utils/configs/local-storage.config';
import useSpinner from '../../composables/useSpinner';
import BackdropMui from '../Commons/Backdrops/BackdropMui';

const Spinner = () => {
  const { spinnerIsLoading, spinnerIsError, spinnerMessage } = useSpinner();

  return (
    <BackdropMui open={spinnerIsLoading} ariaHidden={!spinnerIsError}>
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
        <img className={spinnerIsError ? '' : 'loading'} width={64} height={64} alt="Pokémon Image" src={loading} />
        <span className="caption tw-text-center !tw-text-white text-shadow-black !tw-text-lg">
          <b>
            {spinnerIsError ? (
              <Fragment>
                Oops
                <br />
                {spinnerMessage ? (
                  <span className="tw-text-error" role="alert">
                    {spinnerMessage}
                  </span>
                ) : (
                  'Something went wrong. Try again.'
                )}
                <p
                  className="reload-text"
                  onClick={() => {
                    clearLocalStorageExcept();
                    window.location.reload();
                  }}
                >
                  Retry Again
                </p>
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
    </BackdropMui>
  );
};

export default Spinner;
