import data from '../data/cp_multiplier.json';
import pokemonData from '../data/pokemon.json';
import {
  DEFAULT_DAMAGE_CONST,
  DEFAULT_DAMAGE_MULTIPLY,
  DEFAULT_ENEMY_ATK_DELAY,
  DEFAULT_ENERYGY_PER_HP_LOST,
  DEFAULT_POKEMON_DEF_OBJ,
  DEFAULT_POKEMON_SHADOW,
  DEFAULT_TRAINER_FRIEND,
  DEFAULT_WEATHER_BOOSTS,
  MAX_IV,
  MAX_LEVEL,
  MIN_IV,
  MIN_LEVEL,
  MULTIPLY_LEVEL_FRIENDSHIP,
  MULTIPLY_THROW_CHARGE,
  RAID_BOSS_TIER,
  SHADOW_ATK_BONUS,
  SHADOW_DEF_BONUS,
  STAB_MULTIPLY,
  typeCostPowerUp,
} from './Constants';
import { capitalize, convertName, splitAndCapitalize, convertNameRankingToOri, convertNameRankingToForm } from './Utils';

const weatherMultiple = (globalOptions: any, weatherBoost: any, weather: string, type: string) => {
  return weatherBoost[weather.toUpperCase().replaceAll(' ', '_')].find((item: any) => item === type.toUpperCase().replaceAll(' ', '_'))
    ? STAB_MULTIPLY(globalOptions)
    : 1;
};

export const getTypeEffective = (typeEffective: any, typeMove: string, typesObj: any[]) => {
  let valueEffective = 1;
  typesObj.forEach((type: { type: { name: string }; toUpperCase: () => any }) => {
    try {
      valueEffective *= typeEffective[typeMove.toUpperCase()][type.type.name.toUpperCase()];
    } catch {
      valueEffective *= typeEffective[typeMove.toUpperCase()][type.toUpperCase()];
    }
  });
  return valueEffective;
};

/* Algorithm calculate from pokemongohub.net */
export const calBaseATK = (stats: any, nerf: boolean) => {
  const atk = stats.atk ?? stats.find((item: { stat: { name: string } }) => item.stat.name === 'attack').base_stat;
  const spa = stats.spa ?? stats.find((item: { stat: { name: string } }) => item.stat.name === 'special-attack').base_stat;

  const lower = Math.min(atk, spa);
  const higher = Math.max(atk, spa);

  const speed = stats.spe ?? stats.find((item: { stat: { name: string } }) => item.stat.name === 'speed').base_stat;

  const scaleATK = Math.round(2 * ((7 / 8) * higher + (1 / 8) * lower));
  const speedMod = 1 + (speed - 75) / 500;
  const baseATK = Math.round(scaleATK * speedMod);
  if (!nerf) return baseATK;
  if (calculateCP(baseATK + 15, calBaseDEF(stats, false) + 15, calBaseSTA(stats, false) + 15, 40) >= 4000)
    return Math.round(scaleATK * speedMod * 0.91);
  else return baseATK;
};

export const calBaseDEF = (stats: any, nerf: boolean) => {
  const def = stats.def ?? stats.find((item: { stat: { name: string } }) => item.stat.name === 'defense').base_stat;
  const spd = stats.spd ?? stats.find((item: { stat: { name: string } }) => item.stat.name === 'special-defense').base_stat;

  const lower = Math.min(def, spd);
  const higher = Math.max(def, spd);

  const speed = stats.spe ?? stats.find((item: { stat: { name: string } }) => item.stat.name === 'speed').base_stat;

  const scaleDEF = Math.round(2 * ((5 / 8) * higher + (3 / 8) * lower));
  const speedMod = 1 + (speed - 75) / 500;
  const baseDEF = Math.round(scaleDEF * speedMod);
  if (!nerf) return baseDEF;
  if (calculateCP(calBaseATK(stats, false) + 15, baseDEF + 15, calBaseSTA(stats, false) + 15, 40) >= 4000)
    return Math.round(scaleDEF * speedMod * 0.91);
  else return baseDEF;
};

export const calBaseSTA = (stats: any, nerf: boolean) => {
  const hp = stats.hp ?? stats.find((item: { stat: { name: string } }) => item.stat.name === 'hp').base_stat;

  const baseSTA = Math.floor(hp * 1.75 + 50);
  if (!nerf) return baseSTA;
  if (calculateCP(calBaseATK(stats, false) + 15, calBaseDEF(stats, false) + 15, baseSTA + 15, 40) >= 4000)
    return Math.round((hp * 1.75 + 50) * 0.91);
  else return baseSTA;
};

export const sortStatsPokemon = (states: any[]) => {
  const attackRanking = Array.from(
    new Set(
      states
        .sort(
          (a: { baseStatsPokeGo: { attack: number } }, b: { baseStatsPokeGo: { attack: number } }) =>
            a.baseStatsPokeGo.attack - b.baseStatsPokeGo.attack
        )
        .map((item: { baseStatsPokeGo: { attack: any } }) => {
          return item.baseStatsPokeGo.attack;
        })
    )
  );

  const minATK = Math.min(...attackRanking);
  const maxATK = Math.max(...attackRanking);
  const attackStats = states.map((item: { id: any; name: string; baseStatsPokeGo: { attack: any } }) => {
    return {
      id: item.id,
      form: item.name.split('-')[1] ? item.name.slice(item.name.indexOf('-') + 1, item.name.length) : 'Normal',
      attack: item.baseStatsPokeGo.attack,
      rank: attackRanking.length - attackRanking.indexOf(item.baseStatsPokeGo.attack),
    };
  });

  const defenseRanking = Array.from(
    new Set(
      states
        .sort(
          (a: { baseStatsPokeGo: { defense: number } }, b: { baseStatsPokeGo: { defense: number } }) =>
            a.baseStatsPokeGo.defense - b.baseStatsPokeGo.defense
        )
        .map((item: { baseStatsPokeGo: { defense: any } }) => {
          return item.baseStatsPokeGo.defense;
        })
    )
  );

  const minDEF = Math.min(...defenseRanking);
  const maxDEF = Math.max(...defenseRanking);
  const defenseStats = states.map((item: { id: any; name: string; baseStatsPokeGo: { defense: any } }) => {
    return {
      id: item.id,
      form: item.name.split('-')[1] ? item.name.slice(item.name.indexOf('-') + 1, item.name.length) : 'Normal',
      defense: item.baseStatsPokeGo.defense,
      rank: defenseRanking.length - defenseRanking.indexOf(item.baseStatsPokeGo.defense),
    };
  });

  const staminaRanking = Array.from(
    new Set(
      states
        .sort(
          (a: { baseStatsPokeGo: { stamina: number } }, b: { baseStatsPokeGo: { stamina: number } }) =>
            a.baseStatsPokeGo.stamina - b.baseStatsPokeGo.stamina
        )
        .map((item: { baseStatsPokeGo: { stamina: any } }) => {
          return item.baseStatsPokeGo.stamina;
        })
    )
  );

  const minSTA = Math.min(...staminaRanking);
  const maxSTA = Math.max(...staminaRanking);
  const staminaStats = states.map((item: { id: any; name: string; baseStatsPokeGo: { stamina: any } }) => {
    return {
      id: item.id,
      form: item.name.split('-')[1] ? item.name.slice(item.name.indexOf('-') + 1, item.name.length) : 'Normal',
      stamina: item.baseStatsPokeGo.stamina,
      rank: staminaRanking.length - staminaRanking.indexOf(item.baseStatsPokeGo.stamina),
    };
  });

  return {
    attack: {
      ranking: attackStats,
      min_rank: 1,
      max_rank: attackRanking.length,
      min_stats: minATK,
      max_stats: maxATK,
    },
    defense: {
      ranking: defenseStats,
      min_rank: 1,
      max_rank: defenseRanking.length,
      min_stats: minDEF,
      max_stats: maxDEF,
    },
    stamina: {
      ranking: staminaStats,
      min_rank: 1,
      max_rank: staminaRanking.length,
      min_stats: minSTA,
      max_stats: maxSTA,
    },
  };
};

export const calculateCP = (atk: number, def: number, sta: number, level: number) => {
  return Math.floor(
    Math.max(10, (atk * def ** 0.5 * sta ** 0.5 * (data as any).find((item: any) => item.level === level).multiplier ** 2) / 10)
  );
};

export const calculateRaidStat = (stat: number, tier: number) => {
  return Math.floor((stat + 15) * RAID_BOSS_TIER[tier].CPm);
};

export const calculateRaidCP = (atk: number, def: number, tier: number) => {
  return Math.floor(((atk + 15) * Math.sqrt(def + 15) * Math.sqrt(RAID_BOSS_TIER[tier].sta)) / 10);
};

export const calculateDmgOutput = (atk: number, dps: number) => {
  return atk * dps;
};

export const calculateTankiness = (def: number, HP: number) => {
  return def * HP;
};

export const calculateDuelAbility = (dmgOutput: number, tanki: number) => {
  return dmgOutput * tanki;
};

export const calculateCatchChance = (baseCaptureRate: number, level: number, multiplier: number) => {
  return (
    1 -
    Math.pow(
      Math.max(0, 1 - baseCaptureRate / (2 * (data as any).find((data: { level: number }) => data.level === level).multiplier)),
      multiplier
    )
  );
};

export const predictStat = (atk: number, def: number, sta: number, cp: any) => {
  cp = parseInt(cp);
  const dataStat: any = {};
  let minLevel = 1;
  let maxLevel = 1;
  for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
    if (cp <= calculateCP(atk + 15, def + 15, sta + 15, i)) {
      minLevel = i;
      break;
    }
  }
  for (let i = minLevel; i <= MAX_LEVEL; i += 0.5) {
    if (calculateCP(atk, def, sta, i) >= cp) {
      maxLevel = i;
      break;
    }
  }
  dataStat.cp = cp;
  dataStat.minLevel = minLevel;
  dataStat.maxLevel = maxLevel;

  const predictArr = [];
  for (let l = minLevel; l <= maxLevel; l += 0.5) {
    for (let i = MIN_IV; i <= MAX_IV; i++) {
      for (let j = MIN_IV; j <= MAX_IV; j++) {
        for (let k = MIN_IV; k <= MAX_IV; k++) {
          if (calculateCP(atk + i, def + j, sta + k, l) === cp)
            predictArr.push({
              atk: i,
              def: j,
              sta: k,
              level: l,
              percent: parseFloat((((i + j + k) * 100) / 45).toFixed(2)),
              hp: Math.min(1, Math.floor((sta + k) * (data as any).find((item: any) => item.level === l).multiplier)),
            });
        }
      }
    }
  }
  dataStat.result = predictArr;
  return dataStat;
};

export const predictCPList = (atk: number, def: number, sta: number, IVatk: any, IVdef: any, IVsta: any) => {
  IVatk = parseInt(IVatk);
  IVdef = parseInt(IVdef);
  IVsta = parseInt(IVsta);

  const dataStat: any = {};
  dataStat.IV = { atk: IVatk, def: IVdef, sta: IVsta };

  const predictArr = [];
  for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
    predictArr.push({
      level: i,
      cp: calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i),
      hp: Math.min(1, Math.floor((sta + IVsta) * (data as any).find((item: any) => item.level === i).multiplier)),
    });
  }
  dataStat.result = predictArr;
  return dataStat;
};

export const calculateStats = (atk: number, def: number, sta: number, IVatk: number, IVdef: number, IVsta: number, cp: any) => {
  cp = parseInt(cp);

  const dataStat: any = {};
  dataStat.IV = { atk: IVatk, def: IVdef, sta: IVsta };
  dataStat.CP = cp;
  dataStat.level = null;

  for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
    if (cp === calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i)) {
      dataStat.level = i;
      break;
    }
  }
  return dataStat;
};

export const calculateStatsBattle = (base: number, iv: number, level: number, floor: any = false, addition: any = false) => {
  let result: number = (base + iv) * (data as any).find((item: any) => item.level === level).multiplier;
  if (addition) result *= addition;
  if (floor) return Math.floor(result);
  return result;
};

export const calculateBetweenLevel = (
  globalOptions: any,
  atk: number,
  def: number,
  sta: number,
  IVatk: number,
  IVdef: number,
  IVsta: number,
  fromLV: number,
  toLV: number,
  type: any = ''
) => {
  // from_lv -= 0.5;
  toLV -= 0.5;

  const powerUpCount = (toLV - fromLV) * 2;

  if (fromLV > toLV) {
    return {
      cp: calculateCP(atk + IVatk, def + IVdef, sta + IVsta, toLV + 0.5),
      result_between_stadust: 0,
      result_between_candy: 0,
      result_between_xl_candy: 0,
      power_up_count: 0,
    };
  } else {
    let betweenStadust = 0;
    let betweenCandy = 0;
    let betweenXlCandy = 0;

    let betweenStadustDiff = 0;
    let betweenCandyDiff = 0;
    let betweenXlCandyDiff = 0;

    let atkStat = 0;
    let defStat = 0;
    let atkStatDiff = 0;
    let defStatDiff = 0;

    if (type === 'shadow') {
      atkStat = calculateStatsBattle(atk, IVatk, toLV + 0.5, true, SHADOW_ATK_BONUS(globalOptions));
      defStat = calculateStatsBattle(def, IVdef, toLV + 0.5, true, SHADOW_DEF_BONUS(globalOptions));

      atkStatDiff = Math.abs(calculateStatsBattle(atk, IVatk, toLV + 0.5, true) - atkStat);
      defStatDiff = Math.abs(calculateStatsBattle(def, IVdef, toLV + 0.5, true) - defStat);
    }

    data.forEach((ele: any) => {
      if (ele.level >= fromLV && ele.level <= toLV) {
        betweenStadust += Math.ceil(ele.stadust * typeCostPowerUp(type).stadust);
        betweenCandy += Math.ceil(ele.candy * typeCostPowerUp(type).candy);
        betweenXlCandy += Math.ceil(ele.xl_candy * typeCostPowerUp(type).candy);
        betweenStadustDiff += Math.abs(ele.stadust - Math.ceil(ele.stadust * typeCostPowerUp(type).stadust));
        betweenCandyDiff += Math.abs(ele.candy - Math.ceil(ele.candy * typeCostPowerUp(type).candy));
        betweenXlCandyDiff += Math.abs(ele.xl_candy - Math.ceil(ele.xl_candy * typeCostPowerUp(type).candy));
      }
    });

    const dataList: any = {
      cp: calculateCP(atk + IVatk, def + IVdef, sta + IVsta, toLV + 0.5),
      result_between_stadust: betweenStadust,
      result_between_stadust_diff: betweenStadustDiff,
      result_between_candy: betweenCandy,
      result_between_candy_diff: betweenCandyDiff,
      result_between_xl_candy: betweenXlCandy,
      result_between_xl_candy_diff: betweenXlCandyDiff,
      powerUpCount,
      type,
    };

    if (type === 'shadow') {
      dataList.atk_stat = atkStat;
      dataList.def_stat = defStat;
      dataList.atk_stat_diff = atkStatDiff;
      dataList.def_stat_diff = defStatDiff;
    }

    return dataList;
  }
};

export const calculateBattleLeague = (
  globalOptions: any,
  atk: number,
  def: number,
  sta: number,
  IVatk: number,
  IVdef: number,
  IVsta: number,
  fromLV: any,
  currCP: number,
  maxCp: number | null,
  type: string
) => {
  let level = MAX_LEVEL;
  if (type !== 'lucky') level -= 1;
  if (maxCp && currCP > maxCp) {
    return { elidge: false };
  } else {
    const dataBattle: any = {};

    dataBattle.elidge = true;
    dataBattle.maxCP = maxCp;
    dataBattle.IV = { atk: IVatk, def: IVdef, sta: IVsta };
    dataBattle.cp = 0;
    dataBattle.limit = true;
    dataBattle.level = null;
    if (maxCp == null) {
      dataBattle.level = level;
      dataBattle.cp = calculateCP(atk + IVatk, def + IVdef, sta + IVsta, level);
      dataBattle.limit = false;
    } else {
      for (let i = MIN_LEVEL; i <= level; i += 0.5) {
        if (
          dataBattle.cp < calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i) &&
          calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i) <= maxCp
        ) {
          dataBattle.level = i;
          dataBattle.cp = calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i);
          dataBattle.limit = false;
        }
      }
    }

    const atkStat =
      type === 'shadow'
        ? calculateStatsBattle(atk, IVatk, dataBattle.level, true, SHADOW_ATK_BONUS(globalOptions))
        : calculateStatsBattle(atk, IVatk, dataBattle.level, true);
    const defStat =
      type === 'shadow'
        ? calculateStatsBattle(def, IVdef, dataBattle.level, true, SHADOW_DEF_BONUS(globalOptions))
        : calculateStatsBattle(def, IVdef, dataBattle.level, true);

    dataBattle.rangeValue = calculateBetweenLevel(globalOptions, atk, def, sta, IVatk, IVdef, IVsta, fromLV, dataBattle.level, type);
    dataBattle.stats = {
      atk: atkStat,
      def: defStat,
      sta: calculateStatsBattle(sta, IVsta, dataBattle.level, true),
    };
    return dataBattle;
  }
};

export const findCPforLeague = (
  atk: number,
  def: number,
  sta: number,
  IVatk: any,
  IVdef: any,
  IVsta: any,
  level: any,
  maxCPLeague: any
) => {
  let cp = 10;
  let l = level;
  for (let i = level; i <= MAX_LEVEL; i += 0.5) {
    if (calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i) > maxCPLeague && maxCPLeague !== null) break;
    cp = calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i);
    l = i;
  }
  return {
    cp,
    level: l,
  };
};

export const sortStatsProd = (data: any[]) => {
  data = data.sort((a: { statsProds: number }, b: { statsProds: number }) => a.statsProds - b.statsProds);
  return data.map((item: { statsProds: number }, index: number) => ({
    ...item,
    ratio: (item.statsProds * 100) / data[data.length - 1].statsProds,
    rank: data.length - index,
  }));
};

export const calStatsProd = (atk: number, def: number, sta: number, minCP: number | null, maxCP: number | null, pure = false) => {
  const dataList: {
    IV: { atk: number; def: number; sta: number };
    CP: number;
    level: number;
    stats: { statsATK: number; statsDEF: number; statsSTA: number };
    statsProds: number;
  }[] = [];
  if (atk === 0 || def === 0 || sta === 0) return dataList;
  for (let l = MIN_LEVEL; l <= MAX_LEVEL; l += 0.5) {
    for (let i = MIN_IV; i <= MAX_IV; ++i) {
      for (let j = MIN_IV; j <= MAX_IV; ++j) {
        for (let k = MIN_IV; k <= MAX_IV; ++k) {
          const cp = calculateCP(atk + i, def + j, sta + k, l);
          if ((!minCP || minCP <= cp) && (!maxCP || cp <= maxCP)) {
            const statsATK = calculateStatsBattle(atk, i, l);
            const statsDEF = calculateStatsBattle(def, j, l);
            const statsSTA = calculateStatsBattle(sta, k, l);
            dataList.push({
              IV: { atk: i, def: j, sta: k },
              CP: cp,
              level: l,
              stats: { statsATK, statsDEF, statsSTA },
              statsProds: statsATK * statsDEF * statsSTA,
            });
          }
        }
      }
    }
  }

  if (!pure) {
    return sortStatsProd(dataList);
  } else return dataList;
};

export const calculateStatsByTag = (
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number },
  tag: string | null
) => {
  const checkNerf = tag && tag.toLowerCase().includes('mega') ? false : true;
  const atk = calBaseATK(baseStats, checkNerf);
  const def = calBaseDEF(baseStats, checkNerf);
  const sta = tag !== 'shedinja' ? calBaseSTA(baseStats, checkNerf) : 1;
  return {
    atk,
    def,
    sta,
  };
};

export const calculateDamagePVE = (
  globalOptions: any,
  atk: number,
  defObj: number,
  power: number,
  eff: {
    stab: any;
    wb: any;
    dodge?: any;
    mega?: any;
    trainer?: any;
    flevel?: any;
    clevel?: any;
    effective: any;
  },
  notPure?: boolean | undefined,
  stab?: any
) => {
  const StabMultiply = STAB_MULTIPLY(globalOptions);
  let modifier;
  if (eff) {
    const isStab = eff.stab ? StabMultiply : 1;
    const isWb = eff.wb ? StabMultiply : 1;
    const isDodge = eff.dodge ? 0.25 : 1;
    const isMega = eff.mega ? (eff.stab ? 1.3 : 1.1) : 1;
    const isTrainer = eff.trainer ? 1.3 : 1;
    const isFriend = eff.flevel ? MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, eff.flevel) : 1;
    let isCharge = eff.clevel ? MULTIPLY_THROW_CHARGE(globalOptions, 'normal') : 1;
    if (eff.clevel === 1) isCharge = MULTIPLY_THROW_CHARGE(globalOptions, 'nice');
    else if (eff.clevel === 2) isCharge = MULTIPLY_THROW_CHARGE(globalOptions, 'great');
    else if (eff.clevel === 3) isCharge = MULTIPLY_THROW_CHARGE(globalOptions, 'excellent');
    modifier = isStab * isWb * isFriend * isDodge * isCharge * isMega * isTrainer * eff.effective;
  } else {
    if (stab) modifier = StabMultiply;
    else modifier = 1;
  }
  if (notPure) return 0.5 * power * (atk / defObj) * modifier + 1;
  return Math.floor(0.5 * power * (atk / defObj) * modifier) + 1;
};

export const getBarCharge = (isRaid: boolean, energy: number) => {
  energy = Math.abs(energy);
  if (isRaid) {
    const bar = Math.ceil(100 / energy);
    return bar > 3 ? 3 : bar;
  } else return energy > 50 ? 1 : 2;
};

export const calculateAvgDPS = (
  globalOptions: any,
  typeEff: any,
  weatherBoost: any,
  fmove: any,
  cmove: any,
  Atk: number,
  Def: number,
  HP: number,
  typePoke: string | string[],
  options: any = null,
  shadow: any = null
) => {
  const StabMultiply = STAB_MULTIPLY(globalOptions),
    ShadowAtkBonus = SHADOW_ATK_BONUS(globalOptions),
    ShadowDefBonus = SHADOW_DEF_BONUS(globalOptions),
    MultiplyLevelFriendship = MULTIPLY_LEVEL_FRIENDSHIP(globalOptions);

  const FPow = fmove.pve_power;
  const CPow = cmove.pve_power;
  const FE = Math.abs(fmove.pve_energy);
  const CE = Math.abs(cmove.pve_energy);
  const FDur = fmove.durationMs / 1000;
  const CDur = cmove.durationMs / 1000;
  const FTYPE = capitalize(fmove.type.toLowerCase());
  const CTYPE = capitalize(cmove.type.toLowerCase());
  const CDWS = cmove.damageWindowStartMs / 1000;

  const FMulti = (typePoke.includes(FTYPE) ? StabMultiply : 1) * fmove.accuracyChance;
  const CMulti = (typePoke.includes(CTYPE) ? StabMultiply : 1) * cmove.accuracyChance;

  let y, FDmg, CDmg, FDmgBase, CDmgBase;
  if (options) {
    FDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      FPow *
      FMulti *
      (shadow ? ShadowAtkBonus : 1) *
      (typeof options.WEATHER_BOOSTS === 'string'
        ? weatherMultiple(globalOptions, weatherBoost, options.WEATHER_BOOSTS, FTYPE)
        : options.WEATHER_BOOSTS
        ? StabMultiply
        : 1) *
      (options.TRAINER_FRIEND ? MultiplyLevelFriendship : 1);
    CDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      CPow *
      CMulti *
      (shadow ? ShadowAtkBonus : 1) *
      (typeof options.WEATHER_BOOSTS === 'string'
        ? weatherMultiple(globalOptions, weatherBoost, options.WEATHER_BOOSTS, CTYPE)
        : options.WEATHER_BOOSTS
        ? StabMultiply
        : 1) *
      (options.TRAINER_FRIEND ? MultiplyLevelFriendship : 1);

    FDmg =
      Math.floor((FDmgBase * Atk * (options.objTypes ? getTypeEffective(typeEff, FTYPE, options.objTypes) : 1)) / options.POKEMON_DEF_OBJ) +
      DEFAULT_DAMAGE_CONST;
    CDmg =
      Math.floor((CDmgBase * Atk * (options.objTypes ? getTypeEffective(typeEff, CTYPE, options.objTypes) : 1)) / options.POKEMON_DEF_OBJ) +
      DEFAULT_DAMAGE_CONST;

    y =
      900 /
      ((Def /
        (options.objTypes ? getTypeEffective(typeEff, FTYPE, options.objTypes) * getTypeEffective(typeEff, CTYPE, options.objTypes) : 1)) *
        (shadow ? ShadowDefBonus : 1));
  } else {
    FDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      FPow *
      FMulti *
      (DEFAULT_POKEMON_SHADOW ? ShadowAtkBonus : 1) *
      (DEFAULT_WEATHER_BOOSTS ? StabMultiply : 1) *
      (DEFAULT_TRAINER_FRIEND ? MultiplyLevelFriendship : 1);
    CDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      CPow *
      CMulti *
      (DEFAULT_POKEMON_SHADOW ? ShadowAtkBonus : 1) *
      (DEFAULT_WEATHER_BOOSTS ? StabMultiply : 1) *
      (DEFAULT_TRAINER_FRIEND ? MultiplyLevelFriendship : 1);

    FDmg = Math.floor((FDmgBase * Atk) / DEFAULT_POKEMON_DEF_OBJ) + DEFAULT_DAMAGE_CONST;
    CDmg = Math.floor((CDmgBase * Atk) / DEFAULT_POKEMON_DEF_OBJ) + DEFAULT_DAMAGE_CONST;

    y = 900 / (Def * (DEFAULT_POKEMON_SHADOW ? ShadowDefBonus : 1));
  }

  const FDPS = FDmg / (FDur + (options && options.delay ? options.delay.ftime : 0));
  const CDPS = CDmg / (CDur + (options && options.delay ? options.delay.ctime : 0));

  const CEPSM = CE === 100 ? 0.5 * FE + 0.5 * y * CDWS : 0;
  const FEPS = FE / (FDur + (options && options.delay ? options.delay.ftime : 0));
  const CEPS = (CE + CEPSM) / (CDur + (options && options.delay ? options.delay.ctime : 0));

  let x = 0.5 * CE + 0.5 * FE;
  if (options && options.specific) {
    const bar = getBarCharge(true, CE);
    let λ = 0;
    if (bar === 1) λ = 3;
    else if (bar === 2) λ = 1.5;
    else if (bar === 3) λ = 1;
    x += 0.5 * λ * options.specific.FDmgenemy + options.specific.CDmgenemy * λ + 1;
  }

  const DPS0 = (FDPS * CEPS + CDPS * FEPS) / (CEPS + FEPS);

  let DPS;
  if (FDPS > CDPS) DPS = DPS0;
  else DPS = Math.max(0, DPS0 + ((CDPS - FDPS) / (CEPS + FEPS)) * (DEFAULT_ENERYGY_PER_HP_LOST - x / HP) * y);
  return Math.max(FDPS, DPS);
};

export const calculateTDO = (globalOptions: any, Def: number, HP: number, dps: number, shadow: any = null) => {
  const ShadowDefBonus = SHADOW_DEF_BONUS(globalOptions);

  let y;
  if (shadow) y = 900 / (Def * (shadow ? ShadowDefBonus : 1));
  else y = 900 / (Def * (DEFAULT_POKEMON_SHADOW ? ShadowDefBonus : 1));
  return (HP / y) * dps;
};

export const calculateBattleDPSDefender = (
  globalOptions: any,
  typeEff: any,
  weatherBoost: any,
  Attacker: {
    atk?: number;
    def: any;
    hp?: number;
    fmove?: any;
    cmove?: any;
    types: any;
    shadow?: any;
    WEATHER_BOOSTS?: boolean;
    POKEMON_FRIEND?: boolean;
    POKEMON_FRIEND_LEVEL?: number;
  },
  Defender: {
    atk: any;
    def?: number;
    hp?: number;
    fmove: any;
    cmove: any;
    types: any;
    WEATHER_BOOSTS: any;
    shadow?: any;
  }
) => {
  const StabMultiply = STAB_MULTIPLY(globalOptions),
    ShadowAtkBonus = SHADOW_ATK_BONUS(globalOptions),
    ShadowDefBonus = SHADOW_DEF_BONUS(globalOptions);

  const FPowDef = Defender.fmove.pve_power;
  const CPowDef = Defender.cmove.pve_power;
  const CEDef = Math.abs(Defender.cmove.pve_energy);
  const FDurDef = Defender.fmove.durationMs / 1000;
  const CDurDef = Defender.cmove.durationMs / 1000;
  const FTYPEDef = capitalize(Defender.fmove.type.toLowerCase());
  const CTYPEDef = capitalize(Defender.cmove.type.toLowerCase());

  const FMultiDef = (Defender.types.includes(FTYPEDef) ? StabMultiply : 1) * Defender.fmove.accuracyChance;
  const CMultiDef = (Defender.types.includes(CTYPEDef) ? StabMultiply : 1) * Defender.cmove.accuracyChance;

  const lambdaMod = (CEDef / 100) * 3;
  const defDuration = lambdaMod * (FDurDef + DEFAULT_ENEMY_ATK_DELAY) + (CDurDef + DEFAULT_ENEMY_ATK_DELAY);

  const FDmgBaseDef =
    DEFAULT_DAMAGE_MULTIPLY *
    FPowDef *
    FMultiDef *
    (Defender.shadow ? ShadowAtkBonus : 1) *
    (typeof Defender.WEATHER_BOOSTS === 'string'
      ? weatherMultiple(globalOptions, weatherBoost, Defender.WEATHER_BOOSTS, FTYPEDef)
      : Defender.WEATHER_BOOSTS
      ? StabMultiply
      : 1);
  const CDmgBaseDef =
    DEFAULT_DAMAGE_MULTIPLY *
    CPowDef *
    CMultiDef *
    (Defender.shadow ? ShadowAtkBonus : 1) *
    (typeof Defender.WEATHER_BOOSTS === 'string'
      ? weatherMultiple(globalOptions, weatherBoost, Defender.WEATHER_BOOSTS, CTYPEDef)
      : Defender.WEATHER_BOOSTS
      ? StabMultiply
      : 1);

  const FDmgDef =
    Math.floor(
      (FDmgBaseDef * Defender.atk * getTypeEffective(typeEff, FTYPEDef, Attacker.types)) /
        (Attacker.def * (Attacker.shadow ? ShadowDefBonus : 1))
    ) + DEFAULT_DAMAGE_CONST;
  const CDmgDef =
    Math.floor(
      (CDmgBaseDef * Defender.atk * getTypeEffective(typeEff, CTYPEDef, Attacker.types)) /
        (Attacker.def * (Attacker.shadow ? ShadowDefBonus : 1))
    ) + DEFAULT_DAMAGE_CONST;

  const DefDmg = lambdaMod * FDmgDef + CDmgDef;
  return DefDmg / defDuration;
};

export const calculateBattleDPS = (
  globalOptions: any,
  typeEff: any,
  weatherBoost: any,
  Attacker: {
    atk: any;
    def?: number;
    hp: any;
    fmove: any;
    cmove: any;
    types: any;
    shadow?: any;
    WEATHER_BOOSTS: any;
    POKEMON_FRIEND?: any;
    POKEMON_FRIEND_LEVEL?: any;
    isDoubleCharge?: any;
    cmove2?: any;
  },
  Defender: {
    atk?: number;
    def: any;
    hp?: number;
    fmove?: any;
    cmove?: any;
    types: any;
    WEATHER_BOOSTS?: boolean;
    shadow?: any;
  },
  DPSDef: number
) => {
  const StabMultiply = STAB_MULTIPLY(globalOptions),
    ShadowAtkBonus = SHADOW_ATK_BONUS(globalOptions),
    ShadowDefBonus = SHADOW_DEF_BONUS(globalOptions);

  const FPow = Attacker.fmove.pve_power;
  const CPow = Attacker.cmove.pve_power;
  const FE = Math.abs(Attacker.fmove.pve_energy);
  const CE = Math.abs(Attacker.cmove.pve_energy);
  const FDur = Attacker.fmove.durationMs / 1000;
  const CDur = Attacker.cmove.durationMs / 1000;
  const FTYPE = capitalize(Attacker.fmove.type.toLowerCase());
  const CTYPE = capitalize(Attacker.cmove.type.toLowerCase());
  const CDWS = Attacker.cmove.damageWindowStartMs / 1000;

  const FMulti = (Attacker.types.includes(FTYPE) ? StabMultiply : 1) * Attacker.fmove.accuracyChance;
  const CMulti = (Attacker.types.includes(CTYPE) ? StabMultiply : 1) * Attacker.cmove.accuracyChance;

  const FDmgBase =
    DEFAULT_DAMAGE_MULTIPLY *
    FPow *
    FMulti *
    (Attacker.shadow ? ShadowAtkBonus : 1) *
    (typeof Attacker.WEATHER_BOOSTS === 'string'
      ? weatherMultiple(globalOptions, weatherBoost, Attacker.WEATHER_BOOSTS, FTYPE)
      : Attacker.WEATHER_BOOSTS
      ? StabMultiply
      : 1) *
    (Attacker.POKEMON_FRIEND ? MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, Attacker.POKEMON_FRIEND_LEVEL) : 1);
  const CDmgBase =
    DEFAULT_DAMAGE_MULTIPLY *
    CPow *
    CMulti *
    (Attacker.shadow ? ShadowAtkBonus : 1) *
    (typeof Attacker.WEATHER_BOOSTS === 'string'
      ? weatherMultiple(globalOptions, weatherBoost, Attacker.WEATHER_BOOSTS, CTYPE)
      : Attacker.WEATHER_BOOSTS
      ? StabMultiply
      : 1) *
    (Attacker.POKEMON_FRIEND ? MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, Attacker.POKEMON_FRIEND_LEVEL) : 1);

  const FDmg =
    Math.floor(
      (FDmgBase * Attacker.atk * getTypeEffective(typeEff, FTYPE, Defender.types)) / (Defender.def * (Defender.shadow ? ShadowDefBonus : 1))
    ) + DEFAULT_DAMAGE_CONST;
  const CDmg =
    Math.floor(
      (CDmgBase * Attacker.atk * getTypeEffective(typeEff, CTYPE, Defender.types)) / (Defender.def * (Defender.shadow ? ShadowDefBonus : 1))
    ) + DEFAULT_DAMAGE_CONST;

  const FDPS = FDmg / FDur;
  const CDPS = CDmg / CDur;

  const CEPSM = CE === 100 ? 0.5 * FE + 0.5 * DPSDef * CDWS : 0;
  const FEPS = FE / FDur;
  const CEPS = (CE + CEPSM) / CDur;

  const x = 0.5 * CE + 0.5 * FE;

  const DPS0 = (FDPS * CEPS + CDPS * FEPS) / (CEPS + FEPS);

  let DPS;
  if (FDPS > CDPS) DPS = DPS0;
  else DPS = Math.max(0, DPS0 + ((CDPS - FDPS) / (CEPS + FEPS)) * (DEFAULT_ENERYGY_PER_HP_LOST - x / Attacker.hp) * DPSDef);
  DPS = Math.max(FDPS, DPS);

  let DPSSec = 0;
  if (Attacker.isDoubleCharge) {
    const moveSec = Attacker.cmove2;
    const CPowSec = moveSec.pve_power;
    const CESec = Math.abs(moveSec.pve_energy);
    const CTYPESec = capitalize(moveSec.type.toLowerCase());
    const CDurSec = moveSec.durationMs / 1000;
    const CDWSSec = moveSec.damageWindowStartMs / 1000;

    const CMultiSec = (Attacker.types.includes(CTYPESec) ? StabMultiply : 1) * moveSec.accuracyChance;

    const CDmgBaseSec =
      DEFAULT_DAMAGE_MULTIPLY *
      CPowSec *
      CMultiSec *
      (Attacker.shadow ? ShadowAtkBonus : 1) *
      (typeof Attacker.WEATHER_BOOSTS === 'string'
        ? weatherMultiple(globalOptions, weatherBoost, Attacker.WEATHER_BOOSTS, CTYPE)
        : Attacker.WEATHER_BOOSTS
        ? StabMultiply
        : 1) *
      (Attacker.POKEMON_FRIEND ? MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, Attacker.POKEMON_FRIEND_LEVEL) : 1);
    const CDmgSec =
      Math.floor(
        (CDmgBaseSec * Attacker.atk * getTypeEffective(typeEff, CTYPESec, Defender.types)) /
          (Defender.def * (Defender.shadow ? ShadowDefBonus : 1))
      ) + DEFAULT_DAMAGE_CONST;
    const CDPSSec = CDmgSec / CDurSec;

    const CEPSMSec = CESec === 100 ? 0.5 * FE + 0.5 * DPSDef * CDWSSec : 0;
    const CEPSSec = (CESec + CEPSMSec) / CDurSec;

    const xSec = 0.5 * CESec + 0.5 * FE;

    const DPS0Sec = (FDPS * CEPSSec + CDPSSec * FEPS) / (CEPSSec + FEPS);

    if (FDPS > CDPSSec) DPSSec = DPS0Sec;
    else
      DPSSec = Math.max(0, DPS0Sec + ((CDPSSec - FDPS) / (CEPSSec + FEPS)) * (DEFAULT_ENERYGY_PER_HP_LOST - xSec / Attacker.hp) * DPSDef);
    DPSSec = Math.max(FDPS, DPSSec);
  }
  return Math.max(FDPS, DPS, DPSSec);
};

export const TimeToKill = (HP: number, dpsDef: number) => {
  return HP / dpsDef;
};

export const queryTopMove = (globalOptions: any, typeEff: any, weatherBoost: any, pokemonCombatList: any[], move: any) => {
  const dataPri: {
    num: number;
    forme: string | null;
    name: any;
    baseSpecies: string | null;
    sprite: string;
    releasedGO: boolean;
    dps: number;
    tdo: number;
  }[] = [];
  Object.values(pokemonData).forEach((value) => {
    if (move.track === 281) {
      move.name = 'HIDDEN_POWER';
    }
    let combatPoke: any = pokemonCombatList.filter(
      (item: { id: number; baseSpecies: any }) =>
        item.id === value.num && item.baseSpecies === (value.baseSpecies ? convertName(value.baseSpecies) : convertName(value.name))
    );
    const result = combatPoke.find((item: { name: any }) => item.name === convertName(value.name));
    if (result === undefined) combatPoke = combatPoke[0];
    else combatPoke = result;
    if (combatPoke !== undefined) {
      let pokemonList;
      if (move.type_move === 'FAST') {
        pokemonList = combatPoke.quickMoves.map((item: string) => item).includes(move.name);
        if (!pokemonList) pokemonList = combatPoke.eliteQuickMoves.map((item: string) => item).includes(move.name);
      } else if (move.type_move === 'CHARGE') {
        pokemonList = combatPoke.cinematicMoves.includes(move.name);
        if (!pokemonList) pokemonList = combatPoke.shadowMoves.includes(move.name);
        if (!pokemonList) pokemonList = combatPoke.purifiedMoves.includes(move.name);
        if (!pokemonList) pokemonList = combatPoke.eliteCinematicMoves.includes(move.name);
      }
      if (pokemonList) {
        const stats = calculateStatsByTag(value.baseStats, value.slug);
        const dps = calculateAvgDPS(
          globalOptions,
          typeEff,
          weatherBoost,
          move,
          move,
          calculateStatsBattle(stats.atk, MAX_IV, 40),
          calculateStatsBattle(stats.def, MAX_IV, 40),
          calculateStatsBattle(stats.sta, MAX_IV, 40),
          value.types
        );
        const tdo = calculateTDO(
          globalOptions,
          calculateStatsBattle(stats.def, MAX_IV, 40),
          calculateStatsBattle(stats.sta, MAX_IV, 40),
          dps
        );
        dataPri.push({
          num: value.num,
          forme: value.forme,
          name: splitAndCapitalize(value.name, '-', ' '),
          baseSpecies: value.baseSpecies,
          sprite: value.sprite,
          releasedGO: value.releasedGO,
          dps,
          tdo,
        });
      }
    }
  });
  return dataPri;
};

const queryMove = (
  globalOptions: any,
  typeEff: any,
  weatherBoost: any,
  combat: any[],
  dataList: any[],
  vf: string,
  atk: any,
  def: any,
  sta: any,
  type: any,
  cmove: any[],
  felite: boolean,
  celite: boolean,
  shadow: boolean,
  purified: boolean | undefined
) => {
  cmove.forEach((vc: any) => {
    const mf = combat.find((item: { name: any }) => item.name === vf);
    const mc = combat.find((item: { name: any }) => item.name === vc);

    mf.elite = felite;
    mc.elite = celite;
    mc.shadow = shadow;
    mc.purified = purified;

    const options = {
      delay: {
        ftime: DEFAULT_ENEMY_ATK_DELAY,
        ctime: DEFAULT_ENEMY_ATK_DELAY,
      },
      POKEMON_DEF_OBJ: 160,
      IV_ATK: 15,
      IV_DEF: 15,
      IV_HP: 15,
      POKEMON_LEVEL: 40,
    };

    const offensive = calculateAvgDPS(
      globalOptions,
      typeEff,
      weatherBoost,
      mf,
      mc,
      calculateStatsBattle(atk, options.IV_ATK, options.POKEMON_LEVEL, true),
      calculateStatsBattle(def, options.IV_DEF, options.POKEMON_LEVEL, true),
      calculateStatsBattle(sta, options.IV_HP, options.POKEMON_LEVEL, true),
      type
    );
    const defensive = calculateAvgDPS(
      globalOptions,
      typeEff,
      weatherBoost,
      mf,
      mc,
      calculateStatsBattle(atk, options.IV_ATK, options.POKEMON_LEVEL, true),
      calculateStatsBattle(def, options.IV_DEF, options.POKEMON_LEVEL, true),
      calculateStatsBattle(sta, options.IV_HP, options.POKEMON_LEVEL, true),
      type,
      options
    );

    dataList.push({ fmove: mf, cmove: mc, eDPS: { offensive, defensive } });
  });
};

export const rankMove = (
  globalOptions: any,
  typeEff: any,
  weatherBoost: any,
  combat: any,
  move: {
    quickMoves: any[];
    cinematicMoves: any;
    eliteCinematicMoves: any;
    shadowMoves: any;
    purifiedMoves: any;
    eliteQuickMoves: any[];
  },
  atk: any,
  def: any,
  sta: any,
  type: any
) => {
  if (!move) return { data: [] };
  const dataPri: any[] = [];
  move.quickMoves.forEach((vf: any) => {
    queryMove(
      globalOptions,
      typeEff,
      weatherBoost,
      combat,
      dataPri,
      vf,
      atk,
      def,
      sta,
      type,
      move.cinematicMoves,
      false,
      false,
      false,
      false
    );
    queryMove(
      globalOptions,
      typeEff,
      weatherBoost,
      combat,
      dataPri,
      vf,
      atk,
      def,
      sta,
      type,
      move.eliteCinematicMoves,
      false,
      true,
      false,
      false
    );
    queryMove(globalOptions, typeEff, weatherBoost, combat, dataPri, vf, atk, def, sta, type, move.shadowMoves, false, false, true, false);
    queryMove(
      globalOptions,
      typeEff,
      weatherBoost,
      combat,
      dataPri,
      vf,
      atk,
      def,
      sta,
      type,
      move.purifiedMoves,
      false,
      false,
      false,
      true
    );
  });
  move.eliteQuickMoves.forEach((vf: any) => {
    queryMove(
      globalOptions,
      typeEff,
      weatherBoost,
      combat,
      dataPri,
      vf,
      atk,
      def,
      sta,
      type,
      move.cinematicMoves,
      true,
      false,
      false,
      false
    );
    queryMove(
      globalOptions,
      typeEff,
      weatherBoost,
      combat,
      dataPri,
      vf,
      atk,
      def,
      sta,
      type,
      move.eliteCinematicMoves,
      true,
      true,
      false,
      false
    );
    queryMove(globalOptions, typeEff, weatherBoost, combat, dataPri, vf, atk, def, sta, type, move.shadowMoves, true, false, true, false);
    queryMove(globalOptions, typeEff, weatherBoost, combat, dataPri, vf, atk, def, sta, type, move.purifiedMoves, true, false, false, true);
  });

  return {
    data: dataPri,
    maxOff: Math.max(...dataPri.map((item) => item.eDPS.offensive)),
    maxDef: Math.max(...dataPri.map((item) => item.eDPS.defensive)),
  };
};

export const queryStatesEvoChain = (
  globalOptions: any,
  item: { form: string; id: number; name: string },
  level: any,
  atkIV: number,
  defIV: number,
  staIV: number
) => {
  let pokemon: any;
  if (item.form === '')
    pokemon = Object.values(pokemonData).find((value) => value.num === item.id && value.slug === item.name.toLowerCase());
  else pokemon = Object.values(pokemonData).find((value) => value.num === item.id && value.slug.includes(item.form.toLowerCase()));
  if (!pokemon) pokemon = Object.values(pokemonData).find((value) => value.num === item.id);
  const pokemonStats = calculateStatsByTag(pokemon.baseStats, pokemon.slug);
  const dataLittle = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, 500);
  const dataGreat = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, 1500);
  const dataUltra = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, 2500);
  const dataMaster = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, null);

  const statsProd: any[] = calStatsProd(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, null, null, true);
  const ultraStatsProd = sortStatsProd(statsProd.filter((item: { CP: number }) => item.CP <= 2500));
  const greatStatsProd = sortStatsProd(ultraStatsProd.filter((item: any) => item.CP <= 1500));
  const littleStatsProd = sortStatsProd(greatStatsProd.filter((item: any) => item.CP <= 500));

  const battleLeague: any = {
    little: littleStatsProd.find(
      (item: any) =>
        item.level === dataLittle.level &&
        item.CP === dataLittle.cp &&
        item.IV.atk === atkIV &&
        item.IV.def === defIV &&
        item.IV.sta === staIV
    ),
    great: greatStatsProd.find(
      (item: any) =>
        item.level === dataGreat.level &&
        item.CP === dataGreat.cp &&
        item.IV.atk === atkIV &&
        item.IV.def === defIV &&
        item.IV.sta === staIV
    ),
    ultra: ultraStatsProd.find(
      (item: any) =>
        item.level === dataUltra.level &&
        item.CP === dataUltra.cp &&
        item.IV.atk === atkIV &&
        item.IV.def === defIV &&
        item.IV.sta === staIV
    ),
    master: sortStatsProd(statsProd).find(
      (item: any) =>
        item.level === dataMaster.level &&
        item.CP === dataMaster.cp &&
        item.IV.atk === atkIV &&
        item.IV.def === defIV &&
        item.IV.sta === staIV
    ),
  };

  if (battleLeague.little)
    battleLeague.little = {
      ...battleLeague.little,
      ...calculateBetweenLevel(
        globalOptions,
        pokemonStats.atk,
        pokemonStats.def,
        pokemonStats.sta,
        atkIV,
        defIV,
        staIV,
        level,
        battleLeague.little.level
      ),
    };
  if (battleLeague.great)
    battleLeague.great = {
      ...battleLeague.great,
      ...calculateBetweenLevel(
        globalOptions,
        pokemonStats.atk,
        pokemonStats.def,
        pokemonStats.sta,
        atkIV,
        defIV,
        staIV,
        level,
        battleLeague.great.level
      ),
    };
  if (battleLeague.ultra)
    battleLeague.ultra = {
      ...battleLeague.ultra,
      ...calculateBetweenLevel(
        globalOptions,
        pokemonStats.atk,
        pokemonStats.def,
        pokemonStats.sta,
        atkIV,
        defIV,
        staIV,
        level,
        battleLeague.ultra.level
      ),
    };
  if (battleLeague.master)
    battleLeague.master = {
      ...battleLeague.master,
      ...calculateBetweenLevel(
        globalOptions,
        pokemonStats.atk,
        pokemonStats.def,
        pokemonStats.sta,
        atkIV,
        defIV,
        staIV,
        level,
        battleLeague.master.level
      ),
    };
  return { ...item, battleLeague, maxCP: battleLeague.master.CP, form: pokemon.forme };
};

const queryMoveCounter = (
  globalOptions: any,
  typeEff: any,
  weatherBoost: any,
  dataList: any[],
  combat: any[],
  pokemon: any,
  stats: any,
  def: number,
  types: string | string[],
  vf: any,
  cmove: any,
  felite: boolean,
  celite: boolean,
  shadow: boolean,
  purified: boolean
) => {
  cmove.forEach((vc: any) => {
    const mf = combat.find((item: { name: any }) => item.name === vf);
    const mc = combat.find((item: { name: any }) => item.name === vc);

    if (mf && mc) {
      const options = {
        objTypes: types,
        POKEMON_DEF_OBJ: calculateStatsBattle(def, 15, 40, true),
        IV_ATK: 15,
        IV_DEF: 15,
        IV_HP: 15,
        POKEMON_LEVEL: 40,
      };

      const dpsOff = calculateAvgDPS(
        globalOptions,
        typeEff,
        weatherBoost,
        mf,
        mc,
        calculateStatsBattle(stats.atk, options.IV_ATK, options.POKEMON_LEVEL, true),
        calculateStatsBattle(stats.def, options.IV_DEF, options.POKEMON_LEVEL, true),
        calculateStatsBattle(stats.sta, options.IV_HP, options.POKEMON_LEVEL, true),
        pokemon.types,
        options
      );

      dataList.push({
        pokemon_id: pokemon.num,
        pokemon_name: pokemon.name,
        pokemon_forme: pokemon.forme,
        releasedGO: pokemon.releasedGO,
        dps: dpsOff,
        fmove: { ...mf, elite: felite },
        cmove: { ...mc, elite: celite, shadow, purified },
      });
    }
  });
};

const sortCounterDPS = (data: any[]) => {
  data = data.sort((a: { dps: number }, b: { dps: number }) => b.dps - a.dps);
  return data.map((item: any) => ({ ...item, ratio: (item.dps * 100) / data[0].dps }));
};

export const counterPokemon = (
  globalOptions: any,
  typeEff: any,
  weatherBoost: any,
  def: any,
  types: any,
  combat: any,
  combatList: any[]
) => {
  const dataList: any[] = [];
  combatList.forEach(
    (value: {
      quickMoves: any[];
      cinematicMoves: string[];
      name: string;
      id: any;
      eliteCinematicMoves: any;
      shadowMoves: any;
      purifiedMoves: any;
      eliteQuickMoves: any[];
    }) => {
      if (value.quickMoves[0] !== 'STRUGGLE' && value.cinematicMoves[0] !== 'STRUGGLE') {
        const pokemon = Object.values(pokemonData).find((item) => {
          const name = convertNameRankingToOri(value.name.toLowerCase(), convertNameRankingToForm(value.name.toLowerCase()));
          return item.slug === name;
        });
        if (pokemon === undefined) {
          return;
        }
        const stats = calculateStatsByTag(pokemon.baseStats, pokemon.slug);
        value.quickMoves.forEach((vf: any) => {
          queryMoveCounter(
            globalOptions,
            typeEff,
            weatherBoost,
            dataList,
            combat,
            pokemon,
            stats,
            def,
            types,
            vf,
            value.cinematicMoves,
            false,
            false,
            false,
            false
          );
          queryMoveCounter(
            globalOptions,
            typeEff,
            weatherBoost,
            dataList,
            combat,
            pokemon,
            stats,
            def,
            types,
            vf,
            value.eliteCinematicMoves,
            false,
            true,
            false,
            false
          );
          queryMoveCounter(
            globalOptions,
            typeEff,
            weatherBoost,
            dataList,
            combat,
            pokemon,
            stats,
            def,
            types,
            vf,
            value.shadowMoves,
            false,
            false,
            true,
            false
          );
          queryMoveCounter(
            globalOptions,
            typeEff,
            weatherBoost,
            dataList,
            combat,
            pokemon,
            stats,
            def,
            types,
            vf,
            value.purifiedMoves,
            false,
            false,
            false,
            true
          );
        });
        value.eliteQuickMoves.forEach((vf: any) => {
          queryMoveCounter(
            globalOptions,
            typeEff,
            weatherBoost,
            dataList,
            combat,
            pokemon,
            stats,
            def,
            types,
            vf,
            value.cinematicMoves,
            true,
            false,
            false,
            false
          );
          queryMoveCounter(
            globalOptions,
            typeEff,
            weatherBoost,
            dataList,
            combat,
            pokemon,
            stats,
            def,
            types,
            vf,
            value.eliteCinematicMoves,
            true,
            true,
            false,
            false
          );
          queryMoveCounter(
            globalOptions,
            typeEff,
            weatherBoost,
            dataList,
            combat,
            pokemon,
            stats,
            def,
            types,
            vf,
            value.shadowMoves,
            true,
            false,
            true,
            false
          );
          queryMoveCounter(
            globalOptions,
            typeEff,
            weatherBoost,
            dataList,
            combat,
            pokemon,
            stats,
            def,
            types,
            vf,
            value.purifiedMoves,
            true,
            false,
            false,
            true
          );
        });
      }
    }
  );
  return sortCounterDPS(dataList);
};
