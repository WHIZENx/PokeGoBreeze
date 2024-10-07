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
  NORMAL = new TypeModel();
  FIGHTING = new TypeModel();
  FLYING = new TypeModel();
  POISON = new TypeModel();
  GROUND = new TypeModel();
  ROCK = new TypeModel();
  BUG = new TypeModel();
  GHOST = new TypeModel();
  STEEL = new TypeModel();
  FIRE = new TypeModel();
  WATER = new TypeModel();
  GRASS = new TypeModel();
  ELECTRIC = new TypeModel();
  PSYCHIC = new TypeModel();
  ICE = new TypeModel();
  DRAGON = new TypeModel();
  DARK = new TypeModel();
  FAIRY = new TypeModel();
}

export interface ITypeEffChart {
  veryWeak?: string[];
  weak?: string[];
  superResist?: string[];
  veryResist?: string[];
  resist?: string[];
  neutral?: string[];
}

export class TypeEffChart implements ITypeEffChart {
  veryWeak?: string[];
  weak?: string[];
  superResist?: string[];
  veryResist?: string[];
  resist?: string[];
  neutral?: string[];

  static create(value: ITypeEffChart) {
    const obj = new TypeEffChart();
    Object.assign(obj, value);
    return obj;
  }
}
