import { Dispatch } from 'redux';
import { calculateBaseCPM, calculateCPM } from '../../core/cpm';
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
  optionEvolutionChain,
  optionInformation,
  optionTrainer,
} from '../../core/options';
import { pvpConvertPath, pvpFindFirstPath, pvpFindPath } from '../../core/pvp';
import APIService from '../../services/API.service';
import { APIUrl } from '../../services/constants';
import { getDbPokemonEncounter } from '../../services/db.service';
import { APIPath, APITreeRoot, APITree } from '../../services/models/api.model';
import { BASE_CPM, MIN_LEVEL, MAX_LEVEL } from '../../util/constants';
import { PathActions, SpinnerActions, StatsActions, StoreActions, TimestampActions } from '../actions';
import { DynamicObj, getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber } from '../../util/extension';
import { TimestampModel } from '../reducers/timestamp.reducer';
import { IDataModel } from '../models/store.model';

interface Timestamp {
  isCurrentGameMaster: boolean;
  isCurrentImage: boolean;
  isCurrentSound: boolean;
  gamemasterTimestamp: number;
  assetsTimestamp: number;
  soundsTimestamp: number;
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

export const loadPokeGOLogo = (dispatch: Dispatch) =>
  APIService.getFetchUrl<APIPath[]>(APIUrl.FETCH_POKEGO_IMAGES_ICON_SHA, options)
    .then((res) => {
      if (isNotEmpty(res.data)) {
        return APIService.getFetchUrl<Files>(res.data[0].url, options);
      }
    })
    .then((file) => {
      if (file?.data) {
        const files = file.data.files;
        if (isNotEmpty(files)) {
          const res = files.find((item) => isInclude(item.filename, 'Images/App Icons/'));
          if (res) {
            dispatch(
              StoreActions.SetLogoPokeGO.create(res.filename.replace('Images/App Icons/', '').replace('.png', ''))
            );
          }
        }
      }
    })
    .catch(() => dispatch(StoreActions.SetLogoPokeGO.create()));

export const loadBaseCPM = (dispatch: Dispatch) =>
  dispatch(StoreActions.SetCPM.create(calculateBaseCPM(BASE_CPM, MIN_LEVEL, MAX_LEVEL)));

export const loadCPM = (dispatch: Dispatch, cpmList: DynamicObj<number>) =>
  dispatch(StoreActions.SetCPM.create(calculateCPM(cpmList, MIN_LEVEL, Object.keys(cpmList).length)));

export const loadTimestamp = async (dispatch: Dispatch, data: IDataModel, timestamp: TimestampModel) => {
  await Promise.all([
    APIService.getFetchUrl<string>(APIUrl.TIMESTAMP),
    APIService.getFetchUrl<APITreeRoot[]>(APIUrl.FETCH_POKEGO_IMAGES_POKEMON_SHA, options),
    APIService.getFetchUrl<APITreeRoot[]>(APIUrl.FETCH_POKEGO_IMAGES_SOUND_SHA, options),
  ])
    .then(async ([GMtimestamp, imageRoot, soundsRoot]) => {
      const timestampGameMaster = toNumber(GMtimestamp.data);
      if (isNotEmpty(imageRoot.data) && isNotEmpty(soundsRoot.data)) {
        const imageTimestamp = new Date(imageRoot.data[0].commit.committer.date).getTime();
        const soundTimestamp = new Date(soundsRoot.data[0].commit.committer.date).getTime();

        const timestampLoaded: Timestamp = {
          isCurrentGameMaster: timestampGameMaster > 0 && timestamp.gamemaster === timestampGameMaster,
          isCurrentImage: timestamp.assets > 0 && timestamp.assets === imageTimestamp,
          isCurrentSound: timestamp.sounds > 0 && timestamp.sounds === soundTimestamp,
          gamemasterTimestamp: timestampGameMaster,
          assetsTimestamp: imageTimestamp,
          soundsTimestamp: soundTimestamp,
        };
        dispatch(SpinnerActions.SetPercent.create(40));

        if (!timestampLoaded.isCurrentGameMaster) {
          await loadGameMaster(dispatch, imageRoot.data, soundsRoot.data, timestampLoaded);
        } else if (!timestampLoaded.isCurrentImage || !timestampLoaded.isCurrentSound) {
          await loadAssets(dispatch, imageRoot.data, soundsRoot.data, data.pokemons, timestampLoaded);
        } else {
          dispatch(SpinnerActions.SetPercent.create(100));
          setTimeout(() => dispatch(SpinnerActions.SetBar.create(false)), 500);
        }
      }
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

export const loadGameMaster = (
  dispatch: Dispatch,
  imageRoot: APITreeRoot[],
  soundsRoot: APITreeRoot[],
  timestampLoaded: Timestamp
) => {
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

      const typeEff = optionPokemonTypes(gm.data);
      const weatherBoost = optionPokemonWeather(gm.data);

      dispatch(SpinnerActions.SetPercent.create(60));

      const options = optionSettings(gm.data);
      dispatch(StoreActions.SetOptions.create(options));
      loadCPM(dispatch, options.playerSetting.cpMultipliers);
      dispatch(StoreActions.SetTrainer.create(optionTrainer(gm.data)));
      dispatch(StoreActions.SetTypeEff.create(typeEff));
      dispatch(StoreActions.SetWeatherBoost.create(weatherBoost));
      dispatch(StoreActions.SetSticker.create(optionSticker(gm.data, pokemon)));
      const combat = optionCombat(gm.data, typeEff);
      dispatch(StoreActions.SetCombat.create(combat));
      dispatch(StoreActions.SetEvolutionChain.create(optionEvolutionChain(gm.data, pokemon)));
      dispatch(StoreActions.SetInformation.create(optionInformation(gm.data, pokemon)));
      dispatch(StoreActions.SetLeagues.create(league));

      mappingMoveSetPokemonGO(pokemon, combat);

      if (!timestampLoaded.isCurrentImage || !timestampLoaded.isCurrentSound) {
        await loadAssets(dispatch, imageRoot, soundsRoot, pokemon, timestampLoaded);
      }

      dispatch(SpinnerActions.SetPercent.create(90));
      dispatch(StatsActions.SetStats.create({ pokemon, options }));

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

export const loadAssets = async (
  dispatch: Dispatch,
  imageRoot: APITreeRoot[],
  soundsRoot: APITreeRoot[],
  pokemon: IPokemonData[],
  timestamp: Timestamp
) => {
  if (!isNotEmpty(imageRoot) || !isNotEmpty(soundsRoot)) {
    return;
  }
  await Promise.all([
    APIService.getFetchUrl<APITree>(imageRoot[0].commit.tree.url, options),
    APIService.getFetchUrl<APITree>(soundsRoot[0].commit.tree.url, options),
  ]).then(async ([imageFolder, soundFolder]) => {
    const imageFolderPath = imageFolder.data.tree.find((item) => isEqual(item.path, 'Images'));
    const soundFolderPath = soundFolder.data.tree.find((item) => isEqual(item.path, 'Sounds'));

    if (imageFolderPath && soundFolderPath) {
      await Promise.all([
        APIService.getFetchUrl<APITree>(imageFolderPath.url, options),
        APIService.getFetchUrl<APITree>(soundFolderPath.url, options),
      ]).then(async ([image, sound]) => {
        const imagePath = image.data.tree.find((item) => isEqual(item.path, 'Pokemon - 256x256'));
        const soundPath = sound.data.tree.find((item) => isEqual(item.path, 'Pokemon Cries'));

        if (imagePath && soundPath) {
          await Promise.all([
            APIService.getFetchUrl<APITree>(`${imagePath.url}?recursive=1`, options),
            APIService.getFetchUrl<APITree>(`${soundPath.url}?recursive=1`, options),
          ]).then(([imageData, soundData]) => {
            const assetImgFiles = optionPokeImg(imageData.data);
            dispatch(PathActions.SetPathAssets.create(assetImgFiles));

            const assetSoundFiles = optionPokeSound(soundData.data);
            dispatch(PathActions.SetPathSounds.create(assetSoundFiles));

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

export const loadPVP = (dispatch: Dispatch, timestamp: TimestampModel, pvpData: string[]) => {
  APIService.getFetchUrl<APITreeRoot[]>(APIUrl.FETCH_PVP_DATA, options).then((res) => {
    const pvpTimestamp = new Date(getValueOrDefault(String, res.data.at(0)?.commit.committer.date)).getTime();
    if (pvpTimestamp !== timestamp.pvp && isNotEmpty(res.data)) {
      const pvpUrl = res.data[0].commit.tree.url;
      if (pvpUrl) {
        APIService.getFetchUrl<APITree>(pvpUrl, options)
          .then((pvpRoot) => {
            const pvpRootPath = pvpRoot.data.tree.find((item) => isEqual(item.path, 'src'));
            return APIService.getFetchUrl<APITree>(`${pvpRootPath?.url}`, options);
          })
          .then((pvpFolder) => {
            const pvpFolderPath = pvpFolder.data.tree.find((item) => isEqual(item.path, 'data'));
            return APIService.getFetchUrl<APITree>(`${pvpFolderPath?.url}?recursive=1`, options);
          })
          .then((pvp) => {
            const pvpRank = pvpConvertPath(pvp.data, 'rankings/');
            const pvpTrain = pvpConvertPath(pvp.data, 'training/analysis/');

            const pvpDataPath = pvpFindFirstPath(pvp.data.tree, 'rankings/').concat(
              pvpFindFirstPath(pvp.data.tree, 'training/analysis/')
            );

            dispatch(TimestampActions.SetTimestampPVP.create(pvpTimestamp));
            dispatch(PathActions.SetPathPvp.create(pvpDataPath));

            dispatch(
              StoreActions.SetPVP.create({
                rankings: pvpRank,
                trains: pvpTrain,
              })
            );
          });
      }
    } else {
      const pvpRank = pvpFindPath(pvpData, 'rankings/');
      const pvpTrain = pvpFindPath(pvpData, 'training/analysis/');
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
