import { Asset } from '../../core/models/asset.model';
import { Combat, CombatPokemon } from '../../core/models/combat.model';
import { CPM } from '../../core/models/cpm.model';
import { EvolutionModel } from '../../core/models/evolution.model';
import { LeagueData } from '../../core/models/league.model';
import { Options } from '../../core/models/options.model';
import { PokemonDataModel, PokemonNameModel } from '../../core/models/pokemon.model';
import { PVPDataModel } from '../../core/models/pvp.model';
import { SearchingOptionsModel } from '../../core/models/searching.model';
import { StickerModel } from '../../core/models/sticker.model';
import { TypeEff } from '../../core/models/type-eff.model';
import { WeatherBoost } from '../../core/models/weatherBoost.model';

export interface StoreModel {
  icon?: string;
  data?: DataModel;
  searching?: SearchingOptionsModel;
  timestamp?: number;
}

export interface DataModel {
  cpm: CPM[];
  typeEff: TypeEff;
  weatherBoost: WeatherBoost;
  options: Options;
  pokemon: PokemonDataModel[];
  pokemonName: PokemonNameModel[];
  evolution: EvolutionModel[];
  stickers: StickerModel[];
  assets: Asset[];
  combat: Combat[];
  pokemonCombat: CombatPokemon[];
  leagues: LeagueData;
  pvp: PVPDataModel;
}
