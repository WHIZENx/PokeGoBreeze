export interface ITypeModel {
  normal: number;
  fighting: number;
  flying: number;
  poison: number;
  ground: number;
  rock: number;
  bug: number;
  ghost: number;
  steel: number;
  fire: number;
  water: number;
  grass: number;
  electric: number;
  psychic: number;
  ice: number;
  dragon: number;
  dark: number;
  fairy: number;
}

export class TypeModel implements ITypeModel {
  normal = 0;
  fighting = 0;
  flying = 0;
  poison = 0;
  ground = 0;
  rock = 0;
  bug = 0;
  ghost = 0;
  steel = 0;
  fire = 0;
  water = 0;
  grass = 0;
  electric = 0;
  psychic = 0;
  ice = 0;
  dragon = 0;
  dark = 0;
  fairy = 0;
}
