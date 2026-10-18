import { PokemonType } from '../../enums/type.enum';
import { getPokemonType } from '../../utils/utils';
import { GenderType } from '../enums/asset.enum';

export interface IImage {
  gender?: GenderType;
  pokemonId?: number;
  form?: string;
  default: string;
  fallbacks?: string[];
  shiny: string | undefined;
  pokemonType?: PokemonType;
}

export type PokemonAnimationSource = 'project' | 'pokeapi' | 'showdown';

export interface IPokemonAnimationSource {
  source: PokemonAnimationSource;
  url: string;
}

export interface IPokemonAnimation {
  form: string;
  pokemonType: PokemonType;
  sources: IPokemonAnimationSource[];
}

export class ImageModel implements IImage {
  gender?: GenderType;
  pokemonId?: number;
  form?: string;
  default = '';
  fallbacks?: string[];
  shiny = '';
  pokemonType = PokemonType.Normal;

  constructor({ ...props }: IImage) {
    if (props.pokemonType === undefined) {
      props.pokemonType = getPokemonType(props.form, false, false);
    }
    Object.assign(this, props);
  }
}

export interface ICryPath {
  form: string;
  path: string;
  pokemonType?: PokemonType;
}

export class CryPath implements ICryPath {
  form = '';
  path = '';
  pokemonType = PokemonType.Normal;

  constructor({ ...props }: ICryPath) {
    if (props.pokemonType === undefined) {
      props.pokemonType = getPokemonType(props.form, false, false);
    }
    Object.assign(this, props);
  }
}

interface ISound {
  cry: ICryPath[];
}

class Sound implements ISound {
  cry: ICryPath[] = [];
}

export interface IAsset {
  id?: number;
  name: string;
  image: IImage[];
  animation?: IPokemonAnimation[];
  sound: ISound;
}

export class Asset implements IAsset {
  id = 0;
  name = '';
  image: IImage[] = [];
  animation: IPokemonAnimation[] = [];
  sound = new Sound();
}
