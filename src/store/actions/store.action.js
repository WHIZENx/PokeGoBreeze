import { TOKEN_PRIVATE_REPO } from '../..';
import { optionEvolution, optionSticker, optionPokemon, optionPokeImg, optionformSpecial, optionPokemonFamily, optionAssets, optionPokeSound, optionCombat, optionPokemonCombat, optionSettings, optionLeagues } from '../../options/options';

export const LOAD_STORE = "LOAD_STORE";
export const RESET_STORE = "RESET_STORE";

export const loadStore = (dispatch, axios, source) => {
    Promise.all([
        axios.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json', {cancelToken: source.token}),
        axios.getFetchUrl("https://api.github.com/repos/PokeMiners/pogo_assets/git/trees/master?recursive=1", {
            headers: { "Authorization": `token ${TOKEN_PRIVATE_REPO()}` },
            cancelToken: source.token
        })
      ]).then(([gm, assets]) => {
        const pokemon = optionPokemon(gm.data);
        const pokemonFamily = optionPokemonFamily(pokemon);
        const formSpecial = optionformSpecial(gm.data);
        const assetImgFiles = optionPokeImg(assets.data);
        const assetSoundFiles = optionPokeSound(assets.data);

        dispatch({
            type: LOAD_STORE,
            payload: {
                    options: optionSettings(gm.data),
                    pokemon: pokemon,
                    evolution: optionEvolution(gm.data, pokemon, formSpecial),
                    stickers: optionSticker(gm.data, pokemon),
                    assets: optionAssets(pokemon, pokemonFamily, assetImgFiles, assetSoundFiles),
                    combat: optionCombat(gm.data),
                    pokemonCombat: optionPokemonCombat(gm.data, pokemon, formSpecial),
                    leagues: optionLeagues(gm.data, pokemon)
                }
            });
      });
};

export const resetStore = () => ({
    type: RESET_STORE
});