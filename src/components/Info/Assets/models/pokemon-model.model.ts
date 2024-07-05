import { IImage } from '../../../../core/models/asset.model';

export interface IPokemonModelComponent {
  name: string;
  form: string;
  image: IImage[];
}

export class PokemonModelComponent implements IPokemonModelComponent {
  name = '';
  form: string;
  image: IImage[];

  constructor(value: string, images: IImage[]) {
    this.form = value;
    this.image = images.filter((item) => value === item.form);
  }
}
