export interface Image {
  gender: number;
  pokemonId?: number;
  form: string;
  default: string;
  shiny: string | null;
}

export interface Asset {
  id?: number;
  name: string;
  image: Image[];
  sound: {
    cry: {
      form: string;
      path: string;
    }[];
  };
}

export class AssetDataModel {
  id?: number;
  name!: string;
  image!: Image[];
  sound!: {
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
