import { Asset } from '../../core/models/asset.model';
import { Candy } from '../../core/models/candy.model';
import { Combat, CombatPokemon } from '../../core/models/combat.model';
import { CPM } from '../../core/models/cpm.model';
import { Details } from '../../core/models/details.model';
import { EvolutionModel } from '../../core/models/evolution.model';
import { LeagueData } from '../../core/models/league.model';
import { Options } from '../../core/models/options.model';
import { PokemonDataModel, PokemonModel, PokemonNameModel } from '../../core/models/pokemon.model';
import { PVPDataModel } from '../../core/models/pvp.model';
import { SearchingOptionsModel } from '../../core/models/searching.model';
import { Sticker } from '../../core/models/sticker.model';
import { TypeEff } from '../../core/models/typeEff.model';
import { WeatherBoost } from '../../core/models/weatherBoost.model';

export interface StoreModel {
  icon: string | null;
  data: DataModel | null;
  searching: SearchingOptionsModel | null;
  timestamp: number | null;
}

export interface DataModel {
  cpm?: CPM[];
  typeEff?: TypeEff;
  weatherBoost?: WeatherBoost;
  options?: Options;
  pokemonData?: PokemonDataModel[];
  pokemon?: PokemonModel[];
  pokemonName?: PokemonNameModel[];
  candy?: Candy[];
  evolution?: EvolutionModel[];
  stickers?: Sticker[];
  assets?: Asset[];
  combat?: Combat[];
  pokemonCombat?: CombatPokemon[];
  leagues?: LeagueData;
  details?: Details[];
  pvp?: PVPDataModel;
  released?: PokemonDataModel[];
}
