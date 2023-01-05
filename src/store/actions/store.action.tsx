import pokemonData from './../../data/pokemon.json';
import { calculateCPM } from '../../core/cpm';
import {
  optionEvolution,
  optionSticker,
  optionPokemon,
  optionPokeImg,
  optionformSpecial,
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
} from '../../core/options';
import { convertPVPRankings, convertPVPTrain, pvpConvertPath, pvpFindFirstPath, pvpFindPath } from '../../core/pvp';
import { BASE_CPM, MAX_LEVEL, MIN_LEVEL } from '../../util/Constants';
import { mappingReleasedGO } from '../../util/Utils';
import { showSpinner } from './spinner.action';

export const LOAD_STORE = 'LOAD_STORE';
export const RESET_STORE = 'RESET_STORE';

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
  setStatePVP: any,
  axios: any,
  source: any
) => {
  const selectorDispatch = (
    cpm: any,
    typeEff: any,
    weatherBoost: any,
    gmData: any,
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
        axios.getFetchUrl('https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/gamemaster/moves.json', {
          cancelToken: source.token,
        }),
        axios.getFetchUrl(movesTree.url, {
          headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
          cancelToken: source.token,
        }),
      ])
        .then(([moves, pvpRoot]) => {
          const pvpRootPath: any = pvpRoot.data.tree.find((item: { path: string }) => item.path === 'src');

          axios
            .getFetchUrl(pvpRootPath.url, {
              headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
              cancelToken: source.token,
            })
            .then((pvpFolder: { data: { tree: any[]; sha: any } }) => {
              const pvpFolderPath: any = pvpFolder.data.tree.find((item: { path: string }) => item.path === 'data');
              axios
                .getFetchUrl(pvpFolderPath.url + '?recursive=1', {
                  headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                  cancelToken: source.token,
                })
                .then((pvp: { data: { tree: any; sha?: any } }) => {
                  const pvpRank: any = pvpConvertPath(pvp.data, 'rankings/');
                  const pvpTrain: any = pvpConvertPath(pvp.data, 'training/analysis/');

                  const pvpData = pvpFindFirstPath(pvp.data.tree, 'rankings/').concat(
                    pvpFindFirstPath(pvp.data.tree, 'training/analysis/')
                  );
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
          source.cancel();
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
        pokemon,
        candy: candyData,
        evolution: optionEvolution(gmData, pokemon, formSpecial),
        stickers: optionSticker(gmData, pokemon),
        assets: assetsPokemon,
        combat: optionCombat(gmData, movesData, typeEff),
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
      axios
        .getFetchUrl(`https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Images/App%20Icons&page=1&per_page=1`, {
          headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
          cancelToken: source.token,
        })
        .then((res: { data: { url: any }[] }) => {
          axios
            .getFetchUrl(res.data[0].url, {
              headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
              cancelToken: source.token,
            })
            .then((file: { data: { files: { filename: string }[] | any[] } }) => {
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

  dispatch(showSpinner());
  Promise.all([
    axios.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json', {
      cancelToken: source.token,
    }),
    axios.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/timestamp.txt', {
      cancelToken: source.token,
    }),
    axios.getFetchUrl(`https://api.github.com/repos/pvpoke/pvpoke/commits?path=src/data&page=1&per_page=1`, {
      headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
      cancelToken: source.token,
    }),
  ])
    .then(([gm, timestamp, movesTimestamp]) => {
      const cpm = calculateCPM(BASE_CPM, MIN_LEVEL, MAX_LEVEL);
      if (JSON.parse(stateTimestamp).gamemaster !== parseInt(timestamp.data)) {
        Promise.all([
          axios.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Candy Color Data/PokemonCandyColorData.json', {
            cancelToken: source.token,
          }),
          axios.getFetchUrl(`https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Images/Pokemon&page=1&per_page=1`, {
            headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
            cancelToken: source.token,
          }),
          axios.getFetchUrl(`https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Sounds/Pokemon%20Cries&page=1&per_page=1`, {
            headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
            cancelToken: source.token,
          }),
        ])
          .then(([candy, imageRoot, soundsRoot]) => {
            const pokemon = optionPokemon(gm.data);
            const pokemonFamily = optionPokemonFamily(pokemon);
            const candyData = optionPokemonCandy(candy.data.CandyColors, pokemon, pokemonFamily);
            setStateTimestamp(
              JSON.stringify({
                ...JSON.parse(stateTimestamp),
                gamemaster: parseInt(timestamp.data),
              })
            );
            setStateCandy(JSON.stringify(candyData));

            const formSpecial = optionformSpecial(gm.data);
            const league = optionLeagues(gm.data, pokemon);
            const pokemonCombat = optionPokemonCombat(gm.data, pokemon, formSpecial);

            const typeEff = optionPokemonTypes(gm.data);
            const weatherBoost = optionPokemonWeather(gm.data);

            if (
              (!stateImage && !stateSound) ||
              (stateImage && stateSound && JSON.parse(stateImage).date !== new Date(imageRoot.data[0].commit.committer.date).getTime()) ||
              JSON.parse(stateSound).date !== new Date(soundsRoot.data[0].commit.committer.date).getTime()
            ) {
              Promise.all([
                axios.getFetchUrl(imageRoot.data[0].commit.tree.url, {
                  headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                  cancelToken: source.token,
                }),
                axios.getFetchUrl(soundsRoot.data[0].commit.tree.url, {
                  headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                  cancelToken: source.token,
                }),
              ]).then(([imageFolder, soundsFolder]) => {
                const imageFolderPath: any = imageFolder.data.tree.find((item: { path: string }) => item.path === 'Images');
                const soundsFolderPath: any = soundsFolder.data.tree.find((item: { path: string }) => item.path === 'Sounds');

                Promise.all([
                  axios.getFetchUrl(imageFolderPath.url, {
                    headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                    cancelToken: source.token,
                  }),
                  axios.getFetchUrl(soundsFolderPath.url, {
                    headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                    cancelToken: source.token,
                  }),
                ]).then(([image, sounds]) => {
                  const imagePath: any = image.data.tree.find((item: { path: string }) => item.path === 'Pokemon');
                  const soundsPath: any = sounds.data.tree.find((item: { path: string }) => item.path === 'Pokemon Cries');

                  Promise.all([
                    axios.getFetchUrl(imagePath.url + '?recursive=1', {
                      headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                      cancelToken: source.token,
                    }),
                    axios.getFetchUrl(soundsPath.url + '?recursive=1', {
                      headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
                      cancelToken: source.token,
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
                    const details = optionDetailsPokemon(gm.data, pokemon, formSpecial, assetsPokemon, pokemonCombat);

                    selectorDispatch(
                      cpm,
                      typeEff,
                      weatherBoost,
                      gm.data,
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
              const assetImgFiles = JSON.parse(stateImage).data;
              const assetSoundFiles = JSON.parse(stateSound).data;

              const assetsPokemon = optionAssets(pokemon, pokemonFamily, assetImgFiles, assetSoundFiles);
              const details = optionDetailsPokemon(gm.data, pokemon, formSpecial, assetsPokemon, pokemonCombat);

              selectorDispatch(
                cpm,
                typeEff,
                weatherBoost,
                gm.data,
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
            source.cancel();
            dispatch(
              showSpinner({
                error: true,
                msg: e.message,
              })
            );
          });
      } else {
        const cpm = calculateCPM(BASE_CPM, MIN_LEVEL, MAX_LEVEL);
        const pokemon = optionPokemon(gm.data);
        const pokemonFamily = optionPokemonFamily(pokemon);
        const formSpecial = optionformSpecial(gm.data);

        const league = optionLeagues(gm.data, pokemon);
        const assetsPokemon = optionAssets(pokemon, pokemonFamily, JSON.parse(stateImage).data, JSON.parse(stateSound).data);
        const pokemonCombat = optionPokemonCombat(gm.data, pokemon, formSpecial);
        const details = optionDetailsPokemon(gm.data, pokemon, formSpecial, assetsPokemon, pokemonCombat);

        const typeEff = optionPokemonTypes(gm.data);
        const weatherBoost = optionPokemonWeather(gm.data);

        selectorDispatch(
          cpm,
          typeEff,
          weatherBoost,
          gm.data,
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
      source.cancel();
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
