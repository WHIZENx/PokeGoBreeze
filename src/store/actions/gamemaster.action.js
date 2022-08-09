import APIService from "../../services/API.service";
import { optionEvolution, optionSticker, optionPokemon, optionPokeImg, optionformSpecial, optionPokemonFamily, optionAssets, optionPokeSound, optionCombat, optionPokemonCombat } from '../../options/options';

export const LOAD_GM = "LOAD_GM";
export const RESET_GM = "RESET_GM";

export const loadGM = dispatch => {
    Promise.all([
        APIService.getFetchUrl('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json'),
        APIService.getFetchUrl("https://api.github.com/repos/PokeMiners/pogo_assets/git/trees/master?recursive=1")
      ]).then(([gm, assets]) => {
        const pokemon = optionPokemon(gm.data);
        const pokemonFamily = optionPokemonFamily(pokemon);
        const formSpecial = optionformSpecial(gm.data);
        const assetImgFiles = optionPokeImg(assets.data);
        const assetSoundFiles = optionPokeSound(assets.data);

        dispatch({
            type: LOAD_GM,
            payload: {
                    pokemon: pokemon,
                    evolution: optionEvolution(gm.data, pokemon, formSpecial),
                    stickers: optionSticker(gm.data, pokemon),
                    assets: optionAssets(pokemon, pokemonFamily, assetImgFiles, assetSoundFiles),
                    combat: optionCombat(gm.data),
                    pokemonCombat: optionPokemonCombat(gm.data, pokemon, formSpecial)
                }
            });
      });
};

export const resetGM = () => ({
    type: RESET_GM
});