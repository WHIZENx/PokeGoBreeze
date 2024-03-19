interface EvolutionQuestCondition {
  desc?: string;
  pokemonType?: string[];
  throwType?: string;
}

interface EvolutionQuest {
  genderRequirement?: string;
  kmBuddyDistanceRequirement?: number;
  mustBeBuddy?: boolean;
  onlyDaytime?: boolean;
  onlyNighttime?: boolean;
  lureItemRequirement?: string;
  evolutionItemRequirement?: string;
  onlyUpsideDown?: boolean;
  condition?: EvolutionQuestCondition | undefined;
  goal?: number;
  type?: string;
  randomEvolution?: boolean;
}

export interface EvoList {
  evoToForm: string;
  evoToId: number;
  evoToName: string;
  candyCost: number;
  purificationEvoCandyCost: number;
  quest?: EvolutionQuest;
}

export interface TempEvo {
  tempEvolutionName: string;
  firstTempEvolution: number;
  tempEvolution: number;
  requireMove: string | undefined;
}

export interface PokemonTypeCost {
  stardust?: number;
  candy?: number;
}

export interface EvolutionModel {
  prev?: string | undefined;
  id: number;
  name: string;
  evoList: EvoList[];
  tempEvo: TempEvo[];
  purified?: PokemonTypeCost;
  thirdMove?: PokemonTypeCost;
  form: string;
  canPurified?: boolean;
}
