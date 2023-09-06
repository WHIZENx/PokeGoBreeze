import { calculateCPM } from '../../core/cpm';
import {
  optionEvolution,
  optionSticker,
  optionPokemon,
  optionPokeImg,
  optionFormSpecial,
  optionPokemonFamily,
  optionAssets,
  optionPokeSound,
  optionCombat,
  optionPokemonCombat,
  optionSettings,
  optionLeagues,
  optionDetailsPokemon,
  optionPokemonTypes,
  optionPokemonWeather,
  optionPokemonCandy,
  optionFormNone,
  optionPokemonData,
} from '../../core/options';
import { pvpConvertPath, pvpFindFirstPath, pvpFindPath } from '../../core/pvp';
import { BASE_CPM, MAX_LEVEL, MIN_LEVEL } from '../../util/Constants';
import APIService from '../../services/API.service';
import { Dispatch } from 'redux';
import { loadStats } from './stats.action';
import { APIUrl } from '../../services/constants';
import { PokemonDataModel, PokemonModel } from '../../core/models/pokemon.model';
import { CombatPokemon } from '../../core/models/combat.model';
import { CandyModel } from '../../core/models/candy.model';
import { getDbPokemonEncounter } from '../../services/db.service';
import { DbModel } from '../../core/models/API/db.model';
import { setBar, setPercent, showSpinner } from './spinner.action';
import { AxiosError } from 'axios';

export const LOAD_STORE = 'LOAD_STORE';
export const LOAD_TIMESTAMP = 'LOAD_TIMESTAMP';
export const LOAD_OPTIONS = 'LOAD_OPTIONS';
export const LOAD_TYPE_EFF = 'LOAD_TYPE_EFF';
export const LOAD_WEATHER_BOOST = 'LOAD_WEATHER_BOOST';
export const LOAD_POKEMON = 'LOAD_POKEMON';
export const LOAD_POKEMON_DATA = 'LOAD_POKEMON_DATA';
export const LOAD_EVOLUTION = 'LOAD_EVOLUTION';
export const LOAD_STICKER = 'LOAD_STICKER';
export const LOAD_COMBAT = 'LOAD_COMBAT';
export const LOAD_POKEMON_COMBAT = 'LOAD_POKEMON_COMBAT';
export const LOAD_POKEMON_NAME = 'LOAD_POKEMON_NAME';
export const LOAD_ASSETS = 'LOAD_ASSETS';
export const LOAD_LEAGUES = 'LOAD_LEAGUES';
export const LOAD_RELEASED_GO = 'LOAD_RELEASED_GO';
export const LOAD_LOGO_POKEGO = 'LOAD_LOGO_POKEGO';
export const LOAD_CPM = 'LOAD_CPM';
export const LOAD_CANDY = 'LOAD_CANDY';
export const LOAD_DETAILS = 'LOAD_DETAILS';
export const LOAD_PVP = 'LOAD_PVP';
export const LOAD_PVP_MOVES = 'LOAD_PVP_MOVES';
export const RESET_STORE = 'RESET_STORE';

const options = {
  headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
  cancelToken: APIService.getAxios().CancelToken.source().token,
};

export const loadPokeGOLogo = (dispatch: Dispatch) => {
  try {
    APIService.getFetchUrl(APIUrl.FETCH_POKEGO_IMAGES_ICON_SHA, options).then((res: { data: { url: string }[] }) => {
      APIService.getFetchUrl(res.data.at(0)?.url ?? '', options).then((file: { data: { files: { filename: string }[] | any[] } }) => {
        dispatch({
          type: LOAD_LOGO_POKEGO,
          payload: file.data.files
            ?.find((item: { filename: string }) => item.filename.includes('Images/App Icons/'))
            .filename.replace('Images/App Icons/', '')
            .replace('.png', ''),
        });
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

export const loadTimestamp = (
  dispatch: Dispatch,
  stateTimestamp: any,
  setStateTimestamp: any,
  setStateImage: any,
  setStateSound: any,
  setStateCandy: any,
  stateImage: any,
  stateSound: any,
  stateCandy: any
) => {
  Promise.all([
    APIService.getFetchUrl(APIUrl.TIMESTAMP, {
      cancelToken: APIService.getAxios().CancelToken.source().token,
    }),
    APIService.getFetchUrl(APIUrl.FETCH_POKEGO_IMAGES_POKEMON_SHA, options),
    APIService.getFetchUrl(APIUrl.FETCH_POKEGO_IMAGES_SOUND_SHA, options),
  ])
    .then(([GMtimestamp, imageRoot, soundsRoot]) => {
      dispatch({
        type: LOAD_TIMESTAMP,
        payload: parseInt(GMtimestamp.data),
      });

      const imageTimestamp = new Date(imageRoot.data.at(0).commit.committer.date).getTime();
      const soundTimestamp = new Date(soundsRoot.data.at(0).commit.committer.date).getTime();
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
      loadGameMaster(
        dispatch,
        imageRoot,
        soundsRoot,
        timestampLoaded,
        setStateImage,
        setStateSound,
        setStateCandy,
        stateImage,
        stateSound,
        stateCandy
      );
    })
    .catch((e) => {
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
  imageRoot: { data: { commit: { tree: { url: string } } }[] },
  soundsRoot: { data: { commit: { tree: { url: string } } }[] },
  timestampLoaded: { images: boolean; sounds: boolean },
  setStateImage: any,
  setStateSound: any,
  setStateCandy: any,
  stateImage: any,
  stateSound: any,
  stateCandy: any
) => {
  APIService.getFetchUrl(APIUrl.GAMEMASTER, {
    cancelToken: APIService.getAxios().CancelToken.source().token,
  })
    .then(async (gm) => {
      let pokemonEncounter: DbModel;
      try {
        pokemonEncounter = await getDbPokemonEncounter();
      } catch (e) {
        throw e;
      }

      const pokemon: PokemonModel[] = optionPokemon(gm.data, pokemonEncounter?.rows);
      const pokemonData = optionPokemonData(pokemon);
      const pokemonFamily = optionPokemonFamily(pokemon);
      const noneForm = optionFormNone(gm.data);
      const formSpecial = optionFormSpecial(gm.data);

      const league = optionLeagues(gm.data, pokemon);
      const pokemonCombat = optionPokemonCombat(gm.data, pokemon, formSpecial, noneForm);

      const typeEff = optionPokemonTypes(gm.data);
      const weatherBoost = optionPokemonWeather(gm.data);

      dispatch(loadStats(pokemonData));
      dispatch(setPercent(60));

      if (!stateCandy) {
        APIService.getFetchUrl(APIUrl.CANDY_DATA, {
          cancelToken: APIService.getAxios().CancelToken.source().token,
        }).then((candy: { data: { CandyColors: CandyModel[] } }) => {
          const candyData = optionPokemonCandy(candy.data.CandyColors, pokemon, pokemonFamily);
          setStateCandy(JSON.stringify(candyData));
          dispatch({
            type: LOAD_CANDY,
            payload: candyData,
          });
        });
      } else {
        dispatch({
          type: LOAD_CANDY,
          payload: JSON.parse(stateCandy),
        });
      }
      dispatch(setPercent(80));

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
        type: LOAD_POKEMON,
        payload: pokemon,
      });

      dispatch({
        type: LOAD_POKEMON_DATA,
        payload: pokemonData,
      });

      dispatch({
        type: LOAD_EVOLUTION,
        payload: optionEvolution(gm.data, pokemon, formSpecial),
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
        type: LOAD_POKEMON_COMBAT,
        payload: pokemonCombat,
      });

      dispatch({
        type: LOAD_LEAGUES,
        payload: league,
      });

      if (timestampLoaded.images || timestampLoaded.sounds) {
        loadAssets(
          dispatch,
          imageRoot,
          soundsRoot,
          gm.data,
          pokemon,
          pokemonFamily,
          pokemonData,
          formSpecial,
          pokemonCombat,
          noneForm,
          setStateImage,
          setStateSound
        );
      } else {
        const assetsPokemon = optionAssets(pokemon, pokemonFamily, JSON.parse(stateImage), JSON.parse(stateSound));
        const details = optionDetailsPokemon(gm.data, pokemonData, pokemon, formSpecial, assetsPokemon, pokemonCombat, noneForm);
        dispatch({
          type: LOAD_ASSETS,
          payload: assetsPokemon,
        });
        dispatch({
          type: LOAD_DETAILS,
          payload: details,
        });
        dispatch({
          type: LOAD_POKEMON_NAME,
        });

        dispatch({
          type: LOAD_RELEASED_GO,
        });
      }
      dispatch(setPercent(100));
      setTimeout(() => dispatch(setBar(false)), 500);
    })
    .catch((e: AxiosError) => {
      dispatch(setBar(false));
      dispatch(
        showSpinner({
          error: true,
          msg: e.stack ?? '' + e.cause ?? '',
        })
      );
    });
};

export const loadAssets = (
  dispatch: Dispatch,
  imageRoot: { data: { commit: { tree: { url: string } } }[] },
  soundsRoot: { data: { commit: { tree: { url: string } } }[] },
  data: any,
  pokemon: PokemonModel[],
  pokemonFamily: string[],
  pokemonData: PokemonDataModel[],
  formSpecial: string[],
  pokemonCombat: CombatPokemon[],
  noneForm: string[],
  setStateImage: any,
  setStateSound: any
) => {
  Promise.all([
    APIService.getFetchUrl(imageRoot.data.at(0)?.commit.tree.url ?? '', options),
    APIService.getFetchUrl(soundsRoot.data.at(0)?.commit.tree.url ?? '', options),
  ]).then(([imageFolder, soundFolder]) => {
    const imageFolderPath = imageFolder.data.tree.find((item: { path: string }) => item.path === 'Images');
    const soundFolderPath = soundFolder.data.tree.find((item: { path: string }) => item.path === 'Sounds');

    Promise.all([APIService.getFetchUrl(imageFolderPath.url, options), APIService.getFetchUrl(soundFolderPath.url, options)]).then(
      ([image, sound]) => {
        const imagePath = image.data.tree.find((item: { path: string }) => item.path === 'Pokemon');
        const soundPath = sound.data.tree.find((item: { path: string }) => item.path === 'Pokemon Cries');

        Promise.all([
          APIService.getFetchUrl(imagePath.url + '?recursive=1', options),
          APIService.getFetchUrl(soundPath.url + '?recursive=1', options),
        ]).then(([imageData, soundData]) => {
          const assetImgFiles = optionPokeImg(imageData.data);
          setStateImage(JSON.stringify(assetImgFiles));

          const assetSoundFiles = optionPokeSound(soundData.data);
          setStateSound(JSON.stringify(assetSoundFiles));

          const assetsPokemon = optionAssets(pokemon, pokemonFamily, assetImgFiles, assetSoundFiles);
          const details = optionDetailsPokemon(data, pokemonData, pokemon, formSpecial, assetsPokemon, pokemonCombat, noneForm);

          dispatch({
            type: LOAD_ASSETS,
            payload: assetsPokemon,
          });

          dispatch({
            type: LOAD_DETAILS,
            payload: details,
          });

          dispatch({
            type: LOAD_POKEMON_NAME,
          });

          dispatch({
            type: LOAD_RELEASED_GO,
          });
        });
      }
    );
  });
};

export const loadPVP = (dispatch: Dispatch, setStateTimestamp: any, stateTimestamp: any, setStatePVP: any, statePVP: any) => {
  APIService.getFetchUrl(APIUrl.FETCH_PVP_DATA, options).then(
    (res: { data: { commit: { tree: { url: string }; committer: { date: Date } } }[] }) => {
      const pvpDate = new Date(res.data.at(0)?.commit.committer.date ?? '').getTime();
      if (pvpDate !== JSON.parse(stateTimestamp).pvp) {
        const pvpUrl = res.data.at(0)?.commit.tree.url;
        setStateTimestamp(
          JSON.stringify({
            ...JSON.parse(stateTimestamp),
            pvp: pvpDate,
          })
        );
        APIService.getFetchUrl(pvpUrl ?? '', options).then((pvpRoot: { data: { tree: any[] } }) => {
          const pvpRootPath = pvpRoot.data.tree.find((item: { path: string }) => item.path === 'src');

          APIService.getFetchUrl(pvpRootPath.url, options).then((pvpFolder: { data: { tree: any[] } }) => {
            const pvpFolderPath = pvpFolder.data.tree.find((item: { path: string }) => item.path === 'data');

            APIService.getFetchUrl(pvpFolderPath.url + '?recursive=1', options).then((pvp: { data: { tree: any } }) => {
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
    }
  );
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
