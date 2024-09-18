import { Combat, ICombat } from '../../../../core/models/combat.model';

export interface ICounterModel {
  cMove: ICombat;
  dps: number;
  fMove: ICombat;
  pokemonForme: string | null;
  pokemonId: number;
  pokemonName: string;
  ratio: number;
  releasedGO: boolean;
}

export class CounterModel implements ICounterModel {
  cMove = new Combat();
  dps = 0;
  fMove = new Combat();
  pokemonForme = '';
  pokemonId = 0;
  pokemonName = '';
  ratio = 0;
  releasedGO = false;

  constructor({ ...props }: ICounterModel) {
    Object.assign(this, props);
  }
}
