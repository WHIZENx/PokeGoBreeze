import { CounterModel } from '../components/Table/Counter/models/counter.model';
import { Stats } from '../core/models/API/info.model';
import { Combat, ICombat } from '../core/models/combat.model';
import { CPMData, CPMDetail, ICPM } from '../core/models/cpm.model';
import { IEvolution } from '../core/models/evolution.model';
import { IOptions } from '../core/models/options.model';
import { IPokemonData, PokemonData } from '../core/models/pokemon.model';
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
import { TypeMove } from '../enums/type.enum';
import { IOptionOtherDPS, OptionOtherDPS } from '../store/models/options.model';
import { findStabType } from './compute';
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
  maxLevel,
  MIN_IV,
  MIN_LEVEL,
  MULTIPLY_LEVEL_FRIENDSHIP,
  MULTIPLY_THROW_CHARGE,
  RAID_BOSS_TIER,
  SHADOW_ATK_BONUS,
  SHADOW_DEF_BONUS,
  STAB_MULTIPLY,
  typeCostPowerUp,
} from './constants';
import { capitalize, splitAndCapitalize, checkMoveSetAvailable } from './utils';
import {
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
  IBattleCalculate,
} from './models/calculate.model';
import {
  IPokemonQueryCounter,
  PokemonQueryCounter,
  PokemonQueryMove,
  PokemonQueryRankMove,
  IPokemonTopMove,
  PokemonTopMove,
  EDPS,
} from './models/pokemon-top-move.model';
import { IArrayStats } from './models/util.model';
import { IBattleState } from '../core/models/damage.model';

const weatherMultiple = (
  globalOptions: IOptions | undefined,
  weatherBoost: IWeatherBoost | undefined,
  weather: string | undefined,
  type: string
) => {
  return ((weatherBoost as unknown as { [x: string]: string[] })[weather?.toUpperCase().replaceAll(' ', '_') ?? '']?.find(
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
      minRank: 1,
      maxRank: attackRanking.length,
      minStats: minATK,
      maxStats: maxATK,
    }),
    defense: StatsRankDef.create({
      ranking: defenseStats,
      minRank: 1,
      maxRank: defenseRanking.length,
      minStats: minDEF,
      maxStats: maxDEF,
    }),
    stamina: StatsRankSta.create({
      ranking: staminaStats,
      minRank: 1,
      maxRank: staminaRanking.length,
      minStats: minSTA,
      maxStats: maxSTA,
    }),
    statProd: StatsRankProd.create({
      ranking: prodStats,
      minRank: 1,
      maxRank: prodRanking.length,
      minStats: minPROD,
      maxStats: maxPROD,
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
  for (let level = MIN_LEVEL; level <= maxLevel; level += 0.5) {
    if (cp <= calculateCP(atk + MAX_IV, def + MAX_IV, sta + MAX_IV, level)) {
      minLevel = level;
      break;
    }
  }
  for (let level = minLevel; level <= maxLevel; level += 0.5) {
    if (calculateCP(atk, def, sta, level) >= cp) {
      maxLevel = level;
      break;
    }
  }

  const predictArr: IPredictStatsModel[] = [];
  for (let level = minLevel; level <= maxLevel; level += 0.5) {
    for (let atkIV = MIN_IV; atkIV <= MAX_IV; atkIV++) {
      for (let defIV = MIN_IV; defIV <= MAX_IV; defIV++) {
        for (let staIV = MIN_IV; staIV <= MAX_IV; staIV++) {
          if (calculateCP(atk + atkIV, def + defIV, sta + staIV, level) === cp) {
            predictArr.push(
              PredictStatsModel.create({
                atk: atkIV,
                def: defIV,
                sta: staIV,
                level,
                percent: parseFloat((((atkIV + defIV + staIV) * 100) / 45).toFixed(2)),
                hp: Math.max(1, calculateStatsBattle(sta, staIV, level, true)),
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
  for (let level = MIN_LEVEL; level <= maxLevel; level += 0.5) {
    predictArr.push(
      PredictCPModel.create({
        level,
        CP: calculateCP(atk + IVatk, def + IVdef, sta + IVsta, level),
        hp: Math.max(1, calculateStatsBattle(sta, IVsta, level, true)),
      })
    );
  }
  return new PredictCPCalculate(IVatk, IVdef, IVsta, predictArr);
};

export const calculateStats = (atk: number, def: number, sta: number, IVatk: number, IVdef: number, IVsta: number, cp: number | string) => {
  cp = parseInt(cp.toString());

  const dataStat = new StatsCalculate(IVatk, IVdef, IVsta, cp, 0);

  for (let level = MIN_LEVEL; level <= maxLevel; level += 0.5) {
    if (cp === calculateCP(atk + IVatk, def + IVdef, sta + IVsta, level)) {
      dataStat.level = level;
      break;
    }
  }
  return dataStat;
};

export const calculateStatsBattle = (base: number, iv: number, level: number, floor = false, addition = 0) => {
  let result = (base + iv) * ((data as ICPM[]).find((item) => item.level === level)?.multiplier ?? 0);
  if (addition > 0) {
    result *= addition;
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
      resultBetweenStadust: 0,
      resultBetweenCandy: 0,
      resultBetweenXLCandy: 0,
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

    data.forEach((ele: CPMData) => {
      const result = CPMDetail.mapping(ele);
      if (ele.level >= fromLV && ele.level <= toLV) {
        betweenStadust += Math.ceil(result.stardust * typeCostPowerUp(type).stardust);
        betweenCandy += Math.ceil(result.candy * typeCostPowerUp(type).candy);
        betweenXlCandy += Math.ceil(result.xlCandy * typeCostPowerUp(type).candy);
        betweenStadustDiff += Math.abs(result.stardust - Math.ceil(result.stardust * typeCostPowerUp(type).stardust));
        betweenCandyDiff += Math.abs(result.candy - Math.ceil(result.candy * typeCostPowerUp(type).candy));
        betweenXlCandyDiff += Math.abs(result.xlCandy - Math.ceil(result.xlCandy * typeCostPowerUp(type).candy));
      }
    });

    const dataList = new BetweenLevelCalculate({
      CP: calculateCP(atk + IVatk, def + IVdef, sta + IVsta, toLV + 0.5),
      resultBetweenStadust: betweenStadust,
      resultBetweenStadustDiff: betweenStadustDiff,
      resultBetweenCandy: betweenCandy,
      resultBetweenCandyDiff: betweenCandyDiff,
      resultBetweenXLCandy: betweenXlCandy,
      resultBetweenXLCandyDiff: betweenXlCandyDiff,
      powerUpCount,
      type,
    });

    if (type.toUpperCase() === FORM_SHADOW) {
      dataList.atkStat = atkStat;
      dataList.defStat = defStat;
      dataList.atkStatDiff = atkStatDiff;
      dataList.defStatDiff = defStatDiff;
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
  type: string,
  maxCp?: number
) => {
  let level = maxLevel;
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
      for (let l = MIN_LEVEL; l <= level; l += 0.5) {
        if (
          dataBattle.CP < calculateCP(atk + IVatk, def + IVdef, sta + IVsta, l) &&
          calculateCP(atk + IVatk, def + IVdef, sta + IVsta, l) <= maxCp
        ) {
          dataBattle.level = l;
          dataBattle.CP = calculateCP(atk + IVatk, def + IVdef, sta + IVsta, l);
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
  maxCPLeague?: number
) => {
  let CP = 10;
  let l = level;
  for (let i = level; i <= maxLevel; i += 0.5) {
    if (maxCPLeague !== null && calculateCP(atk + IVatk, def + IVdef, sta + IVsta, i) > (maxCPLeague ?? 0)) {
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

export const calStatsProd = (atk: number, def: number, sta: number, minCP?: number, maxCP?: number, pure = false) => {
  const dataList: IBattleBaseStats[] = [];
  if (atk === 0 || def === 0 || sta === 0) {
    return dataList;
  }
  let seqId = 0;
  for (let level = MIN_LEVEL; level <= maxLevel; level += 0.5) {
    for (let atkIV = MIN_IV; atkIV <= MAX_IV; ++atkIV) {
      for (let defIV = MIN_IV; defIV <= MAX_IV; ++defIV) {
        for (let staIV = MIN_IV; staIV <= MAX_IV; ++staIV) {
          const cp = calculateCP(atk + atkIV, def + defIV, sta + staIV, level);
          if ((!minCP || minCP <= cp) && (!maxCP || cp <= maxCP)) {
            const statsATK = calculateStatsBattle(atk, atkIV, level);
            const statsDEF = calculateStatsBattle(def, defIV, level);
            const statsSTA = calculateStatsBattle(sta, staIV, level);
            dataList.push(
              BattleBaseStats.create({
                IV: { atk: atkIV, def: defIV, sta: staIV },
                CP: cp,
                level,
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
      return StatsBase.setValue(pokemon.baseStats.atk, pokemon.baseStats.def, pokemon.baseStats.sta ?? 0);
    }
    const from = tag?.toLowerCase();
    const checkNerf = !from?.toUpperCase().includes(FORM_MEGA);

    atk = calBaseATK(baseStats, checkNerf);
    def = calBaseDEF(baseStats, checkNerf);
    sta = tag !== 'shedinja' ? calBaseSTA(baseStats, checkNerf) : 1;
  }
  return StatsBase.setValue(atk, def, sta);
};

export const calculateDamagePVE = (
  globalOptions: IOptions | undefined,
  atk: number,
  defObj: number,
  power: number,
  eff: IBattleState,
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
    const isFriend = eff.fLevel ? MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, eff.fLevel) : 1;
    let isCharge = eff.cLevel ? MULTIPLY_THROW_CHARGE(globalOptions, 'normal') : 1;
    if (eff.cLevel === 1) {
      isCharge = MULTIPLY_THROW_CHARGE(globalOptions, 'nice');
    } else if (eff.cLevel === 2) {
      isCharge = MULTIPLY_THROW_CHARGE(globalOptions, 'great');
    } else if (eff.cLevel === 3) {
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

export const getBarCharge = (energy: number, isRaid = false) => {
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
  fMove: ICombat | undefined,
  cMove: ICombat | undefined,
  atk: number,
  def: number,
  hp: number,
  typePoke: string[],
  isShadow = false,
  options?: IOptionOtherDPS
) => {
  const stabMultiply = STAB_MULTIPLY(globalOptions),
    shadowAtkBonus = SHADOW_ATK_BONUS(globalOptions),
    shadowDefBonus = SHADOW_DEF_BONUS(globalOptions),
    multiplyLevelFriendship = MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, options?.pokemonFriendLevel);

  const FPow = fMove?.pvePower ?? 0;
  const CPow = cMove?.pvePower ?? 0;
  const FE = Math.abs(fMove?.pveEnergy ?? 0);
  const CE = Math.abs(cMove?.pveEnergy ?? 0);
  const FDur = (fMove?.durationMs ?? 0) / 1000;
  const CDur = (cMove?.durationMs ?? 0) / 1000;
  const FType = capitalize(fMove?.type);
  const CType = capitalize(cMove?.type);
  const CDWS = (cMove?.damageWindowStartMs ?? 0) / 1000;

  const FMulti = (findStabType(typePoke, FType) ? stabMultiply : 1) * (fMove?.accuracyChance ?? 0);
  const CMulti = (findStabType(typePoke, CType) ? stabMultiply : 1) * (cMove?.accuracyChance ?? 0);

  let y = 0,
    FDmg = 0,
    CDmg = 0,
    FDmgBase = 0,
    CDmgBase = 0;
  if (options) {
    FDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      FPow *
      FMulti *
      (isShadow ? shadowAtkBonus : 1) *
      weatherMultiple(globalOptions, weatherBoost, options.weatherBoosts, FType) *
      (options.trainerFriend ? multiplyLevelFriendship : 1);
    CDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      CPow *
      CMulti *
      (isShadow ? shadowAtkBonus : 1) *
      weatherMultiple(globalOptions, weatherBoost, options.weatherBoosts, CType) *
      (options.trainerFriend ? multiplyLevelFriendship : 1);

    const FTypeEff = getTypeEffective(typeEff, FType, options.objTypes ?? []);
    const CTypeEff = getTypeEffective(typeEff, CType, options.objTypes ?? []);

    FDmg = Math.floor((FDmgBase * atk * FTypeEff) / options.pokemonDefObj) + DEFAULT_DAMAGE_CONST;
    CDmg = Math.floor((CDmgBase * atk * CTypeEff) / options.pokemonDefObj) + DEFAULT_DAMAGE_CONST;

    y = 900 / ((def / (FTypeEff * CTypeEff)) * (isShadow ? shadowDefBonus : 1));
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

  const FDPS = FDmg / (FDur + (options?.delay?.fTime ?? 0));
  const CDPS = CDmg / (CDur + (options?.delay?.cTime ?? 0));

  const CEPSM = CE === 100 ? 0.5 * FE + 0.5 * y * CDWS : 0;
  const FEPS = FE / (FDur + (options?.delay?.fTime ?? 0));
  const CEPS = (CE + CEPSM) / (CDur + (options?.delay?.cTime ?? 0));

  let x = 0.5 * CE + 0.5 * FE;
  if (options?.specific) {
    const bar = getBarCharge(CE, true);
    const λ = 3 / bar;
    x += 0.5 * λ * options.specific.FDmgEnemy + options.specific.CDmgEnemy * λ + 1;
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

export const calculateTDO = (globalOptions: IOptions | undefined, def: number, hp: number, dps: number, isShadow = false) => {
  const shadowDefBonus = SHADOW_DEF_BONUS(globalOptions);
  const y = 900 / (def * (isShadow ?? DEFAULT_POKEMON_SHADOW ? shadowDefBonus : 1));
  return (hp / y) * dps;
};

export const calculateBattleDPSDefender = (
  globalOptions: IOptions | undefined | undefined,
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  attacker: IBattleCalculate,
  defender: IBattleCalculate
) => {
  const stabMultiply = STAB_MULTIPLY(globalOptions),
    shadowAtkBonus = SHADOW_ATK_BONUS(globalOptions),
    shadowDefBonus = SHADOW_DEF_BONUS(globalOptions);

  const FPowDef = defender.fMove?.pvePower;
  const CPowDef = defender.cMove?.pvePower;
  const CEDef = Math.abs(defender.cMove?.pveEnergy ?? 0);
  const FDurDef = (defender.fMove?.durationMs ?? 0) / 1000;
  const CDurDef = (defender.cMove?.durationMs ?? 0) / 1000;
  const FTypeDef = capitalize(defender.fMove?.type);
  const CTypeDef = capitalize(defender.cMove?.type);

  const FMultiDef = (findStabType(defender.types, FTypeDef) ? stabMultiply : 1) * (defender.fMove?.accuracyChance ?? 0);
  const CMultiDef = (findStabType(defender.types, CTypeDef) ? stabMultiply : 1) * (defender.cMove?.accuracyChance ?? 0);

  const lambdaMod = (CEDef / 100) * 3;
  const defDuration = lambdaMod * (FDurDef + DEFAULT_ENEMY_ATK_DELAY) + (CDurDef + DEFAULT_ENEMY_ATK_DELAY);

  const FDmgBaseDef =
    DEFAULT_DAMAGE_MULTIPLY *
    (FPowDef ?? 0) *
    FMultiDef *
    (defender.shadow ? shadowAtkBonus : 1) *
    (defender.isStab ? stabMultiply : weatherMultiple(globalOptions, weatherBoost, defender.weatherBoosts, FTypeDef));
  const CDmgBaseDef =
    DEFAULT_DAMAGE_MULTIPLY *
    (CPowDef ?? 0) *
    CMultiDef *
    (defender.shadow ? shadowAtkBonus : 1) *
    (defender.isStab ? stabMultiply : weatherMultiple(globalOptions, weatherBoost, defender.weatherBoosts, CTypeDef));

  const FTypeEff = getTypeEffective(typeEff, FTypeDef, attacker.types);
  const CTypeEff = getTypeEffective(typeEff, CTypeDef, attacker.types);

  const FDmgDef =
    Math.floor((FDmgBaseDef * (defender.atk ?? 0) * FTypeEff) / (attacker.def * (attacker.shadow ? shadowDefBonus : 1))) +
    DEFAULT_DAMAGE_CONST;
  const CDmgDef =
    Math.floor((CDmgBaseDef * (defender.atk ?? 0) * CTypeEff) / (attacker.def * (attacker.shadow ? shadowDefBonus : 1))) +
    DEFAULT_DAMAGE_CONST;

  const DefDmg = lambdaMod * FDmgDef + CDmgDef;
  return DefDmg / defDuration;
};

export const calculateBattleDPS = (
  globalOptions: IOptions | undefined,
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  attacker: IBattleCalculate,
  defender: IBattleCalculate,
  DPSDef: number
) => {
  const stabMultiply = STAB_MULTIPLY(globalOptions),
    shadowAtkBonus = SHADOW_ATK_BONUS(globalOptions),
    shadowDefBonus = SHADOW_DEF_BONUS(globalOptions),
    multiplyLevelFriendship = MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, attacker.pokemonFriendLevel);

  const FPow = attacker.fMove?.pvePower;
  const CPow = attacker.cMove?.pvePower;
  const FE = Math.abs(attacker.fMove?.pveEnergy ?? 0);
  const CE = Math.abs(attacker.cMove?.pveEnergy ?? 0);
  const FDur = (attacker.fMove?.durationMs ?? 0) / 1000;
  const CDur = (attacker.cMove?.durationMs ?? 0) / 1000;
  const FType = capitalize(attacker.fMove?.type?.toLowerCase());
  const CType = capitalize(attacker.cMove?.type?.toLowerCase());
  const CDWS = (attacker.cMove?.damageWindowStartMs ?? 0) / 1000;

  const FMulti = (findStabType(attacker.types, FType) ? stabMultiply : 1) * (attacker.fMove?.accuracyChance ?? 0);
  const CMulti = (findStabType(attacker.types, CType) ? stabMultiply : 1) * (attacker.cMove?.accuracyChance ?? 0);

  const FDmgBase =
    DEFAULT_DAMAGE_MULTIPLY *
    (FPow ?? 0) *
    FMulti *
    (attacker.shadow ? shadowAtkBonus : 1) *
    (attacker.isStab ? stabMultiply : weatherMultiple(globalOptions, weatherBoost, attacker.weatherBoosts, FType)) *
    (attacker.pokemonFriend ? multiplyLevelFriendship : 1);
  const CDmgBase =
    DEFAULT_DAMAGE_MULTIPLY *
    (CPow ?? 0) *
    CMulti *
    (attacker.shadow ? shadowAtkBonus : 1) *
    (attacker.isStab ? stabMultiply : weatherMultiple(globalOptions, weatherBoost, attacker.weatherBoosts, CType)) *
    (attacker.pokemonFriend ? multiplyLevelFriendship : 1);

  const FTypeEff = getTypeEffective(typeEff, FType, defender.types);
  const CTypeEff = getTypeEffective(typeEff, CType, defender.types);

  const FDmg =
    Math.floor((FDmgBase * (attacker.atk ?? 0) * FTypeEff) / (defender.def * (defender.shadow ? shadowDefBonus : 1))) +
    DEFAULT_DAMAGE_CONST;
  const CDmg =
    Math.floor((CDmgBase * (attacker.atk ?? 0) * CTypeEff) / (defender.def * (defender.shadow ? shadowDefBonus : 1))) +
    DEFAULT_DAMAGE_CONST;

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
    const moveSec = attacker.cMoveSec;
    const CPowSec = moveSec?.pvePower;
    const CESec = Math.abs(moveSec?.pveEnergy ?? 0);
    const CTypeSec = capitalize(moveSec?.type);
    const CDurSec = (moveSec?.durationMs ?? 0) / 1000;
    const CDWSSec = (moveSec?.damageWindowStartMs ?? 0) / 1000;

    const CMultiSec = (attacker.types.includes(CTypeSec.toUpperCase()) ? stabMultiply : 1) * (moveSec?.accuracyChance ?? 0);

    const CDmgBaseSec =
      DEFAULT_DAMAGE_MULTIPLY *
      (CPowSec ?? 0) *
      CMultiSec *
      (attacker.shadow ? shadowAtkBonus : 1) *
      weatherMultiple(globalOptions, weatherBoost, attacker.weatherBoosts, CTypeSec) *
      (attacker.pokemonFriend ? multiplyLevelFriendship : 1);

    const CTypeEffSec = getTypeEffective(typeEff, CTypeSec, defender.types);

    const CDmgSec =
      Math.floor((CDmgBaseSec * (attacker.atk ?? 0) * CTypeEffSec) / (defender.def * (defender.shadow ? shadowDefBonus : 1))) +
      DEFAULT_DAMAGE_CONST;
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
      let isInclude = false;
      let isElite = false;
      let isSpecial = false;
      if (move?.typeMove === TypeMove.FAST) {
        isInclude = value.quickMoves?.includes(move.name) ?? false;
        if (!isInclude) {
          isInclude = value.eliteQuickMove?.includes(move.name) ?? false;
          isElite = isInclude;
        }
      } else if (move?.typeMove === TypeMove.CHARGE) {
        isInclude = value.cinematicMoves?.includes(move.name) ?? false;
        if (!isInclude) {
          isInclude = value.shadowMoves?.includes(move.name) ?? false;
        }
        if (!isInclude) {
          isInclude = value.purifiedMoves?.includes(move.name) ?? false;
        }
        if (!isInclude) {
          isInclude = value.eliteCinematicMove?.includes(move.name) ?? false;
          isElite = isInclude;
        }
        if (!isInclude) {
          isInclude = value.specialMoves?.includes(move.name) ?? false;
          isSpecial = isInclude;
        }
      }
      if (isInclude) {
        const stats = calculateStatsByTag(value, value.baseStats, value.slug);
        const statsAtkBattle = calculateStatsBattle(stats.atk, MAX_IV, DEFAULT_POKEMON_LEVEL);
        const statsDefBattle = calculateStatsBattle(stats.atk, MAX_IV, DEFAULT_POKEMON_LEVEL);
        const statsStaBattle = calculateStatsBattle(stats.atk, MAX_IV, DEFAULT_POKEMON_LEVEL);
        const dps = calculateAvgDPS(
          globalOptions,
          typeEff,
          weatherBoost,
          move,
          move,
          statsAtkBattle,
          statsDefBattle,
          statsStaBattle,
          value.types
        );
        const tdo = calculateTDO(globalOptions, statsDefBattle, statsStaBattle, dps);
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
  cMove: string[],
  fElite: boolean,
  cElite: boolean,
  shadow: boolean,
  purified: boolean,
  special: boolean
) => {
  cMove.forEach((vc: string) => {
    const mf = data.combat.find((item) => item.name === vf);
    const mc = data.combat.find((item) => item.name === vc);

    if (mf && mc) {
      mf.elite = fElite;
      mc.elite = cElite;
      mc.shadow = shadow;
      mc.purified = purified;
      mc.special = special;

      const options = OptionOtherDPS.create({
        delay: {
          fTime: DEFAULT_ENEMY_ATK_DELAY,
          cTime: DEFAULT_ENEMY_ATK_DELAY,
        },
        pokemonDefObj: DEFAULT_POKEMON_DEF_OBJ,
        ivAtk: MAX_IV,
        ivDef: MAX_IV,
        ivHp: MAX_IV,
        pokemonLevel: DEFAULT_POKEMON_LEVEL,
      });

      const statsAtkBattle = calculateStatsBattle(data.atk, options.ivAtk, options.pokemonLevel, true);
      const statsDefBattle = calculateStatsBattle(data.atk, options.ivDef, options.pokemonLevel, true);
      const statsStaBattle = calculateStatsBattle(data.atk, options.ivHp, options.pokemonLevel, true);

      const offensive = calculateAvgDPS(
        data.globalOptions,
        data.typeEff,
        data.weatherBoost,
        mf,
        mc,
        statsAtkBattle,
        statsDefBattle,
        statsStaBattle,
        data.types,
        shadow
      );
      const defensive = calculateAvgDPS(
        data.globalOptions,
        data.typeEff,
        data.weatherBoost,
        mf,
        mc,
        statsAtkBattle,
        statsDefBattle,
        statsStaBattle,
        data.types,
        shadow,
        options
      );

      data.dataList.push(new PokemonQueryMove({ fMove: mf, cMove: mc, eDPS: EDPS.create({ offensive, defensive }) }));
    }
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
  let pokemon: IPokemonData | undefined = new PokemonData();
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
  const dataMaster = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta ?? 0, atkIV, defIV, staIV, level);

  const statsProd = calStatsProd(pokemonStats.atk, pokemonStats.def, pokemonStats.sta ?? 0, undefined, undefined, true);
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
  cMove: string[],
  fElite: boolean,
  cElite: boolean,
  shadow: boolean,
  purified: boolean,
  special: boolean
) => {
  cMove.forEach((vc) => {
    const mf = data.combat.find((item) => item.name === vf);
    const mc = data.combat.find((item) => item.name === vc);

    if (mf && mc) {
      const options = OptionOtherDPS.create({
        objTypes: data.types,
        pokemonDefObj: calculateStatsBattle(data.def, MAX_IV, DEFAULT_POKEMON_LEVEL, true),
        ivAtk: MAX_IV,
        ivDef: MAX_IV,
        ivHp: MAX_IV,
        pokemonLevel: DEFAULT_POKEMON_LEVEL,
      });

      const dpsOff = calculateAvgDPS(
        data.globalOptions,
        data.typeEff,
        data.weatherBoost,
        mf,
        mc,
        calculateStatsBattle(data.pokemon.baseStats.atk, options.ivAtk, options.pokemonLevel, true),
        calculateStatsBattle(data.pokemon.baseStats.def, options.ivDef, options.pokemonLevel, true),
        calculateStatsBattle(data.pokemon.baseStats?.sta ?? 0, options.ivHp, options.pokemonLevel, true),
        data.pokemon.types,
        shadow,
        options
      );

      data.dataList.push(
        new PokemonQueryCounter({
          pokemonId: data.pokemon.num,
          pokemonName: data.pokemon.name,
          pokemonForme: data.pokemon.forme,
          releasedGO: data.pokemon.releasedGO,
          dps: dpsOff,
          fMove: Combat.create({ ...mf, elite: fElite }),
          cMove: Combat.create({ ...mc, elite: cElite, shadow, purified, special }),
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