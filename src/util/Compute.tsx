import { Candy } from '../options/models/candy';
import APIService from '../services/API.service';
import { convertName, getStyleRuleValue } from './Utils';

export const rankName = (rank: number) => {
  if (rank === 21) return 'Ace';
  else if (rank === 22) return 'Veteren';
  else if (rank === 23) return 'Expert';
  else if (rank === 24) return 'Legend';
};

export const rankIconName = (rank: number) => {
  if (rank === 20) return APIService.getPokeOtherLeague('CombatRank03');
  else if (rank === 21) return APIService.getPokeOtherLeague('special_combat_rank_1');
  else if (rank === 22) return APIService.getPokeOtherLeague('special_combat_rank_2');
  else if (rank === 23) return APIService.getPokeOtherLeague('special_combat_rank_3');
  else if (rank === 24) return APIService.getPokeOtherLeague('special_combat_rank_4');
  else
    return APIService.getPokeOtherLeague(
      `CombatRank${Math.floor(rank / 5)
        .toString()
        .padStart(2, '0')}`
    );
};

export const rankIconCenterName = (rank: number) => {
  if (rank === 21 || rank === 22 || rank === 23) return APIService.getPokeOtherLeague('special_combat_rank_1_center');
  else if (rank === 24) return APIService.getPokeOtherLeague('special_combat_rank_4_center');
};

export const raidEgg = (tier: number, mega: any, ultra?: boolean) => {
  if (tier === 5 && ultra) return APIService.getRaidSprite('raid_ultra_icon');
  if (tier === 1) return APIService.getRaidSprite('raid_egg_0_icon');
  else if (tier === 3) return APIService.getRaidSprite('raid_egg_1_icon');
  else if (tier === 4) return APIService.getRaidSprite('raid_egg_5_icon');
  else if (tier === 5 && mega) return APIService.getRaidSprite('raid_egg_3_icon');
  else if (tier === 5) return APIService.getRaidSprite('raid_egg_2_icon');
  else if (tier === 6) return APIService.getRaidSprite('raid_egg_4_icon');
  else return APIService.getRaidSprite('ic_raid_small');
};

export const computeCandyBgColor = (candyData: Candy[], id: number) => {
  let data: any = candyData.find((item) => item.familyGroup.map((value) => value.id).includes(id));
  if (!data) data = candyData.find((item) => item.familyId === 0);
  return `rgb(${Math.round(255 * data?.secondaryColor.r)}, ${Math.round(255 * data?.secondaryColor.g)}, ${Math.round(
    255 * data?.secondaryColor.b
  )}, ${data?.secondaryColor.a})`;
};

export const computeCandyColor = (candyData: Candy[], id: number) => {
  let data: any = candyData.find((item) => item.familyGroup.map((value) => value.id).includes(id));
  if (!data) data = candyData.find((item: any) => item.familyId === 0);
  return `rgb(${Math.round(255 * data?.primaryColor.r)}, ${Math.round(255 * data?.primaryColor.g)}, ${Math.round(
    255 * data?.primaryColor.b
  )}, ${data?.primaryColor.a})`;
};

export const computeBgType = (types: any[], shadow = false, purified = false, opacity = 1, styleSheet?: any) => {
  const colorsPalette: any[] = [];
  types.forEach((type: string) => {
    type = type.toLowerCase();
    const color = getStyleRuleValue('background-color', `.${type}`, styleSheet);
    colorsPalette.push(color.split(')')[0] + `, ${opacity ?? 1})`);
  });
  if (shadow) return `linear-gradient(to bottom right, ${colorsPalette[0]}, rgb(202, 156, 236), ${colorsPalette[1] ?? colorsPalette[0]})`;
  if (purified) return `linear-gradient(to bottom right, ${colorsPalette[0]}, white, ${colorsPalette[1] ?? colorsPalette[0]})`;
  return `linear-gradient(to bottom right, ${colorsPalette[0]}, ${colorsPalette[1] ?? colorsPalette[0]})`;
};

export const findAssetForm = (pokemonAssets: any[], id: number, name: string) => {
  if (name.split('-')[1] === 'A') name = name.replace('-A', '-Armor');
  const pokemon = pokemonAssets.find((item: { id: any }) => item.id === id);
  const standard = pokemon.image.filter((item: { form: string | string[] }) => item.form.includes('STANDARD'));
  name = convertName(name);
  if (pokemon.name === name || standard.length > 0) {
    const image = pokemon.image.find((item: { form: string }) => item.form === 'NORMAL');
    if (image) return image.default;
    if (standard.length > 0) {
      if (name.includes('GALARIAN')) {
        if (name.includes('ZEN'))
          return pokemon.image.find((item: { form: string | string[] }) => item.form.includes('GALARIAN_ZEN')).default;
        return pokemon.image.find((item: { form: string | string[] }) => item.form.includes('GALARIAN')).default;
      } else if (name.includes('ZEN'))
        return pokemon.image.find((item: { form: string | string[] }) => !item.form.includes('GALARIAN') && item.form.includes('ZEN'))
          .default;
      else return pokemon.image.find((item: { form: string }) => item.form === 'STANDARD').default;
    }
    try {
      return pokemon.image[0].default;
    } catch {
      return null;
    }
  }
  try {
    return pokemon.image.find((item: { form: any }) => name.replaceAll(pokemon.name + '_', '') === item.form).default;
  } catch {
    return null;
  }
};

export const findStabType = (types: any[], findType: string) => {
  return types.find((type: string) => type.toLowerCase() === findType.toLowerCase()) ? true : false;
};
