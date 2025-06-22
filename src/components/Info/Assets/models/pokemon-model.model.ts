import { IImage } from '../../../../core/models/asset.model';
import { getValueOrDefault, isEqual } from '../../../../utils/extension';

export interface IPokemonModelComponent {
  name: string;
  form: string;
  image: IImage[];
}

export class PokemonModelComponent implements IPokemonModelComponent {
  name = '';
  form = '';
  image: IImage[] = [];

  constructor(value: string | undefined, images: IImage[] | undefined) {
    this.form = getValueOrDefault(String, value);
    this.image = getValueOrDefault(Array, images).filter((item) => isEqual(value, item.form));
  }
}
