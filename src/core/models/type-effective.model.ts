import { ITypeModel, TypeModel } from './type.model';

export interface ITypeEffectiveModel {
  normal: ITypeModel;
  fighting: ITypeModel;
  flying: ITypeModel;
  poison: ITypeModel;
  ground: ITypeModel;
  rock: ITypeModel;
  bug: ITypeModel;
  ghost: ITypeModel;
  steel: ITypeModel;
  fire: ITypeModel;
  water: ITypeModel;
  grass: ITypeModel;
  electric: ITypeModel;
  psychic: ITypeModel;
  ice: ITypeModel;
  dragon: ITypeModel;
  dark: ITypeModel;
  fairy: ITypeModel;
}

export class TypeEffectiveModel implements ITypeEffectiveModel {
  normal = new TypeModel();
  fighting = new TypeModel();
  flying = new TypeModel();
  poison = new TypeModel();
  ground = new TypeModel();
  rock = new TypeModel();
  bug = new TypeModel();
  ghost = new TypeModel();
  steel = new TypeModel();
  fire = new TypeModel();
  water = new TypeModel();
  grass = new TypeModel();
  electric = new TypeModel();
  psychic = new TypeModel();
  ice = new TypeModel();
  dragon = new TypeModel();
  dark = new TypeModel();
  fairy = new TypeModel();
}

export interface ITypeEffectiveChart {
  veryWeak?: string[];
  weak?: string[];
  superResist?: string[];
  veryResist?: string[];
  resist?: string[];
  neutral?: string[];
}

export class TypeEffectiveChart implements ITypeEffectiveChart {
  veryWeak?: string[];
  weak?: string[];
  superResist?: string[];
  veryResist?: string[];
  resist?: string[];
  neutral?: string[];

  static create(value: ITypeEffectiveChart) {
    const obj = new TypeEffectiveChart();
    Object.assign(obj, value);
    return obj;
  }
}
