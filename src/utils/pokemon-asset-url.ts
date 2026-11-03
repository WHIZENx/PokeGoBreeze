const GIGANTAMAX_ASSET_TOKEN = '.fGIGANTAMAX';

export const isGigantamaxPokemonAsset = (asset: string | null | undefined) =>
  Boolean(asset?.includes(GIGANTAMAX_ASSET_TOKEN));
