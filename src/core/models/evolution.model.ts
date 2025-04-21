import { ConditionType, ItemEvolutionRequireType, ItemLureRequireType, QuestType } from '../enums/option.enum';

interface IOpponentPokemonBattle {
  requireDefeat: boolean;
  types: string[];
}

export class OpponentPokemonBattle implements IOpponentPokemonBattle {
  requireDefeat = false;
  types: string[] = [];
}

export interface IEvolutionQuestCondition {
  desc?: ConditionType;
  pokemonType?: string[];
  throwType?: string;
  opponentPokemonBattle?: IOpponentPokemonBattle;
}

export class EvolutionQuestCondition implements IEvolutionQuestCondition {
  desc?: ConditionType;
  pokemonType?: string[];
  throwType?: string;
  opponentPokemonBattle?: IOpponentPokemonBattle;
}

interface IEvolutionQuest {
  genderRequirement?: string;
  kmBuddyDistanceRequirement?: number;
  isMustBeBuddy?: boolean;
  isOnlyDaytime?: boolean;
  isOnlyNighttime?: boolean;
  lureItemRequirement?: ItemLureRequireType;
  evolutionItemRequirement?: ItemEvolutionRequireType;
  isOnlyUpsideDown?: boolean;
  condition?: IEvolutionQuestCondition;
  goal?: number;
  type?: QuestType;
  isRandomEvolution?: boolean;
}

export class EvolutionQuest implements IEvolutionQuest {
  genderRequirement?: string;
  kmBuddyDistanceRequirement?: number;
  isMustBeBuddy?: boolean;
  isOnlyDaytime?: boolean;
  isOnlyNighttime?: boolean;
  lureItemRequirement?: ItemLureRequireType;
  evolutionItemRequirement?: ItemEvolutionRequireType;
  isOnlyUpsideDown?: boolean;
  condition?: IEvolutionQuestCondition;
  goal?: number;
  type?: QuestType;
  isRandomEvolution?: boolean;
}

export interface IEvoList {
  evoToForm: string;
  evoToId: number;
  evoToName: string;
  candyCost: number;
  item?: string;
  itemCost?: number;
  purificationEvoCandyCost: number;
  quest?: IEvolutionQuest;
}

export class EvoList implements IEvoList {
  evoToForm = '';
  evoToId = 0;
  evoToName = '';
  candyCost = 0;
  item?: string;
  itemCost?: number;
  purificationEvoCandyCost = 0;
  quest?: IEvolutionQuest;
}

export interface ITempEvo {
  tempEvolutionName?: string;
  firstTempEvolution: string | number;
  tempEvolution: string | number;
  requireMove?: string;
}

export class TempEvo implements ITempEvo {
  tempEvolutionName?: string;
  firstTempEvolution: string | number = '';
  tempEvolution: string | number = '';
  requireMove?: string;

  static create(value: ITempEvo) {
    const obj = new TempEvo();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPokemonTypeCost {
  stardust: number | undefined;
  candy: number | undefined;
}

export class PokemonTypeCost implements IPokemonTypeCost {
  stardust: number | undefined;
  candy: number | undefined;

  static create(value: IPokemonTypeCost) {
    const obj = new PokemonTypeCost();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IEvolution {
  pokemonId?: string;
  prev?: string;
  id: number;
  name: string;
  evoList: EvoList[];
  tempEvo: ITempEvo[];
  purified?: PokemonTypeCost;
  thirdMove?: PokemonTypeCost;
  form: string | undefined;
  isBaby?: boolean;
}

export class EvolutionModel implements IEvolution {
  pokemonId?: string;
  prev?: string;
  id = 0;
  name = '';
  evoList: EvoList[] = [];
  tempEvo: ITempEvo[] = [];
  purified?: PokemonTypeCost;
  thirdMove?: PokemonTypeCost;
  form: string | undefined;
  isBaby?: boolean;

  constructor({ ...props }: IEvolution) {
    Object.assign(this, props);
  }
}
