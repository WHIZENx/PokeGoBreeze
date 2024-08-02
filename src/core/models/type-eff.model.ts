import { TypeModel, TypeMultiply } from './type.model';

export interface ITypeEff {
  NORMAL: TypeMultiply;
  FIGHTING: TypeMultiply;
  FLYING: TypeMultiply;
  POISON: TypeMultiply;
  GROUND: TypeMultiply;
  ROCK: TypeMultiply;
  BUG: TypeMultiply;
  GHOST: TypeMultiply;
  STEEL: TypeMultiply;
  FIRE: TypeMultiply;
  WATER: TypeMultiply;
  GRASS: TypeMultiply;
  ELECTRIC: TypeMultiply;
  PSYCHIC: TypeMultiply;
  ICE: TypeMultiply;
  DRAGON: TypeMultiply;
  DARK: TypeMultiply;
  FAIRY: TypeMultiply;
}

export class TypeEff implements ITypeEff {
  NORMAL: TypeMultiply;
  FIGHTING: TypeMultiply;
  FLYING: TypeMultiply;
  POISON: TypeMultiply;
  GROUND: TypeMultiply;
  ROCK: TypeMultiply;
  BUG: TypeMultiply;
  GHOST: TypeMultiply;
  STEEL: TypeMultiply;
  FIRE: TypeMultiply;
  WATER: TypeMultiply;
  GRASS: TypeMultiply;
  ELECTRIC: TypeMultiply;
  PSYCHIC: TypeMultiply;
  ICE: TypeMultiply;
  DRAGON: TypeMultiply;
  DARK: TypeMultiply;
  FAIRY: TypeMultiply;

  constructor() {
    this.NORMAL = new TypeModel();
    this.FIGHTING = new TypeModel();
    this.FLYING = new TypeModel();
    this.POISON = new TypeModel();
    this.GROUND = new TypeModel();
    this.ROCK = new TypeModel();
    this.BUG = new TypeModel();
    this.GHOST = new TypeModel();
    this.STEEL = new TypeModel();
    this.FIRE = new TypeModel();
    this.WATER = new TypeModel();
    this.GRASS = new TypeModel();
    this.ELECTRIC = new TypeModel();
    this.PSYCHIC = new TypeModel();
    this.ICE = new TypeModel();
    this.DRAGON = new TypeModel();
    this.DARK = new TypeModel();
    this.FAIRY = new TypeModel();
  }
}

export interface ITypeEffChart {
  very_weak?: string[];
  weak?: string[];
  super_resist?: string[];
  very_resist?: string[];
  resist?: string[];
  neutral?: string[];
}

// tslint:disable-next-line:max-classes-per-file
export class TypeEffChart implements ITypeEffChart {
  // tslint:disable-next-line:variable-name
  very_weak?: string[];
  weak?: string[];
  // tslint:disable-next-line:variable-name
  super_resist?: string[];
  // tslint:disable-next-line:variable-name
  very_resist?: string[];
  resist?: string[];
  neutral?: string[];

  // tslint:disable-next-line:no-empty
  constructor() {}

  static create(value: ITypeEffChart) {
    const obj = new TypeEffChart();
    Object.assign(obj, value);
    return obj;
  }
}
