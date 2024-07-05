import { ICombat } from '../../../../core/models/combat.model';

export interface CounterModel {
  cmove: ICombat;
  dps: number;
  fmove: ICombat;
  pokemon_forme: string;
  pokemon_id: number;
  pokemon_name: string;
  ratio: number;
  releasedGO: boolean;
}
