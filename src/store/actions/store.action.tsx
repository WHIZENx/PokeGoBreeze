import { optionEvolution, optionSticker, optionPokemon, optionPokeImg, optionformSpecial, optionPokemonFamily, optionAssets, optionPokeSound, optionCombat, optionPokemonCombat, optionSettings, optionLeagues, optionDetailsPokemon } from '../../options/options';
import { convertPVPRankings, convertPVPTrain, pvpFindPath } from '../../options/pvp';
import { showSpinner } from './spinner.action';

export const LOAD_STORE = "LOAD_STORE";
export const RESET_STORE = "RESET_STORE";

export const loadStore = (dispatch: any, axios: any, source: any) => {
    dispatch(showSpinner());
    Promise.all([
        axios.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json', {cancelToken: source.token}),
        axios.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/timestamp.txt', {cancelToken: source.token}),
        axios.getFetchUrl("https://api.github.com/repos/PokeMiners/pogo_assets/git/trees/master?recursive=1", {
            headers: { "Authorization": `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
            cancelToken: source.token
        }),
        axios.getFetchUrl("https://api.github.com/repos/pvpoke/pvpoke/git/trees/master?recursive=1", {
            headers: { "Authorization": `token ${process.env.REACT_APP_TOKEN_PRIVATE_REPO}` },
            cancelToken: source.token
        })
      ]).then(([gm, timestamp, assets, pvp]) => {

        const pokemon = optionPokemon(gm.data);
        const pokemonFamily = optionPokemonFamily(pokemon);
        const formSpecial = optionformSpecial(gm.data);
        const assetImgFiles = optionPokeImg(assets.data);
        const assetSoundFiles = optionPokeSound(assets.data);
        const league = optionLeagues(gm.data, pokemon);
        const assetsPokemon = optionAssets(pokemon, pokemonFamily, assetImgFiles, assetSoundFiles);
        const details = optionDetailsPokemon(gm.data, pokemon, formSpecial, assetsPokemon);

        const pvpRank: any = pvpFindPath(pvp.data, "rankings");
        const pvpTrain: any = pvpFindPath(pvp.data, "training/analysis")

        dispatch({
            type: LOAD_STORE,
            payload: {
                data: {
                    options: optionSettings(gm.data),
                    pokemon: pokemon,
                    evolution: optionEvolution(gm.data, pokemon, formSpecial),
                    stickers: optionSticker(gm.data, pokemon),
                    assets: assetsPokemon,
                    combat: optionCombat(gm.data),
                    pokemonCombat: optionPokemonCombat(gm.data, pokemon, formSpecial),
                    leagues: optionLeagues(gm.data, pokemon),
                    details: details,
                    pvp: {
                        rankings: convertPVPRankings(pvpRank, league.data),
                        trains: convertPVPTrain(pvpTrain, league.data)
                    }
                },
                timestamp: timestamp.data
                }
            });
      }).catch(() => {
        source.cancel();
        dispatch(showSpinner(true));
      });
};

export const resetStore = () => ({
    type: RESET_STORE
});