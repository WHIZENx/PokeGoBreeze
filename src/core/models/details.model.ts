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
