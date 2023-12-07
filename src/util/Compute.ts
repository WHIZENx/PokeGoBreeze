import { Asset } from '../core/models/asset.model';
import { Candy } from '../core/models/candy.model';
import APIService from '../services/API.service';
import { FORM_GALARIAN, FORM_NORMAL, FORM_STANDARD } from './Constants';
import { convertName, getStyleRuleValue } from './Utils';

export const priorityBadge = (priority: number) => {
  if (priority === 0) {
    return APIService.getPokeSprite(0);
  }
  return APIService.getBadgeSprite(`Frames/badge_ring_${priority}`);
};

export const rankName = (rank: number) => {
  if (rank === 21) {
    return 'Ace';
  } else if (rank === 22) {
    return 'Veteran';
  } else if (rank === 23) {
    return 'Expert';
  } else if (rank === 24) {
    return 'Legend';
  }
};

export const rankIconName = (rank: number) => {
  if (rank === 20) {
    return APIService.getPokeOtherLeague('CombatRank03');
  } else if (rank === 21) {
    return APIService.getPokeOtherLeague('special_combat_rank_1');
  } else if (rank === 22) {
    return APIService.getPokeOtherLeague('special_combat_rank_2');
  } else if (rank === 23) {
    return APIService.getPokeOtherLeague('special_combat_rank_3');
  } else if (rank === 24) {
    return APIService.getPokeOtherLeague('special_combat_rank_4');
  } else {
    return APIService.getPokeOtherLeague(
      `CombatRank${Math.floor(rank / 5)
        .toString()
        .padStart(2, '0')}`
    );
  }
};

export const rankIconCenterName = (rank: number) => {
  if (rank === 21 || rank === 22 || rank === 23) {
    return APIService.getPokeOtherLeague('special_combat_rank_1_center');
  } else if (rank === 24) {
    return APIService.getPokeOtherLeague('special_combat_rank_4_center');
  }
};

export const raidEgg = (tier: number, mega: boolean, primal: boolean, ultra?: boolean) => {
  if (tier === 1) {
    return APIService.getRaidSprite('raid_egg_0_icon');
  } else if (tier === 3) {
    return APIService.getRaidSprite('raid_egg_1_icon');
  } else if (tier === 4) {
    if (mega) {
      return APIService.getRaidSprite('raid_egg_3_icon');
    }
    return APIService.getRaidSprite('raid_egg_5_icon');
  } else if (tier === 5) {
    if (ultra) {
      return APIService.getRaidSprite('raid_ultra_icon');
    }
    return APIService.getRaidSprite('raid_egg_2_icon');
  } else if (tier === 6) {
    if (primal) {
      return APIService.getRaidSprite('raid_egg_primal_icon');
    }
    return APIService.getRaidSprite('raid_egg_4_icon');
  } else {
    return APIService.getRaidSprite('ic_raid_small');
  }
};

export const computeCandyBgColor = (candyData: Candy[], id: number) => {
  let data = candyData?.find((item) => item.familyGroup.map((value) => value.id).includes(id));
  if (!data) {
    data = candyData?.find((item) => item.familyId === 0);
  }
  return `rgb(${Math.round(255 * (data?.secondaryColor.r ?? 0)) || 0}, ${Math.round(255 * (data?.secondaryColor.g ?? 0)) || 0}, ${
    Math.round(255 * (data?.secondaryColor.b ?? 0)) || 0
  }, ${data?.secondaryColor.a || 1})`;
};

export const computeCandyColor = (candyData: Candy[], id: number) => {
  let data = candyData?.find((item) => item.familyGroup.map((value) => value.id).includes(id));
  if (!data) {
    data = candyData?.find((item) => item.familyId === 0);
  }
  return `rgb(${Math.round(255 * (data?.primaryColor.r ?? 0)) || 0}, ${Math.round(255 * (data?.primaryColor.g ?? 0)) || 0}, ${
    Math.round(255 * (data?.primaryColor.b ?? 0)) || 0
  }, ${data?.primaryColor.a || 1})`;
};

export const computeBgType = (
  types: string[] | string | undefined,
  shadow = false,
  purified = false,
  opacity = 1,
  styleSheet?: any,
  defaultColor?: string | null
) => {
  if (defaultColor) {
    return `linear-gradient(to bottom right, ${defaultColor}, ${defaultColor})`;
  }
  const colorsPalette: any[] = [];
  if (typeof types === 'string') {
    const color = getStyleRuleValue('background-color', `.${types.toLowerCase()}`, styleSheet);
    return color?.split(')').at(0) + `, ${opacity ?? 1})`;
  } else {
    types?.forEach((type: string) => {
      const color = getStyleRuleValue('background-color', `.${type.toLowerCase()}`, styleSheet);
      colorsPalette.push(color?.split(')').at(0) + `, ${opacity ?? 1})`);
    });
  }
  if (shadow) {
    return `linear-gradient(to bottom right, ${colorsPalette.at(0)}, rgb(202, 156, 236), ${colorsPalette.at(1) ?? colorsPalette.at(0)})`;
  }
  if (purified) {
    return `linear-gradient(to bottom right, ${colorsPalette.at(0)}, white, ${colorsPalette.at(1) ?? colorsPalette.at(0)})`;
  }
  return `linear-gradient(to bottom right, ${colorsPalette.at(0)}, ${colorsPalette.at(1) ?? colorsPalette.at(0)})`;
};

export const queryAssetForm = (pokemonAssets: Asset[], id: number | undefined, name: string | undefined) => {
  if (name?.split('-').at(1) === 'A') {
    name = name.replace('-A', '-Armor');
  }
  const pokemon = pokemonAssets?.find((item) => item.id === id);
  if (!pokemon) {
    return null;
  }
  const standard = pokemon.image.filter((item) => item.form?.toUpperCase().includes(FORM_STANDARD));
  name = convertName(name);

  if (pokemon.name === name || standard.length > 0) {
    const image = pokemon.image.find((item) => item.form?.toUpperCase() === FORM_NORMAL);
    if (image) {
      return image;
    }
    if (standard.length > 0) {
      if (name.includes(FORM_GALARIAN)) {
        if (name.includes('ZEN')) {
          return pokemon.image.find((item) => item.form.includes(`${FORM_GALARIAN}_ZEN`));
        }
        return pokemon.image.find((item) => item.form.includes(FORM_GALARIAN));
      } else if (name.includes('ZEN')) {
        return pokemon.image.find((item) => !item.form.includes(FORM_GALARIAN) && item.form.includes('ZEN'));
      } else {
        return pokemon.image.find((item) => item.form?.toUpperCase() === FORM_STANDARD);
      }
    }
    try {
      return pokemon.image.at(0);
    } catch {
      return null;
    }
  }
  try {
    return pokemon.image.find((item) => name?.replaceAll(pokemon.name + '_', '') === item.form);
  } catch {
    return null;
  }
};

export const findAssetForm = (pokemonAssets: Asset[], id: number | undefined, name: string | undefined) => {
  const form = queryAssetForm(pokemonAssets, id, name);
  if (form) {
    return form.default;
  }
  return null;
};

export const findAssetFormShiny = (pokemonAssets: Asset[], id: number, name: string) => {
  const form = queryAssetForm(pokemonAssets, id, name);
  if (form) {
    return form.shiny;
  }
  return null;
};

export const findStabType = (types: string[], findType: string) => {
  return types.some((type) => type.toLowerCase() === findType.toLowerCase());
};
