import { useCallback } from 'react';
import useDataStore from '../composables/useDataStore';

export const useEvolution = () => {
  const { evolutionChainsData } = useDataStore();

  const findEvoChainsById = useCallback(
    (id: number | undefined) => {
      return evolutionChainsData.find((chain) => chain.id === id);
    },
    [evolutionChainsData]
  );

  return {
    findEvoChainsById,
  };
};

export default useEvolution;
