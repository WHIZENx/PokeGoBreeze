import { ICombat } from '../../../core/models/combat.model';

export interface IMoveSet extends Partial<ICombat> {
  id: number;
  uses: number;
}

export class MoveSetModel implements IMoveSet {
  id = 0;
  uses = 0;

  static create(value: IMoveSet | ICombat) {
    const obj = new MoveSetModel();
    Object.assign(obj, value);
    return obj;
  }
}
