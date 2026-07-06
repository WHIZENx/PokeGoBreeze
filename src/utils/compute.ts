import { Color, ICandy } from '../core/models/candy.model';
import { PokemonClass, PokemonType } from '../enums/type.enum';
import APIService from '../services/api.service';
import { BattleLeagueCPType, BattleLeagueIconType } from './enums/compute.enum';
import { EqualMode } from './enums/string.enum';
import { getValueOrDefault, isEqual, isIncludeList, toNumber } from './extension';
import { IStyleData } from './models/util.model';
import candy from '../data/pokemon_candy_color_data.json';
import { maxLevel, minLevel, stepLevel } from './helpers/options-context.helpers';
import { CostPowerUp } from './models/constants.model';

// Lazy-initialized list of Pokemon GO levels. Previously computed at module load,
// which captured values from the level getters before config was guaranteed to be
// set, and would go stale if config ever changed at runtime. Now computes on first
// access and caches — always reflects the current config, still stable reference.
let _levelList: number[] | undefined;

export const getLevelList = (): number[] => {
  if (!_levelList) {
    const step = stepLevel();
    _levelList = Array.from({ length: (maxLevel() - minLevel()) / step + 1 }, (_, i) => 1 + i * step);
  }
  return _levelList;
};

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'] as const;

export const genRoman = (gen: number | string) => ROMAN[toNumber(gen)] ?? '';

const COST_MULTIPLIERS: Partial<Record<PokemonType, { stardust: number; candy: number }>> = {
  [PokemonType.Shadow]: { stardust: 1.2, candy: 1.2 },
  [PokemonType.Purified]: { stardust: 0.9, candy: 0.9 },
  [PokemonType.Lucky]: { stardust: 0.5, candy: 1 },
};

export const typeCostPowerUp = (type: PokemonType | undefined) => {
  const multiplier = (type !== undefined && COST_MULTIPLIERS[type]) || { stardust: 1, candy: 1 };
  return CostPowerUp.create({ ...multiplier, type });
};

export const priorityBadge = (priority: number) => {
  if (priority === 0) {
    return APIService.getPokeSprite();
  }
  return APIService.getBadgeSprite(`Frames/badge_ring_${priority}`);
};

const RANK_NAMES: Partial<Record<number, string>> = {
  21: 'Ace',
  22: 'Veteran',
  23: 'Expert',
  24: 'Legend',
};

export const rankName = (rank: number) => RANK_NAMES[rank];

export const rankIconName = (rank: number | string) => {
  const rankNumber = toNumber(rank);
  switch (rankNumber) {
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
    default: {
      const tier = Math.floor(rankNumber / 5)
        .toString()
        .padStart(2, '0');
      return APIService.getPokeOtherLeague(`CombatRank${tier}`);
    }
  }
};

export const rankIconCenterName = (rank: number | string) => {
  switch (toNumber(rank)) {
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

const _candyCache = new Map<number, ICandy | undefined>();

const getCandyData = (id: number | undefined): ICandy | undefined => {
  const key = toNumber(id);
  if (_candyCache.has(key)) {
    return _candyCache.get(key);
  }
  const data = (candy as ICandy[]).find(
    (item) =>
      isIncludeList(
        item.familyGroup.map((v) => v.id),
        id
      ) || item.familyId === key
  );
  _candyCache.set(key, data);
  return data;
};

const toRgba = (color: Color) => `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;

export const computeCandyColor = (id: number | undefined) => {
  const data = getCandyData(id);
  return toRgba(
    Color.createRgb(data?.primaryColor.r, data?.primaryColor.g, data?.primaryColor.b, data?.primaryColor.a)
  );
};

export const computeCandyBgColor = (id: number | undefined) => {
  const data = getCandyData(id);
  return toRgba(
    Color.createRgb(data?.secondaryColor.r, data?.secondaryColor.g, data?.secondaryColor.b, data?.secondaryColor.a)
  );
};

const getTypeColor = (type: string, styleList: IStyleData[], defaultBg: string, opacity: number) => {
  const style = styleList.find((s) => isIncludeList(s.style.split(','), `.${type.toLowerCase()}`));
  const color = getValueOrDefault(String, style?.property?.['background-color'], defaultBg);
  return `${color.split(')').at(0)}, ${opacity})`;
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
  if (typeof types === 'string') {
    return getTypeColor(types, styleList, defaultBg, opacity);
  }
  const colorsPalette = (types ?? []).map((type) => getTypeColor(type, styleList, defaultBg, opacity));
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

export const findStabType = (types: string[] | undefined, findType: string | undefined) =>
  getValueOrDefault(Array, types).some((type) => isEqual(type, findType, EqualMode.IgnoreCaseSensitive));

const LEAGUE_NAMES: Partial<Record<BattleLeagueCPType, string>> = {
  [BattleLeagueCPType.Little]: 'Little Cup',
  [BattleLeagueCPType.Great]: 'Great League',
  [BattleLeagueCPType.Ultra]: 'Ultra League',
};

export const getPokemonBattleLeagueName = (cp = BattleLeagueCPType.Master) => LEAGUE_NAMES[cp] ?? 'Master League';

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
