import { calculateCPM } from '../../options/cpm';
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
  optionPokemonFamilyGroup,
  optionPokemonCandy,
} from '../../options/options';
import { convertPVPRankings, convertPVPTrain, pvpConvertPath, pvpFindFirstPath, pvpFindPath } from '../../options/pvp';
import { BASE_CPM, MAX_LEVEL, MIN_LEVEL } from '../../util/Constants';
import { showSpinner } from './spinner.action';

export const LOAD_STORE = 'LOAD_STORE';
export const RESET_STORE = 'RESET_STORE';

export const loadStore = (
  dispatch: any,
  stateGM: any,
  stateTimestamp: any,
  stateMoves: any,
  stateCandy: any,
  stateImage: any,
  stateSound: any,
  statePVP: any,
  setStateGM: any,
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
        axios.getFetchUrl(`https://api.github.com/repos/pvpoke/pvpoke/git/trees/${process.env.REACT_APP_HASH_REPO_PVPOKE}?recursive=1`, {
          headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
          cancelToken: source.token,
        }),
      ])
        .then(([moves, pvp]) => {
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
          setStatePVP(JSON.stringify(pvpData));

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
      const pvpRank: any = pvpFindPath(JSON.parse(statePVP), 'rankings/');
      const pvpTrain: any = pvpFindPath(JSON.parse(statePVP), 'training/analysis/');

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
    return dispatch({
      type: LOAD_STORE,
      payload: {
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
        },
        timestamp,
      },
    });
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
          axios.getFetchUrl(
            `https://api.github.com/repos/PokeMiners/pogo_assets/git/trees/${process.env.REACT_APP_HASH_REPO_IMG}?recursive=1`,
            {
              headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
              cancelToken: source.token,
            }
          ),
          axios.getFetchUrl(
            `https://api.github.com/repos/PokeMiners/pogo_assets/git/trees/${process.env.REACT_APP_HASH_REPO_SOUND}?recursive=1`,
            {
              headers: { Authorization: `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
              cancelToken: source.token,
            }
          ),
        ])
          .then(([candy, image, sounds]) => {
            const assetImgFiles = optionPokeImg(image.data);
            const assetSoundFiles = optionPokeSound(sounds.data);
            const pokemon = optionPokemon(gm.data);
            const pokemonFamily = optionPokemonFamily(pokemon);
            const pokemonFamilyGroup = optionPokemonFamilyGroup(gm.data);
            const candyData = optionPokemonCandy(candy.data.CandyColors, pokemonFamilyGroup, pokemon, pokemonFamily);

            setStateTimestamp(
              JSON.stringify({
                ...JSON.parse(stateTimestamp),
                gamemaster: parseInt(timestamp.data),
              })
            );
            setStateCandy(JSON.stringify(candyData));
            setStateImage(JSON.stringify(assetImgFiles));
            setStateSound(JSON.stringify(assetSoundFiles));

            const formSpecial = optionformSpecial(gm.data);

            const league = optionLeagues(gm.data, pokemon);
            const assetsPokemon = optionAssets(pokemon, pokemonFamily, assetImgFiles, assetSoundFiles);
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
              candyData,
              formSpecial,
              assetsPokemon,
              new Date(movesTimestamp.data[0].commit.committer.date).getTime(),
              pokemonCombat,
              details,
              league,
              parseInt(timestamp.data)
            );
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
        const assetsPokemon = optionAssets(pokemon, pokemonFamily, JSON.parse(stateImage), JSON.parse(stateSound));
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
