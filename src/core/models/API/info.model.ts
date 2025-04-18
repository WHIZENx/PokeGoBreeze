import { PokemonClass, PokemonType } from '../../../enums/type.enum';
import { DynamicObj } from '../../../util/extension';
import { getGenerationPokemon, splitAndCapitalize } from '../../../util/utils';
import { IEvoList, ITempEvo } from '../evolution.model';
import { Encounter, IPokemonData, IPokemonFormChange, IPokemonGenderRatio, PokemonGenderRatio } from '../pokemon.model';
import { StatsPokemonGO } from '../stats.model';
import { IPokemonSprit, PokemonSprit } from './form.model';
import { Path } from './species.model';

export interface SpriteInfo {
  back_default: string;
  back_female: string | null;
  back_shiny: string | null;
  back_shiny_female: string | null;
  front_default: string;
  front_female: string | null;
  front_shiny: string | null;
  front_shiny_female: string | null;
  other: {
    dream_world: {
      front_default: string;
      front_female: string | null;
    };
    home: {
      front_default: string;
      front_female: string | null;
      front_shiny: string | null;
      front_shiny_female: string | null;
    };
    'official-artwork': {
      front_default: string;
      front_shiny: string | null;
    };
  };
  versions: {
    'generation-i': {
      'red-blue': {
        back_default: string | null;
        back_gray: string | null;
        back_transparent: string | null;
        front_default: string | null;
        front_gray: string | null;
        front_transparent: string | null;
      };
      yellow: {
        back_default: string | null;
        back_gray: string | null;
        back_transparent: string | null;
        front_default: string | null;
        front_gray: string | null;
        front_transparent: string | null;
      };
    };
    'generation-ii': {
      crystal: {
        back_default: string | null;
        back_shiny: string | null;
        back_shiny_transparent: string | null;
        back_transparent: string | null;
        front_default: string | null;
        front_shiny: string | null;
        front_shiny_transparent: string | null;
        front_transparent: string | null;
      };
      gold: {
        back_default: string | null;
        back_shiny: string | null;
        front_default: string | null;
        front_shiny: string | null;
        front_transparent: string | null;
      };
      silver: {
        back_default: string | null;
        back_shiny: string | null;
        front_default: string | null;
        front_shiny: string | null;
        front_transparent: string | null;
      };
    };
    'generation-iii': {
      emerald: {
        front_default: string | null;
        front_shiny: string | null;
      };
      'firered-leafgreen': {
        back_default: string | null;
        back_shiny: string | null;
        front_default: string | null;
        front_shiny: string | null;
      };
      'ruby-sapphire': {
        back_default: string | null;
        back_shiny: string | null;
        front_default: string | null;
        front_shiny: string | null;
      };
    };
    'generation-iv': {
      'diamond-pearl': {
        back_default: string | null;
        back_female: string | null;
        back_shiny: string | null;
        back_shiny_female: string | null;
        front_default: string | null;
        front_female: string | null;
        front_shiny: string | null;
        front_shiny_female: string | null;
      };
      'heartgold-soulsilver': {
        back_default: string | null;
        back_female: string | null;
        back_shiny: string | null;
        back_shiny_female: string | null;
        front_default: string | null;
        front_female: string | null;
        front_shiny: string | null;
        front_shiny_female: string | null;
      };
      platinum: {
        back_default: string | null;
        back_female: string | null;
        back_shiny: string | null;
        back_shiny_female: string | null;
        front_default: string | null;
        front_female: string | null;
        front_shiny: string | null;
        front_shiny_female: string | null;
      };
    };
    'generation-v': {
      'black-white': {
        animated: {
          back_default: string | null;
          back_female: string | null;
          back_shiny: string | null;
          back_shiny_female: string | null;
          front_default: string | null;
          front_female: string | null;
          front_shiny: string | null;
          front_shiny_female: string | null;
        };
        back_default: string | null;
        back_female: string | null;
        back_shiny: string | null;
        back_shiny_female: string | null;
        front_default: string | null;
        front_female: string | null;
        front_shiny: string | null;
        front_shiny_female: string | null;
      };
    };
    'generation-vi': {
      'omegaruby-alphasapphire': {
        front_default: string | null;
        front_female: string | null;
        front_shiny: string | null;
        front_shiny_female: string | null;
      };
      'x-y': {
        front_default: string | null;
        front_female: string | null;
        front_shiny: string | null;
        front_shiny_female: string | null;
      };
    };
    'generation-vii': {
      icons: {
        front_default: string | null;
        front_female: string | null;
      };
      'ultra-sun-ultra-moon': {
        front_default: string | null;
        front_female: string | null;
        front_shiny: string | null;
        front_shiny_female: string | null;
      };
    };
    'generation-viii': {
      icons: {
        front_default: string | null;
        front_female: string | null;
      };
    };
  };
}

export interface PokemonInfo {
  abilities: Ability[];
  base_experience: number;
  cries: DynamicObj<string>;
  forms: Path[];
  game_indices: Indices[];
  height: number;
  held_items: [];
  id: number;
  is_default: boolean;
  location_area_encounters: string;
  moves: Move[];
  name: string;
  order: number;
  past_types: [];
  species: Path;
  sprites: SpriteInfo;
  stats: Stats[];
  types: Type[];
  weight: number;
  isIncludeShadow?: boolean;
}

interface Ability {
  ability: Path;
  is_hidden: boolean;
  slot: number;
}

interface Indices {
  game_index: number;
  version: Path;
}

interface Move {
  move: Path;
  version_group_details: LevelLearned[];
}

interface LevelLearned {
  level_learned_at: number;
  move_learn_method: Path;
  version_group: Path;
}

export interface Stats {
  base_stat: number;
  effort: number;
  stat: Path;
}

export interface Type {
  slot: number;
  type: Path;
}

export interface IPokemonDetailInfo {
  cries?: DynamicObj<string>;
  forms: Path[];
  height: number;
  id: number;
  isDefault: boolean;
  name: string;
  speciesName?: string;
  sprites: IPokemonSprit;
  stats: Stats[];
  types: string[];
  weight: number;
  isIncludeShadow?: boolean;
}

export class PokemonDetailInfo implements IPokemonDetailInfo {
  cries?: DynamicObj<string>;
  forms: Path[] = [];
  height = 0;
  id = 0;
  isDefault = false;
  name = '';
  speciesName?: string;
  sprites = new PokemonSprit();
  stats: Stats[] = [];
  types: string[] = [];
  weight = 0;
  isIncludeShadow?: boolean;

  static setDetails(info: PokemonInfo) {
    const obj = new PokemonDetail();
    obj.cries = info.cries;
    obj.forms = info.forms;
    obj.height = info.height;
    obj.id = info.id;
    obj.name = info.name;
    obj.speciesName = info.species?.name;
    obj.sprites = PokemonSprit.setDetails(info.sprites);
    obj.stats = info.stats;
    obj.types = info.types.map((item) => item.type.name);
    obj.weight = info.weight;
    obj.isDefault = info.is_default;
    obj.isIncludeShadow = info.isIncludeShadow;
    return obj;
  }
}

export interface IPokemonDetail extends IPokemonDetailInfo {
  encounter?: Encounter;
  fullName: string | undefined;
  statsGO: StatsPokemonGO;
  forme?: string | null;
  pokemonClass?: PokemonClass;
  pokemonType?: PokemonType;
  formChange?: IPokemonFormChange[];
  genderRatio: IPokemonGenderRatio;
  pokemonId?: string;
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  prevEvo: string | null;
  sprite?: string;
  releasedGO: boolean;
  quickMoves?: string[];
  cinematicMoves?: string[];
  specialMoves?: string[];
  exclusiveMoves?: string[];
  dynamaxMoves?: string[];
  eliteQuickMoves?: string[];
  eliteCinematicMoves?: string[];
  shadowMoves?: string[];
  purifiedMoves?: string[];
}

export class PokemonDetail implements IPokemonDetail {
  cries?: DynamicObj<string>;
  forms: Path[] = [];
  height = 0;
  id = 0;
  isDefault = false;
  name = '';
  speciesName?: string;
  sprites = new PokemonSprit();
  stats: Stats[] = [];
  types: string[] = [];
  weight = 0;
  isIncludeShadow?: boolean;
  encounter?: Encounter;
  fullName: string | undefined;
  statsGO = new StatsPokemonGO();
  forme?: string | null;
  pokemonClass?: PokemonClass;
  pokemonType?: PokemonType;
  formChange?: IPokemonFormChange[];
  genderRatio = new PokemonGenderRatio();
  pokemonId?: string;
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  prevEvo: string | null = null;
  sprite?: string;
  releasedGO = true;
  quickMoves?: string[];
  cinematicMoves?: string[];
  specialMoves?: string[];
  exclusiveMoves?: string[];
  dynamaxMoves?: string[];
  eliteQuickMoves?: string[];
  eliteCinematicMoves?: string[];
  shadowMoves?: string[];
  purifiedMoves?: string[];

  static setDetails(details: IPokemonDetailInfo) {
    const obj = new PokemonDetail();
    Object.assign(obj, details);
    return obj;
  }

  static setData(data: IPokemonData, info?: PokemonInfo) {
    let obj = new PokemonDetail();
    if (info) {
      obj = PokemonDetailInfo.setDetails(info);
    } else {
      obj.id = data.num;
      obj.types = data.types;
      obj.weight = data.weightKg;
      obj.height = data.heightM;
    }
    obj.encounter = data.encounter;
    obj.fullName = data.fullName;
    if (data.statsGO) {
      obj.statsGO = data.statsGO;
    }
    obj.forme = data.forme;
    obj.pokemonClass = data.pokemonClass;
    obj.pokemonType = data.pokemonType;
    obj.formChange = data.formChange;
    obj.genderRatio = data.genderRatio;
    obj.pokemonId = data.pokemonId;
    obj.evoList = data.evoList;
    obj.tempEvo = data.tempEvo;
    obj.prevEvo = data.prevo;
    obj.sprite = data.sprite;
    obj.releasedGO = data.releasedGO;
    obj.quickMoves = data.quickMoves;
    obj.cinematicMoves = data.cinematicMoves;
    obj.specialMoves = data.specialMoves;
    obj.exclusiveMoves = data.exclusiveMoves;
    obj.dynamaxMoves = data.dynamaxMoves;
    obj.eliteQuickMoves = data.eliteQuickMoves;
    obj.eliteCinematicMoves = data.eliteCinematicMoves;
    obj.purifiedMoves = data.purifiedMoves;
    obj.shadowMoves = data.shadowMoves;
    return obj;
  }
}

interface InfoEvoToDetail {
  gender: string | null;
  held_item: Path;
  item: string | null;
  known_move: string | null;
  known_move_type: string | null;
  location: string | null;
  min_affection: string | null;
  min_beauty: string | null;
  min_happiness: string | null;
  min_level: string | null;
  needs_overworld_rain: boolean;
  party_species: string | null;
  party_type: string | null;
  relative_physical_stats: string | null;
  time_of_day: string | null;
  trade_species: string | null;
  trigger: Path;
  turn_upside_down: boolean;
}

interface PokemonInfoEvoChain {
  evolution_details: InfoEvoToDetail[];
  evolves_to: PokemonInfoEvoChain[];
  is_baby: boolean;
  species: Path;
}

export interface PokemonInfoEvo {
  baby_trigger_item: Path | null;
  chain: PokemonInfoEvoChain;
  id: number;
}

export interface IInfoEvoChain {
  id: number;
  name: string;
  evolutionDetails: InfoEvoToDetail[];
  evolvesTo: IInfoEvoChain[];
  isBaby: boolean;
}

class InfoEvoChain implements IInfoEvoChain {
  id = 0;
  name = '';
  evolutionDetails: InfoEvoToDetail[] = [];
  evolvesTo: IInfoEvoChain[] = [];
  isBaby = false;

  static mapping(value: PokemonInfoEvoChain) {
    const obj = new InfoEvoChain();
    obj.id = getGenerationPokemon(value.species.url);
    obj.name = splitAndCapitalize(value.species.name, '-', ' ');
    obj.evolutionDetails = value.evolution_details;
    obj.evolvesTo = value.evolves_to.map((v) => this.mapping(v));
    obj.isBaby = value.is_baby;
    return obj;
  }
}

export interface IPokemonDetailEvoChain {
  chain: IInfoEvoChain;
  id: number;
}

export class PokemonDetailEvoChain implements IPokemonDetailEvoChain {
  chain = new InfoEvoChain();
  id = 0;

  static mapping(value: PokemonInfoEvo) {
    const obj = new PokemonDetailEvoChain();
    obj.id = value.id;
    obj.chain = InfoEvoChain.mapping(value.chain);
    return obj;
  }
}
