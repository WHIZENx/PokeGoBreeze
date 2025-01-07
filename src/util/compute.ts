import { IAsset } from '../core/models/asset.model';
import { ICandy } from '../core/models/candy.model';
import { PokemonType } from '../enums/type.enum';
import APIService from '../services/API.service';
import { FORM_GMAX, FORM_MEGA, FORM_NORMAL } from './constants';
import { BattleLeagueCPType, BattleLeagueIconType } from './enums/compute.enum';
import { EqualMode, IncludeMode } from './enums/string.enum';
import { getValueOrDefault, isEqual, isInclude, isIncludeList, isNotEmpty, toNumber } from './extension';
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

export const raidEgg = (tier: number, isMega?: boolean, isPrimal?: boolean, isUltra?: boolean) => {
  if (tier === 1) {
    return APIService.getRaidSprite('raid_egg_0_icon');
  } else if (tier === 3) {
    return APIService.getRaidSprite('raid_egg_1_icon');
  } else if (tier === 4) {
    if (isMega) {
      return APIService.getRaidSprite('raid_egg_3_icon');
    }
    return APIService.getRaidSprite('raid_egg_5_icon');
  } else if (tier === 5) {
    if (isUltra) {
      return APIService.getRaidSprite('raid_ultra_icon');
    }
    return APIService.getRaidSprite('raid_egg_2_icon');
  } else if (tier === 6) {
    if (isPrimal) {
      return APIService.getRaidSprite('raid_egg_primal_icon');
    }
    return APIService.getRaidSprite('raid_egg_4_icon');
  } else {
    return APIService.getRaidSprite('ic_raid_small');
  }
};

export const computeCandyBgColor = (candyData: ICandy[], id: number | undefined) => {
  const data = candyData.find(
    (item) =>
      isIncludeList(
        item.familyGroup.map((value) => value.id),
        id
      ) || item.familyId === toNumber(id)
  );
  return `rgb(${Math.round(255 * toNumber(data?.secondaryColor.r))}, ${Math.round(255 * toNumber(data?.secondaryColor.g))}, ${Math.round(
    255 * toNumber(data?.secondaryColor.b)
  )}, ${toNumber(data?.secondaryColor.a, 1)})`;
};

export const computeCandyColor = (candyData: ICandy[], id: number | undefined) => {
  const data = candyData.find(
    (item) =>
      isIncludeList(
        item.familyGroup.map((value) => value.id),
        id
      ) || item.familyId === toNumber(id)
  );
  return `rgb(${Math.round(255 * toNumber(data?.primaryColor.r))}, ${Math.round(255 * toNumber(data?.primaryColor.g))}, ${Math.round(
    255 * toNumber(data?.primaryColor.b)
  )}, ${toNumber(data?.primaryColor.a, 1)})`;
};

export const computeBgType = (
  types: string[] | string | undefined,
  pokemonType = PokemonType.Normal,
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
    return (color || defaultBg).split(')').at(0) + `, ${toNumber(opacity, 1)})` || defaultBg;
  } else {
    types?.forEach((type) => {
      const color = getStyleRuleValue('background-color', `.${type.toLowerCase()}`, styleSheet);
      colorsPalette.push((color || defaultBg).split(')').at(0) + `, ${toNumber(opacity, 1)})`);
    });
  }
  const [priColor, secColor] = colorsPalette;
  if (pokemonType === PokemonType.Shadow) {
    return `linear-gradient(to bottom right, ${priColor}, rgb(202, 156, 236), ${secColor ?? priColor})`;
  }
  if (pokemonType === PokemonType.Purified) {
    return `linear-gradient(to bottom right, ${priColor}, white, ${secColor ?? priColor})`;
  }
  return `linear-gradient(to bottom right, ${priColor}, ${secColor ?? priColor})`;
};

export const queryAssetForm = (assets: IAsset[], id: number | undefined, formName: string | null = FORM_NORMAL) => {
  const pokemonAssets = assets.find((asset) => asset.id === id);
  if (!pokemonAssets || isEqual(formName, FORM_GMAX, EqualMode.IgnoreCaseSensitive)) {
    return;
  }
  const asset = pokemonAssets.image.find((img) => isEqual(formName, img.form, EqualMode.IgnoreCaseSensitive));
  if (asset) {
    return asset;
  } else if (!asset && isNotEmpty(pokemonAssets.image) && !isInclude(formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive)) {
    const formNormal = pokemonAssets.image.find((img) => img.form === FORM_NORMAL);
    if (!formNormal) {
      return pokemonAssets.image[0];
    }
    return formNormal;
  }
  return;
};

export const findAssetForm = (pokemonAssets: IAsset[], id: number | undefined, formName: string | null = FORM_NORMAL) => {
  const form = queryAssetForm(pokemonAssets, id, formName);
  if (form) {
    return form.default;
  }
  return form;
};

export const findAssetFormShiny = (pokemonAssets: IAsset[], id: number, formName: string | null = FORM_NORMAL) => {
  const form = queryAssetForm(pokemonAssets, id, formName);
  if (form) {
    return form.shiny;
  }
  return form;
};

export const findStabType = (types: string[] | undefined, findType: string | undefined) => {
  return getValueOrDefault(Array, types).some((type) => isEqual(type, findType, EqualMode.IgnoreCaseSensitive));
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
