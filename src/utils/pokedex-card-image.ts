export const buildPokedexCardImageCandidates = (
  pokemonGoAsset: string | null | undefined,
  profileImage: string | null | undefined,
  ...fallbacks: Array<string | null | undefined>
) => [
  ...new Set(
    [pokemonGoAsset || profileImage, ...(pokemonGoAsset ? [profileImage] : []), ...fallbacks].filter(
      (candidate): candidate is string => Boolean(candidate)
    )
  ),
];
