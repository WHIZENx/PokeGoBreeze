import React from 'react';

import Affect from './Affect';
import Effect from './Effect';

import './Weather.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { useTitle } from '../../utils/hooks/useTitle';

const Weather = () => {
  useTitle({
    title: 'PokéGO Breeze - Weather Boosts',
    description:
      'Learn about weather effects and Pokémon type boosts in Pokémon GO. Discover which Pokémon types are boosted under different weather conditions.',
    keywords: ['weather boosts', 'Pokémon GO weather', 'type boosts', 'weather effects'],
  });
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
