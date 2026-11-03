import React from 'react';

import Attacker from './Attacker';
import Defender from './Defender';

import { useTitle } from '../../utils/hooks/useTitle';
import '../../components/Info/PokemonDetailLayout.scss';
import TypeMatchupMatrix from './TypeMatchupMatrix';

const TypeEffect = () => {
  useTitle({
    title: 'PokéGO Breeze - Type Effectiveness',
    description:
      'Complete Pokémon GO type effectiveness chart. Learn which types are strong or weak against other types to maximize your battle strategy.',
    keywords: [
      'type effectiveness',
      'Pokémon GO types',
      'type chart',
      'type matchups',
      'super effective',
      'battle strategy',
    ],
  });

  return (
    <div className="tw-container tw-pb-3 tw-text-default">
      <div className="pokemon-detail-sections tw-my-3 tw-grid tw-grid-cols-1 tw-gap-4 xl:tw-grid-cols-2">
        <Attacker />
        <Defender />
        <div className="xl:tw-col-span-2">
          <TypeMatchupMatrix />
        </div>
      </div>
    </div>
  );
};

export default TypeEffect;
