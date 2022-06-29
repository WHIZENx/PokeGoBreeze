import candyData from '../data/candy_pokemon_go.json';
import pokemonAssets from '../data/assets_pokemon_go.json';

import APIService from "../services/API.service";
import { convertName } from "./Utils";

export const rankName = (rank) => {
    if (rank === 21) return "Ace"
    else if (rank === 22) return "Veteren"
    else if (rank === 23) return "Expert"
    else if (rank === 24) return "Legend"
}

export const rankIconName = (rank) => {
    if (rank === 21) return APIService.getPokeOtherLeague("special_combat_rank_1");
    else if (rank === 22) return APIService.getPokeOtherLeague("special_combat_rank_2");
    else if (rank === 23) return APIService.getPokeOtherLeague("special_combat_rank_3");
    else if (rank === 24) return APIService.getPokeOtherLeague("special_combat_rank_4");
}

export const rankIconCenterName = (rank) => {
    if (rank === 21 || rank === 22 || rank === 23) return APIService.getPokeOtherLeague("special_combat_rank_1_center");
    else if (rank === 24) return APIService.getPokeOtherLeague("special_combat_rank_4_center");
}

export const raidEgg = (tier, mega) => {
    if (tier === 1) return APIService.getRaidSprite("raid_egg_0_icon");
    else if (tier === 3) return APIService.getRaidSprite("raid_egg_1_icon");
    else if (tier === 4) return APIService.getRaidSprite("raid_egg_5_icon");
    else if (tier === 5 && mega) return APIService.getRaidSprite("raid_egg_3_icon");
    else if (tier === 5) return APIService.getRaidSprite("raid_egg_2_icon");
    else if (tier === 6) return APIService.getRaidSprite("raid_egg_4_icon");
    else return APIService.getRaidSprite("ic_raid_small");
}

export const computeBgColor = (id) => {
    let data = candyData.find(item => item.familyGroup.map(value => value.id).includes(id));
    if (!data) data = candyData.find(item => item.familyId === 0);
    return `rgb(${Math.round(255*data.SecondaryColor.r)}, ${Math.round(255*data.SecondaryColor.g)}, ${Math.round(255*data.SecondaryColor.b)}, ${data.SecondaryColor.a})`
}

export const computeColor = (id) => {
  let data = candyData.find(item => item.familyGroup.map(value => value.id).includes(id));
  if (!data) data = candyData.find(item => item.familyId === 0);
  return `rgb(${Math.round(255*data.PrimaryColor.r)}, ${Math.round(255*data.PrimaryColor.g)}, ${Math.round(255*data.PrimaryColor.b)}, ${data.PrimaryColor.a})`
}

export const findAssetForm = (id, name) => {
    name = convertName(name).replaceAll("GALAR", "GALARIAN")
    const pokemon = pokemonAssets.find(item => item.id === id);
    const standard = pokemon.image.filter(item => item.form.includes("STANDARD"));
    if (pokemon.name === convertName(name) || standard.length > 0) {
        let image = pokemon.image.find(item => item.form === "NORMAL")
        if (image) return image.default;
        if (standard.length > 0) {
            if (name.includes("GALARIAN")) {
                if (name.includes("ZEN")) return pokemon.image.find(item => item.form.includes("GALARIAN_ZEN")).default
                return pokemon.image.find(item => item.form.includes("GALARIAN")).default
            } else if (name.includes("ZEN")) return pokemon.image.find(item => !item.form.includes("GALARIAN") && item.form.includes("ZEN")).default
            else return pokemon.image.find(item => item.form === "STANDARD").default;
        }
        try {return pokemon.image[0].default;}
        catch { return null }
    }
    try {return pokemon.image.find(item => convertName(name).replaceAll(pokemon.name+"_", "") === item.form).default;}
    catch { return null; }
}

export const findStabType = (types, findType) => {
    return types.find(type => type.toLowerCase() === findType.toLowerCase()) ? true : false;
};

