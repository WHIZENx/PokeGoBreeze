import { useSelector, useDispatch } from 'react-redux';
import { SearchingState } from '../store/models/state.model';
import {
  SetPokemonMainSearch,
  ResetPokemonMainSearch,
  SetPokemonToolSearch,
  ResetPokemonToolSearch,
  SetMainPokemonForm,
  SetMainPokemonDetails,
  ResetMainPokemon,
  SetToolPokemonForm,
  SetToolPokemonDetails,
  ResetToolPokemon,
  SetToolObjectPokemonForm,
  SetToolObjectPokemonDetails,
  ResetToolObjectPokemon,
} from '../store/actions/searching.action';
import { IToolSearching } from '../core/models/searching.model';
import { ISearchingModel } from '../store/models/searching.model';
import { IPokemonFormModify } from '../core/models/API/form.model';
import { IPokemonDetail } from '../core/models/API/info.model';

/**
 * Custom hook to access and update searching data in the Redux store
 *
 * @returns The searching data and methods to update it
 */
export const useSearch = () => {
  const dispatch = useDispatch();
  const searchData = useSelector((state: SearchingState) => state.searching);

  // Main Pokemon Search
  const setPokemonMainSearch = (value: ISearchingModel) => {
    dispatch(SetPokemonMainSearch.create(value));
  };

  const resetPokemonMainSearch = () => {
    dispatch(ResetPokemonMainSearch.create());
  };

  // Tool Pokemon Search
  const setPokemonToolSearch = (value: IToolSearching) => {
    dispatch(SetPokemonToolSearch.create(value));
  };

  const resetPokemonToolSearch = () => {
    dispatch(ResetPokemonToolSearch.create());
  };

  // Main Pokemon Form & Details
  const setMainPokemonForm = (value: IPokemonFormModify | undefined) => {
    dispatch(SetMainPokemonForm.create(value));
  };

  const setMainPokemonDetails = (value: IPokemonDetail) => {
    dispatch(SetMainPokemonDetails.create(value));
  };

  const resetMainPokemon = () => {
    dispatch(ResetMainPokemon.create());
  };

  // Tool Pokemon Form & Details
  const setToolPokemonForm = (value: IPokemonFormModify | undefined) => {
    dispatch(SetToolPokemonForm.create(value));
  };

  const setToolPokemonDetails = (value: IPokemonDetail) => {
    dispatch(SetToolPokemonDetails.create(value));
  };

  const resetToolPokemon = () => {
    dispatch(ResetToolPokemon.create());
  };

  // Tool Object Pokemon Form & Details
  const setToolObjectPokemonForm = (value: IPokemonFormModify | undefined) => {
    dispatch(SetToolObjectPokemonForm.create(value));
  };

  const setToolObjectPokemonDetails = (value: IPokemonDetail) => {
    dispatch(SetToolObjectPokemonDetails.create(value));
  };

  const resetToolObjectPokemon = () => {
    dispatch(ResetToolObjectPokemon.create());
  };

  const searchingMainData = searchData.mainSearching;
  const searchingMainForm = searchData.mainSearching?.form;
  const searchingMainDetails = searchData.mainSearching?.pokemon;

  const searchingToolData = searchData.toolSearching;
  const searchingToolCurrentData = searchData.toolSearching?.current;
  const searchingToolCurrentForm = searchData.toolSearching?.current?.form;
  const searchingToolCurrentDetails = searchData.toolSearching?.current?.pokemon;
  const searchingToolObjectData = searchData.toolSearching?.object;
  const searchingToolObjectForm = searchData.toolSearching?.object?.form;
  const searchingToolObjectDetails = searchData.toolSearching?.object?.pokemon;

  return {
    searchData,
    setPokemonMainSearch,
    resetPokemonMainSearch,
    setPokemonToolSearch,
    resetPokemonToolSearch,
    setMainPokemonForm,
    setMainPokemonDetails,
    resetMainPokemon,
    setToolPokemonForm,
    setToolPokemonDetails,
    resetToolPokemon,
    setToolObjectPokemonForm,
    setToolObjectPokemonDetails,
    resetToolObjectPokemon,
    searchingMainData,
    searchingMainForm,
    searchingMainDetails,
    searchingToolData,
    searchingToolCurrentData,
    searchingToolCurrentForm,
    searchingToolCurrentDetails,
    searchingToolObjectData,
    searchingToolObjectForm,
    searchingToolObjectDetails,
  };
};

export default useSearch;
