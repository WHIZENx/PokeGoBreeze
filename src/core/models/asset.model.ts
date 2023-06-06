interface Sound {
  cry: any[];
}

interface Image {
  gender: number;
  pokemonId: number;
  form: string;
  default: string;
  shiny: string;
}

export interface Asset {
  id: number;
  name: string;
  image: Image[];
  sound: Sound;
}
