import { useSelector, useDispatch } from 'react-redux';
import { StoreState } from '../store/models/state.model';
import {
  SetOptions,
  SetPokemon,
  SetCombat,
  SetEvolutionChain,
  SetInformation,
  SetAssets,
  SetLeagues,
  SetCPM,
  SetTrainer,
  SetPVP,
} from '../store/actions/store.action';
import { IOptions } from '../core/models/options.model';
import { IPokemonData } from '../core/models/pokemon.model';
import { ICombat } from '../core/models/combat.model';
import { IEvolutionChain } from '../core/models/evolution-chain.model';
import { IInformation } from '../core/models/information';
import { IAsset } from '../core/models/asset.model';
import { LeagueData } from '../core/models/league.model';
import { ICPM } from '../core/models/cpm.model';
import { ITrainerLevelUp } from '../core/models/trainer.model';
import { IPVPDataModel } from '../core/models/pvp.model';
import { IStatsRank } from '../core/models/stats.model';
import { StoreActions, StatsActions, TimestampActions } from '../store/actions';
import { createProgressHelpers } from '../utils/helpers/progress-helpers';
import ProcessedDataService, { ProcessedDataSection } from '../services/processed-data.service';

/**
 * Custom hook to access and update the data from Redux store
 * This replaces direct usage of useSelector((state: StoreState) => state.store.data)
 *
 * @returns The data store object with all properties and update methods
 */
export const useDataStore = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const { setProgress, completeProgress } = createProgressHelpers(dispatch);

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
  const setPVP = (pvpData: IPVPDataModel) => {
    dispatch(SetPVP.create(pvpData));
  };

  /**
   * Hydrates Redux exclusively from the server-preprocessed snapshot.
   */
  const applyProcessedSection = (section: ProcessedDataSection, data: unknown) => {
    switch (section) {
      case 'options':
        dispatch(StoreActions.SetOptions.create(data as IOptions));
        break;
      case 'cpm':
        dispatch(StoreActions.SetCPM.create(data as ICPM[]));
        break;
      case 'pvp':
        dispatch(StoreActions.SetPVP.create(data as IPVPDataModel));
        break;
      case 'statsRankings':
        dispatch(StatsActions.SetStats.create(data as IStatsRank));
        break;
      case 'pokemons':
        dispatch(StoreActions.SetPokemon.create(data as IPokemonData[]));
        break;
      case 'combats':
        dispatch(StoreActions.SetCombat.create(data as ICombat[]));
        break;
      case 'assets':
        dispatch(StoreActions.SetAssets.create(data as IAsset[]));
        break;
      case 'evolutionChains':
        dispatch(StoreActions.SetEvolutionChain.create(data as IEvolutionChain[]));
        break;
      case 'trainers':
        dispatch(StoreActions.SetTrainer.create(data as ITrainerLevelUp[]));
        break;
    }
  };

  const loadProcessedSections = async (sections: ProcessedDataSection[]) => {
    const uniqueSections = [...new Set(sections)];
    const values = await Promise.all(uniqueSections.map((section) => ProcessedDataService.getSection(section)));
    uniqueSections.forEach((section, index) => applyProcessedSection(section, values[index]));
  };

  const loadProcessedData = async () => {
    if (!ProcessedDataService.isConfigured()) {
      return false;
    }

    try {
      const meta = await ProcessedDataService.getMeta();
      setProgress(20);
      await loadProcessedSections(['options']);
      setProgress(70);
      dispatch(TimestampActions.SetSnapshotGeneratedAt.create(meta.generatedAt));
      dispatch(TimestampActions.SetTimestampGameMaster.create(meta.source.gameMaster));
      dispatch(TimestampActions.SetTimestampAssets.create(meta.source.assets));
      dispatch(TimestampActions.SetTimestampSounds.create(meta.source.sounds));
      dispatch(TimestampActions.SetTimestampPVP.create(meta.source.pvp));
      completeProgress();
      return true;
    } catch {
      return false;
    }
  };

  const pokemonsData = dataStore.pokemons;
  const combatsData = dataStore.combats;
  const evolutionChainsData = dataStore.evolutionChains;
  const informationData = dataStore.information;
  const assetsData = dataStore.assets;
  const leaguesData = dataStore.leagues;
  const cpmData = dataStore.cpm;
  const trainersData = dataStore.trainers;
  const pvpData = dataStore.pvp;
  const optionsData = dataStore.options;

  return {
    dataStore,
    loadProcessedData,
    loadProcessedSections,
    pokemonsData,
    combatsData,
    evolutionChainsData,
    informationData,
    assetsData,
    leaguesData,
    cpmData,
    trainersData,
    pvpData,
    optionsData,
    setOptions,
    setPokemons,
    setCombats,
    setEvolutionChains,
    setInformation,
    setAssets,
    setLeagues,
    setCPM,
    setTrainers,
    setPVP,
  };
};

export default useDataStore;
