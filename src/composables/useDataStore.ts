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
import { IOptions, PokemonDataGM } from '../core/models/options.model';
import { IPokemonData, PokemonEncounter } from '../core/models/pokemon.model';
import { ISticker } from '../core/models/sticker.model';
import { ICombat } from '../core/models/combat.model';
import { IEvolutionChain } from '../core/models/evolution-chain.model';
import { IInformation } from '../core/models/information';
import { IAsset } from '../core/models/asset.model';
import { LeagueData } from '../core/models/league.model';
import { ICPM } from '../core/models/cpm.model';
import { ITrainerLevelUp } from '../core/models/trainer.model';
import { PokemonPVPMove } from '../core/models/pvp.model';
import { isEqual } from 'lodash';
import { Database } from '../core/models/API/db.model';
import {
  optionPokemonData,
  optionLeagues,
  optionPokemonTypes,
  optionPokemonWeather,
  optionSettings,
  optionTrainer,
  optionSticker,
  optionCombat,
  optionEvolutionChain,
  optionInformation,
  mappingMoveSetPokemonGO,
  optionPokeImg,
  optionPokeSound,
  optionAssets,
  mappingReleasedPokemonGO,
} from '../core/options';
import { APIUrl } from '../services/constants';
import { getDbPokemonEncounter } from '../services/db.service';
import { APITreeRoot, APITree } from '../services/models/api.model';
import { SpinnerActions, StoreActions, StatsActions, TimestampActions } from '../store/actions';
import { DynamicObj, isInclude, isNotEmpty } from '../utils/extension';
import APIService from '../services/api.service';
import { Timestamp } from '../store/models/timestamp.model';
import { Files } from '../store/models/store.model';
import { calculateBaseCPM, calculateCPM } from '../core/cpm';
import { maxIv, minIv } from '../utils/helpers/options-context.helpers';
import { BASE_CPM } from '../utils/constants';

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

  const loadBaseCPM = () => dispatch(StoreActions.SetCPM.create(calculateBaseCPM(BASE_CPM, minIv(), maxIv())));

  const loadCPM = (cpmList: DynamicObj<number>) =>
    dispatch(StoreActions.SetCPM.create(calculateCPM(cpmList, minIv(), Object.keys(cpmList).length)));

  const loadPokeGOLogo = (url: string, iconTimestamp: number) =>
    APIService.getFetchUrl<Files>(url, getAuthorizationHeaders)
      .then((file) => {
        if (file?.data) {
          const files = file.data.files;
          if (isNotEmpty(files)) {
            const res = files.find((item) => isInclude(item.filename, 'Images/App Icons/'));
            if (res) {
              dispatch(StoreActions.SetLogoPokeGO.create(res.filename));
              dispatch(TimestampActions.SetTimestampIcon.create(iconTimestamp));
            }
          }
        }
      })
      .catch(() => dispatch(StoreActions.SetLogoPokeGO.create()));

  const loadGameMaster = async (imageRoot: APITreeRoot[], soundsRoot: APITreeRoot[], timestampLoaded: Timestamp) => {
    APIService.getFetchUrl<PokemonDataGM[]>(APIUrl.GAMEMASTER)
      .then(async (gm) => {
        if (!gm || !isNotEmpty(gm.data)) {
          dispatch(
            SpinnerActions.ShowSpinnerMsg.create({
              isError: true,
            })
          );
          return;
        }
        let pokemonEncounter = new Database<PokemonEncounter>();
        try {
          pokemonEncounter = await getDbPokemonEncounter();
        } catch (e) {
          dispatch(
            SpinnerActions.ShowSpinnerMsg.create({
              isError: true,
              message: (e as Error).message,
            })
          );
          return;
        }

        const pokemon = optionPokemonData(gm.data, pokemonEncounter.rows);

        const league = optionLeagues(gm.data, pokemon);

        const typeEffective = optionPokemonTypes(gm.data);
        const weatherBoost = optionPokemonWeather(gm.data);

        dispatch(SpinnerActions.SetPercent.create(60));

        const options = optionSettings(gm.data, typeEffective, weatherBoost);
        dispatch(StoreActions.SetOptions.create(options));
        loadCPM(options.playerSetting.cpMultipliers);
        dispatch(StoreActions.SetTrainer.create(optionTrainer(gm.data)));
        dispatch(StoreActions.SetSticker.create(optionSticker(gm.data, pokemon)));
        const combat = optionCombat(gm.data, typeEffective);
        dispatch(StoreActions.SetCombat.create(combat));
        dispatch(StoreActions.SetEvolutionChain.create(optionEvolutionChain(gm.data, pokemon)));
        dispatch(StoreActions.SetInformation.create(optionInformation(gm.data, pokemon)));
        dispatch(StoreActions.SetLeagues.create(league));

        mappingMoveSetPokemonGO(pokemon, combat);

        if (!timestampLoaded.isCurrentImage || !timestampLoaded.isCurrentSound || !timestampLoaded.isCurrentVersion) {
          await loadAssets(imageRoot, soundsRoot, pokemon, timestampLoaded);
        }

        dispatch(SpinnerActions.SetPercent.create(90));
        dispatch(StatsActions.SetStats.create(pokemon));

        dispatch(TimestampActions.SetTimestampGameMaster.create(timestampLoaded.gamemasterTimestamp));
        dispatch(SpinnerActions.SetPercent.create(100));
        setTimeout(() => dispatch(SpinnerActions.SetBar.create(false)), 500);
      })
      .catch((e: ErrorEvent) => {
        dispatch(SpinnerActions.SetBar.create(false));
        dispatch(
          SpinnerActions.ShowSpinnerMsg.create({
            isError: true,
            message: e.message,
          })
        );
      });
  };

  const loadAssets = async (
    imageRoot: APITreeRoot[],
    soundsRoot: APITreeRoot[],
    pokemon: IPokemonData[],
    timestamp: Timestamp
  ) => {
    if (!isNotEmpty(imageRoot) || !isNotEmpty(soundsRoot)) {
      return;
    }
    await Promise.all([
      APIService.getFetchUrl<APITree>(imageRoot[0].commit.tree.url, getAuthorizationHeaders),
      APIService.getFetchUrl<APITree>(soundsRoot[0].commit.tree.url, getAuthorizationHeaders),
    ]).then(async ([imageFolder, soundFolder]) => {
      const imageFolderPath = imageFolder.data.tree.find((item) => isEqual(item.path, 'Images'));
      const soundFolderPath = soundFolder.data.tree.find((item) => isEqual(item.path, 'Sounds'));

      if (imageFolderPath && soundFolderPath) {
        await Promise.all([
          APIService.getFetchUrl<APITree>(imageFolderPath.url, getAuthorizationHeaders),
          APIService.getFetchUrl<APITree>(soundFolderPath.url, getAuthorizationHeaders),
        ]).then(async ([image, sound]) => {
          const imagePath = image.data.tree.find((item) => isEqual(item.path, 'Pokemon - 256x256'));
          const soundPath = sound.data.tree.find((item) => isEqual(item.path, 'Pokemon Cries'));

          if (imagePath && soundPath) {
            await Promise.all([
              APIService.getFetchUrl<APITree>(`${imagePath.url}?recursive=1`, getAuthorizationHeaders),
              APIService.getFetchUrl<APITree>(`${soundPath.url}?recursive=1`, getAuthorizationHeaders),
            ]).then(([imageData, soundData]) => {
              const assetImgFiles = optionPokeImg(imageData.data);
              const assetSoundFiles = optionPokeSound(soundData.data);

              const assetsPokemon = optionAssets(pokemon, assetImgFiles, assetSoundFiles);
              mappingReleasedPokemonGO(pokemon, assetsPokemon);

              dispatch(StoreActions.SetAssets.create(assetsPokemon));
              dispatch(StoreActions.SetPokemon.create(pokemon));

              dispatch(TimestampActions.SetTimestampAssets.create(timestamp.assetsTimestamp));
              dispatch(TimestampActions.SetTimestampSounds.create(timestamp.soundsTimestamp));
              dispatch(SpinnerActions.SetPercent.create(100));
              setTimeout(() => dispatch(SpinnerActions.SetBar.create(false)), 500);
            });
          }
        });
      }
    });
  };

  const pokemonsData = dataStore.pokemons;
  const stickersData = dataStore.stickers;
  const combatsData = dataStore.combats;
  const evolutionChainsData = dataStore.evolutionChains;
  const informationData = dataStore.information;
  const assetsData = dataStore.assets;
  const leaguesData = dataStore.leagues;
  const cpmData = dataStore.cpm;
  const trainersData = dataStore.trainers;
  const pvpData = dataStore.pvp;
  const optionsData = dataStore.options;

  /**
   * Returns a filtered version of the pokemons data based on the provided filter function
   * @param filterFn - A function to filter the pokemons array
   * @returns The filtered array of IPokemonData
   */
  const getFilteredPokemons = (filterFn?: (item: IPokemonData) => boolean) => {
    return dataStore.pokemons.filter((item) => item.num > 0 && (filterFn?.(item) || true));
  };

  const getAuthorizationHeaders = {
    headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
  };

  return {
    dataStore,
    loadBaseCPM,
    loadCPM,
    loadPokeGOLogo,
    loadGameMaster,
    loadAssets,
    pokemonsData,
    stickersData,
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
    getAuthorizationHeaders,
    getFilteredPokemons,
  };
};

export default useDataStore;
