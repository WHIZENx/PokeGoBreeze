import { Combat, ICombat } from '../../../../core/models/combat.model';

export interface ICounterModel {
  cmove: ICombat;
  dps: number;
  fmove: ICombat;
  pokemon_forme: string | null;
  pokemon_id: number;
  pokemon_name: string | null;
  ratio: number;
  releasedGO: boolean;
}

export class CounterModel implements ICounterModel {
  cmove: ICombat = new Combat();
  dps: number = 0;
  fmove: ICombat = new Combat();
  // tslint:disable-next-line:variable-name
  pokemon_forme: string | null = '';
  // tslint:disable-next-line:variable-name
  pokemon_id: number = 0;
  // tslint:disable-next-line:variable-name
  pokemon_name: string | null = '';
  ratio: number = 0;
  releasedGO: boolean = false;

  constructor({ ...props }: ICounterModel) {
    Object.assign(this, props);
  }
}
