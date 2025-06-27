import { defaultData } from '../../contexts/data.context';
import { ICombat } from '../../core/models/combat.model';
import { IPokemonData } from '../../core/models/pokemon.model';

// This variable will store the latest data from the context
const currentData = defaultData;

// Function to update the current data (called from a React component)
export const updateCurrentDataPokemons = (newData: IPokemonData[]) => {
  currentData.pokemons = newData;
};

// Function to update the current data (called from a React component)
export const updateCurrentDataCombats = (newData: ICombat[]) => {
  currentData.combats = newData;
};

// Function to get the current data (can be called from any file)
export const getData = () => currentData;

// Pokemons
export const getDataPokemons = () => currentData.pokemons?.filter((pokemon) => pokemon.num > 0) || [];

// Combats
export const getDataCombats = () => currentData.combats || [];
