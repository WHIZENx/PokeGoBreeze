import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import loading from '../../assets/loading.png';
import './Spinner.scss';
import { DeviceState, SpinnerState } from '../../store/models/state.model';

const Spinner = () => {
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const device = useSelector((state: DeviceState) => state.device);

  return (
    <Fragment>
      {spinner.loading && (
        <div className="spinner-container">
          <div className="loading-group-spin" />
          <div className="loading-spin-container">
            <div className="loading-spin text-center">
              <img className={spinner.error ? '' : 'loading'} width={64} height={64} alt="img-pokemon" src={loading} />
              <span className="caption text-white text-shadow" style={{ fontSize: 18 }}>
                <b>
                  {spinner.error ? (
                    <Fragment>
                      Oops
                      <br />
                      Something went wrong on our end.
                      <p
                        className="reload-text"
                        onClick={() => {
                          localStorage.clear();
                          window.location.reload();
                        }}
                      >
                        Retry Again
                      </p>
                      {device.isMobile && <p className="text-danger">{spinner.error.msg}</p>}
                    </Fragment>
                  ) : (
                    <Fragment>
                      Loading<span id="p1">.</span>
                      <span id="p2">.</span>
                      <span id="p3">.</span>
                      {spinner.message && <p className="spinner-msg">{spinner.message}</p>}
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
