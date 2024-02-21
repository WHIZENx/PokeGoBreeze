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
  evo_to_form: string;
  evo_to_id: number;
  evo_to_name: string;
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
  evo_list: EvoList[];
  temp_evo: TempEvo[];
  purified?: PokemonTypeCost;
  thirdMove?: PokemonTypeCost;
  form: string;
  canPurified?: boolean;
}

export class EvolutionDataModel {
  id!: number;
  name!: string;
  // tslint:disable-next-line:variable-name
  evo_list!: EvoList[];
  // tslint:disable-next-line:variable-name
  temp_evo!: TempEvo[];
  purified!: {
    stardust?: number;
    candy?: number;
  };
  thirdMove!: {
    stardust?: number;
    candy?: number;
  };
  form!: string;

  constructor() {
    this.id = 0;
    this.name = '';
    this.evo_list = [];
    this.temp_evo = [];
    this.purified = {};
    this.thirdMove = {};
    this.form = '';
  }
}
