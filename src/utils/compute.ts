import { IAsset } from '../core/models/asset.model';
import { Color, ICandy } from '../core/models/candy.model';
import { PokemonClass, PokemonType } from '../enums/type.enum';
import APIService from '../services/API.service';
import { BattleLeagueCPType, BattleLeagueIconType, FormType } from './enums/compute.enum';
import { EqualMode, IncludeMode } from './enums/string.enum';
import { getValueOrDefault, isEqual, isInclude, isIncludeList, isNotEmpty, toNumber } from './extension';
import { formGmax, formMega, formNormal } from './helpers/context.helpers';
import { IStyleData } from './models/util.model';

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
  const color = Color.createRgb(
    data?.secondaryColor.r,
    data?.secondaryColor.g,
    data?.secondaryColor.b,
    data?.secondaryColor.a
  );
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
};

export const computeBgType = (
  types: string[] | string | undefined,
  pokemonType = PokemonType.Normal,
  styleList: IStyleData[],
  opacity = 1,
  defaultColor?: string,
  defaultBg = `#6464644d`
) => {
  if (defaultColor) {
    return `linear-gradient(to bottom right, ${defaultColor}, ${defaultColor})`;
  }
  const colorsPalette: string[] = [];
  if (typeof types === 'string') {
    const style = styleList.find((style) => isIncludeList(style.style.split(','), `.${types.toLowerCase()}`));
    const color = getValueOrDefault(String, style?.property?.['background-color'], defaultBg);
    return `${color.split(')').at(0)}, ${toNumber(opacity, 1)})`;
  } else {
    types?.forEach((type) => {
      const style = styleList.find((style) => isIncludeList(style.style.split(','), `.${type.toLowerCase()}`));
      const color = getValueOrDefault(String, style?.property?.['background-color'], defaultBg);
      colorsPalette.push(`${color.split(')').at(0)}, ${toNumber(opacity, 1)})`);
    });
  }
  const [priColor, secTempColor] = colorsPalette;
  const secColor = getValueOrDefault(String, secTempColor, priColor);
  switch (pokemonType) {
    case PokemonType.Shadow:
      return `linear-gradient(to bottom right, ${priColor}, #ca9cec, ${secColor})`;
    case PokemonType.Purified:
      return `linear-gradient(to bottom right, ${priColor}, white, ${secColor})`;
    default:
      return `linear-gradient(to bottom right, ${priColor}, ${secColor})`;
  }
};

export const queryAssetForm = (assets: IAsset[], id: number | undefined, formName = formNormal()) => {
  const pokemonAssets = assets.find((asset) => asset.id === id);
  if (!pokemonAssets) {
    return;
  }
  const asset = pokemonAssets.image.find((img) => isEqual(formName, img.form, EqualMode.IgnoreCaseSensitive));
  if (asset) {
    return asset;
  } else if (
    isNotEmpty(pokemonAssets.image) &&
    !isInclude(formName, formMega(), IncludeMode.IncludeIgnoreCaseSensitive)
  ) {
    const formOrigin = pokemonAssets.image.find((img) => img.form === formNormal());
    if (!formOrigin) {
      return pokemonAssets.image[0];
    }
    return formOrigin;
  }
  return;
};

export const findAssetForm = (
  pokemonAssets: IAsset[],
  id: number | undefined,
  formName = formNormal(),
  formType = FormType.Default
) => {
  if (isEqual(formName, formGmax(), EqualMode.IgnoreCaseSensitive)) {
    return;
  }
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
