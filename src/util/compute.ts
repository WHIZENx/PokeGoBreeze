import { IAsset } from '../core/models/asset.model';
import { Color, ICandy } from '../core/models/candy.model';
import { PokemonClass, PokemonType } from '../enums/type.enum';
import APIService from '../services/API.service';
import { FORM_GMAX, FORM_MEGA, FORM_NORMAL } from './constants';
import { BattleLeagueCPType, BattleLeagueIconType, FormType } from './enums/compute.enum';
import { EqualMode, IncludeMode } from './enums/string.enum';
import { getValueOrDefault, isEqual, isInclude, isIncludeList, isNotEmpty, toNumber } from './extension';
import { getStyleRuleValue } from './utils';

export const priorityBadge = (priority: number) => {
  if (priority === 0) {
    return APIService.getPokeSprite();
  }
  return APIService.getBadgeSprite(`Frames/badge_ring_${priority}`);
};

export const rankName = (rank: number) => {
  switch (rank) {
    case 21:
      return 'Ace';
    case 22:
      return 'Veteran';
    case 23:
      return 'Expert';
    case 24:
      return 'Legend';
  }
};

export const rankIconName = (rank: number) => {
  switch (rank) {
    case 20:
      return APIService.getPokeOtherLeague('CombatRank03');
    case 21:
      return APIService.getPokeOtherLeague('special_combat_rank_1');
    case 22:
      return APIService.getPokeOtherLeague('special_combat_rank_2');
    case 23:
      return APIService.getPokeOtherLeague('special_combat_rank_3');
    case 24:
      return APIService.getPokeOtherLeague('special_combat_rank_4');
    default:
      return APIService.getPokeOtherLeague(
        `CombatRank${Math.floor(rank / 5)
          .toString()
          .padStart(2, '0')}`
      );
  }
};

export const rankIconCenterName = (rank: number) => {
  switch (rank) {
    case 21:
    case 22:
    case 23:
      return APIService.getPokeOtherLeague('special_combat_rank_1_center');
    case 24:
      return APIService.getPokeOtherLeague('special_combat_rank_4_center');
  }
};

export const raidEgg = (tier: number, pokemonType?: PokemonType, pokemonClass?: PokemonClass) => {
  switch (tier) {
    case 1:
    case 2:
      return APIService.getRaidSprite('ic_raid_egg_normal');
    case 3:
    case 4: {
      if (tier === 4 && isEqual(pokemonType, PokemonType.Mega)) {
        return APIService.getRaidSprite('raid_egg_3_icon');
      }
      return APIService.getRaidSprite('ic_raid_egg_rare');
    }
    case 5: {
      if (isEqual(pokemonClass, PokemonClass.UltraBeast)) {
        return APIService.getRaidSprite('raid_ultra_icon');
      }
      return APIService.getRaidSprite('raid_egg_2_icon');
    }
    case 6: {
      if (isEqual(pokemonType, PokemonType.Primal)) {
        return APIService.getRaidSprite('raid_egg_primal_icon');
      }
      return APIService.getRaidSprite('raid_egg_4_icon');
    }
    default:
      return APIService.getRaidSprite('ic_raid_small');
  }
};

export const computeCandyColor = (candyData: ICandy[], id: number | undefined) => {
  const data = candyData.find(
    (item) =>
      isIncludeList(
        item.familyGroup.map((value) => value.id),
        id
      ) || item.familyId === toNumber(id)
  );
  const color = Color.createRgb(data?.primaryColor.r, data?.primaryColor.g, data?.primaryColor.b, data?.primaryColor.a);
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
};

export const computeCandyBgColor = (candyData: ICandy[], id: number | undefined) => {
  const data = candyData.find(
    (item) =>
      isIncludeList(
        item.familyGroup.map((value) => value.id),
        id
      ) || item.familyId === toNumber(id)
  );
  const color = Color.createRgb(data?.secondaryColor.r, data?.secondaryColor.g, data?.secondaryColor.b, data?.secondaryColor.a);
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
};

export const computeBgType = (
  types: string[] | string | undefined,
  pokemonType = PokemonType.Normal,
  opacity = 1,
  styleSheet?: CSSStyleSheet,
  defaultColor?: string,
  defaultBg = `#646464`
) => {
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
    return `linear-gradient(to bottom right, ${priColor}, #ca9cec, ${secColor ?? priColor})`;
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
  } else if (isNotEmpty(pokemonAssets.image) && !isInclude(formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive)) {
    const formNormal = pokemonAssets.image.find((img) => img.form === FORM_NORMAL);
    if (!formNormal) {
      return pokemonAssets.image[0];
    }
    return formNormal;
  }
  return;
};

export const findAssetForm = (
  pokemonAssets: IAsset[],
  id: number | undefined,
  formName: string | null = FORM_NORMAL,
  formType = FormType.Default
) => {
  const form = queryAssetForm(pokemonAssets, id, formName);
  if (form) {
    switch (formType) {
      case FormType.Shiny:
        return form.shiny;
      case FormType.Default:
      default:
        return form.default;
    }
  }
  return;
};

export const findStabType = (types: string[] | undefined, findType: string | undefined) =>
  getValueOrDefault(Array, types).some((type) => isEqual(type, findType, EqualMode.IgnoreCaseSensitive));

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

export const convertHexByRgba = (color: string) =>
  `#${color
    .replace(/^rgba?\(|\s+|\)$/gi, '')
    .split(',')
    .map((c, i) =>
      (i < 3 ? toNumber(c).toString(16) : Math.round(Math.max(0, Math.min(toNumber(c, 1), 1)) * 255).toString(16)).padStart(2, '0')
    )
    .join('')}`;
