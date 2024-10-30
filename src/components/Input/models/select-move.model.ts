export interface ISelectMoveModel {
  name: string;
  isElite: boolean;
  isShadow: boolean;
  isPurified: boolean;
  isSpecial: boolean;
}

export class SelectMoveModel implements ISelectMoveModel {
  name = '';
  isElite = false;
  isShadow = false;
  isPurified = false;
  isSpecial = false;

  constructor(name: string, isElite: boolean, isShadow: boolean, isPurified: boolean, isSpecial: boolean) {
    this.name = name;
    this.isElite = isElite;
    this.isShadow = isShadow;
    this.isPurified = isPurified;
    this.isSpecial = isSpecial;
  }
}
