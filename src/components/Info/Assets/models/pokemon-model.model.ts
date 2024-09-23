import { IImage } from '../../../../core/models/asset.model';
import { isEqual } from '../../../../util/extension';

export interface IPokemonModelComponent {
  name: string;
  form: string;
  image: IImage[];
}

export class PokemonModelComponent implements IPokemonModelComponent {
  name = '';
  form = '';
  image: IImage[] = [];

  constructor(value: string, images: IImage[]) {
    this.form = value;
    this.image = images.filter((item) => isEqual(value, item.form));
  }
}
