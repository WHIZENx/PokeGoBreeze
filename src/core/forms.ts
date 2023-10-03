import { PokemonFormModify, PokemonFormModifyModel } from './models/API/form.model';

// Pokémon GO Forms
const GO_FORMS: PokemonFormModify[] = [
  new PokemonFormModifyModel(150, 'mewtwo', 'mewtwo', 'armor', true, true, false, false, false, 'mewtwo-armor', 'Pokémon-GO', [
    { type: { name: 'psychic' } },
  ]),
];

export const getFormsGO = (id: number) => {
  return GO_FORMS.filter((pokemon) => pokemon.default_id === id);
};

// Pokémon GO Stats Change
interface PokeGOStats {
  id: string;
  attack: number;
  defense: number;
  stamina: number;
}

const PRIMAL_STATS: PokeGOStats = {
  id: 'primal',
  attack: 353,
  defense: 268,
  stamina: 218,
};

const MEGA_RAYQUAZA: PokeGOStats = {
  id: 'rayquaza-mega',
  attack: 377,
  defense: 210,
  stamina: 227,
};

const pokeGOStats: PokeGOStats[] = [PRIMAL_STATS, MEGA_RAYQUAZA];

export const findStatsPokeGO = (id: string | undefined) => {
  if (!id) {
    return null;
  }
  return pokeGOStats.find((pokemon) => id.includes(pokemon.id));
};
