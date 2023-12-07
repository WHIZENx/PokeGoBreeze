import { Image } from '../../../../core/models/asset.model';

export interface PokemonModelComponent {
  name: string;
  image: Image[];
}

export class PokemonModelComponent {
  form: string;
  image: Image[];

  constructor(value: string, images: Image[]) {
    this.form = value;
    this.image = images.filter((item) => value === item.form);
  }
}
