import { MoveType } from '../../../enums/type.enum';

export interface ISelectMoveModel {
  name: string;
  moveType: MoveType;
}

export class SelectMoveModel implements ISelectMoveModel {
  name = '';
  moveType = MoveType.None;

  constructor(name: string, moveType: MoveType) {
    this.name = name;
    this.moveType = moveType;
  }
}
