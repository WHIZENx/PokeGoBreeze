import candyData from '../data/candy_pokemon_go.json';
import pokemonAssets from '../data/assets_pokemon_go.json';

import APIService from "../services/API.service";
import { convertName, getStyleRuleValue } from "./Utils";

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

export const computeCandyBgColor = (id) => {
    let data = candyData.find(item => item.familyGroup.map(value => value.id).includes(id));
    if (!data) data = candyData.find(item => item.familyId === 0);
    return `rgb(${Math.round(255*data.SecondaryColor.r)}, ${Math.round(255*data.SecondaryColor.g)}, ${Math.round(255*data.SecondaryColor.b)}, ${data.SecondaryColor.a})`
}

export const computeCandyColor = (id) => {
  let data = candyData.find(item => item.familyGroup.map(value => value.id).includes(id));
  if (!data) data = candyData.find(item => item.familyId === 0);
  return `rgb(${Math.round(255*data.PrimaryColor.r)}, ${Math.round(255*data.PrimaryColor.g)}, ${Math.round(255*data.PrimaryColor.b)}, ${data.PrimaryColor.a})`
}

export const computeBgType = (types, shadow, purified, opacity) => {
    let colorsPalette = [];
    types.forEach(type => {
        type = type.toLowerCase();
        const color = getStyleRuleValue('background-color', `.${type}`, document.styleSheets[2]);
        colorsPalette.push(color.split(")")[0]+`, ${opacity ?? 1})`);
    });
    if (shadow) return `linear-gradient(to bottom right, ${colorsPalette[0]}, rgb(202, 156, 236), ${colorsPalette[1] ?? colorsPalette[0]})`;
    if (purified) return `linear-gradient(to bottom right, ${colorsPalette[0]}, white, ${colorsPalette[1] ?? colorsPalette[0]})`
    return `linear-gradient(to bottom right, ${colorsPalette[0]}, ${colorsPalette[1] ?? colorsPalette[0]})`;
}

export const findAssetForm = (id, name) => {
    if (name.split("-")[1] === "A") name = name.replace("-A", "-Armor")
    name = convertName(name).replaceAll("GALAR", "GALARIAN").replaceAll("HISUI", "HISUIAN")
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

