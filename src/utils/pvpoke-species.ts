export const pvpokeSpeciesAliases: Readonly<Record<string, string>> = {
  AEGISLASH_SHIELD: 'AEGISLASH',
  BASCULIN: 'BASCULIN_RED_STRIPED',
  CALYREX_ICE: 'CALYREX_ICE_RIDER',
  CALYREX_SHADOW: 'CALYREX_SHADOW_RIDER',
  CLODSIRESB: 'CLODSIRE',
  DARMANITAN_GALARIAN_STANDARD: 'DARMANITAN_GALARIAN',
  DEERLING: 'DEERLING_SPRING',
  FLORGES: 'FLORGES_RED',
  FLABEBE: 'FLABEBE_RED',
  FLOETTE: 'FLOETTE_RED',
  FURFROU: 'FURFROU_NATURAL',
  GASTRODON: 'GASTRODON_WEST_SEA',
  GOLISOPODSH: 'GOLISOPOD',
  LANTURNW: 'LANTURN',
  HOOPA: 'HOOPA_CONFINED',
  MEWTWO_ARMORED: 'MEWTWO_ARMOR',
  MIMIKYU: 'MIMIKYU_DISGUISED',
  MINIOR_CORE: 'MINIOR_RED',
  PIKACHU_5TH_ANNIVERSARY: 'PIKACHU',
  PIKACHU_FLYING: 'PIKACHU',
  PIKACHU_KARIYUSHI: 'PIKACHU',
  POLTEAGEIST: 'POLTEAGEIST_PHONY',
  SAWSBUCK: 'SAWSBUCK_SPRING',
  SHELLOS: 'SHELLOS_WEST_SEA',
  SINISTEA: 'SINISTEA_PHONY',
  TAUROS_AQUA: 'TAUROS_PALDEA_AQUA',
  TAUROS_BLAZE: 'TAUROS_PALDEA_BLAZE',
  TAUROS_COMBAT: 'TAUROS_PALDEA_COMBAT',
  TOXTRICITY: 'TOXTRICITY_AMPED',
  UNOWN: 'A',
  ZACIAN_CROWNED: 'ZACIAN_CROWNED_SWORD',
  ZAMAZENTA_CROWNED: 'ZAMAZENTA_CROWNED_SHIELD',
  ZYGARDE: 'ZYGARDE_FIFTY_PERCENT',
  ZYGARDE_10: 'ZYGARDE_TEN_PERCENT',
  VIVILLON: 'VIVILLON_MEADOW',
};

export const normalizePvpokeSpeciesId = (speciesId: string) =>
  speciesId
    .trim()
    .replaceAll('-', '_')
    .toUpperCase()
    .replace(/_ALOLAN$/, '_ALOLA')
    .replace(/_PALDEAN$/, '_PALDEA');

export const getPvpokeSpeciesCandidates = (speciesId: string | undefined) => {
  if (!speciesId) {
    return [];
  }

  const key = normalizePvpokeSpeciesId(speciesId);
  const candidates = [key, key.replace(/_XS$/, ''), key.replace(/_SHADOW$/, '')].map(normalizePvpokeSpeciesId);
  return [...new Set(candidates.flatMap((candidate) => [pvpokeSpeciesAliases[candidate], candidate]).filter(Boolean))];
};
