import React, { useEffect, useMemo, useState } from 'react';

import PokemonTableIcon from '../../../components/Sprites/PokemonTableIcon/PokemonTableIcon';
import { IPokemonBattleData } from '../models/battle.model';
import APIService from '../../../services/api.service';

interface BattlePokemonImageProps {
  alt: string;
  className?: string;
  fallbackSize: number;
  pokemon?: IPokemonBattleData;
}

const BattlePokemonImage = ({ alt, className, fallbackSize, pokemon }: BattlePokemonImageProps) => {
  const sources = useMemo(
    () =>
      [
        APIService.getPokemonModel(pokemon?.assetForm, pokemon?.id),
        APIService.getPokemonSqModel(pokemon?.assetForm, pokemon?.id),
        APIService.getPokeFullSprite(pokemon?.id, pokemon?.form),
        APIService.getPokeFullAsset(pokemon?.id),
      ].filter((source, index, values) => source && values.indexOf(source) === index),
    [pokemon?.assetForm, pokemon?.form, pokemon?.id]
  );
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => setSourceIndex(0), [pokemon?.assetForm, pokemon?.form, pokemon?.id]);

  if (sourceIndex >= sources.length) {
    return pokemon?.pokemon ? (
      <PokemonTableIcon {...pokemon.pokemon} pokemonType={pokemon.pokemonType} size={fallbackSize} />
    ) : (
      <PokemonTableIcon
        num={pokemon?.id ?? 0}
        name={pokemon?.name}
        form={pokemon?.form}
        pokemonType={pokemon?.pokemonType}
        size={fallbackSize}
      />
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      src={sources[sourceIndex]}
      onError={() => setSourceIndex((current) => current + 1)}
    />
  );
};

export default BattlePokemonImage;
