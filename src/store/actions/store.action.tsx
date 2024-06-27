import { calculateCPM } from '../../core/cpm';
import {
  optionSticker,
  optionPokeImg,
  optionPokeSound,
  optionCombat,
  optionSettings,
  optionLeagues,
  optionPokemonTypes,
  optionPokemonWeather,
  optionAssets,
  optionPokemonData,
  mappingReleasedPokemonGO,
} from '../../core/options';
import { pvpConvertPath, pvpFindFirstPath, pvpFindPath } from '../../core/pvp';
import { BASE_CPM, MAX_LEVEL, MIN_LEVEL } from '../../util/Constants';
import APIService from '../../services/API.service';
import { Dispatch } from 'redux';
import { loadStats } from './stats.action';
import { APIUrl } from '../../services/constants';
import { getDbPokemonEncounter } from '../../services/db.service';
import { DbModel } from '../../core/models/API/db.model';
import { setBar, setPercent, showSpinner } from './spinner.action';
import { SetValue } from '../models/state.model';
import { PokemonData } from '../../core/models/options.model';
import { APITreeRoot, APITree, APIPath } from '../../services/models/api.model';
import { PokemonDataModel } from '../../core/models/pokemon.model';

export const LOAD_STORE = 'LOAD_STORE';
export const LOAD_TIMESTAMP = 'LOAD_TIMESTAMP';
export const LOAD_OPTIONS = 'LOAD_OPTIONS';
export const LOAD_TYPE_EFF = 'LOAD_TYPE_EFF';
export const LOAD_WEATHER_BOOST = 'LOAD_WEATHER_BOOST';
export const LOAD_POKEMON = 'LOAD_POKEMON';
export const LOAD_STICKER = 'LOAD_STICKER';
export const LOAD_COMBAT = 'LOAD_COMBAT';
export const LOAD_ASSETS = 'LOAD_ASSETS';
export const LOAD_LEAGUES = 'LOAD_LEAGUES';
export const LOAD_LOGO_POKEGO = 'LOAD_LOGO_POKEGO';
export const LOAD_CPM = 'LOAD_CPM';
export const LOAD_PVP = 'LOAD_PVP';
export const LOAD_PVP_MOVES = 'LOAD_PVP_MOVES';
export const RESET_STORE = 'RESET_STORE';

const options = {
  headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
};

export const loadPokeGOLogo = (dispatch: Dispatch) => {
  try {
    APIService.getFetchUrl<APIPath[]>(APIUrl.FETCH_POKEGO_IMAGES_ICON_SHA, options)
      .then((res) =>
        APIService.getFetchUrl<{
          files: { filename: string }[];
        }>(res.data[0]?.url ?? '', options)
      )
      .then((file) => {
        dispatch({
          type: LOAD_LOGO_POKEGO,
          payload: file.data.files
            ?.find((item) => item.filename.includes('Images/App Icons/'))
            ?.filename.replace('Images/App Icons/', '')
            .replace('.png', ''),
        });
      });
  } catch {
    dispatch({
      type: LOAD_LOGO_POKEGO,
      payload: '',
    });
  }
};

export const loadCPM = (dispatch: Dispatch) => {
  const cpm = calculateCPM(BASE_CPM, MIN_LEVEL, MAX_LEVEL);
  dispatch({
    type: LOAD_CPM,
    payload: cpm,
  });
};

export const loadTimestamp = async (
  dispatch: Dispatch,
  stateTimestamp: string,
  setStateTimestamp: SetValue<string>,
  setStateImage: SetValue<string>,
  setStateSound: SetValue<string>,
  stateImage: string,
  stateSound: string
) => {
  await Promise.all([
    APIService.getFetchUrl<string>(APIUrl.TIMESTAMP),
    APIService.getFetchUrl<APITreeRoot[]>(APIUrl.FETCH_POKEGO_IMAGES_POKEMON_SHA, options),
    APIService.getFetchUrl<APITreeRoot[]>(APIUrl.FETCH_POKEGO_IMAGES_SOUND_SHA, options),
  ])
    .then(async ([GMtimestamp, imageRoot, soundsRoot]) => {
      dispatch({
        type: LOAD_TIMESTAMP,
        payload: parseInt(GMtimestamp.data),
      });

      const imageTimestamp = new Date(imageRoot.data[0].commit.committer.date).getTime();
      const soundTimestamp = new Date(soundsRoot.data[0].commit.committer.date).getTime();
      setStateTimestamp(
        JSON.stringify({
          ...JSON.parse(stateTimestamp),
          gamemaster: parseInt(GMtimestamp.data),
          images: imageTimestamp,
          sounds: soundTimestamp,
        })
      );

      const timestampLoaded = {
        images: !stateImage || JSON.parse(stateTimestamp).images !== imageTimestamp,
        sounds: !stateSound || JSON.parse(stateTimestamp).sounds !== soundTimestamp,
      };
      dispatch(setPercent(40));
      loadGameMaster(dispatch, imageRoot.data, soundsRoot.data, timestampLoaded, setStateImage, setStateSound, stateImage, stateSound);
    })
    .catch((e: ErrorEvent) => {
      dispatch(setBar(false));
      dispatch(
        showSpinner({
          error: true,
          msg: e.message,
        })
      );
    });
};

export const loadGameMaster = (
  dispatch: Dispatch,
  imageRoot: APITreeRoot[],
  soundsRoot: APITreeRoot[],
  timestampLoaded: { images: boolean; sounds: boolean },
  setStateImage: SetValue<string>,
  setStateSound: SetValue<string>,
  stateImage: string,
  stateSound: string
) => {
  APIService.getFetchUrl<PokemonData[]>(APIUrl.GAMEMASTER)
    .then(async (gm) => {
      let pokemonEncounter = new DbModel();
      try {
        pokemonEncounter = await getDbPokemonEncounter();
      } catch (e) {
        throw e;
      }

      const pokemon = optionPokemonData(gm.data, pokemonEncounter?.rows);

      const league = optionLeagues(gm.data, pokemon);

      const typeEff = optionPokemonTypes(gm.data);
      const weatherBoost = optionPokemonWeather(gm.data);

      dispatch(setPercent(60));

      dispatch({
        type: LOAD_OPTIONS,
        payload: optionSettings(gm.data),
      });

      dispatch({
        type: LOAD_TYPE_EFF,
        payload: typeEff,
      });

      dispatch({
        type: LOAD_WEATHER_BOOST,
        payload: weatherBoost,
      });

      dispatch({
        type: LOAD_STICKER,
        payload: optionSticker(gm.data, pokemon),
      });

      dispatch({
        type: LOAD_COMBAT,
        payload: optionCombat(gm.data, typeEff),
      });

      dispatch({
        type: LOAD_LEAGUES,
        payload: league,
      });

      if (timestampLoaded.images || timestampLoaded.sounds) {
        await loadAssets(dispatch, imageRoot, soundsRoot, pokemon, setStateImage, setStateSound);
      } else {
        const assetsPokemon = optionAssets(pokemon, JSON.parse(stateImage), JSON.parse(stateSound));
        mappingReleasedPokemonGO(pokemon, assetsPokemon);
        dispatch({
          type: LOAD_ASSETS,
          payload: assetsPokemon,
        });
        dispatch({
          type: LOAD_POKEMON,
          payload: pokemon,
        });
      }

      dispatch(setPercent(90));
      dispatch(loadStats(pokemon));

      dispatch(setPercent(100));
      setTimeout(() => dispatch(setBar(false)), 500);
    })
    .catch((e: ErrorEvent) => {
      dispatch(setBar(false));
      dispatch(
        showSpinner({
          error: true,
          msg: e.message,
        })
      );
    });
};

export const loadAssets = async (
  dispatch: Dispatch,
  imageRoot: APITreeRoot[],
  soundsRoot: APITreeRoot[],
  pokemon: PokemonDataModel[],
  setStateImage: SetValue<string>,
  setStateSound: SetValue<string>
) => {
  await Promise.all([
    APIService.getFetchUrl<APITree>(imageRoot.at(0)?.commit.tree.url ?? '', options),
    APIService.getFetchUrl<APITree>(soundsRoot.at(0)?.commit.tree.url ?? '', options),
  ]).then(async ([imageFolder, soundFolder]) => {
    const imageFolderPath = imageFolder.data.tree.find((item) => item.path === 'Images');
    const soundFolderPath = soundFolder.data.tree.find((item) => item.path === 'Sounds');

    if (imageFolderPath && soundFolderPath) {
      await Promise.all([
        APIService.getFetchUrl<APITree>(imageFolderPath?.url, options),
        APIService.getFetchUrl<APITree>(soundFolderPath.url, options),
      ]).then(async ([image, sound]) => {
        const imagePath = image.data.tree.find((item) => item.path === 'Pokemon');
        const soundPath = sound.data.tree.find((item) => item.path === 'Pokemon Cries');

        if (imagePath && soundPath) {
          await Promise.all([
            APIService.getFetchUrl<APITree>(imagePath.url + '?recursive=1', options),
            APIService.getFetchUrl<APITree>(soundPath.url + '?recursive=1', options),
          ]).then(([imageData, soundData]) => {
            const assetImgFiles = optionPokeImg(imageData.data);
            setStateImage(JSON.stringify(assetImgFiles));

            const assetSoundFiles = optionPokeSound(soundData.data);
            setStateSound(JSON.stringify(assetSoundFiles));

            const assetsPokemon = optionAssets(pokemon, assetImgFiles, assetSoundFiles);
            mappingReleasedPokemonGO(pokemon, assetsPokemon);

            dispatch({
              type: LOAD_ASSETS,
              payload: assetsPokemon,
            });

            dispatch({
              type: LOAD_POKEMON,
              payload: pokemon,
            });
          });
        }
      });
    }
  });
};

export const loadPVP = (
  dispatch: Dispatch,
  setStateTimestamp: SetValue<string>,
  stateTimestamp: string,
  setStatePVP: SetValue<string>,
  statePVP: string
) => {
  APIService.getFetchUrl<APITreeRoot[]>(APIUrl.FETCH_PVP_DATA, options).then((res) => {
    const pvpDate = new Date(res.data.at(0)?.commit.committer.date ?? '').getTime();
    if (pvpDate !== JSON.parse(stateTimestamp).pvp) {
      const pvpUrl = res.data.at(0)?.commit.tree.url;
      setStateTimestamp(
        JSON.stringify({
          ...JSON.parse(stateTimestamp),
          pvp: pvpDate,
        })
      );
      APIService.getFetchUrl<APITree>(pvpUrl ?? '', options)
        .then((pvpRoot) => {
          const pvpRootPath = pvpRoot.data.tree.find((item) => item.path === 'src');
          return APIService.getFetchUrl<APITree>(pvpRootPath?.url + '', options);
        })
        .then((pvpFolder) => {
          const pvpFolderPath = pvpFolder.data.tree.find((item) => item.path === 'data');
          return APIService.getFetchUrl<APITree>(pvpFolderPath?.url + '?recursive=1', options);
        })
        .then((pvp) => {
          const pvpRank = pvpConvertPath(pvp.data, 'rankings/');
          const pvpTrain = pvpConvertPath(pvp.data, 'training/analysis/');

          const pvpData = pvpFindFirstPath(pvp.data.tree, 'rankings/').concat(pvpFindFirstPath(pvp.data.tree, 'training/analysis/'));

          setStatePVP(JSON.stringify(pvpData));

          dispatch({
            type: LOAD_PVP,
            payload: {
              rankings: pvpRank,
              trains: pvpTrain,
            },
          });
        });
    } else {
      const pvpRank = pvpFindPath(JSON.parse(statePVP), 'rankings/');
      const pvpTrain = pvpFindPath(JSON.parse(statePVP), 'training/analysis/');
      dispatch({
        type: LOAD_PVP,
        payload: {
          rankings: pvpRank,
          trains: pvpTrain,
        },
      });
    }
  });
};

export const loadPVPMoves = (dispatch: Dispatch) => {
  APIService.getFetchUrl(APIUrl.FETCH_PVP_MOVES).then((moves) => {
    dispatch({
      type: LOAD_PVP_MOVES,
      payload: moves.data,
    });
  });
};

export const resetStore = () => ({
  type: RESET_STORE,
});
