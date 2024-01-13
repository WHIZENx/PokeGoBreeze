export interface PokemonGender {
  malePercent?: number;
  femalePercent?: number;
  genderlessPercent?: number;
}

export interface Details {
  id: number;
  name: string;
  form: string;
  gender: PokemonGender | null;
  releasedGO: boolean;
  isTransferable: boolean | null;
  isDeployable: boolean | null;
  isTradable: boolean | null;
  pokemonClass: string | null;
  disableTransferToPokemonHome: boolean | null;
  isBaby: boolean;
  formChange?: {
    availableForm: string[];
    candyCost: string;
    stardustCost: string;
  }[];
}

export class DetailsPokemonModel {
  id!: number;
  name!: string;
  form!: string;
  gender!: PokemonGender | null;
  releasedGO!: boolean;
  isTransferable!: boolean | null;
  isDeployable!: boolean | null;
  isTradable!: boolean | null;
  pokemonClass!: string | null;
  disableTransferToPokemonHome!: boolean | null;
  isBaby!: boolean;
  formChange?: {
    availableForm: string[];
    candyCost: string;
    stardustCost: string;
  }[];

  constructor() {
    this.id = 0;
    this.name = '';
    this.form = '';
    this.disableTransferToPokemonHome = false;
    this.isTransferable = false;
    this.formChange = [];
    this.pokemonClass = null;
    this.isTradable = false;
    this.releasedGO = false;
  }
}
