import { ICPM } from '../core/models/cpm.model';
import { IPokemonData } from '../core/models/pokemon.model';
import { IStatsPokemon, StatsPokemon, StatsIV, StatsPokemonGO } from '../core/models/stats.model';
import dataCPM from '../data/cp_multiplier.json';
import { PokemonType } from '../enums/type.enum';
import { RAID_BOSS_TIER } from './constants';
import { camelCase, splitAndCamelCase } from './utils';
import { BattleBaseStats, StatsBaseCalculate } from './models/calculate.model';
import { DynamicObj, isEqual, isInclude, isNotEmpty, toNumber } from './extension';
import { EqualMode, IncludeMode } from './enums/string.enum';
import {
  maxIv,
  maxLevel,
  formMega,
  minCp,
  getTypeEffective as getTypeEffectiveScalar,
} from './helpers/options-context.helpers';

const CPM_MAP = new Map<number, number>(dataCPM.map((item: ICPM) => [item.level, item.multiplier]));
const getCpmMultiplier = (level: number | undefined): number => toNumber(CPM_MAP.get(toNumber(level)));

export const getTypeEffective = (typeMove: string | undefined, typesObj: string[] | undefined) => {
  let valueEffective = 1;
  if (!typeMove || !getTypeEffectiveScalar() || !isNotEmpty(typesObj)) {
    return valueEffective;
  }
  const types = getTypeEffectiveScalar() as unknown as DynamicObj<DynamicObj<number>>;
  const typeScalar = types[camelCase(typeMove)] || types[splitAndCamelCase(typeMove, '_', '')];
  typesObj?.forEach(
    (type) =>
      (valueEffective *= toNumber(typeScalar[camelCase(type)] || typeScalar[splitAndCamelCase(type, '_', '')], 1))
  );
  return valueEffective;
};

/* Algorithm calculate from pokemongohub.net */
export const calBaseATK = (stats: IStatsPokemon | undefined, nerf: boolean) => {
  if (!stats) {
    stats = new StatsPokemon();
  }
  const atk = toNumber(stats.atk);
  const spa = toNumber(stats.spa);

  const lower = Math.min(atk, spa);
  const higher = Math.max(atk, spa);

  const speed = toNumber(stats.spe);

  const scaleATK = Math.round(2 * ((7 / 8) * higher + (1 / 8) * lower));
  const speedMod = 1 + (speed - 75) / 500;
  const baseATK = Math.round(scaleATK * speedMod);
  if (!nerf) {
    return baseATK;
  }
  if (
    calculateCP(baseATK + maxIv(), calBaseDEF(stats, false) + maxIv(), calBaseSTA(stats, false) + maxIv(), 40) >= 4000
  ) {
    return Math.round(scaleATK * speedMod * 0.91);
  } else {
    return baseATK;
  }
};

export const calBaseDEF = (stats: IStatsPokemon | undefined, nerf: boolean) => {
  if (!stats) {
    stats = new StatsPokemon();
  }
  const def = toNumber(stats.def);
  const spd = toNumber(stats.spd);

  const lower = Math.min(def, spd);
  const higher = Math.max(def, spd);

  const speed = toNumber(stats.spe);

  const scaleDEF = Math.round(2 * ((5 / 8) * higher + (3 / 8) * lower));
  const speedMod = 1 + (speed - 75) / 500;
  const baseDEF = Math.round(scaleDEF * speedMod);
  if (!nerf) {
    return baseDEF;
  }
  if (
    calculateCP(calBaseATK(stats, false) + maxIv(), baseDEF + maxIv(), calBaseSTA(stats, false) + maxIv(), 40) >= 4000
  ) {
    return Math.round(scaleDEF * speedMod * 0.91);
  } else {
    return baseDEF;
  }
};

export const calBaseSTA = (stats: IStatsPokemon | undefined, nerf: boolean) => {
  if (!stats) {
    stats = new StatsPokemon();
  }
  const hp = toNumber(stats.hp);

  const baseSTA = hp > 0 ? Math.floor(hp * 1.75 + 50) : hp;
  if (!nerf) {
    return baseSTA;
  }
  if (
    calculateCP(calBaseATK(stats, false) + maxIv(), calBaseDEF(stats, false) + maxIv(), baseSTA + maxIv(), 40) >= 4000
  ) {
    return Math.round((hp * 1.75 + 50) * 0.91);
  } else {
    return baseSTA;
  }
};

export const calculateCP = (atk: number, def: number, sta: number, level: number) =>
  Math.floor(Math.max(minCp(), (atk * def ** 0.5 * sta ** 0.5 * getCpmMultiplier(level) ** 2) / 10));

export const calculateRaidStat = (stat: number | undefined, tier: number) =>
  Math.floor((toNumber(stat) + maxIv()) * RAID_BOSS_TIER[tier].CPm);

export const calculateRaidCP = (atk: number, def: number, tier: number) =>
  Math.floor(((atk + maxIv()) * Math.sqrt(def + maxIv()) * Math.sqrt(RAID_BOSS_TIER[tier].sta)) / 10);

export const calculateStatsBattle = (base?: number, iv?: number, level?: number, floor = false, addition = 1) => {
  const result = (toNumber(base) + toNumber(iv)) * getCpmMultiplier(level) * addition;
  if (floor) {
    return Math.floor(result);
  }
  return result;
};

export const getBaseStatsByIVandLevel = (
  atk: number,
  def: number,
  sta: number,
  CP: number,
  id = 0,
  level = maxLevel(),
  atkIV = maxIv(),
  defIV = maxIv(),
  staIV = maxIv()
) => {
  const statATK = calculateStatsBattle(atk, atkIV, level);
  const statDEF = calculateStatsBattle(def, defIV, level);
  const statSTA = calculateStatsBattle(sta, staIV, level);
  return BattleBaseStats.create({
    IV: StatsIV.setValue(atkIV, defIV, staIV),
    CP,
    level,
    stats: StatsBaseCalculate.create(statATK, statDEF, statSTA),
    id,
  });
};

export const calculateStatsByTag = (
  pokemon: IPokemonData | undefined,
  baseStats: IStatsPokemon | undefined,
  tag: string | undefined
) => {
  const result = new StatsPokemonGO();
  if (pokemon || (baseStats && tag)) {
    if (pokemon?.baseStatsGO) {
      return StatsPokemonGO.create(pokemon.statsGO.atk, pokemon.statsGO.def, pokemon.statsGO.sta);
    }
    const checkNerf =
      !isInclude(tag, formMega(), IncludeMode.IncludeIgnoreCaseSensitive) || pokemon?.pokemonType !== PokemonType.Mega;

    result.atk = calBaseATK(baseStats, checkNerf);
    result.def = calBaseDEF(baseStats, checkNerf);
    result.sta = !isEqual(tag, 'shedinja', EqualMode.IgnoreCaseSensitive) ? calBaseSTA(baseStats, checkNerf) : 1;
  }
  return result;
};

export const getBarCharge = (energy: number, isRaid = false) => {
  energy = Math.abs(energy);
  if (isRaid) {
    const bar = Math.ceil(100 / energy);
    return Math.min(3, bar);
  } else {
    return Number(energy <= 50) + 1;
  }
};
