export interface ITypeSet {
  NORMAL: ITypeModel;
  FIGHTING: ITypeModel;
  FLYING: ITypeModel;
  POISON: ITypeModel;
  GROUND: ITypeModel;
  ROCK: ITypeModel;
  BUG: ITypeModel;
  GHOST: ITypeModel;
  STEEL: ITypeModel;
  FIRE: ITypeModel;
  WATER: ITypeModel;
  GRASS: ITypeModel;
  ELECTRIC: ITypeModel;
  PSYCHIC: ITypeModel;
  ICE: ITypeModel;
  DRAGON: ITypeModel;
  DARK: ITypeModel;
  FAIRY: ITypeModel;
}

interface ITypeModel {
  NORMAL: number;
  FIGHTING: number;
  FLYING: number;
  POISON: number;
  GROUND: number;
  ROCK: number;
  BUG: number;
  GHOST: number;
  STEEL: number;
  FIRE: number;
  WATER: number;
  GRASS: number;
  ELECTRIC: number;
  PSYCHIC: number;
  ICE: number;
  DRAGON: number;
  DARK: number;
  FAIRY: number;
}

export class TypeSet implements ITypeSet {
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

export class TypeModel implements ITypeModel {
  NORMAL = 0;
  FIGHTING = 0;
  FLYING = 0;
  POISON = 0;
  GROUND = 0;
  ROCK = 0;
  BUG = 0;
  GHOST = 0;
  STEEL = 0;
  FIRE = 0;
  WATER = 0;
  GRASS = 0;
  ELECTRIC = 0;
  PSYCHIC = 0;
  ICE = 0;
  DRAGON = 0;
  DARK = 0;
  FAIRY = 0;
}

export interface TypeMultiply {
  NORMAL: number;
  FIGHTING: number;
  FLYING: number;
  POISON: number;
  GROUND: number;
  ROCK: number;
  BUG: number;
  GHOST: number;
  STEEL: number;
  FIRE: number;
  WATER: number;
  GRASS: number;
  ELECTRIC: number;
  PSYCHIC: number;
  ICE: number;
  DRAGON: number;
  DARK: number;
  FAIRY: number;
}
