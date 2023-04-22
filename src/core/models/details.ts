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
  isTransferable: any;
  isDeployable: any;
  isTradable: any;
  pokemonClass: any;
  disableTransferToPokemonHome: any;
  isBaby: boolean;
  formChange?: object | null;
}
