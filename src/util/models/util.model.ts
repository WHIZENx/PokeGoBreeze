/* eslint-disable no-unused-vars */
import { IStatsPokemon, StatsPokemon } from '../../core/models/stats.model';
import { isNull, isUndefined } from '../utils';

interface IBaseStatsPokeGo {
  attack: number;
  defense: number;
  stamina: number;
}

export class BaseStatsPokeGo implements IBaseStatsPokeGo {
  attack: number = 0;
  defense: number = 0;
  stamina: number = 0;

  constructor({ ...props }: IBaseStatsPokeGo) {
    Object.assign(this, props);
  }
}

export interface IArrayStats {
  id: number;
  name: string;
  form: string;
  baseStats: IStatsPokemon;
  baseStatsPokeGo: IBaseStatsPokeGo | undefined;
  baseStatsProd: number;
}

// tslint:disable-next-line:max-classes-per-file
export class ArrayStats implements IArrayStats {
  id: number = 0;
  name: string = '';
  form: string = '';
  baseStats: IStatsPokemon = new StatsPokemon();
  baseStatsPokeGo: IBaseStatsPokeGo | undefined;
  baseStatsProd: number = 0;

  constructor({ ...props }: IArrayStats) {
    Object.assign(this, props);
  }
}

export type DynamicObj<S, T extends string | number = string | number> = { [x in T]: S };

export const getValueOrDefault = <T>(
  i: NumberConstructor | StringConstructor | BooleanConstructor | ArrayConstructor | ObjectConstructor,
  value: T | undefined | null,
  defaultValue?: T
) => {
  if (isUndefined(value) || isNull(value)) {
    const type = Object.prototype.toString.call(i.prototype).slice(8, -1).toLowerCase();
    switch (type) {
      case 'number':
        return (defaultValue || 0) as T;
      case 'string':
        return (defaultValue || '') as T;
      case 'boolean':
        return (defaultValue || false) as T;
      case 'array':
        return (defaultValue || []) as T;
      case 'object':
        return (defaultValue || {}) as T;
    }
  }
  return value as T;
};
