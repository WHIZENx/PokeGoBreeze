interface ITypeSet {
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

// tslint:disable-next-line:max-classes-per-file
export class TypeModel implements ITypeModel {
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

  constructor() {
    this.NORMAL = 0;
    this.FIGHTING = 0;
    this.FLYING = 0;
    this.POISON = 0;
    this.GROUND = 0;
    this.ROCK = 0;
    this.BUG = 0;
    this.GHOST = 0;
    this.STEEL = 0;
    this.FIRE = 0;
    this.WATER = 0;
    this.GRASS = 0;
    this.ELECTRIC = 0;
    this.PSYCHIC = 0;
    this.ICE = 0;
    this.DRAGON = 0;
    this.DARK = 0;
    this.FAIRY = 0;
  }
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
