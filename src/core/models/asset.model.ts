import { PokemonType } from '../../enums/type.enum';
import { getPokemonType } from '../../util/utils';
import { GenderType } from '../enums/asset.enum';

export interface IImage {
  gender?: GenderType;
  pokemonId?: number;
  form?: string;
  default: string;
  shiny: string | undefined;
  pokemonType: PokemonType;
}

export class ImageModel implements IImage {
  gender?: GenderType;
  pokemonId?: number;
  form?: string;
  default = '';
  shiny = '';
  pokemonType = PokemonType.Normal;

  constructor({ ...props }: IImage) {
    props.pokemonType = getPokemonType(props.form);
    Object.assign(this, props);
  }
}

export interface ICryPath {
  form: string;
  path: string;
}

export class CryPath implements ICryPath {
  form = '';
  path = '';

  constructor({ ...props }: ICryPath) {
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
  sound: ISound;
}

export class Asset implements IAsset {
  id = 0;
  name = '';
  image: IImage[] = [];
  sound = new Sound();
}
