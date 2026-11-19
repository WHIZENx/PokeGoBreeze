import type { IPokemonTableComponent } from '../components/Commons/models/component.model';
import { getPokemonDetailTableName } from './pokemon-display-name';

export interface PokemonDetailHeroData {
  num?: number;
  fullName?: string;
  name?: string;
  pokemonType?: number;
  gen?: number | string;
  region?: string;
  version?: string;
  weightKg?: number;
  heightM?: number;
}

/** Keep both detail routes on the same generated Pokémon metadata contract. */
export const buildPokemonDetailHeroTable = (
  pokemon: PokemonDetailHeroData | undefined,
  isLoadedForms: boolean
): Omit<IPokemonTableComponent, 'className'> => ({
  id: pokemon?.num,
  gen: pokemon?.gen,
  formName: getPokemonDetailTableName(pokemon?.fullName || pokemon?.name, pokemon?.pokemonType),
  region: pokemon?.region,
  version: pokemon?.version,
  weightKg: pokemon?.weightKg,
  heightM: pokemon?.heightM,
  isLoadedForms,
});
