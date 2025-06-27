// Some React component
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { updateCurrentDataCombats, updateCurrentDataPokemons } from '../helpers/data-context.helpers';

const dataObserver = () => {
  const pokemons = useSelector((state: StoreState) => state.store.data.pokemons);
  const combats = useSelector((state: StoreState) => state.store.data.combats);

  useEffect(() => {
    updateCurrentDataPokemons(pokemons || []);
  }, [pokemons]);

  useEffect(() => {
    updateCurrentDataCombats(combats || []);
  }, [combats]);

  return null;
};

export default dataObserver;
