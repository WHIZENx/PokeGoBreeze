export interface IImage {
  gender?: number;
  pokemonId?: number;
  form?: string;
  default: string;
  shiny: string | null;
}

export class ImageModel implements IImage {
  gender?: number;
  pokemonId?: number;
  form?: string;
  default: string = '';
  shiny: string | null = '';

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
  form: string = '';
  path: string = '';

  constructor({ ...props }: ICryPath) {
    Object.assign(this, props);
  }
}

export interface IAsset {
  id?: number;
  name: string;
  image: IImage[];
  sound: {
    cry: ICryPath[];
  };
}

// tslint:disable-next-line:max-classes-per-file
export class Asset implements IAsset {
  id?: number;
  name: string;
  image: IImage[];
  sound: {
    cry: ICryPath[];
  };

  constructor() {
    this.id = 0;
    this.name = '';
    this.image = [];
    this.sound = {
      cry: [],
    };
  }
}
