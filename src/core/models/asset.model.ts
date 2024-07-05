export interface IImage {
  gender?: number;
  pokemonId?: number;
  form?: string;
  default: string;
  shiny: string | null;
}

export interface IAsset {
  id?: number;
  name: string;
  image: IImage[];
  sound: {
    cry: {
      form: string;
      path: string;
    }[];
  };
}

export class Asset implements IAsset {
  id?: number;
  name: string;
  image: IImage[];
  sound: {
    cry: {
      form: string;
      path: string;
    }[];
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
