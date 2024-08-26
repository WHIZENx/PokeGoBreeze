interface IEvolutionQuestCondition {
  desc?: string;
  pokemonType?: string[];
  throwType?: string;
}

export class EvolutionQuestCondition implements IEvolutionQuestCondition {
  desc?: string;
  pokemonType?: string[];
  throwType?: string;
}

interface IEvolutionQuest {
  genderRequirement?: string;
  kmBuddyDistanceRequirement?: number;
  mustBeBuddy?: boolean;
  onlyDaytime?: boolean;
  onlyNighttime?: boolean;
  lureItemRequirement?: string;
  evolutionItemRequirement?: string;
  onlyUpsideDown?: boolean;
  condition?: IEvolutionQuestCondition | undefined;
  goal?: number;
  type?: string;
  randomEvolution?: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class EvolutionQuest implements IEvolutionQuest {
  genderRequirement?: string;
  kmBuddyDistanceRequirement?: number;
  mustBeBuddy?: boolean;
  onlyDaytime?: boolean;
  onlyNighttime?: boolean;
  lureItemRequirement?: string;
  evolutionItemRequirement?: string;
  onlyUpsideDown?: boolean;
  condition?: IEvolutionQuestCondition | undefined;
  goal?: number;
  type?: string;
  randomEvolution?: boolean;
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

// tslint:disable-next-line:max-classes-per-file
export class EvoList implements IEvoList {
  evoToForm: string;
  evoToId: number;
  evoToName: string;
  candyCost: number;
  item?: string;
  itemCost?: number;
  purificationEvoCandyCost: number;
  quest?: IEvolutionQuest;

  constructor() {
    this.evoToForm = '';
    this.evoToId = 0;
    this.evoToName = '';
    this.candyCost = 0;
    this.purificationEvoCandyCost = 0;
  }
}

export interface ITempEvo {
  tempEvolutionName: string;
  firstTempEvolution: number;
  tempEvolution: number;
  requireMove: string | undefined;
}

export interface PokemonTypeCost {
  stardust?: number;
  candy?: number;
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
  form: string;
  canPurified?: boolean;
  isBaby?: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class EvolutionModel implements IEvolution {
  pokemonId?: string;
  prev?: string;
  id: number = 0;
  name: string = '';
  evoList: EvoList[] = [];
  tempEvo: ITempEvo[] = [];
  purified?: PokemonTypeCost;
  thirdMove?: PokemonTypeCost;
  form: string = '';
  canPurified?: boolean;
  isBaby?: boolean;

  constructor({ ...props }: IEvolution) {
    Object.assign(this, props);
  }
}
