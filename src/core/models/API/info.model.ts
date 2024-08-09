import { IPokemonSprit, PokemonSprit } from './form.model';

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
  cries: { [x: string]: string };
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
  is_include_shadow?: boolean;
}

interface Ability {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

interface Path {
  name: string;
  url: string;
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

export interface IPokemonDetail {
  cries: { [x: string]: string };
  forms: Path[];
  height: number;
  id: number;
  isDefault: boolean;
  moves: Move[];
  name: string;
  species: Path;
  sprites: IPokemonSprit;
  stats: Stats[];
  types: Type[];
  weight: number;
  isIncludeShadow?: boolean;
}

export class PokemonDetail implements IPokemonDetail {
  cries!: { [x: string]: string };
  forms: Path[] = [];
  height: number = 0;
  id: number = 0;
  isDefault: boolean = false;
  moves: Move[] = [];
  name: string = '';
  species!: Path;
  sprites!: IPokemonSprit;
  stats: Stats[] = [];
  types: Type[] = [];
  weight: number = 0;
  isIncludeShadow?: boolean;

  static setDetails(info: PokemonInfo) {
    const obj = new PokemonDetail();
    obj.cries = info.cries;
    obj.forms = info.forms;
    obj.height = info.height;
    obj.id = info.id;
    obj.moves = info.moves;
    obj.name = info.name;
    obj.species = info.species;
    obj.sprites = PokemonSprit.setDetails(info.sprites);
    obj.stats = info.stats;
    obj.types = info.types;
    obj.weight = info.weight;
    obj.isDefault = info.is_default;
    obj.isIncludeShadow = info.is_include_shadow;
    return obj;
  }
}
