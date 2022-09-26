import React, { useEffect } from 'react';

import Affect from './Affect';
import Effect from './Effect';

import './Weather.css';
import { useSelector, RootStateOrAny } from 'react-redux';

const Weather = () => {
  const typeEffective = useSelector((state: RootStateOrAny) => state.store.data.typeEff);
  const weatherBoosts = useSelector((state: RootStateOrAny) => state.store.data.weatherBoost);

  useEffect(() => {
    document.title = 'Weather Boosts';
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
