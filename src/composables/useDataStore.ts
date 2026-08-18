import { useSelector, useDispatch } from 'react-redux';
import { StatsState, StoreState, TimestampState } from '../store/models/state.model';
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
import { useSnackbar } from '../contexts/snackbar.context';
import ProcessedDataService from '../services/processed-data.service';

/**
 * Custom hook to access and update the data from Redux store
 * This replaces direct usage of useSelector((state: StoreState) => state.store.data)
 *
 * @returns The data store object with all properties and update methods
 */
export const useDataStore = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const timestampState = useSelector((state: TimestampState) => state.timestamp);
  const statsState = useSelector((state: StatsState) => state.stats);
  const { showSnackbar } = useSnackbar();
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
  const loadProcessedData = async (isCurrentVersion: boolean) => {
    if (!ProcessedDataService.isConfigured()) {
      return false;
    }

    try {
      const meta = await ProcessedDataService.getMeta();
      const isCurrentSnapshot =
        isCurrentVersion &&
        timestampState.snapshotGeneratedAt === meta.generatedAt &&
        timestampIsCurrent(meta.source.gameMaster, meta.source.assets, meta.source.sounds, meta.source.pvp);
      if (isCurrentSnapshot) {
        completeProgress();
        return true;
      }

      showSnackbar('Loading processed game data...', 'info');
      setProgress(20);
      const [processedOptions, cpm, pvp, statsRankings, pokemons, combats, assets, evolutionChains, trainers] =
        await Promise.all([
          ProcessedDataService.getSection<IOptions>('options'),
          ProcessedDataService.getSection<ICPM[]>('cpm'),
          ProcessedDataService.getSection<IPVPDataModel>('pvp'),
          ProcessedDataService.getSection<IStatsRank>('statsRankings'),
          ProcessedDataService.getSection<IPokemonData[]>('pokemons'),
          ProcessedDataService.getSection<ICombat[]>('combats'),
          ProcessedDataService.getSection<IAsset[]>('assets'),
          ProcessedDataService.getSection<IEvolutionChain[]>('evolutionChains'),
          ProcessedDataService.getSection<ITrainerLevelUp[]>('trainers'),
        ]);

      setProgress(70);
      dispatch(StoreActions.SetOptions.create(processedOptions));
      dispatch(StoreActions.SetCPM.create(cpm));
      dispatch(StoreActions.SetPVP.create(pvp));
      dispatch(StoreActions.SetPokemon.create(pokemons));
      dispatch(StoreActions.SetCombat.create(combats));
      dispatch(StoreActions.SetAssets.create(assets));
      dispatch(StoreActions.SetEvolutionChain.create(evolutionChains));
      dispatch(StoreActions.SetTrainer.create(trainers));
      dispatch(StatsActions.SetStats.create(statsRankings));
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

  const timestampIsCurrent = (gameMaster: number, assets: number, sounds: number, pvp: number) =>
    dataStore.pokemons.length > 0 &&
    dataStore.combats.length > 0 &&
    dataStore.cpm.length > 0 &&
    dataStore.pvp.rankings.length > 0 &&
    statsState !== null &&
    timestampState.gamemaster === gameMaster &&
    timestampState.assets === assets &&
    timestampState.sounds === sounds &&
    timestampState.pvp === pvp;

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
