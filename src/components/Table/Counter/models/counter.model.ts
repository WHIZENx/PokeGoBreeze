import { Combat, ICombat } from '../../../../core/models/combat.model';

export interface ICounterModel {
  cMove: ICombat;
  dps: number;
  fMove: ICombat;
  pokemonForme: string | null;
  pokemonId: number;
  pokemonName: string | null;
  ratio: number;
  releasedGO: boolean;
}

export class CounterModel implements ICounterModel {
  cMove: ICombat = new Combat();
  dps: number = 0;
  fMove: ICombat = new Combat();
  pokemonForme: string | null = '';
  pokemonId: number = 0;
  pokemonName: string | null = '';
  ratio: number = 0;
  releasedGO: boolean = false;

  constructor({ ...props }: ICounterModel) {
    Object.assign(this, props);
  }
}
