const POKEMON_256_ASSET_FORM_PREFIXES = ['.fGIGANTAMAX', '.fMEGA'];

export const hasPokemon256AssetFallback = (asset: string | null | undefined) =>
  Boolean(asset && POKEMON_256_ASSET_FORM_PREFIXES.some((prefix) => asset.includes(prefix)));
