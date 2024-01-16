import React, { useEffect } from 'react';

import Affect from './Affect';
import Effect from './Effect';

import './Weather.scss';
import { useSelector, useDispatch } from 'react-redux';
import { hideSpinner, showSpinnerWithMsg } from '../../store/actions/spinner.action';
import { StoreState, SpinnerState } from '../../store/models/state.model';
import { SYNC_MSG } from '../../util/Constants';
import { WeatherBoost } from '../../core/models/weatherBoost.model';
import { TypeEff } from '../../core/models/type-eff.model';

const Weather = () => {
  const dispatch = useDispatch();
  const typeEffective = useSelector((state: StoreState) => state.store.data?.typeEff);
  const weatherBoosts = useSelector((state: StoreState) => state.store.data?.weatherBoost);
  const spinner = useSelector((state: SpinnerState) => state.spinner);

  useEffect(() => {
    if (Object.keys(typeEffective ?? {}).length > 0 && Object.keys(weatherBoosts ?? {}).length > 0 && spinner.loading) {
      dispatch(hideSpinner());
    }
  }, [typeEffective, weatherBoosts]);

  useEffect(() => {
    if (Object.keys(typeEffective ?? {}).length === 0 && Object.keys(weatherBoosts ?? {}).length === 0) {
      dispatch(showSpinnerWithMsg(SYNC_MSG));
    }
    document.title = 'Weather Boosts';
  }, []);

  return (
    <div className="container element-top">
      <div className="container-fluid">
        <Affect weathers={weatherBoosts} />
      </div>
      <hr style={{ marginTop: 15, marginBottom: 15 }} />
      <div className="container w-75">
        <Effect weathers={weatherBoosts as WeatherBoost} types={typeEffective as TypeEff} />
      </div>
    </div>
  );
};

export default Weather;
