interface Gender {
  malePercent?: number;
  femalePercent?: number;
  genderlessPercent?: number;
}

export interface Details {
  id: number;
  name: string;
  form: string;
  gender: Gender | null;
  releasedGO: boolean;
  isTransferable: boolean | null;
  isDeployable: boolean | null;
  isTradable: boolean | null;
  pokemonClass: string | null;
  disableTransferToPokemonHome: boolean | null;
  isBaby: boolean;
  formChange?: object | null;
}

export class DetailsPokemonModel {
  id!: number;
  name!: string;
  form!: string;
  gender!: Gender | null;
  releasedGO!: boolean;
  isTransferable!: boolean | null;
  isDeployable!: boolean | null;
  isTradable!: boolean | null;
  pokemonClass!: string | null;
  disableTransferToPokemonHome!: boolean | null;
  isBaby!: boolean;
  formChange?: object | null;

  constructor() {
    this.id = 0;
    this.name = '';
    this.form = '';
    this.disableTransferToPokemonHome = false;
    this.isTransferable = false;
    this.formChange = null;
    this.pokemonClass = null;
    this.isTradable = false;
    this.releasedGO = false;
  }
}
