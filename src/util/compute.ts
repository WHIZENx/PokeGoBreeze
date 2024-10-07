import { IAsset } from '../core/models/asset.model';
import { ICandy } from '../core/models/candy.model';
import APIService from '../services/API.service';
import { FORM_GMAX, FORM_NORMAL } from './constants';
import { BattleLeagueCPType, BattleLeagueIconType } from './enums/compute.enum';
import { EqualMode } from './enums/string.enum';
import { getValueOrDefault, isEqual, isIncludeList, isNotEmpty } from './extension';
import { getStyleRuleValue } from './utils';

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

export const computeCandyBgColor = (candyData: ICandy[], id: number) => {
  let data = candyData.find((item) =>
    isIncludeList(
      item.familyGroup.map((value) => value.id),
      id
    )
  );
  if (!data) {
    data = candyData.find((item) => item.familyId === id);
    if (!data) {
      data = candyData.find((item) => item.familyId === 0);
    }
  }
  return `rgb(${Math.round(255 * getValueOrDefault(Number, data?.secondaryColor.r))}, ${Math.round(
    255 * getValueOrDefault(Number, data?.secondaryColor.g)
  )}, ${Math.round(255 * getValueOrDefault(Number, data?.secondaryColor.b))}, ${data?.secondaryColor.a || 1})`;
};

export const computeCandyColor = (candyData: ICandy[], id: number) => {
  let data = candyData.find((item) =>
    isIncludeList(
      item.familyGroup.map((value) => value.id),
      id
    )
  );
  if (!data) {
    data = candyData.find((item) => item.familyId === id);
    if (!data) {
      data = candyData.find((item) => item.familyId === 0);
    }
  }
  return `rgb(${Math.round(255 * getValueOrDefault(Number, data?.primaryColor.r))}, ${Math.round(
    255 * getValueOrDefault(Number, data?.primaryColor.g)
  )}, ${Math.round(255 * getValueOrDefault(Number, data?.primaryColor.b))}, ${data?.primaryColor.a || 1})`;
};

export const computeBgType = (
  types: string[] | string | undefined,
  shadow = false,
  purified = false,
  opacity = 1,
  styleSheet?: CSSStyleSheet,
  defaultColor?: string
) => {
  const defaultBg = `rgb(100, 100, 100)`;
  if (defaultColor) {
    return `linear-gradient(to bottom right, ${defaultColor}, ${defaultColor})`;
  }
  const colorsPalette: string[] = [];
  if (typeof types === 'string') {
    const color = getStyleRuleValue('background-color', `.${types.toLowerCase()}`, styleSheet);
    return (color || defaultBg).split(')').at(0) + `, ${getValueOrDefault(Number, opacity, 1)})` || defaultBg;
  } else {
    types?.forEach((type) => {
      const color = getStyleRuleValue('background-color', `.${type.toLowerCase()}`, styleSheet);
      colorsPalette.push((color || defaultBg).split(')').at(0) + `, ${getValueOrDefault(Number, opacity, 1)})`);
    });
  }
  const [priColor, secColor] = colorsPalette;
  if (shadow) {
    return `linear-gradient(to bottom right, ${priColor}, rgb(202, 156, 236), ${secColor ?? priColor})`;
  }
  if (purified) {
    return `linear-gradient(to bottom right, ${priColor}, white, ${secColor ?? priColor})`;
  }
  return `linear-gradient(to bottom right, ${priColor}, ${secColor ?? priColor})`;
};

export const queryAssetForm = (assets: IAsset[], id: number | undefined, name: string | undefined | null) => {
  const pokemonAssets = assets.find((asset) => asset.id === id);
  if (!pokemonAssets || name?.toUpperCase() === FORM_GMAX) {
    return;
  }
  const asset = pokemonAssets.image.find((img) => isEqual(img.form, name));
  if (asset) {
    return asset;
  } else if (!asset && isNotEmpty(pokemonAssets.image)) {
    const formNormal = pokemonAssets.image.find((img) => img.form === FORM_NORMAL);
    if (!formNormal) {
      return pokemonAssets.image.at(0);
    }
    return formNormal;
  }
  return;
};

export const findAssetForm = (pokemonAssets: IAsset[], id: number | undefined, name: string | undefined) => {
  const form = queryAssetForm(pokemonAssets, id, name);
  if (form) {
    return form.default;
  }
  return form;
};

export const findAssetFormShiny = (pokemonAssets: IAsset[], id: number, name: string) => {
  const form = queryAssetForm(pokemonAssets, id, name);
  if (form) {
    return form.shiny;
  }
  return form;
};

export const findStabType = (types: string[], findType: string) => {
  return types.some((type) => isEqual(type, findType, EqualMode.IgnoreCaseSensitive));
};

export const getPokemonBattleLeagueName = (cp = BattleLeagueCPType.Master) => {
  switch (cp) {
    case BattleLeagueCPType.Little:
      return 'Little Cup';
    case BattleLeagueCPType.Great:
      return 'Great League';
    case BattleLeagueCPType.Ultra:
      return 'Ultra League';
    default:
      return 'Master League';
  }
};

export const getPokemonBattleLeagueIcon = (cp = BattleLeagueCPType.Master) => {
  switch (cp) {
    case BattleLeagueCPType.Little:
      return APIService.getPokeOtherLeague(BattleLeagueIconType.Little);
    case BattleLeagueCPType.Great:
      return APIService.getPokeLeague(BattleLeagueIconType.Great);
    case BattleLeagueCPType.Ultra:
      return APIService.getPokeLeague(BattleLeagueIconType.Ultra);
    default:
      return APIService.getPokeLeague(BattleLeagueIconType.Master);
  }
};
