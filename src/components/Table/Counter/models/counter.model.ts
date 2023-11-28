import { Combat } from '../../../../core/models/combat.model';

export interface CounterModel {
  cmove: Combat;
  dps: number;
  fmove: Combat;
  pokemon_forme: string;
  pokemon_id: number;
  pokemon_name: string;
  ratio: number;
  releasedGO: boolean;
}
