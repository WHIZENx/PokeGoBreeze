import React from 'react';

import iconManifest from '../../../assets/generated/pokemon-icons/pokemon-icon-index.json';
import iconSheet from '../../../assets/generated/pokemon-icons/pokemonicons-sheet.png';
import { PokemonType } from '../../../enums/type.enum';

interface PokemonTableIconProps {
  num: number;
  name?: string;
  fullName?: string;
  slug?: string;
  sprite?: string;
  form?: string;
  baseSpecies?: string;
  pokemonType?: PokemonType;
  className?: string;
  size?: number;
}

const UNKNOWN_SPRITES = new Set(['', 'unknown', 'unknownpokemon']);
const BASE_FORMS = new Set(['', 'normal', 'ordinary', 'standard', 'hero']);

const toId = (value?: string) => (value ?? '').toLowerCase().replaceAll(/[^a-z0-9]+/g, '');

const normalizeCandidate = (value?: string, pokemonType?: PokemonType) => {
  let id = toId(value);
  if (UNKNOWN_SPRITES.has(id)) {
    return '';
  }

  if (pokemonType === PokemonType.Shadow || pokemonType === PokemonType.Purified) {
    id = id.replace(/(?:shadow|purified)$/, '');
  }

  id = id
    .replaceAll('hisuian', 'hisui')
    .replaceAll('galarian', 'galar')
    .replaceAll('alolan', 'alola')
    .replaceAll('paldean', 'paldea')
    .replace(/breed$/, '')
    .replace(/female(?=mega$)/, 'f')
    .replace(/male(?=mega$)/, 'm')
    .replace(/exclamationpoint$/, 'exclamation')
    .replace(/questionmark$/, 'question')
    .replace(/eastsea$/, 'east')
    .replace(/female$/, 'f')
    .replace(/complete(?:fifty|ten)percent$/, 'complete')
    .replace(/tenpercent$/, '10')
    .replace(/originalcolor$/, 'original')
    .replace(/familyoffour$/, 'four')
    .replace(/crownedsword$/, 'crowned')
    .replace(/crownedshield$/, 'crowned')
    .replace(/icerider$/, 'ice')
    .replace(/shadowrider$/, 'shadow')
    .replace(/standard$/, '');
  return id;
};

export const resolvePokemonIconIndex = ({
  num,
  name,
  fullName,
  slug,
  sprite,
  form,
  baseSpecies,
  pokemonType,
}: Omit<PokemonTableIconProps, 'className' | 'size'>) => {
  const baseId = normalizeCandidate(baseSpecies, pokemonType);
  const formId = normalizeCandidate(form, pokemonType);
  const candidates = [
    normalizeCandidate(sprite, pokemonType),
    normalizeCandidate(slug, pokemonType),
    normalizeCandidate(fullName, pokemonType),
    normalizeCandidate(name, pokemonType),
    !BASE_FORMS.has(formId) && baseId ? normalizeCandidate(`${baseId}-${form}`, pokemonType) : '',
  ];
  const indexes = iconManifest.indexes as Record<string, number>;
  const alternate = candidates.find((candidate) => candidate && indexes[candidate] !== undefined);

  // Pokémon Showdown indexes base species by National Pokédex number. GO-only
  // costumes that have no dedicated cell intentionally fall back to this icon.
  return alternate ? indexes[alternate] : Math.min(Math.max(Math.trunc(num), 0), 1025);
};

const PokemonTableIcon = ({ className = '', size = 48, ...pokemon }: PokemonTableIconProps) => {
  const index = resolvePokemonIconIndex(pokemon);
  const { imageWidth, imageHeight, cellWidth, cellHeight, columns } = iconManifest.sheet;
  const scale = size / cellWidth;
  const left = (index % columns) * cellWidth;
  const top = Math.floor(index / columns) * cellHeight;
  const label = pokemon.name || pokemon.baseSpecies || `Pokémon #${pokemon.num}`;

  return (
    <span
      aria-label={`${label} icon`}
      className={`tw-inline-block tw-shrink-0 tw-bg-no-repeat tw-align-middle [image-rendering:pixelated] ${className}`}
      data-pokemon-icon-index={index}
      role="img"
      style={{
        width: cellWidth * scale,
        height: cellHeight * scale,
        backgroundImage: `url(${iconSheet})`,
        backgroundPosition: `${-left * scale}px ${-top * scale}px`,
        backgroundSize: `${imageWidth * scale}px ${imageHeight * scale}px`,
      }}
    />
  );
};

export default PokemonTableIcon;
