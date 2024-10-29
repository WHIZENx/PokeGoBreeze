import { Dispatch } from 'redux';
import { calculateCPM } from '../../core/cpm';
import { Database } from '../../core/models/API/db.model';
import { PokemonDataGM } from '../../core/models/options.model';
import { IPokemonData, PokemonEncounter } from '../../core/models/pokemon.model';
import { PokemonPVPMove } from '../../core/models/pvp.model';
import {
  optionPokemonData,
  optionLeagues,
  optionPokemonTypes,
  optionPokemonWeather,
  optionSettings,
  optionSticker,
  optionCombat,
  optionAssets,
  mappingReleasedPokemonGO,
  optionPokeImg,
  optionPokeSound,
  mappingMoveSetPokemonGO,
} from '../../core/options';
import { pvpConvertPath, pvpFindFirstPath, pvpFindPath } from '../../core/pvp';
import APIService from '../../services/API.service';
import { APIUrl } from '../../services/constants';
import { getDbPokemonEncounter } from '../../services/db.service';
import { APIPath, APITreeRoot, APITree } from '../../services/models/api.model';
import { BASE_CPM, MIN_LEVEL, MAX_LEVEL } from '../../util/constants';
import { SetValue } from '../models/state.model';
import { SpinnerActions, StatsActions, StoreActions } from '../actions';
import { LocalTimeStamp } from '../models/local-storage.model';
import { getValueOrDefault, isInclude, toNumber } from '../../util/extension';

interface Timestamp {
  images: boolean;
  sounds: boolean;
}

interface Files {
  files: FileName[];
}

interface FileName {
  filename: string;
}

const options = {
  headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
};

export const loadPokeGOLogo = (dispatch: Dispatch) => {
  try {
    APIService.getFetchUrl<APIPath[]>(APIUrl.FETCH_POKEGO_IMAGES_ICON_SHA, options)
      .then((res) => APIService.getFetchUrl<Files>(getValueOrDefault(String, res.data[0]?.url), options))
      .then((file) => {
        dispatch(
          StoreActions.SetLogoPokeGO.create(
            getValueOrDefault(
              String,
              file.data.files
                .find((item) => isInclude(item.filename, 'Images/App Icons/'))
                ?.filename.replace('Images/App Icons/', '')
                .replace('.png', '')
            )
          )
        );
      });
  } catch {
    dispatch(StoreActions.SetLogoPokeGO.create());
  }
};

export const loadCPM = (dispatch: Dispatch) => {
  const cpm = calculateCPM(BASE_CPM, MIN_LEVEL, MAX_LEVEL);
  return dispatch(StoreActions.SetCPM.create(cpm));
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
      dispatch(StoreActions.SetTimestamp.create(toNumber(GMtimestamp.data)));

      const imageTimestamp = new Date(imageRoot.data[0].commit.committer.date).getTime();
      const soundTimestamp = new Date(soundsRoot.data[0].commit.committer.date).getTime();
      setStateTimestamp(
        JSON.stringify(
          LocalTimeStamp.create({
            ...JSON.parse(stateTimestamp),
            gamemaster: toNumber(GMtimestamp.data),
            images: imageTimestamp,
            sounds: soundTimestamp,
          })
        )
      );

      const timestampLoaded = {
        images: !stateImage || JSON.parse(stateTimestamp).images !== imageTimestamp,
        sounds: !stateSound || JSON.parse(stateTimestamp).sounds !== soundTimestamp,
      };
      dispatch(SpinnerActions.SetPercent.create(40));
      loadGameMaster(dispatch, imageRoot.data, soundsRoot.data, timestampLoaded, setStateImage, setStateSound, stateImage, stateSound);
    })
    .catch((e: ErrorEvent) => {
      dispatch(SpinnerActions.SetBar.create(false));
      dispatch(
        SpinnerActions.ShowSpinnerMsg.create({
          error: true,
          message: e.message,
        })
      );
    });
};

export const loadGameMaster = (
  dispatch: Dispatch,
  imageRoot: APITreeRoot[],
  soundsRoot: APITreeRoot[],
  timestampLoaded: Timestamp,
  setStateImage: SetValue<string>,
  setStateSound: SetValue<string>,
  stateImage: string,
  stateSound: string
) => {
  APIService.getFetchUrl<PokemonDataGM[]>(APIUrl.GAMEMASTER)
    .then(async (gm) => {
      let pokemonEncounter = new Database<PokemonEncounter>();
      try {
        pokemonEncounter = await getDbPokemonEncounter();
      } catch (e) {
        throw e;
      }

      const pokemon = optionPokemonData(gm.data, pokemonEncounter.rows);

      const league = optionLeagues(gm.data, pokemon);

      const typeEff = optionPokemonTypes(gm.data);
      const weatherBoost = optionPokemonWeather(gm.data);

      dispatch(SpinnerActions.SetPercent.create(60));

      dispatch(StoreActions.SetOptions.create(optionSettings(gm.data)));
      dispatch(StoreActions.SetTypeEff.create(typeEff));
      dispatch(StoreActions.SetWeatherBoost.create(weatherBoost));
      dispatch(StoreActions.SetSticker.create(optionSticker(gm.data, pokemon)));
      const combat = optionCombat(gm.data, typeEff);
      dispatch(StoreActions.SetCombat.create(combat));
      dispatch(StoreActions.SetLeagues.create(league));

      mappingMoveSetPokemonGO(pokemon, combat);

      if (timestampLoaded.images || timestampLoaded.sounds) {
        await loadAssets(dispatch, imageRoot, soundsRoot, pokemon, setStateImage, setStateSound);
      } else {
        const assetsPokemon = optionAssets(pokemon, JSON.parse(stateImage), JSON.parse(stateSound));
        mappingReleasedPokemonGO(pokemon, assetsPokemon);
        dispatch(StoreActions.SetAssets.create(assetsPokemon));
        dispatch(StoreActions.SetPokemon.create(pokemon));
      }

      dispatch(SpinnerActions.SetPercent.create(90));
      dispatch(StatsActions.SetStats.create(pokemon));

      dispatch(SpinnerActions.SetPercent.create(100));
      setTimeout(() => dispatch(SpinnerActions.SetBar.create(false)), 500);
    })
    .catch((e: ErrorEvent) => {
      dispatch(SpinnerActions.SetBar.create(false));
      dispatch(
        SpinnerActions.ShowSpinnerMsg.create({
          error: true,
          message: e.message,
        })
      );
    });
};

export const loadAssets = async (
  dispatch: Dispatch,
  imageRoot: APITreeRoot[],
  soundsRoot: APITreeRoot[],
  pokemon: IPokemonData[],
  setStateImage: SetValue<string>,
  setStateSound: SetValue<string>
) => {
  await Promise.all([
    APIService.getFetchUrl<APITree>(getValueOrDefault(String, imageRoot.at(0)?.commit.tree.url), options),
    APIService.getFetchUrl<APITree>(getValueOrDefault(String, soundsRoot.at(0)?.commit.tree.url), options),
  ]).then(async ([imageFolder, soundFolder]) => {
    const imageFolderPath = imageFolder.data.tree.find((item) => item.path === 'Images');
    const soundFolderPath = soundFolder.data.tree.find((item) => item.path === 'Sounds');

    if (imageFolderPath && soundFolderPath) {
      await Promise.all([
        APIService.getFetchUrl<APITree>(imageFolderPath.url, options),
        APIService.getFetchUrl<APITree>(soundFolderPath.url, options),
      ]).then(async ([image, sound]) => {
        const imagePath = image.data.tree.find((item) => item.path === 'Pokemon');
        const soundPath = sound.data.tree.find((item) => item.path === 'Pokemon Cries');

        if (imagePath && soundPath) {
          await Promise.all([
            APIService.getFetchUrl<APITree>(`${imagePath.url}?recursive=1`, options),
            APIService.getFetchUrl<APITree>(`${soundPath.url}?recursive=1`, options),
          ]).then(([imageData, soundData]) => {
            const assetImgFiles = optionPokeImg(imageData.data);
            setStateImage(JSON.stringify(assetImgFiles));

            const assetSoundFiles = optionPokeSound(soundData.data);
            setStateSound(JSON.stringify(assetSoundFiles));

            const assetsPokemon = optionAssets(pokemon, assetImgFiles, assetSoundFiles);
            mappingReleasedPokemonGO(pokemon, assetsPokemon);

            dispatch(StoreActions.SetAssets.create(assetsPokemon));
            dispatch(StoreActions.SetPokemon.create(pokemon));
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
    const pvpDate = new Date(getValueOrDefault(String, res.data.at(0)?.commit.committer.date)).getTime();
    setStateTimestamp(
      JSON.stringify(
        LocalTimeStamp.create({
          ...JSON.parse(stateTimestamp),
          pvp: pvpDate,
        })
      )
    );
    if (pvpDate !== JSON.parse(stateTimestamp).pvp) {
      const pvpUrl = res.data.at(0)?.commit.tree.url;
      if (pvpUrl) {
        APIService.getFetchUrl<APITree>(pvpUrl, options)
          .then((pvpRoot) => {
            const pvpRootPath = pvpRoot.data.tree.find((item) => item.path === 'src');
            return APIService.getFetchUrl<APITree>(`${pvpRootPath?.url}`, options);
          })
          .then((pvpFolder) => {
            const pvpFolderPath = pvpFolder.data.tree.find((item) => item.path === 'data');
            return APIService.getFetchUrl<APITree>(`${pvpFolderPath?.url}?recursive=1`, options);
          })
          .then((pvp) => {
            const pvpRank = pvpConvertPath(pvp.data, 'rankings/');
            const pvpTrain = pvpConvertPath(pvp.data, 'training/analysis/');

            const pvpData = pvpFindFirstPath(pvp.data.tree, 'rankings/').concat(pvpFindFirstPath(pvp.data.tree, 'training/analysis/'));

            setStatePVP(JSON.stringify(pvpData));

            dispatch(
              StoreActions.SetPVP.create({
                rankings: pvpRank,
                trains: pvpTrain,
              })
            );
          });
      }
    } else {
      const pvpRank = pvpFindPath(JSON.parse(statePVP), 'rankings/');
      const pvpTrain = pvpFindPath(JSON.parse(statePVP), 'training/analysis/');
      dispatch(
        StoreActions.SetPVP.create({
          rankings: pvpRank,
          trains: pvpTrain,
        })
      );
    }
  });
};

export const loadPVPMoves = (dispatch: Dispatch) => {
  APIService.getFetchUrl<PokemonPVPMove[]>(APIUrl.FETCH_PVP_MOVES).then((moves) => {
    dispatch(StoreActions.SetPVPMoves.create(moves.data));
  });
};
