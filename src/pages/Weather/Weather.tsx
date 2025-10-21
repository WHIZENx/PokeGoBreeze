import React from 'react';

import Affect from './Affect';
import Effect from './Effect';

import { useTitle } from '../../utils/hooks/useTitle';

const Weather = () => {
  useTitle({
    title: 'PokéGO Breeze - Weather Boosts',
    description:
      'Learn about weather effects and Pokémon type boosts in Pokémon GO. Discover which Pokémon types are boosted under different weather conditions.',
    keywords: ['weather boosts', 'Pokémon GO weather', 'type boosts', 'weather effects'],
  });

  return (
    <div className="tw-container tw-mt-2">
      <div className="tw-container tw-w-3/4">
        <Affect />
      </div>
      <hr className="tw-my-3" />
      <div className="tw-container tw-w-3/4">
        <Effect />
      </div>
    </div>
  );
};

export default Weather;
