import React from 'react';

import Affect from './Affect';
import Effect from './Effect';

import './Weather.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { useChangeTitle } from '../../util/hooks/useChangeTitle';

const Weather = () => {
  useChangeTitle('Weather Boosts');
  const typeEffective = useSelector((state: StoreState) => state.store.data.typeEff);
  const weatherBoosts = useSelector((state: StoreState) => state.store.data.weatherBoost);

  return (
    <div className="container mt-2">
      <div className="container w-75">
        <Affect weathers={weatherBoosts} />
      </div>
      <hr className="my-3" />
      <div className="container w-75">
        <Effect weathers={weatherBoosts} types={typeEffective} />
      </div>
    </div>
  );
};

export default Weather;
