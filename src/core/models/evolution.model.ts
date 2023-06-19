interface EvoList {
  evo_to_form: string;
  evo_to_id: number;
  evo_to_name: string;
  candyCost: number;
  purificationEvoCandyCost: number;
  quest: any;
}

interface TempEvo {
  tempEvolutionName: string;
  firstTempEvolution: number;
  tempEvolution: number;
}

export interface EvolutionModel {
  id: number;
  name: string;
  evo_list: EvoList[];
  temp_evo: TempEvo[];
  purified: {
    stardust?: number;
    candy?: number;
  };
  thirdMove: {
    stardust?: number;
    candy?: number;
  };
  form: string;
}
