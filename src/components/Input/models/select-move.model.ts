export interface ISelectMoveModel {
  name: string;
  elite: boolean;
  shadow: boolean;
  purified: boolean;
  special: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class SelectMoveModel implements ISelectMoveModel {
  name: string = '';
  elite: boolean = false;
  shadow: boolean = false;
  purified: boolean = false;
  special: boolean = false;

  constructor(name: string, elite: boolean, shadow: boolean, purified: boolean, special: boolean) {
    this.name = name;
    this.elite = elite;
    this.shadow = shadow;
    this.purified = purified;
    this.special = special;
  }
}
