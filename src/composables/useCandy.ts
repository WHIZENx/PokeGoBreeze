import { ICandy } from '../core/models/candy.model';
import useDataStore from './useDataStore';

const candyLookupCache = new WeakMap<ICandy[], Map<number, ICandy>>();

const buildCandyByPokemonId = (entries: ICandy[]) => {
  const cached = candyLookupCache.get(entries);
  if (cached) {
    return cached;
  }
  const result = new Map<number, ICandy>();
  for (const entry of entries) {
    if (!result.has(entry.familyId)) {
      result.set(entry.familyId, entry);
    }
    for (const member of entry.familyGroup) {
      if (!result.has(member.id)) {
        result.set(member.id, entry);
      }
    }
  }
  candyLookupCache.set(entries, result);
  return result;
};

export const useCandy = () => {
  const { candyData } = useDataStore();
  const candyByPokemonId = buildCandyByPokemonId(candyData);

  return {
    candyData,
    getCandyData: (pokemonId: number) => candyByPokemonId.get(pokemonId),
  };
};

export default useCandy;
