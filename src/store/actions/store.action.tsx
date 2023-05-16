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
  optionPokemonName,
} from '../../core/options';
import { convertPVPRankings, convertPVPTrain, pvpConvertPath, pvpFindFirstPath, pvpFindPath } from '../../core/pvp';
import { BASE_CPM, MAX_LEVEL, MIN_LEVEL, SYNC_MSG } from '../../util/Constants';
import { mappingReleasedGO } from '../../util/Utils';
import { showSpinner, showSpinnerWithMsg } from './spinner.action';
import APIService from '../../services/API.service';
import { Dispatch } from 'redux';
import { loadStats } from './stats.action';

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
export const RESET_STORE = 'RESET_STORE';

const options = {
  headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
  cancelToken: APIService.getAxios().CancelToken.source().token,
};

export const loadPokeGOLogo = (dispatch: Dispatch) => {
  try {
    APIService.getFetchUrl(
      `https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Images/App%20Icons&page=1&per_page=1`,
      options
    ).then((res: { data: { url: any }[] }) => {
      APIService.getFetchUrl(res.data[0].url, options).then((file: { data: { files: { filename: string }[] | any[] } }) => {
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
    APIService.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/timestamp.txt', {
      cancelToken: APIService.getAxios().CancelToken.source().token,
    }),
    APIService.getFetchUrl(`https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Images/Pokemon&page=1&per_page=1`, options),
    APIService.getFetchUrl(
      `https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Sounds/Pokemon%20Cries&page=1&per_page=1`,
      options
    ),
  ]).then(([GMtimestamp, imageRoot, soundsRoot]) => {
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
    loadGameMaster(dispatch, timestampLoaded, setStateImage, setStateSound, setStateCandy, stateImage, stateSound, stateCandy);
  });
};

export const loadGameMaster = (
  dispatch: Dispatch,
  timestampLoaded: { images: boolean; sounds: boolean },
  setStateImage: any,
  setStateSound: any,
  setStateCandy: any,
  stateImage: any,
  stateSound: any,
  stateCandy: any
) => {
  APIService.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json', {
    cancelToken: APIService.getAxios().CancelToken.source().token,
  }).then((gm: { data: any }) => {
    const pokemon = optionPokemon(gm.data);
    const pokemonData = optionPokemonData(pokemon);
    const pokemonFamily = optionPokemonFamily(pokemon);
    const noneForm = optionFormNone(gm.data);
    const formSpecial = optionFormSpecial(gm.data);

    const league = optionLeagues(gm.data, pokemon);
    const pokemonCombat = optionPokemonCombat(gm.data, pokemon, formSpecial, noneForm);

    const typeEff = optionPokemonTypes(gm.data);
    const weatherBoost = optionPokemonWeather(gm.data);

    dispatch(loadStats(pokemonData));

    if (!stateCandy) {
      APIService.getFetchUrl(
        'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Candy Color Data/PokemonCandyColorData.json',
        {
          cancelToken: APIService.getAxios().CancelToken.source().token,
        }
      ).then((candy: { data: { CandyColors: any[] } }) => {
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

    if (timestampLoaded.sounds) {
      loadSounds(setStateSound);
    }
    if (timestampLoaded.images) {
      loadAssets(dispatch, gm.data, pokemon, pokemonFamily, pokemonData, formSpecial, pokemonCombat, noneForm, setStateImage);
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
  });
};

export const loadAssets = (
  dispatch: Dispatch,
  data: any,
  pokemon: any[],
  pokemonFamily: any[],
  pokemonData: any[],
  formSpecial: string[],
  pokemonCombat: any[],
  noneForm: string[],
  setStateImage: any
) => {
  APIService.getFetchUrl(`https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Images/Pokemon&page=1&per_page=1`, options).then(
    (imageRoot: { data: { commit: { tree: { url: string } } }[] }) => {
      APIService.getFetchUrl(imageRoot.data[0].commit.tree.url, options).then((imageFolder: { data: { tree: any[] } }) => {
        const imageFolderPath: any = imageFolder.data.tree.find((item: { path: string }) => item.path === 'Images');

        APIService.getFetchUrl(imageFolderPath.url, options).then((image: { data: { tree: any[] } }) => {
          const imagePath: any = image.data.tree.find((item: { path: string }) => item.path === 'Pokemon');

          APIService.getFetchUrl(imagePath.url + '?recursive=1', options).then((imageData: { data: { tree: any[] } }) => {
            const assetImgFiles = optionPokeImg(imageData.data);
            setStateImage(JSON.stringify(assetImgFiles));

            const assetsPokemon = optionAssets(pokemon, pokemonFamily, assetImgFiles, assetImgFiles);
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
        });
      });
    }
  );
};

export const loadSounds = (setStateSound: any) => {
  APIService.getFetchUrl(
    `https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Sounds/Pokemon%20Cries&page=1&per_page=1`,
    options
  ).then((soundRoot: { data: { commit: { tree: { url: string } } }[] }) => {
    APIService.getFetchUrl(soundRoot.data[0].commit.tree.url, options).then((soundFolder: { data: { tree: any[] } }) => {
      const soundFolderPath: any = soundFolder.data.tree.find((item: { path: string }) => item.path === 'Sounds');

      APIService.getFetchUrl(soundFolderPath.url, options).then((sound: { data: { tree: any[] } }) => {
        const soundPath: any = sound.data.tree.find((item: { path: string }) => item.path === 'Pokemon Cries');

        APIService.getFetchUrl(soundPath.url + '?recursive=1', options).then((soundData: { data: { tree: any[] } }) => {
          const assetSoundFiles = optionPokeSound(soundData.data);
          setStateSound(JSON.stringify(assetSoundFiles));
        });
      });
    });
  });
};

export const loadPVP = (dispatch: Dispatch, setStateTimestamp: any, stateTimestamp: any, setStatePVP: any, statePVP: any) => {
  APIService.getFetchUrl(`https://api.github.com/repos/pvpoke/pvpoke/commits?path=src/data&page=1&per_page=1`, options).then(
    (res: { data: { commit: { tree: { url: string }; committer: { date: Date } } }[] }) => {
      const pvpDate = new Date(res.data[0].commit.committer.date).getTime();
      if (pvpDate !== JSON.parse(stateTimestamp).pvp) {
        const pvpUrl = res.data[0].commit.tree.url;
        setStateTimestamp(
          JSON.stringify({
            ...JSON.parse(stateTimestamp),
            pvp: pvpDate,
          })
        );
        APIService.getFetchUrl(pvpUrl, options).then((pvpRoot: { data: { tree: any[] } }) => {
          const pvpRootPath: any = pvpRoot.data.tree.find((item: { path: string }) => item.path === 'src');

          APIService.getFetchUrl(pvpRootPath.url, options).then((pvpFolder: { data: { tree: any[] } }) => {
            const pvpFolderPath: any = pvpFolder.data.tree.find((item: { path: string }) => item.path === 'data');

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
        const pvpRank: any = pvpFindPath(JSON.parse(statePVP), 'rankings/');
        const pvpTrain: any = pvpFindPath(JSON.parse(statePVP), 'training/analysis/');
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

export const loadStore = (
  dispatch: any,
  stateTimestamp: any,
  stateMoves: any,
  stateCandy: any,
  stateImage: any,
  stateSound: any,
  statePVP: any,
  setStateTimestamp: any,
  setStateMoves: any,
  setStateCandy: any,
  setStateImage: any,
  setStateSound: any,
  setStatePVP: any
) => {
  const selectorDispatch = (
    cpm: any,
    typeEff: any,
    weatherBoost: any,
    gmData: any,
    pokemonData: any,
    pokemon: any[],
    candyData: any[],
    formSpecial: string | any[],
    assetsPokemon: any,
    movesDate: number,
    movesTree: any,
    pokemonCombat: any,
    details: any,
    league: any,
    timestamp: any
  ) => {
    if (movesDate !== JSON.parse(stateTimestamp).battle) {
      Promise.all([
        APIService.getFetchUrl('https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/gamemaster/moves.json', {
          cancelToken: APIService.getAxios().CancelToken.source().token,
        }),
        APIService.getFetchUrl(movesTree.url, {
          headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
          cancelToken: APIService.getAxios().CancelToken.source().token,
        }),
      ])
        .then(([moves, pvpRoot]) => {
          const pvpRootPath: any = pvpRoot.data.tree.find((item: { path: string }) => item.path === 'src');

          APIService.getFetchUrl(pvpRootPath.url, {
            headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
            cancelToken: APIService.getAxios().CancelToken.source().token,
          }).then((pvpFolder: { data: { tree: any[]; sha: any } }) => {
            const pvpFolderPath: any = pvpFolder.data.tree.find((item: { path: string }) => item.path === 'data');
            APIService.getFetchUrl(pvpFolderPath.url + '?recursive=1', {
              headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
              cancelToken: APIService.getAxios().CancelToken.source().token,
            }).then((pvp: { data: { tree: any; sha?: any } }) => {
              const pvpRank: any = pvpConvertPath(pvp.data, 'rankings/');
              const pvpTrain: any = pvpConvertPath(pvp.data, 'training/analysis/');

              const pvpData = pvpFindFirstPath(pvp.data.tree, 'rankings/').concat(pvpFindFirstPath(pvp.data.tree, 'training/analysis/'));
              setStateTimestamp(
                JSON.stringify({
                  gamemaster: timestamp,
                  battle: movesDate,
                })
              );
              setStateMoves(JSON.stringify(moves.data));
              setStatePVP(
                JSON.stringify({
                  rootSha: movesTree.sha,
                  folderSha: pvpFolder.data.sha,
                  sha: pvp.data.sha,
                  data: pvpData,
                })
              );

              dispatchStore(
                cpm,
                typeEff,
                weatherBoost,
                gmData,
                pokemonData,
                pokemon,
                candyData,
                formSpecial,
                assetsPokemon,
                moves.data,
                pokemonCombat,
                details,
                pvpRank,
                pvpTrain,
                league,
                timestamp
              );
            });
          });
        })
        .catch((e) => {
          APIService.getAxios().CancelToken.source().cancel();
          dispatch(
            showSpinner({
              error: true,
              msg: e.message,
            })
          );
        });
    } else {
      const pvpRank: any = pvpFindPath(JSON.parse(statePVP).data, 'rankings/');
      const pvpTrain: any = pvpFindPath(JSON.parse(statePVP).data, 'training/analysis/');

      dispatchStore(
        cpm,
        typeEff,
        weatherBoost,
        gmData,
        pokemonData,
        pokemon,
        candyData,
        formSpecial,
        assetsPokemon,
        JSON.parse(stateMoves),
        pokemonCombat,
        details,
        pvpRank,
        pvpTrain,
        league,
        timestamp
      );
    }
  };

  const dispatchStore = (
    cpm: any,
    typeEff: any,
    weatherBoost: any,
    gmData: any,
    pokemonData: any,
    pokemon: any[],
    candyData: any[],
    formSpecial: string | any[],
    assetsPokemon: any,
    movesData: any[],
    pokemonCombat: any,
    details: any,
    pvpRank: any,
    pvpTrain: any,
    league: any,
    timestamp: any
  ) => {
    const payload = {
      icon: null,
      data: {
        cpm,
        typeEff,
        weatherBoost,
        options: optionSettings(gmData),
        pokemonData,
        pokemon,
        pokemonName: optionPokemonName(details),
        candy: candyData,
        evolution: optionEvolution(gmData, pokemon, formSpecial),
        stickers: optionSticker(gmData, pokemon),
        assets: assetsPokemon,
        combat: optionCombat(gmData, typeEff),
        pokemonCombat,
        leagues: optionLeagues(gmData, pokemon),
        details,
        pvp: {
          rankings: convertPVPRankings(pvpRank, league.data),
          trains: convertPVPTrain(pvpTrain, league.data),
        },
        released: mappingReleasedGO(pokemonData, details),
      },
      timestamp,
    };
    try {
      APIService.getFetchUrl(`https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Images/App%20Icons&page=1&per_page=1`, {
        headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
        cancelToken: APIService.getAxios().CancelToken.source().token,
      }).then((res: { data: { url: any }[] }) => {
        APIService.getFetchUrl(res.data[0].url, {
          headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
          cancelToken: APIService.getAxios().CancelToken.source().token,
        }).then((file: { data: { files: { filename: string }[] | any[] } }) => {
          return dispatch({
            type: LOAD_STORE,
            payload: {
              ...payload,
              icon: file.data.files
                ?.find((item: { filename: string }) => item.filename.includes('Images/App Icons/'))
                .filename.replace('Images/App Icons/', '')
                .replace('.png', ''),
            },
          });
        });
      });
    } catch {
      return dispatch({
        type: LOAD_STORE,
        payload,
      });
    }
  };

  dispatch(showSpinnerWithMsg(SYNC_MSG));
  Promise.all([
    APIService.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json', {
      cancelToken: APIService.getAxios().CancelToken.source().token,
    }),
    APIService.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/timestamp.txt', {
      cancelToken: APIService.getAxios().CancelToken.source().token,
    }),
    APIService.getFetchUrl(`https://api.github.com/repos/pvpoke/pvpoke/commits?path=src/data&page=1&per_page=1`, {
      headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
      cancelToken: APIService.getAxios().CancelToken.source().token,
    }),
  ])
    .then(([gm, timestamp, movesTimestamp]) => {
      const cpm = calculateCPM(BASE_CPM, MIN_LEVEL, MAX_LEVEL);
      if (JSON.parse(stateTimestamp).gamemaster !== parseInt(timestamp.data)) {
        Promise.all([
          APIService.getFetchUrl(
            'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Candy Color Data/PokemonCandyColorData.json',
            {
              cancelToken: APIService.getAxios().CancelToken.source().token,
            }
          ),
          APIService.getFetchUrl(`https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Images/Pokemon&page=1&per_page=1`, {
            headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
            cancelToken: APIService.getAxios().CancelToken.source().token,
          }),
          APIService.getFetchUrl(
            `https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Sounds/Pokemon%20Cries&page=1&per_page=1`,
            {
              headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
              cancelToken: APIService.getAxios().CancelToken.source().token,
            }
          ),
        ])
          .then(([candy, imageRoot, soundsRoot]) => {
            const pokemon = optionPokemon(gm.data);
            const pokemonData = optionPokemonData(pokemon);
            const pokemonFamily = optionPokemonFamily(pokemon);
            const candyData = optionPokemonCandy(candy.data.CandyColors, pokemon, pokemonFamily);
            setStateTimestamp(
              JSON.stringify({
                ...JSON.parse(stateTimestamp),
                gamemaster: parseInt(timestamp.data),
              })
            );
            setStateCandy(JSON.stringify(candyData));

            const noneForm = optionFormNone(gm.data);
            const formSpecial = optionFormSpecial(gm.data);
            const league = optionLeagues(gm.data, pokemon);
            const pokemonCombat = optionPokemonCombat(gm.data, pokemon, formSpecial, noneForm);

            const typeEff = optionPokemonTypes(gm.data);
            const weatherBoost = optionPokemonWeather(gm.data);

            if (
              (!stateImage && !stateSound) ||
              (stateImage && stateSound && JSON.parse(stateImage).date !== new Date(imageRoot.data[0].commit.committer.date).getTime()) ||
              JSON.parse(stateSound).date !== new Date(soundsRoot.data[0].commit.committer.date).getTime()
            ) {
              Promise.all([
                APIService.getFetchUrl(imageRoot.data[0].commit.tree.url, {
                  headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                  cancelToken: APIService.getAxios().CancelToken.source().token,
                }),
                APIService.getFetchUrl(soundsRoot.data[0].commit.tree.url, {
                  headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                  cancelToken: APIService.getAxios().CancelToken.source().token,
                }),
              ]).then(([imageFolder, soundsFolder]) => {
                const imageFolderPath: any = imageFolder.data.tree.find((item: { path: string }) => item.path === 'Images');
                const soundsFolderPath: any = soundsFolder.data.tree.find((item: { path: string }) => item.path === 'Sounds');

                Promise.all([
                  APIService.getFetchUrl(imageFolderPath.url, {
                    headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                    cancelToken: APIService.getAxios().CancelToken.source().token,
                  }),
                  APIService.getFetchUrl(soundsFolderPath.url, {
                    headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                    cancelToken: APIService.getAxios().CancelToken.source().token,
                  }),
                ]).then(([image, sounds]) => {
                  const imagePath: any = image.data.tree.find((item: { path: string }) => item.path === 'Pokemon');
                  const soundsPath: any = sounds.data.tree.find((item: { path: string }) => item.path === 'Pokemon Cries');

                  Promise.all([
                    APIService.getFetchUrl(imagePath.url + '?recursive=1', {
                      headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                      cancelToken: APIService.getAxios().CancelToken.source().token,
                    }),
                    APIService.getFetchUrl(soundsPath.url + '?recursive=1', {
                      headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                      cancelToken: APIService.getAxios().CancelToken.source().token,
                    }),
                  ]).then(([imageData, soundsData]) => {
                    const assetImgFiles = optionPokeImg(imageData.data);
                    const assetSoundFiles = optionPokeSound(soundsData.data);
                    setStateImage(
                      JSON.stringify({
                        rootSha: imageRoot.data[0].sha,
                        date: new Date(imageRoot.data[0].commit.committer.date).getTime(),
                        folderSha: imageFolder.data.sha,
                        sha: imageData.data.sha,
                        data: assetImgFiles,
                      })
                    );
                    setStateSound(
                      JSON.stringify({
                        rootSha: soundsRoot.data[0].sha,
                        date: new Date(soundsRoot.data[0].commit.committer.date).getTime(),
                        folderSha: soundsFolder.data.sha,
                        sha: imageData.data.sha,
                        data: assetSoundFiles,
                      })
                    );
                    const assetsPokemon = optionAssets(pokemon, pokemonFamily, assetImgFiles, assetSoundFiles);
                    const details = optionDetailsPokemon(
                      gm.data,
                      pokemonData,
                      pokemon,
                      formSpecial,
                      assetsPokemon,
                      pokemonCombat,
                      noneForm
                    );

                    selectorDispatch(
                      cpm,
                      typeEff,
                      weatherBoost,
                      gm.data,
                      pokemonData,
                      pokemon,
                      candyData,
                      formSpecial,
                      assetsPokemon,
                      new Date(movesTimestamp.data[0].commit.committer.date).getTime(),
                      movesTimestamp.data[0].commit.tree,
                      pokemonCombat,
                      details,
                      league,
                      parseInt(timestamp.data)
                    );
                  });
                });
              });
            } else {
              const pokemonData = optionPokemonData(pokemon);
              const assetImgFiles = JSON.parse(stateImage).data;
              const assetSoundFiles = JSON.parse(stateSound).data;

              const assetsPokemon = optionAssets(pokemon, pokemonFamily, assetImgFiles, assetSoundFiles);
              const details = optionDetailsPokemon(gm.data, pokemonData, pokemon, formSpecial, assetsPokemon, pokemonCombat, noneForm);

              selectorDispatch(
                cpm,
                typeEff,
                weatherBoost,
                gm.data,
                pokemonData,
                pokemon,
                candyData,
                formSpecial,
                assetsPokemon,
                new Date(movesTimestamp.data[0].commit.committer.date).getTime(),
                movesTimestamp.data[0].commit.tree,
                pokemonCombat,
                details,
                league,
                parseInt(timestamp.data)
              );
            }
          })
          .catch((e) => {
            APIService.getAxios().CancelToken.source().cancel();
            dispatch(
              showSpinner({
                error: true,
                msg: e.message,
              })
            );
          });
      } else {
        const pokemon = optionPokemon(gm.data);
        const pokemonData = optionPokemonData(pokemon);
        const pokemonFamily = optionPokemonFamily(pokemon);
        const noneForm = optionFormNone(gm.data);
        const formSpecial = optionFormSpecial(gm.data);

        const league = optionLeagues(gm.data, pokemon);
        const assetsPokemon = optionAssets(pokemon, pokemonFamily, JSON.parse(stateImage).data, JSON.parse(stateSound).data);
        const pokemonCombat = optionPokemonCombat(gm.data, pokemon, formSpecial, noneForm);
        const details = optionDetailsPokemon(gm.data, pokemonData, pokemon, formSpecial, assetsPokemon, pokemonCombat, noneForm);

        const typeEff = optionPokemonTypes(gm.data);
        const weatherBoost = optionPokemonWeather(gm.data);

        selectorDispatch(
          cpm,
          typeEff,
          weatherBoost,
          gm.data,
          pokemonData,
          pokemon,
          JSON.parse(stateCandy),
          formSpecial,
          assetsPokemon,
          new Date(movesTimestamp.data[0].commit.committer.date).getTime(),
          movesTimestamp.data[0].commit.tree,
          pokemonCombat,
          details,
          league,
          parseInt(timestamp.data)
        );
      }
    })
    .catch((e) => {
      APIService.getAxios().CancelToken.source().cancel();
      dispatch(
        showSpinner({
          error: true,
          msg: e.message,
        })
      );
    });
};

export const resetStore = () => ({
  type: RESET_STORE,
});
