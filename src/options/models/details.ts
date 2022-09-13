interface gender {
    malePercent?: number;
    femalePercent?: number;
    genderlessPercent?: number;
}

export interface details {
    id: number;
    name: string;
    form: string;
    gender: gender | null,
    releasedGO: boolean;
    isTransferable: any;
    isDeployable: any;
    isTradable: any;
    pokemonClass: any;
    disableTransferToPokemonHome: any;
    isBaby: boolean;
}