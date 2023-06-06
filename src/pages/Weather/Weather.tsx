import React, { useEffect } from 'react';

import Affect from './Affect';
import Effect from './Effect';

import './Weather.scss';
import { useSelector, useDispatch } from 'react-redux';
import { hideSpinner } from '../../store/actions/spinner.action';
import { StoreState, SpinnerState } from '../../store/models/state.model';

const Weather = () => {
  const dispatch = useDispatch();
  const typeEffective = useSelector((state: StoreState) => state.store.data?.typeEff);
  const weatherBoosts = useSelector((state: StoreState) => state.store.data?.weatherBoost);
  const spinner = useSelector((state: SpinnerState) => state.spinner);

  useEffect(() => {
    document.title = 'Weather Boosts';
    if (spinner.loading) {
      dispatch(hideSpinner());
    }
  }, []);

  return (
    <div className="container element-top">
      <div className="container-fluid">
        <Affect weathers={weatherBoosts} />
      </div>
      <hr style={{ marginTop: 15, marginBottom: 15 }} />
      <div className="container w-75">
        <Effect weathers={weatherBoosts} types={typeEffective} />
      </div>
    </div>
  );
};

export default Weather;
