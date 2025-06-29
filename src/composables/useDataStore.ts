import { useSelector, useDispatch } from 'react-redux';
import { StoreState } from '../store/models/state.model';
import {
  SetOptions,
  SetPokemon,
  SetSticker,
  SetCombat,
  SetEvolutionChain,
  SetInformation,
  SetAssets,
  SetLeagues,
  SetCPM,
  SetTrainer,
  SetPVP,
  SetPVPMoves,
} from '../store/actions/store.action';
import { IOptions } from '../core/models/options.model';
import { IPokemonData } from '../core/models/pokemon.model';
import { ISticker } from '../core/models/sticker.model';
import { ICombat } from '../core/models/combat.model';
import { IEvolutionChain } from '../core/models/evolution-chain.model';
import { IInformation } from '../core/models/information';
import { IAsset } from '../core/models/asset.model';
import { LeagueData } from '../core/models/league.model';
import { ICPM } from '../core/models/cpm.model';
import { ITrainerLevelUp } from '../core/models/trainer.model';
import { PokemonPVPMove } from '../core/models/pvp.model';

/**
 * Custom hook to access and update the data from Redux store
 * This replaces direct usage of useSelector((state: StoreState) => state.store.data)
 *
 * @returns The data store object with all properties and update methods
 */
export const useDataStore = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: StoreState) => state.store.data);

  /**
   * Update options in the store
   * @param options - The new options to be set
   */
  const setOptions = (options: IOptions) => {
    dispatch(SetOptions.create(options));
  };

  /**
   * Update pokemon data in the store
   * @param pokemons - The new pokemon data to be set
   */
  const setPokemons = (pokemons: IPokemonData[]) => {
    dispatch(SetPokemon.create(pokemons));
  };

  /**
   * Update sticker data in the store
   * @param stickers - The new sticker data to be set
   */
  const setStickers = (stickers: ISticker[]) => {
    dispatch(SetSticker.create(stickers));
  };

  /**
   * Update combat data in the store
   * @param combats - The new combat data to be set
   */
  const setCombats = (combats: ICombat[]) => {
    dispatch(SetCombat.create(combats));
  };

  /**
   * Update evolution chain data in the store
   * @param evolutionChains - The new evolution chain data to be set
   */
  const setEvolutionChains = (evolutionChains: IEvolutionChain[]) => {
    dispatch(SetEvolutionChain.create(evolutionChains));
  };

  /**
   * Update information data in the store
   * @param information - The new information data to be set
   */
  const setInformation = (information: IInformation[]) => {
    dispatch(SetInformation.create(information));
  };

  /**
   * Update assets data in the store
   * @param assets - The new assets data to be set
   */
  const setAssets = (assets: IAsset[]) => {
    dispatch(SetAssets.create(assets));
  };

  /**
   * Update leagues data in the store
   * @param leagues - The new leagues data to be set
   */
  const setLeagues = (leagues: LeagueData) => {
    dispatch(SetLeagues.create(leagues));
  };

  /**
   * Update CPM data in the store
   * @param cpm - The new CPM data to be set
   */
  const setCPM = (cpm: ICPM[]) => {
    dispatch(SetCPM.create(cpm));
  };

  /**
   * Update trainer data in the store
   * @param trainers - The new trainer data to be set
   */
  const setTrainers = (trainers: ITrainerLevelUp[]) => {
    dispatch(SetTrainer.create(trainers));
  };

  /**
   * Update PVP data in the store
   * @param pvpData - The new PVP data to be set
   */
  const setPVP = (pvpData: { rankings: string[]; trains: string[] }) => {
    dispatch(SetPVP.create(pvpData));
  };

  /**
   * Update PVP moves data in the store
   * @param pvpMoves - The new PVP moves data to be set
   */
  const setPVPMoves = (pvpMoves: PokemonPVPMove[]) => {
    dispatch(SetPVPMoves.create(pvpMoves));
  };

  return {
    ...dataStore,
    setOptions,
    setPokemons,
    setStickers,
    setCombats,
    setEvolutionChains,
    setInformation,
    setAssets,
    setLeagues,
    setCPM,
    setTrainers,
    setPVP,
    setPVPMoves,
  };
};

export default useDataStore;
