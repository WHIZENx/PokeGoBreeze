import { TypeMultiply } from './type.model';

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

export interface TypeEffChart {
  very_weak?: string[];
  weak?: string[];
  super_resist?: string[];
  very_resist?: string[];
  resist?: string[];
  neutral?: string[];
}
