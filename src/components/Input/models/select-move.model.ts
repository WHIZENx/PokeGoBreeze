export interface ISelectMoveModel {
  name: string;
  elite: boolean;
  shadow: boolean;
  purified: boolean;
  special: boolean;
}

export class SelectMoveModel implements ISelectMoveModel {
  name = '';
  elite = false;
  shadow = false;
  purified = false;
  special = false;

  constructor(name: string, elite: boolean, shadow: boolean, purified: boolean, special: boolean) {
    this.name = name;
    this.elite = elite;
    this.shadow = shadow;
    this.purified = purified;
    this.special = special;
  }
}
