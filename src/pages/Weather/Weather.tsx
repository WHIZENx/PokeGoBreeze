import React from 'react';

import Affect from './Affect';
import Effect from './Effect';

import { useTitle } from '../../utils/hooks/useTitle';
import '../../components/Info/PokemonDetailLayout.scss';
import WeatherOverview from './WeatherOverview';

const Weather = () => {
  useTitle({
    title: 'PokéGO Breeze - Weather Boosts',
    description:
      'Learn about weather effects and Pokémon type boosts in Pokémon GO. Discover which Pokémon types are boosted under different weather conditions.',
    keywords: ['weather boosts', 'Pokémon GO weather', 'type boosts', 'weather effects'],
  });

  return (
    <div className="tw-container tw-pb-3 tw-text-default">
      <div className="pokemon-detail-sections tw-my-3 tw-grid tw-grid-cols-1 tw-gap-4 xl:tw-grid-cols-2">
        <Affect />
        <Effect />
      </div>
      <WeatherOverview />
    </div>
  );
};

export default Weather;
