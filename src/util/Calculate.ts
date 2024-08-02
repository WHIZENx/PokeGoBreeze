import { CounterModel } from '../components/Table/Counter/models/counter.model';
import { Stats } from '../core/models/API/info.model';
import { ICombat } from '../core/models/combat.model';
import { ICPM } from '../core/models/cpm.model';
import { IEvolution } from '../core/models/evolution.model';
import { IOptions } from '../core/models/options.model';
import { IPokemonData } from '../core/models/pokemon.model';
import {
  IStatsPokemon,
  StatsBase,
  StatsRank,
  StatsPokemon,
  StatsRankAtk,
  StatsRankDef,
  StatsRankSta,
  StatsRankProd,
  StatsProd,
  StatsAtk,
  StatsDef,
  StatsSta,
} from '../core/models/stats.model';
import { ITypeEff } from '../core/models/type-eff.model';
import { IWeatherBoost } from '../core/models/weatherBoost.model';
import data from '../data/cp_multiplier.json';
import { TypeMove } from '../enums/move.enum';
import { OptionOtherDPS } from '../store/models/options.model';
import {
  DEFAULT_DAMAGE_CONST,
  DEFAULT_DAMAGE_MULTIPLY,
  DEFAULT_DODGE_MULTIPLY,
  DEFAULT_ENEMY_ATK_DELAY,
  DEFAULT_ENERGY_PER_HP_LOST,
  DEFAULT_MEGA_MULTIPLY,
  DEFAULT_POKEMON_DEF_OBJ,
  DEFAULT_POKEMON_LEVEL,
  DEFAULT_POKEMON_SHADOW,
  DEFAULT_TRAINER_FRIEND,
  DEFAULT_TRAINER_MULTIPLY,
  DEFAULT_WEATHER_BOOSTS,
  FORM_MEGA,
  FORM_SHADOW,
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
import { capitalize, splitAndCapitalize, checkMoveSetAvailable } from './Utils';
import {
  BattleCalculate,
  BattleLeagueCalculate,
  PredictCPCalculate,
  IPredictCPModel,
  PredictStatsCalculate,
  IPredictStatsModel,
  QueryMovesCounterPokemon,
  QueryMovesPokemon,
  QueryStatesEvoChain,
  StatsCalculate,
  StatsLeagueCalculate,
  IBattleBaseStats,
  BattleBaseStats,
  BetweenLevelCalculate,
  PredictCPModel,
  PredictStatsModel,
  BattleLeague,
} from './models/calculate.model';
import {
  IPokemonQueryCounter,
  PokemonQueryCounter,
  PokemonQueryMove,
  PokemonQueryRankMove,
  IPokemonTopMove,
  PokemonTopMove,
} from './models/pokemon-top-move.model';
import { IArrayStats } from './models/util.model';

const weatherMultiple = (globalOptions: IOptions | undefined, weatherBoost: IWeatherBoost | undefined, weather: string, type: string) => {
  return ((weatherBoost as unknown as { [x: string]: string[] })[weather.toUpperCase().replaceAll(' ', '_')]?.find(
    (item) => item === type?.toUpperCase().replaceAll(' ', '_')
  )
    ? STAB_MULTIPLY(globalOptions)
    : 1) as unknown as number;
};

export const getTypeEffective = (typeEffective: ITypeEff | undefined, typeMove: string, typesObj: string[]) => {
  let valueEffective = 1;
  if (!typeEffective) {
    return valueEffective;
  }
  typesObj.forEach((type) => {
    valueEffective *= (typeEffective as unknown as { [x: string]: { [y: string]: number } })[typeMove?.toUpperCase()][type.toUpperCase()];
  });
  return valueEffective;
};

const convertStatsArray = (stats: Stats[] | undefined, name: string) => {
  return stats?.find((item) => item.stat.name === name)?.base_stat ?? 0;
};

export const convertAllStats = (stats: Stats[] | undefined) => {
  const atk = convertStatsArray(stats, 'attack');
  const spa = convertStatsArray(stats, 'special-attack');
  const spe = convertStatsArray(stats, 'speed');
  const def = convertStatsArray(stats, 'defense');
  const spd = convertStatsArray(stats, 'special-defense');
  const hp = convertStatsArray(stats, 'hp');
  return StatsPokemon.create({
    atk,
    spa,
    spe,
    def,
    spd,
    hp,
  });
};

/* Algorithm calculate from pokemongohub.net */
export const calBaseATK = (stats: IStatsPokemon | null | undefined, nerf: boolean) => {
  if (!stats) {
    stats = new StatsPokemon();
  }
  const atk = stats.atk ?? 0;
  const spa = stats.spa ?? 0;

  const lower = Math.min(atk, spa);
  const higher = Math.max(atk, spa);

  const speed = stats.spe ?? 0;

  const scaleATK = Math.round(2 * ((7 / 8) * higher + (1 / 8) * lower));
  const speedMod = 1 + (speed - 75) / 500;
  const baseATK = Math.round(scaleATK * speedMod);
  if (!nerf) {
    return baseATK;
  }
  if (calculateCP(baseATK + MAX_IV, calBaseDEF(stats, false) + MAX_IV, calBaseSTA(stats, false) + MAX_IV, 40) >= 4000) {
    return Math.round(scaleATK * speedMod * 0.91);
  } else {
    return baseATK;
  }
};

export const calBaseDEF = (stats: IStatsPokemon | null | undefined, nerf: boolean) => {
  if (!stats) {
    stats = new StatsPokemon();
  }
  const def = stats.def ?? 0;
  const spd = stats.spd ?? 0;

  const lower = Math.min(def, spd);
  const higher = Math.max(def, spd);

  const speed = stats.spe ?? 0;

  const scaleDEF = Math.round(2 * ((5 / 8) * higher + (3 / 8) * lower));
  const speedMod = 1 + (speed - 75) / 500;
  const baseDEF = Math.round(scaleDEF * speedMod);
  if (!nerf) {
    return baseDEF;
  }
  if (calculateCP(calBaseATK(stats, false) + MAX_IV, baseDEF + MAX_IV, calBaseSTA(stats, false) + MAX_IV, 40) >= 4000) {
    return Math.round(scaleDEF * speedMod * 0.91);
  } else {
    return baseDEF;
  }
};

export const calBaseSTA = (stats: IStatsPokemon | null | undefined, nerf: boolean) => {
  if (!stats) {
    stats = new StatsPokemon();
  }
  const hp = stats.hp ?? 0;

  const baseSTA = hp > 0 ? Math.floor(hp * 1.75 + 50) : hp;
  if (!nerf) {
    return baseSTA;
  }
  if (calculateCP(calBaseATK(stats, false) + MAX_IV, calBaseDEF(stats, false) + MAX_IV, baseSTA + MAX_IV, 40) >= 4000) {
    return Math.round((hp * 1.75 + 50) * 0.91);
  } else {
    return baseSTA;
  }
};

export const sortStatsPokemon = (stats: IArrayStats[]) => {
  const attackRanking = [
    ...new Set(
      stats
        .sort((a, b) => (a.baseStatsPokeGo?.attack ?? 0) - (b.baseStatsPokeGo?.attack ?? 0))
        .map((item) => {
          return item.baseStatsPokeGo?.attack ?? 0;
        })
    ),
  ];

  const minATK = Math.min(...attackRanking);
  const maxATK = Math.max(...attackRanking);
  const attackStats = stats.map((item) => {
    return StatsAtk.create({
      id: item.id,
      form: item.form,
      attack: item.baseStatsPokeGo?.attack ?? 0,
      rank: attackRanking.length - attackRanking.indexOf(item.baseStatsPokeGo?.attack ?? 0),
    });
  });

  const defenseRanking = [
    ...new Set(
      stats
        .sort((a, b) => (a.baseStatsPokeGo?.defense ?? 0) - (b.baseStatsPokeGo?.defense ?? 0))
        .map((item) => {
          return item.baseStatsPokeGo?.defense ?? 0;
        })
    ),
  ];

  const minDEF = Math.min(...defenseRanking);
  const maxDEF = Math.max(...defenseRanking);
  const defenseStats = stats.map((item) => {
    return StatsDef.create({
      id: item.id,
      form: item.form,
      defense: item.baseStatsPokeGo?.defense ?? 0,
      rank: defenseRanking.length - defenseRanking.indexOf(item.baseStatsPokeGo?.defense ?? 0),
    });
  });

  const staminaRanking = [
    ...new Set(
      stats
        .sort((a, b) => (a.baseStatsPokeGo?.stamina ?? 0) - (b.baseStatsPokeGo?.stamina ?? 0))
        .map((item) => {
          return item.baseStatsPokeGo?.stamina ?? 0;
        })
    ),
  ];

  const minSTA = Math.min(...staminaRanking);
  const maxSTA = Math.max(...staminaRanking);
  const staminaStats = stats.map((item) => {
    return StatsSta.create({
      id: item.id,
      form: item.form,
      stamina: item.baseStatsPokeGo?.stamina ?? 0,
      rank: staminaRanking.length - staminaRanking.indexOf(item.baseStatsPokeGo?.stamina ?? 0),
    });
  });

  const prodRanking = [
    ...new Set(
      stats
        .sort((a, b) => a.baseStatsProd - b.baseStatsProd)
        .map((item) => {
          return item.baseStatsProd;
        })
    ),
  ];

  const minPROD = Math.min(...prodRanking);
  const maxPROD = Math.max(...prodRanking);
  const prodStats = stats.map((item) => {
    return StatsProd.create({
      id: item.id,
      form: item.form,
      prod: item.baseStatsProd,
      rank: prodRanking.length - prodRanking.indexOf(item.baseStatsProd),
    });
  });

  return new StatsRank({
    attack: StatsRankAtk.create({
      ranking: attackStats,
      min_rank: 1,
      max_rank: attackRanking.length,
      min_stats: minATK,
      max_stats: maxATK,
    }),
    defense: StatsRankDef.create({
      ranking: defenseStats,
      min_rank: 1,
      max_rank: defenseRanking.length,
      min_stats: minDEF,
      max_stats: maxDEF,
    }),
    stamina: StatsRankSta.create({
      ranking: staminaStats,
      min_rank: 1,
      max_rank: staminaRanking.length,
      min_stats: minSTA,
      max_stats: maxSTA,
    }),
    statProd: StatsRankProd.create({
      ranking: prodStats,
      min_rank: 1,
      max_rank: prodRanking.length,
      min_stats: minPROD,
      max_stats: maxPROD,
    }),
  });
};

export const calculateCP = (atk: number, def: number, sta: number, level: number) => {
  return Math.floor(
    Math.max(10, (atk * def ** 0.5 * sta ** 0.5 * ((data as ICPM[]).find((item) => item.level === level)?.multiplier ?? 0) ** 2) / 10)
  );
};

export const calculateRaidStat = (stat: number, tier: number) => {
  return Math.floor((stat + MAX_IV) * RAID_BOSS_TIER[tier].CPm);
};

export const calculateRaidCP = (atk: number, def: number, tier: number) => {
  return Math.floor(((atk + MAX_IV) * Math.sqrt(def + MAX_IV) * Math.sqrt(RAID_BOSS_TIER[tier].sta)) / 10);
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
    Math.pow(Math.max(0, 1 - baseCaptureRate / (2 * ((data as ICPM[])?.find((data) => data.level === level)?.multiplier ?? 0))), multiplier)
  );
};

export const predictStat = (atk: number, def: number, sta: number, cp: number | string) => {
  cp = parseInt(cp.toString());
  let minLevel = MIN_LEVEL + 1;
  let maxLevel = MIN_LEVEL + 1;
  for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
    if (cp <= calculateCP(atk + MAX_IV, def + MAX_IV, sta + MAX_IV, i)) {
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

  const predictArr: IPredictStatsModel[] = [];
  for (let l = minLevel; l <= maxLevel; l += 0.5) {
    for (let i = MIN_IV; i <= MAX_IV; i++) {
      for (let j = MIN_IV; j <= MAX_IV; j++) {
        for (let k = MIN_IV; k <= MAX_IV; k++) {
          if (calculateCP(atk + i, def + j, sta + k, l) === cp) {
            predictArr.push(
              PredictStatsModel.create({
                atk: i,
                def: j,
                sta: k,
                level: l,
                percent: parseFloat((((i + j + k) * 100) / 45).toFixed(2)),
                hp: Math.max(1, calculateStatsBattle(sta, k, l, true)),
              })
            );
          }
        }
      }
    }
  }
  return new PredictStatsCalculate(cp, minLevel, maxLevel, predictArr);
};

export const predictCPList = (
  atk: number,
  def: number,
  sta: number,
  IVatk: number | string,
  IVdef: number | string,
  IVsta: number | string
) => {
  IVatk = parseInt(IVatk.toString());
  IVdef = parseInt(IVdef.toString());
  IVsta = parseInt(IVsta.toString());

  const predictArr: IPredictCPModel[] = [];
  for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
    predictArr.push(
      PredictCPModel.create({
        level: i,
        CP: calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i),
        hp: Math.max(1, calculateStatsBattle(sta, IVsta, i, true)),
      })
    );
  }
  return new PredictCPCalculate(IVatk, IVdef, IVsta, predictArr);
};

export const calculateStats = (atk: number, def: number, sta: number, IVatk: number, IVdef: number, IVsta: number, cp: number | string) => {
  cp = parseInt(cp.toString());

  const dataStat = new StatsCalculate(IVatk, IVdef, IVsta, cp, 0);

  for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
    if (cp === calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i)) {
      dataStat.level = i;
      break;
    }
  }
  return dataStat;
};

export const calculateStatsBattle = (base: number, iv: number, level: number, floor = false, addition = false) => {
  let result = (base + iv) * ((data as ICPM[]).find((item) => item.level === level)?.multiplier ?? 0);
  if (addition) {
    result *= +addition;
  }
  if (floor) {
    return Math.floor(result);
  }
  return result;
};

export const calculateBetweenLevel = (
  globalOptions: IOptions | undefined,
  atk: number,
  def: number,
  sta: number,
  IVatk: number,
  IVdef: number,
  IVsta: number,
  fromLV: number,
  toLV: number,
  type = ''
) => {
  // from_lv -= 0.5;
  toLV -= 0.5;

  const powerUpCount = (toLV - fromLV) * 2;

  if (fromLV > toLV) {
    return new BetweenLevelCalculate({
      CP: calculateCP(atk + IVatk, def + IVdef, sta + IVsta, toLV + 0.5),
      result_between_stadust: 0,
      result_between_candy: 0,
      result_between_xl_candy: 0,
      powerUpCount: 0,
    });
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

    if (type.toUpperCase() === FORM_SHADOW) {
      atkStat = calculateStatsBattle(atk, IVatk, toLV + 0.5, true, SHADOW_ATK_BONUS(globalOptions));
      defStat = calculateStatsBattle(def, IVdef, toLV + 0.5, true, SHADOW_DEF_BONUS(globalOptions));

      atkStatDiff = Math.abs(calculateStatsBattle(atk, IVatk, toLV + 0.5, true) - atkStat);
      defStatDiff = Math.abs(calculateStatsBattle(def, IVdef, toLV + 0.5, true) - defStat);
    }

    data.forEach((ele) => {
      if (ele.level >= fromLV && ele.level <= toLV) {
        betweenStadust += Math.ceil((ele.stadust ?? 0) * typeCostPowerUp(type).stadust);
        betweenCandy += Math.ceil((ele.candy ?? 0) * typeCostPowerUp(type).candy);
        betweenXlCandy += Math.ceil((ele.xl_candy ?? 0) * typeCostPowerUp(type).candy);
        betweenStadustDiff += Math.abs((ele.stadust ?? 0) - Math.ceil((ele.stadust ?? 0) * typeCostPowerUp(type).stadust));
        betweenCandyDiff += Math.abs((ele.candy ?? 0) - Math.ceil((ele.candy ?? 0) * typeCostPowerUp(type).candy));
        betweenXlCandyDiff += Math.abs((ele.xl_candy ?? 0) - Math.ceil((ele.xl_candy ?? 0) * typeCostPowerUp(type).candy));
      }
    });

    const dataList = new BetweenLevelCalculate({
      CP: calculateCP(atk + IVatk, def + IVdef, sta + IVsta, toLV + 0.5),
      result_between_stadust: betweenStadust,
      result_between_stadust_diff: betweenStadustDiff,
      result_between_candy: betweenCandy,
      result_between_candy_diff: betweenCandyDiff,
      result_between_xl_candy: betweenXlCandy,
      result_between_xl_candy_diff: betweenXlCandyDiff,
      powerUpCount,
      type,
    });

    if (type.toUpperCase() === FORM_SHADOW) {
      dataList.atk_stat = atkStat;
      dataList.def_stat = defStat;
      dataList.atk_stat_diff = atkStatDiff;
      dataList.def_stat_diff = defStatDiff;
    }

    return dataList;
  }
};

export const calculateBattleLeague = (
  globalOptions: IOptions | undefined,
  atk: number,
  def: number,
  sta: number,
  IVatk: number,
  IVdef: number,
  IVsta: number,
  fromLV: number,
  currCP: number,
  maxCp: number | null,
  type: string
) => {
  let level = MAX_LEVEL;
  if (type !== 'buddy') {
    level -= 1;
  }
  if (maxCp && currCP > maxCp) {
    return new BattleLeagueCalculate(false);
  } else {
    const dataBattle = new BattleLeagueCalculate(true, maxCp, IVatk, IVdef, IVsta, 0, 0, true);

    if (maxCp == null) {
      dataBattle.level = level;
      dataBattle.CP = calculateCP(atk + IVatk, def + IVdef, sta + IVsta, level);
      dataBattle.limit = false;
    } else {
      for (let i = MIN_LEVEL; i <= level; i += 0.5) {
        if (
          dataBattle.CP < calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i) &&
          calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i) <= maxCp
        ) {
          dataBattle.level = i;
          dataBattle.CP = calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i);
          dataBattle.limit = false;
        }
      }
    }

    const atkStat =
      type.toUpperCase() === FORM_SHADOW
        ? calculateStatsBattle(atk, IVatk, dataBattle.level, true, SHADOW_ATK_BONUS(globalOptions))
        : calculateStatsBattle(atk, IVatk, dataBattle.level, true);
    const defStat =
      type.toUpperCase() === FORM_SHADOW
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
  IVatk: number,
  IVdef: number,
  IVsta: number,
  level: number,
  maxCPLeague: number | null
) => {
  let CP = 10;
  let l = level;
  for (let i = level; i <= MAX_LEVEL; i += 0.5) {
    if (maxCPLeague !== null && calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i) > maxCPLeague) {
      break;
    }
    CP = calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i);
    l = i;
  }
  return new StatsLeagueCalculate({
    CP,
    level: l,
  });
};

export const sortStatsProd = (data: IBattleBaseStats[]) => {
  data = data.sort((a, b) => (a.statsProds ?? 0) - (b.statsProds ?? 0));
  return data.map((item, index) =>
    BattleBaseStats.create({
      ...item,
      ratio: ((item.statsProds ?? 0) * 100) / (data[data.length - 1]?.statsProds ?? 1),
      rank: data.length - index,
    })
  );
};

export const calStatsProd = (atk: number, def: number, sta: number, minCP: number | null, maxCP: number | null, pure = false) => {
  const dataList: IBattleBaseStats[] = [];
  if (atk === 0 || def === 0 || sta === 0) {
    return dataList;
  }
  let seqId = 0;
  for (let l = MIN_LEVEL; l <= MAX_LEVEL; l += 0.5) {
    for (let i = MIN_IV; i <= MAX_IV; ++i) {
      for (let j = MIN_IV; j <= MAX_IV; ++j) {
        for (let k = MIN_IV; k <= MAX_IV; ++k) {
          const cp = calculateCP(atk + i, def + j, sta + k, l);
          if ((!minCP || minCP <= cp) && (!maxCP || cp <= maxCP)) {
            const statsATK = calculateStatsBattle(atk, i, l);
            const statsDEF = calculateStatsBattle(def, j, l);
            const statsSTA = calculateStatsBattle(sta, k, l);
            dataList.push(
              BattleBaseStats.create({
                IV: { atk: i, def: j, sta: k },
                CP: cp,
                level: l,
                stats: { statsATK, statsDEF, statsSTA },
                statsProds: statsATK * statsDEF * statsSTA,
                id: seqId,
              })
            );
            seqId++;
          }
        }
      }
    }
  }

  if (!pure) {
    return sortStatsProd(dataList);
  } else {
    return dataList;
  }
};

export const calculateStatsByTag = (
  pokemon: IPokemonData | undefined | null,
  baseStats: IStatsPokemon | undefined,
  tag: string | null | undefined
) => {
  let atk = 0,
    def = 0,
    sta = 0;

  if (pokemon || (baseStats && tag)) {
    if (pokemon?.baseStatsGO) {
      return pokemon.baseStats;
    }
    const from = tag?.toLowerCase();
    const checkNerf = !from?.toUpperCase().includes(FORM_MEGA);

    atk = calBaseATK(baseStats, checkNerf);
    def = calBaseDEF(baseStats, checkNerf);
    sta = tag !== 'shedinja' ? calBaseSTA(baseStats, checkNerf) : 1;
  }
  return new StatsBase(atk, def, sta);
};

export const calculateDamagePVE = (
  globalOptions: IOptions | undefined,
  atk: number,
  defObj: number,
  power: number,
  eff: {
    stab: boolean;
    wb: boolean;
    dodge?: boolean;
    mega?: boolean;
    trainer?: boolean;
    flevel?: number;
    clevel?: number;
    effective: number;
  },
  notPure?: boolean,
  stab?: boolean
) => {
  const stabMultiply = STAB_MULTIPLY(globalOptions);
  let modifier;
  if (eff) {
    const isStab = eff.stab ? stabMultiply : 1;
    const isWb = eff.wb ? stabMultiply : 1;
    const isDodge = eff.dodge ? DEFAULT_DODGE_MULTIPLY : 1;
    const isMega = eff.mega ? (eff.stab ? STAB_MULTIPLY(globalOptions) : DEFAULT_MEGA_MULTIPLY) : 1;
    const isTrainer = eff.trainer ? DEFAULT_TRAINER_MULTIPLY : 1;
    const isFriend = eff.flevel ? MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, eff.flevel) : 1;
    let isCharge = eff.clevel ? MULTIPLY_THROW_CHARGE(globalOptions, 'normal') : 1;
    if (eff.clevel === 1) {
      isCharge = MULTIPLY_THROW_CHARGE(globalOptions, 'nice');
    } else if (eff.clevel === 2) {
      isCharge = MULTIPLY_THROW_CHARGE(globalOptions, 'great');
    } else if (eff.clevel === 3) {
      isCharge = MULTIPLY_THROW_CHARGE(globalOptions, 'excellent');
    }
    modifier = isStab * isWb * isFriend * isDodge * isCharge * isMega * isTrainer * eff.effective;
  } else {
    modifier = stab ? stabMultiply : 1;
  }
  if (notPure) {
    return 0.5 * power * (atk / defObj) * modifier + 1;
  }
  return Math.floor(0.5 * power * (atk / defObj) * modifier) + 1;
};

export const getBarCharge = (isRaid: boolean, energy: number) => {
  energy = Math.abs(energy);
  if (isRaid) {
    const bar = Math.ceil(100 / energy);
    return bar > 3 ? 3 : bar;
  } else {
    return energy > 50 ? 1 : 2;
  }
};

export const calculateAvgDPS = (
  globalOptions: IOptions | undefined,
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  fmove: ICombat | undefined,
  cmove: ICombat | undefined,
  atk: number,
  def: number,
  hp: number,
  typePoke: string | string[],
  options: OptionOtherDPS | null = null,
  shadow = false
) => {
  const stabMultiply = STAB_MULTIPLY(globalOptions),
    shadowAtkBonus = SHADOW_ATK_BONUS(globalOptions),
    shadowDefBonus = SHADOW_DEF_BONUS(globalOptions),
    multiplyLevelFriendship = MULTIPLY_LEVEL_FRIENDSHIP(globalOptions);

  const FPow = fmove?.pve_power ?? 0;
  const CPow = cmove?.pve_power ?? 0;
  const FE = Math.abs(fmove?.pve_energy ?? 0);
  const CE = Math.abs(cmove?.pve_energy ?? 0);
  const FDur = (fmove?.durationMs ?? 0) / 1000;
  const CDur = (cmove?.durationMs ?? 0) / 1000;
  const FTYPE = capitalize(fmove?.type);
  const CTYPE = capitalize(cmove?.type);
  const CDWS = (cmove?.damageWindowStartMs ?? 0) / 1000;

  const FMulti = (typePoke.includes(FTYPE) ? stabMultiply : 1) * (fmove?.accuracyChance ?? 0);
  const CMulti = (typePoke.includes(CTYPE) ? stabMultiply : 1) * (cmove?.accuracyChance ?? 0);

  let y, FDmg, CDmg, FDmgBase, CDmgBase;
  if (options) {
    FDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      FPow *
      FMulti *
      (shadow ? shadowAtkBonus : 1) *
      (typeof options.WEATHER_BOOSTS === 'string'
        ? weatherMultiple(globalOptions, weatherBoost, options.WEATHER_BOOSTS, FTYPE)
        : options.WEATHER_BOOSTS
        ? stabMultiply
        : 1) *
      (options.TRAINER_FRIEND ? multiplyLevelFriendship : 1);
    CDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      CPow *
      CMulti *
      (shadow ? shadowAtkBonus : 1) *
      (typeof options.WEATHER_BOOSTS === 'string'
        ? weatherMultiple(globalOptions, weatherBoost, options.WEATHER_BOOSTS, CTYPE)
        : options.WEATHER_BOOSTS
        ? stabMultiply
        : 1) *
      (options.TRAINER_FRIEND ? multiplyLevelFriendship : 1);

    FDmg =
      Math.floor((FDmgBase * atk * (options.objTypes ? getTypeEffective(typeEff, FTYPE, options.objTypes) : 1)) / options.POKEMON_DEF_OBJ) +
      DEFAULT_DAMAGE_CONST;
    CDmg =
      Math.floor((CDmgBase * atk * (options.objTypes ? getTypeEffective(typeEff, CTYPE, options.objTypes) : 1)) / options.POKEMON_DEF_OBJ) +
      DEFAULT_DAMAGE_CONST;

    y =
      900 /
      ((def /
        (options.objTypes ? getTypeEffective(typeEff, FTYPE, options.objTypes) * getTypeEffective(typeEff, CTYPE, options.objTypes) : 1)) *
        (shadow ? shadowDefBonus : 1));
  } else {
    FDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      FPow *
      FMulti *
      (DEFAULT_POKEMON_SHADOW ? shadowAtkBonus : 1) *
      (DEFAULT_WEATHER_BOOSTS ? stabMultiply : 1) *
      (DEFAULT_TRAINER_FRIEND ? multiplyLevelFriendship : 1);
    CDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      CPow *
      CMulti *
      (DEFAULT_POKEMON_SHADOW ? shadowAtkBonus : 1) *
      (DEFAULT_WEATHER_BOOSTS ? stabMultiply : 1) *
      (DEFAULT_TRAINER_FRIEND ? multiplyLevelFriendship : 1);

    FDmg = Math.floor((FDmgBase * atk) / DEFAULT_POKEMON_DEF_OBJ) + DEFAULT_DAMAGE_CONST;
    CDmg = Math.floor((CDmgBase * atk) / DEFAULT_POKEMON_DEF_OBJ) + DEFAULT_DAMAGE_CONST;

    y = 900 / (def * (DEFAULT_POKEMON_SHADOW ? shadowDefBonus : 1));
  }

  const FDPS = FDmg / (FDur + (options?.delay ? options.delay.ftime : 0));
  const CDPS = CDmg / (CDur + (options?.delay ? options.delay.ctime : 0));

  const CEPSM = CE === 100 ? 0.5 * FE + 0.5 * y * CDWS : 0;
  const FEPS = FE / (FDur + (options?.delay ? options.delay.ftime : 0));
  const CEPS = (CE + CEPSM) / (CDur + (options?.delay ? options.delay.ctime : 0));

  let x = 0.5 * CE + 0.5 * FE;
  if (options?.specific) {
    const bar = getBarCharge(true, CE);
    const λ = 3 / bar;
    x += 0.5 * λ * options.specific.FDmgenemy + options.specific.CDmgenemy * λ + 1;
  }

  const DPS0 = (FDPS * CEPS + CDPS * FEPS) / (CEPS + FEPS);

  let DPS;
  if (FDPS > CDPS) {
    DPS = DPS0;
  } else {
    DPS = Math.max(0, DPS0 + ((CDPS - FDPS) / (CEPS + FEPS)) * (DEFAULT_ENERGY_PER_HP_LOST - x / hp) * y);
  }
  return Math.max(FDPS, DPS);
};

export const calculateTDO = (globalOptions: IOptions | undefined, def: number, hp: number, dps: number, shadow = false) => {
  const shadowDefBonus = SHADOW_DEF_BONUS(globalOptions);
  const y = 900 / (def * (shadow ?? DEFAULT_POKEMON_SHADOW ? shadowDefBonus : 1));
  return (hp / y) * dps;
};

export const calculateBattleDPSDefender = (
  globalOptions: IOptions | undefined | undefined,
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  attacker: BattleCalculate,
  defender: BattleCalculate
) => {
  const stabMultiply = STAB_MULTIPLY(globalOptions),
    shadowAtkBonus = SHADOW_ATK_BONUS(globalOptions),
    shadowDefBonus = SHADOW_DEF_BONUS(globalOptions);

  const FPowDef = defender.fmove?.pve_power;
  const CPowDef = defender.cmove?.pve_power;
  const CEDef = Math.abs(defender.cmove?.pve_energy ?? 0);
  const FDurDef = (defender.fmove?.durationMs ?? 0) / 1000;
  const CDurDef = (defender.cmove?.durationMs ?? 0) / 1000;
  const FTYPEDef = capitalize(defender.fmove?.type);
  const CTYPEDef = capitalize(defender.cmove?.type);

  const FMultiDef = (defender.types.includes(FTYPEDef) ? stabMultiply : 1) * (defender.fmove?.accuracyChance ?? 0);
  const CMultiDef = (defender.types.includes(CTYPEDef) ? stabMultiply : 1) * (defender.cmove?.accuracyChance ?? 0);

  const lambdaMod = (CEDef / 100) * 3;
  const defDuration = lambdaMod * (FDurDef + DEFAULT_ENEMY_ATK_DELAY) + (CDurDef + DEFAULT_ENEMY_ATK_DELAY);

  const FDmgBaseDef =
    DEFAULT_DAMAGE_MULTIPLY *
    (FPowDef ?? 0) *
    FMultiDef *
    (defender.shadow ? shadowAtkBonus : 1) *
    (defender.WEATHER_BOOSTS !== ''
      ? weatherMultiple(globalOptions, weatherBoost, defender.WEATHER_BOOSTS ?? '', FTYPEDef)
      : defender.WEATHER_BOOSTS
      ? stabMultiply
      : 1);
  const CDmgBaseDef =
    DEFAULT_DAMAGE_MULTIPLY *
    (CPowDef ?? 0) *
    CMultiDef *
    (defender.shadow ? shadowAtkBonus : 1) *
    (defender.WEATHER_BOOSTS !== ''
      ? weatherMultiple(globalOptions, weatherBoost, defender.WEATHER_BOOSTS ?? '', CTYPEDef)
      : Boolean(defender.WEATHER_BOOSTS)
      ? stabMultiply
      : 1);

  const FDmgDef =
    Math.floor(
      (FDmgBaseDef * (defender.atk ?? 0) * getTypeEffective(typeEff, FTYPEDef, attacker.types)) /
        (attacker.def * (attacker.shadow ? shadowDefBonus : 1))
    ) + DEFAULT_DAMAGE_CONST;
  const CDmgDef =
    Math.floor(
      (CDmgBaseDef * (defender.atk ?? 0) * getTypeEffective(typeEff, CTYPEDef, attacker.types)) /
        (attacker.def * (attacker.shadow ? shadowDefBonus : 1))
    ) + DEFAULT_DAMAGE_CONST;

  const DefDmg = lambdaMod * FDmgDef + CDmgDef;
  return DefDmg / defDuration;
};

export const calculateBattleDPS = (
  globalOptions: IOptions | undefined,
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  attacker: BattleCalculate,
  defender: BattleCalculate,
  DPSDef: number
) => {
  const stabMultiply = STAB_MULTIPLY(globalOptions),
    shadowAtkBonus = SHADOW_ATK_BONUS(globalOptions),
    shadowDefBonus = SHADOW_DEF_BONUS(globalOptions);

  const FPow = attacker.fmove?.pve_power;
  const CPow = attacker.cmove?.pve_power;
  const FE = Math.abs(attacker.fmove?.pve_energy ?? 0);
  const CE = Math.abs(attacker.cmove?.pve_energy ?? 0);
  const FDur = (attacker.fmove?.durationMs ?? 0) / 1000;
  const CDur = (attacker.cmove?.durationMs ?? 0) / 1000;
  const FTYPE = capitalize(attacker.fmove?.type?.toLowerCase());
  const CTYPE = capitalize(attacker.cmove?.type?.toLowerCase());
  const CDWS = (attacker.cmove?.damageWindowStartMs ?? 0) / 1000;

  const FMulti = (attacker.types.includes(FTYPE) ? stabMultiply : 1) * (attacker.fmove?.accuracyChance ?? 0);
  const CMulti = (attacker.types.includes(CTYPE) ? stabMultiply : 1) * (attacker.cmove?.accuracyChance ?? 0);

  const FDmgBase =
    DEFAULT_DAMAGE_MULTIPLY *
    (FPow ?? 0) *
    FMulti *
    (attacker.shadow ? shadowAtkBonus : 1) *
    (typeof attacker.WEATHER_BOOSTS === 'string'
      ? weatherMultiple(globalOptions, weatherBoost, attacker.WEATHER_BOOSTS, FTYPE)
      : attacker.WEATHER_BOOSTS
      ? stabMultiply
      : 1) *
    (attacker.POKEMON_FRIEND ? MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, attacker.POKEMON_FRIEND_LEVEL) : 1);
  const CDmgBase =
    DEFAULT_DAMAGE_MULTIPLY *
    (CPow ?? 0) *
    CMulti *
    (attacker.shadow ? shadowAtkBonus : 1) *
    (typeof attacker.WEATHER_BOOSTS === 'string'
      ? weatherMultiple(globalOptions, weatherBoost, attacker.WEATHER_BOOSTS, CTYPE)
      : attacker.WEATHER_BOOSTS
      ? stabMultiply
      : 1) *
    (attacker.POKEMON_FRIEND ? MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, attacker.POKEMON_FRIEND_LEVEL) : 1);

  const FDmg =
    Math.floor(
      (FDmgBase * (attacker.atk ?? 0) * getTypeEffective(typeEff, FTYPE, defender.types)) /
        (defender.def * (defender.shadow ? shadowDefBonus : 1))
    ) + DEFAULT_DAMAGE_CONST;
  const CDmg =
    Math.floor(
      (CDmgBase * (attacker.atk ?? 0) * getTypeEffective(typeEff, CTYPE, defender.types)) /
        (defender.def * (defender.shadow ? shadowDefBonus : 1))
    ) + DEFAULT_DAMAGE_CONST;

  const FDPS = FDmg / FDur;
  const CDPS = CDmg / CDur;

  const CEPSM = CE === 100 ? 0.5 * FE + 0.5 * DPSDef * CDWS : 0;
  const FEPS = FE / FDur;
  const CEPS = (CE + CEPSM) / CDur;

  const x = 0.5 * CE + 0.5 * FE;

  const DPS0 = (FDPS * CEPS + CDPS * FEPS) / (CEPS + FEPS);

  let DPS;
  if (FDPS > CDPS) {
    DPS = DPS0;
  } else {
    DPS = Math.max(0, DPS0 + ((CDPS - FDPS) / (CEPS + FEPS)) * (DEFAULT_ENERGY_PER_HP_LOST - x / (attacker.hp ?? 0)) * DPSDef);
  }
  DPS = Math.max(FDPS, DPS);

  let DPSSec = 0;
  if (attacker.isDoubleCharge) {
    const moveSec = attacker.cmove2;
    const CPowSec = moveSec?.pve_power;
    const CESec = Math.abs(moveSec?.pve_energy ?? 0);
    const CTYPESec = capitalize(moveSec?.type);
    const CDurSec = (moveSec?.durationMs ?? 0) / 1000;
    const CDWSSec = (moveSec?.damageWindowStartMs ?? 0) / 1000;

    const CMultiSec = (attacker.types.includes(CTYPESec) ? stabMultiply : 1) * (moveSec?.accuracyChance ?? 0);

    const CDmgBaseSec =
      DEFAULT_DAMAGE_MULTIPLY *
      (CPowSec ?? 0) *
      CMultiSec *
      (attacker.shadow ? shadowAtkBonus : 1) *
      (typeof attacker.WEATHER_BOOSTS === 'string'
        ? weatherMultiple(globalOptions, weatherBoost, attacker.WEATHER_BOOSTS, CTYPE)
        : attacker.WEATHER_BOOSTS
        ? stabMultiply
        : 1) *
      (attacker.POKEMON_FRIEND ? MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, attacker.POKEMON_FRIEND_LEVEL) : 1);
    const CDmgSec =
      Math.floor(
        (CDmgBaseSec * (attacker.atk ?? 0) * getTypeEffective(typeEff, CTYPESec, defender.types)) /
          (defender.def * (defender.shadow ? shadowDefBonus : 1))
      ) + DEFAULT_DAMAGE_CONST;
    const CDPSSec = CDmgSec / CDurSec;

    const CEPSMSec = CESec === 100 ? 0.5 * FE + 0.5 * DPSDef * CDWSSec : 0;
    const CEPSSec = (CESec + CEPSMSec) / CDurSec;

    const xSec = 0.5 * CESec + 0.5 * FE;

    const DPS0Sec = (FDPS * CEPSSec + CDPSSec * FEPS) / (CEPSSec + FEPS);

    if (FDPS > CDPSSec) {
      DPSSec = DPS0Sec;
    } else {
      DPSSec = Math.max(
        0,
        DPS0Sec + ((CDPSSec - FDPS) / (CEPSSec + FEPS)) * (DEFAULT_ENERGY_PER_HP_LOST - xSec / (attacker.hp ?? 0)) * DPSDef
      );
    }
    DPSSec = Math.max(FDPS, DPSSec);
  }
  return Math.max(FDPS, DPS, DPSSec);
};

export const TimeToKill = (hp: number, dpsDef: number) => {
  return hp / dpsDef;
};

export const queryTopMove = (
  globalOptions: IOptions | undefined,
  pokemonList: IPokemonData[] | undefined,
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  move: ICombat | undefined
) => {
  const dataPri: IPokemonTopMove[] = [];
  pokemonList?.forEach((value) => {
    if (move?.track === 281) {
      move.name = 'HIDDEN_POWER';
    }
    if (value) {
      let pokemonList;
      let isElite = false;
      let isSpecial = true;
      if (move?.type_move === TypeMove.FAST) {
        pokemonList = value.quickMoves?.map((item: string) => item).includes(move.name);
        if (!pokemonList) {
          pokemonList = value.eliteQuickMove?.map((item: string) => item).includes(move.name);
          isElite = true;
        }
      } else if (move?.type_move === TypeMove.CHARGE) {
        pokemonList = value.cinematicMoves?.includes(move.name);
        if (!pokemonList) {
          pokemonList = value.shadowMoves?.includes(move.name);
        }
        if (!pokemonList) {
          pokemonList = value.purifiedMoves?.includes(move.name);
        }
        if (!pokemonList) {
          pokemonList = value.eliteCinematicMove?.includes(move.name);
          isElite = true;
        }
        if (!pokemonList) {
          pokemonList = value.specialMoves?.includes(move.name);
          isSpecial = true;
        }
      }
      if (pokemonList) {
        const stats = calculateStatsByTag(value, value.baseStats, value.slug);
        const dps = calculateAvgDPS(
          globalOptions,
          typeEff,
          weatherBoost,
          move,
          move,
          calculateStatsBattle(stats.atk, MAX_IV, DEFAULT_POKEMON_LEVEL),
          calculateStatsBattle(stats.def, MAX_IV, DEFAULT_POKEMON_LEVEL),
          calculateStatsBattle(stats?.sta ?? 0, MAX_IV, DEFAULT_POKEMON_LEVEL),
          value.types
        );
        const tdo = calculateTDO(
          globalOptions,
          calculateStatsBattle(stats.def, MAX_IV, DEFAULT_POKEMON_LEVEL),
          calculateStatsBattle(stats?.sta ?? 0, MAX_IV, DEFAULT_POKEMON_LEVEL),
          dps
        );
        dataPri.push(
          new PokemonTopMove({
            num: value.num,
            forme: value.forme,
            name: splitAndCapitalize(value.name, '-', ' '),
            baseSpecies: value.baseSpecies,
            sprite: value.sprite,
            releasedGO: value.releasedGO,
            isElite,
            isSpecial,
            dps,
            tdo,
          })
        );
      }
    }
  });
  return dataPri;
};

const queryMove = (
  data: QueryMovesPokemon,
  vf: string,
  cmove: string[],
  felite: boolean,
  celite: boolean,
  shadow: boolean,
  purified: boolean,
  special: boolean
) => {
  cmove.forEach((vc: string) => {
    const mf = data.combat.find((item) => item.name === vf);
    const mc = data.combat.find((item) => item.name === vc);

    if (!mf || !mc) {
      return;
    }

    mf.elite = felite;
    mc.elite = celite;
    mc.shadow = shadow;
    mc.purified = purified;
    mc.special = special;

    const options = {
      delay: {
        ftime: DEFAULT_ENEMY_ATK_DELAY,
        ctime: DEFAULT_ENEMY_ATK_DELAY,
      },
      POKEMON_DEF_OBJ: DEFAULT_POKEMON_DEF_OBJ,
      IV_ATK: MAX_IV,
      IV_DEF: MAX_IV,
      IV_HP: MAX_IV,
      POKEMON_LEVEL: DEFAULT_POKEMON_LEVEL,
    };

    const offensive = calculateAvgDPS(
      data.globalOptions,
      data.typeEff,
      data.weatherBoost,
      mf,
      mc,
      calculateStatsBattle(data.atk, options.IV_ATK, options.POKEMON_LEVEL, true),
      calculateStatsBattle(data.def, options.IV_DEF, options.POKEMON_LEVEL, true),
      calculateStatsBattle(data.sta, options.IV_HP, options.POKEMON_LEVEL, true),
      data.types,
      null,
      shadow
    );
    const defensive = calculateAvgDPS(
      data.globalOptions,
      data.typeEff,
      data.weatherBoost,
      mf,
      mc,
      calculateStatsBattle(data.atk, options.IV_ATK, options.POKEMON_LEVEL, true),
      calculateStatsBattle(data.def, options.IV_DEF, options.POKEMON_LEVEL, true),
      calculateStatsBattle(data.sta, options.IV_HP, options.POKEMON_LEVEL, true),
      data.types,
      options,
      shadow
    );

    data.dataList.push(new PokemonQueryMove({ fmove: mf, cmove: mc, eDPS: { offensive, defensive } }));
  });
};

export const rankMove = (
  globalOptions: IOptions | undefined,
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  combat: ICombat[],
  move: IPokemonData | undefined,
  atk: number,
  def: number,
  sta: number,
  types: string[]
) => {
  if (!move) {
    return new PokemonQueryRankMove({ data: [] });
  }
  const data = new QueryMovesPokemon(globalOptions, typeEff, weatherBoost, combat, atk, def, sta, types);
  move.quickMoves?.forEach((vf) => setQueryMove(data, vf, move, false));
  move.eliteQuickMove?.forEach((vf) => setQueryMove(data, vf, move, true));

  return new PokemonQueryRankMove({
    data: data.dataList,
    maxOff: Math.max(...data.dataList.map((item) => item.eDPS.offensive)),
    maxDef: Math.max(...data.dataList.map((item) => item.eDPS.defensive)),
  });
};

const setQueryMove = (data: QueryMovesPokemon, vf: string, value: IPokemonData, isEliteQuick: boolean) => {
  queryMove(data, vf, value.cinematicMoves ?? [], isEliteQuick, false, false, false, false);
  queryMove(data, vf, value.eliteCinematicMove ?? [], isEliteQuick, true, false, false, false);
  queryMove(data, vf, value.shadowMoves ?? [], isEliteQuick, false, true, false, false);
  queryMove(data, vf, value.purifiedMoves ?? [], isEliteQuick, false, false, true, false);
  queryMove(data, vf, value.specialMoves ?? [], isEliteQuick, false, false, false, true);
};

export const queryStatesEvoChain = (
  globalOptions: IOptions | undefined,
  pokemonData: IPokemonData[],
  item: IEvolution,
  level: number,
  atkIV: number,
  defIV: number,
  staIV: number
) => {
  let pokemon: IPokemonData | undefined;
  if (item.form === '') {
    pokemon = pokemonData.find((value) => value.num === item.id && value.slug === item.name.toLowerCase());
  } else {
    pokemon = pokemonData.find((value) => value.num === item.id && value.slug.includes(item.form.toLowerCase()));
  }
  if (!pokemon) {
    pokemon = pokemonData.find((value) => value.num === item.id);
  }
  const pokemonStats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);
  const dataLittle = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta ?? 0, atkIV, defIV, staIV, level, 500);
  const dataGreat = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta ?? 0, atkIV, defIV, staIV, level, 1500);
  const dataUltra = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta ?? 0, atkIV, defIV, staIV, level, 2500);
  const dataMaster = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta ?? 0, atkIV, defIV, staIV, level, null);

  const statsProd = calStatsProd(pokemonStats.atk, pokemonStats.def, pokemonStats.sta ?? 0, null, null, true);
  const ultraStatsProd = sortStatsProd(statsProd.filter((item) => (item.CP ?? 0) <= 2500));
  const greatStatsProd = sortStatsProd(ultraStatsProd.filter((item) => (item.CP ?? 0) <= 1500));
  const littleStatsProd = sortStatsProd(greatStatsProd.filter((item) => (item.CP ?? 0) <= 500));

  const little = littleStatsProd.find(
    (item) =>
      item.level === dataLittle.level &&
      item.CP === dataLittle.CP &&
      item.IV &&
      item.IV.atk === atkIV &&
      item.IV.def === defIV &&
      item.IV.sta === staIV
  );
  const great = greatStatsProd.find(
    (item) =>
      item.level === dataGreat.level &&
      item.CP === dataGreat.CP &&
      item.IV &&
      item.IV.atk === atkIV &&
      item.IV.def === defIV &&
      item.IV.sta === staIV
  );
  const ultra = ultraStatsProd.find(
    (item) =>
      item.level === dataUltra.level &&
      item.CP === dataUltra.CP &&
      item.IV &&
      item.IV.atk === atkIV &&
      item.IV.def === defIV &&
      item.IV.sta === staIV
  );
  const master = sortStatsProd(statsProd).find(
    (item) =>
      item.level === dataMaster.level &&
      item.CP === dataMaster.CP &&
      item.IV &&
      item.IV.atk === atkIV &&
      item.IV.def === defIV &&
      item.IV.sta === staIV
  );

  const battleLeague = new BattleLeague();

  if (little) {
    battleLeague.little = BattleBaseStats.create({
      ...little,
      ...calculateBetweenLevel(
        globalOptions,
        pokemonStats.atk,
        pokemonStats.def,
        pokemonStats.sta ?? 0,
        atkIV,
        defIV,
        staIV,
        level,
        little.level ?? 0
      ),
    });
  }
  if (great) {
    battleLeague.great = BattleBaseStats.create({
      ...great,
      ...calculateBetweenLevel(
        globalOptions,
        pokemonStats.atk,
        pokemonStats.def,
        pokemonStats.sta ?? 0,
        atkIV,
        defIV,
        staIV,
        level,
        great.level ?? 0
      ),
    });
  }
  if (ultra) {
    battleLeague.ultra = BattleBaseStats.create({
      ...ultra,
      ...calculateBetweenLevel(
        globalOptions,
        pokemonStats.atk,
        pokemonStats.def,
        pokemonStats.sta ?? 0,
        atkIV,
        defIV,
        staIV,
        level,
        ultra.level ?? 0
      ),
    });
  }
  if (master) {
    battleLeague.master = BattleBaseStats.create({
      ...master,
      ...calculateBetweenLevel(
        globalOptions,
        pokemonStats.atk,
        pokemonStats.def,
        pokemonStats.sta ?? 0,
        atkIV,
        defIV,
        staIV,
        level,
        master.level ?? 0
      ),
    });
  }
  return new QueryStatesEvoChain({ ...item, battleLeague, maxCP: battleLeague.master?.CP ?? 0, form: pokemon?.forme ?? '' });
};

const queryMoveCounter = (
  data: QueryMovesCounterPokemon,
  vf: string,
  cmove: string[],
  felite: boolean,
  celite: boolean,
  shadow: boolean,
  purified: boolean,
  special: boolean
) => {
  cmove.forEach((vc) => {
    const mf = data.combat.find((item) => item.name === vf);
    const mc = data.combat.find((item) => item.name === vc);

    if (mf && mc) {
      const options = {
        objTypes: data.types,
        POKEMON_DEF_OBJ: calculateStatsBattle(data.def, MAX_IV, DEFAULT_POKEMON_LEVEL, true),
        IV_ATK: MAX_IV,
        IV_DEF: MAX_IV,
        IV_HP: MAX_IV,
        POKEMON_LEVEL: DEFAULT_POKEMON_LEVEL,
      };

      const dpsOff = calculateAvgDPS(
        data.globalOptions,
        data.typeEff,
        data.weatherBoost,
        mf,
        mc,
        calculateStatsBattle(data.pokemon.baseStats.atk, options.IV_ATK, options.POKEMON_LEVEL, true),
        calculateStatsBattle(data.pokemon.baseStats.def, options.IV_DEF, options.POKEMON_LEVEL, true),
        calculateStatsBattle(data.pokemon.baseStats?.sta ?? 0, options.IV_HP, options.POKEMON_LEVEL, true),
        data.pokemon.types,
        options,
        shadow
      );

      data.dataList.push(
        new PokemonQueryCounter({
          pokemon_id: data.pokemon.num,
          pokemon_name: data.pokemon.name,
          pokemon_forme: data.pokemon.forme,
          releasedGO: data.pokemon.releasedGO,
          dps: dpsOff,
          fmove: { ...mf, elite: felite },
          cmove: { ...mc, elite: celite, shadow, purified, special },
        })
      );
    }
  });
};

export const counterPokemon = (
  globalOptions: IOptions | undefined,
  pokemonList: IPokemonData[],
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  def: number,
  types: string[],
  combat: ICombat[]
) => {
  const dataList: IPokemonQueryCounter[] = [];
  pokemonList.forEach((pokemon) => {
    if (pokemon && checkMoveSetAvailable(pokemon) && !pokemon.fullName?.includes('_FEMALE')) {
      const data = new QueryMovesCounterPokemon(globalOptions, typeEff, weatherBoost, combat, pokemon, def, types, dataList);
      pokemon.quickMoves?.forEach((vf) => setQueryMoveCounter(data, vf, pokemon, false));
      pokemon.eliteQuickMove?.forEach((vf) => setQueryMoveCounter(data, vf, pokemon, true));
    }
  });
  return dataList
    .sort((a, b) => b.dps - a.dps)
    .map((item) => new CounterModel({ ...item, ratio: (item.dps * 100) / (dataList.at(0)?.dps ?? 0) }));
};

const setQueryMoveCounter = (data: QueryMovesCounterPokemon, vf: string, value: IPokemonData, isEliteQuick: boolean) => {
  queryMoveCounter(data, vf, value.cinematicMoves ?? [], isEliteQuick, false, false, false, false);
  queryMoveCounter(data, vf, value.eliteCinematicMove ?? [], isEliteQuick, true, false, false, false);
  queryMoveCounter(data, vf, value.shadowMoves ?? [], isEliteQuick, false, true, false, false);
  queryMoveCounter(data, vf, value.purifiedMoves ?? [], isEliteQuick, false, false, true, false);
  queryMoveCounter(data, vf, value.specialMoves ?? [], isEliteQuick, false, false, false, true);
};
