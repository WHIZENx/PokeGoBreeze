import { Combat, ICombat } from '../../../../core/models/combat.model';

export interface ICounterModel {
  cMove: ICombat;
  dps: number;
  fMove: ICombat;
  pokemon_forme: string | null;
  pokemon_id: number;
  pokemon_name: string | null;
  ratio: number;
  releasedGO: boolean;
}

export class CounterModel implements ICounterModel {
  cMove: ICombat = new Combat();
  dps: number = 0;
  fMove: ICombat = new Combat();
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
