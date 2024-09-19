export interface IImage {
  gender?: number;
  pokemonId?: number;
  form?: string;
  default: string;
  shiny: string | undefined;
}

export class ImageModel implements IImage {
  gender?: number;
  pokemonId?: number;
  form?: string;
  default = '';
  shiny = '';

  constructor({ ...props }: IImage) {
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
