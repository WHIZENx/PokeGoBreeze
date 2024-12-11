export interface IEvolutionInfo {
  id: number;
  pokemonId: string;
  form: string;
}

export class EvolutionInfo implements IEvolutionInfo {
  id = 0;
  pokemonId = '';
  form = '';

  static create(value: IEvolutionInfo) {
    const obj = new EvolutionInfo();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IEvolutionChain {
  id: number;
  pokemonId: string;
  evolutionInfos: IEvolutionInfo[];
}

export class EvolutionChain implements IEvolutionChain {
  id = 0;
  pokemonId = '';
  evolutionInfos: IEvolutionInfo[] = [];

  static create(value: IEvolutionChain) {
    const obj = new EvolutionChain();
    Object.assign(obj, value);
    return obj;
  }
}
