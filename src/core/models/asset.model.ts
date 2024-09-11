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

// tslint:disable-next-line:max-classes-per-file
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

// tslint:disable-next-line:max-classes-per-file
class Sound implements ISound {
  cry: ICryPath[] = [];
}

export interface IAsset {
  id?: number;
  name: string;
  image: IImage[];
  sound: ISound;
}

// tslint:disable-next-line:max-classes-per-file
export class Asset implements IAsset {
  id?: number;
  name: string;
  image: IImage[];
  sound: ISound;

  constructor() {
    this.id = 0;
    this.name = '';
    this.image = [];
    this.sound = new Sound();
  }
}
