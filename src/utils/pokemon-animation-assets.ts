import { IPokemonAnimation, IPokemonAnimationSource, PokemonAnimationSource } from '../core/models/asset.model';
import { PokemonType } from '../enums/type.enum';

export const pokemonAnimationSourcePriority: readonly PokemonAnimationSource[] = ['project', 'pokeapi', 'showdown'];

const animationSourceRank = new Map(pokemonAnimationSourcePriority.map((source, index) => [source, index]));

export const sortAnimationSources = (sources: IPokemonAnimationSource[]) =>
  [...sources].sort(
    (left, right) =>
      (animationSourceRank.get(left.source) ?? Number.MAX_SAFE_INTEGER) -
      (animationSourceRank.get(right.source) ?? Number.MAX_SAFE_INTEGER)
  );

export const selectAnimationForm = (
  animations: IPokemonAnimation[],
  formName: string,
  pokemonType = PokemonType.Normal
) => {
  const normalizedForm = formName.replaceAll('-', '_').toUpperCase();
  const exact = animations.find(
    (animation) => animation.form.toUpperCase() === normalizedForm && animation.pokemonType === pokemonType
  );
  if (exact) {
    return exact;
  }

  const normalizedPokemonType = pokemonType === PokemonType.None ? PokemonType.Normal : pokemonType;
  if (normalizedPokemonType !== pokemonType) {
    const compatible = animations.find(
      (animation) => animation.form.toUpperCase() === normalizedForm && animation.pokemonType === normalizedPokemonType
    );
    if (compatible) {
      return compatible;
    }
  }

  if (normalizedPokemonType === PokemonType.Shadow || normalizedPokemonType === PokemonType.Purified) {
    return animations.find(
      (animation) => animation.form.toUpperCase() === normalizedForm && animation.pokemonType === PokemonType.Normal
    );
  }
  return;
};
