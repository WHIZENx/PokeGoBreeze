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
  IStatsBase,
} from '../core/models/stats.model';
import { ITypeEff } from '../core/models/type-eff.model';
import { IWeatherBoost } from '../core/models/weatherBoost.model';
import data from '../data/cp_multiplier.json';
import { MoveType, PokemonType, TypeAction } from '../enums/type.enum';
import { Delay, IOptionOtherDPS, OptionOtherDPS } from '../store/models/options.model';
import { findStabType } from './compute';
import {
  CP_DIFF_RATIO,
  DEFAULT_DAMAGE_CONST,
  DEFAULT_DAMAGE_MULTIPLY,
  DEFAULT_ENEMY_ATK_DELAY,
  DEFAULT_ENERGY_PER_HP_LOST,
  DEFAULT_MEGA_MULTIPLY,
  DEFAULT_POKEMON_DEF_OBJ,
  DEFAULT_POKEMON_LEVEL,
  DEFAULT_POKEMON_SHADOW,
  DEFAULT_TRAINER_FRIEND,
  DEFAULT_TRAINER_MULTIPLY,
  DEFAULT_WEATHER_BOOSTS,
  DODGE_REDUCE,
  FORM_MEGA,
  MAX_IV,
  MAX_LEVEL,
  MIN_CP,
  MIN_IV,
  MIN_LEVEL,
  MULTIPLY_LEVEL_FRIENDSHIP,
  MULTIPLY_THROW_CHARGE,
  RAID_BOSS_TIER,
  STAB_MULTIPLY,
  typeCostPowerUp,
} from './constants';
import { splitAndCapitalize, checkMoveSetAvailable, getDmgMultiplyBonus, getMoveType, getAllMoves, moveTypeToFormType } from './utils';
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
import {
  DynamicObj,
  getValueOrDefault,
  isEmpty,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  isUndefined,
  toFloat,
  toNumber,
} from './extension';
import { IBattleState } from '../core/models/damage.model';
import { IArrayStats } from './models/util.model';
import { EqualMode, IncludeMode } from './enums/string.enum';
import { BattleLeagueCPType } from './enums/compute.enum';

const weatherMultiple = (
  globalOptions: IOptions | undefined,
  weatherBoost: IWeatherBoost | undefined,
  weather: string | undefined,
  type: string | undefined
) => {
  return (weatherBoost as unknown as DynamicObj<string[]>)[getValueOrDefault(String, weather?.toUpperCase().replaceAll(' ', '_'))]?.find(
    (item) => isEqual(item, type?.replaceAll(' ', '_'), EqualMode.IgnoreCaseSensitive)
  )
    ? STAB_MULTIPLY(globalOptions)
    : 1;
};

export const getTypeEffective = (typeEffective: ITypeEff | undefined, typeMove: string | undefined, typesObj: string[] | undefined) => {
  let valueEffective = 1;
  if (!typeEffective) {
    return valueEffective;
  }
  const moveType = getValueOrDefault(String, typeMove).toUpperCase();
  typesObj?.forEach((type) => {
    type = getValueOrDefault(String, type).toUpperCase();
    valueEffective *= (typeEffective as unknown as DynamicObj<DynamicObj<number>>)[moveType][type] || 1;
  });
  return valueEffective;
};

const convertStatsArray = (stats: Stats[] | undefined, name: string) => {
  return toNumber(stats?.find((item) => isEqual(item.stat.name, name))?.base_stat);
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
  const hp = toNumber(stats.hp);

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
        .sort((a, b) => toNumber(a.baseStatsPokeGo?.attack) - toNumber(b.baseStatsPokeGo?.attack))
        .map((item) => toNumber(item.baseStatsPokeGo?.attack))
    ),
  ];

  const minATK = Math.min(...attackRanking);
  const maxATK = Math.max(...attackRanking);
  const attackStats = stats.map((item) =>
    StatsAtk.create({
      id: item.id,
      form: item.form,
      attack: toNumber(item.baseStatsPokeGo?.attack),
      rank: attackRanking.length - attackRanking.indexOf(toNumber(item.baseStatsPokeGo?.attack)),
    })
  );

  const defenseRanking = [
    ...new Set(
      stats
        .sort((a, b) => toNumber(a.baseStatsPokeGo?.defense) - toNumber(b.baseStatsPokeGo?.defense))
        .map((item) => toNumber(item.baseStatsPokeGo?.defense))
    ),
  ];

  const minDEF = Math.min(...defenseRanking);
  const maxDEF = Math.max(...defenseRanking);
  const defenseStats = stats.map((item) =>
    StatsDef.create({
      id: item.id,
      form: item.form,
      defense: toNumber(item.baseStatsPokeGo?.defense),
      rank: defenseRanking.length - defenseRanking.indexOf(toNumber(item.baseStatsPokeGo?.defense)),
    })
  );

  const staminaRanking = [
    ...new Set(
      stats
        .sort((a, b) => toNumber(a.baseStatsPokeGo?.stamina) - toNumber(b.baseStatsPokeGo?.stamina))
        .map((item) => toNumber(item.baseStatsPokeGo?.stamina))
    ),
  ];

  const minSTA = Math.min(...staminaRanking);
  const maxSTA = Math.max(...staminaRanking);
  const staminaStats = stats.map((item) =>
    StatsSta.create({
      id: item.id,
      form: item.form,
      stamina: toNumber(item.baseStatsPokeGo?.stamina),
      rank: staminaRanking.length - staminaRanking.indexOf(toNumber(item.baseStatsPokeGo?.stamina)),
    })
  );

  const prodRanking = [...new Set(stats.sort((a, b) => a.baseStatsProd - b.baseStatsProd).map((item) => item.baseStatsProd))];

  const minPROD = Math.min(...prodRanking);
  const maxPROD = Math.max(...prodRanking);
  const prodStats = stats.map((item) =>
    StatsProd.create({
      id: item.id,
      form: item.form,
      product: item.baseStatsProd,
      rank: prodRanking.length - prodRanking.indexOf(item.baseStatsProd),
    })
  );

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
    Math.max(10, (atk * def ** 0.5 * sta ** 0.5 * toNumber(data.find((item: ICPM) => item.level === level)?.multiplier) ** 2) / 10)
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

export const calculateDuelAbility = (dmgOutput: number, tankiness: number) => {
  return dmgOutput * tankiness;
};

export const calculateCatchChance = (baseCaptureRate: number | undefined, level: number, multiplier: number) => {
  return (
    1 -
    Math.pow(
      Math.max(0, 1 - toNumber(baseCaptureRate) / (2 * toNumber(data?.find((data: ICPM) => data.level === level)?.multiplier))),
      multiplier
    )
  );
};

export const predictStat = (atk: number, def: number, sta: number, cp: string) => {
  const maxCP = toNumber(cp);
  let minLevel = MIN_LEVEL;
  let maxLevel = MIN_LEVEL + 1;
  for (let level = minLevel; level <= MAX_LEVEL; level += 0.5) {
    if (maxCP <= calculateCP(atk + MAX_IV, def + MAX_IV, sta + MAX_IV, level)) {
      minLevel = level;
      break;
    }
  }
  for (let level = minLevel; level <= MAX_LEVEL; level += 0.5) {
    if (calculateCP(atk, def, sta, level) >= maxCP) {
      maxLevel = level;
      break;
    }
  }

  const predictArr: IPredictStatsModel[] = [];
  for (let level = minLevel; level <= maxLevel; level += 0.5) {
    for (let atkIV = MIN_IV; atkIV <= MAX_IV; atkIV++) {
      for (let defIV = MIN_IV; defIV <= MAX_IV; defIV++) {
        for (let staIV = MIN_IV; staIV <= MAX_IV; staIV++) {
          if (calculateCP(atk + atkIV, def + defIV, sta + staIV, level) === maxCP) {
            predictArr.push(
              PredictStatsModel.create({
                atk: atkIV,
                def: defIV,
                sta: staIV,
                level,
                percent: toFloat(((atkIV + defIV + staIV) * 100) / (MAX_IV * 3), 2),
                hp: Math.max(1, calculateStatsBattle(sta, staIV, level, true)),
              })
            );
          }
        }
      }
    }
  }
  return new PredictStatsCalculate(maxCP, minLevel, maxLevel, predictArr);
};

export const predictCPList = (atk: number, def: number, sta: number, IVatk: number, IVdef: number, IVsta: number) => {
  const predictArr: IPredictCPModel[] = [];
  for (let level = MIN_LEVEL; level <= MAX_LEVEL; level += 0.5) {
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

export const calculateStats = (atk: number, def: number, sta: number, IVatk: number, IVdef: number, IVsta: number, cp: string) => {
  const maxCP = toNumber(cp);
  const dataStat = new StatsCalculate(IVatk, IVdef, IVsta, maxCP, 0);

  for (let level = MIN_LEVEL; level <= MAX_LEVEL; level += 0.5) {
    if (maxCP === calculateCP(atk + IVatk, def + IVdef, sta + IVsta, level)) {
      dataStat.level = level;
      break;
    }
  }
  return dataStat;
};

export const calculateStatsBattle = (base?: number, iv?: number, level?: number, floor = false, addition = 1) => {
  const result =
    (toNumber(base) + toNumber(iv)) * toNumber(data.find((item: ICPM) => item.level === toNumber(level))?.multiplier) * addition;
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
  toLV: number | undefined,
  pokemonType?: PokemonType
) => {
  toLV = toNumber(toLV);
  // from_lv -= 0.5;
  toLV -= 0.5;

  const powerUpCount = (toLV - fromLV) * 2;

  if (fromLV > toLV) {
    return new BetweenLevelCalculate({
      CP: calculateCP(atk + IVatk, def + IVdef, sta + IVsta, toLV + 0.5),
      resultBetweenStardust: 0,
      resultBetweenCandy: 0,
      resultBetweenXLCandy: 0,
      powerUpCount: 0,
    });
  } else {
    let betweenStardust = 0;
    let betweenCandy = 0;
    let betweenXlCandy = 0;

    let betweenStardustDiff = 0;
    let betweenCandyDiff = 0;
    let betweenXlCandyDiff = 0;

    const atkStat = calculateStatsBattle(atk, IVatk, toLV + 0.5, true, getDmgMultiplyBonus(pokemonType, globalOptions, TypeAction.Atk));
    const defStat = calculateStatsBattle(def, IVdef, toLV + 0.5, true, getDmgMultiplyBonus(pokemonType, globalOptions, TypeAction.Def));

    const atkStatDiff = Math.abs(calculateStatsBattle(atk, IVatk, toLV + 0.5, true) - atkStat);
    const defStatDiff = Math.abs(calculateStatsBattle(def, IVdef, toLV + 0.5, true) - defStat);

    data.forEach((ele: CPMData) => {
      const result = CPMDetail.mapping(ele);
      if (ele.level >= fromLV && ele.level <= toNumber(toLV)) {
        betweenStardust += Math.ceil(result.stardust * typeCostPowerUp(pokemonType).stardust);
        betweenCandy += Math.ceil(result.candy * typeCostPowerUp(pokemonType).candy);
        betweenXlCandy += Math.ceil(result.xlCandy * typeCostPowerUp(pokemonType).candy);
        betweenStardustDiff += Math.abs(result.stardust - Math.ceil(result.stardust * typeCostPowerUp(pokemonType).stardust));
        betweenCandyDiff += Math.abs(result.candy - Math.ceil(result.candy * typeCostPowerUp(pokemonType).candy));
        betweenXlCandyDiff += Math.abs(result.xlCandy - Math.ceil(result.xlCandy * typeCostPowerUp(pokemonType).candy));
      }
    });

    const dataList = new BetweenLevelCalculate({
      CP: calculateCP(atk + IVatk, def + IVdef, sta + IVsta, toLV + 0.5),
      resultBetweenStardust: betweenStardust,
      resultBetweenStardustDiff: betweenStardustDiff,
      resultBetweenCandy: betweenCandy,
      resultBetweenCandyDiff: betweenCandyDiff,
      resultBetweenXLCandy: betweenXlCandy,
      resultBetweenXLCandyDiff: betweenXlCandyDiff,
      powerUpCount,
      pokemonType,
    });

    if (pokemonType === PokemonType.Shadow) {
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
  type: PokemonType | undefined,
  maxCp?: number
) => {
  let level = MAX_LEVEL;
  if (type !== PokemonType.Buddy) {
    level -= 1;
  }
  if (maxCp && currCP > maxCp) {
    return new BattleLeagueCalculate(false);
  } else {
    const dataBattle = new BattleLeagueCalculate(true, maxCp, IVatk, IVdef, IVsta, 0, 0, true);

    if (isUndefined(maxCp)) {
      dataBattle.level = level;
      dataBattle.CP = calculateCP(atk + IVatk, def + IVdef, sta + IVsta, level);
      dataBattle.isLimit = false;
    } else {
      for (let l = MIN_LEVEL; l <= level; l += 0.5) {
        if (
          dataBattle.CP < calculateCP(atk + IVatk, def + IVdef, sta + IVsta, l) &&
          calculateCP(atk + IVatk, def + IVdef, sta + IVsta, l) <= maxCp
        ) {
          dataBattle.level = l;
          dataBattle.CP = calculateCP(atk + IVatk, def + IVdef, sta + IVsta, l);
          dataBattle.isLimit = false;
        }
      }
    }

    const atkStat = calculateStatsBattle(atk, IVatk, dataBattle.level, true, getDmgMultiplyBonus(type, globalOptions, TypeAction.Atk));
    const defStat = calculateStatsBattle(def, IVdef, dataBattle.level, true, getDmgMultiplyBonus(type, globalOptions, TypeAction.Def));

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
  let CP = MIN_CP;
  let currentLevel = level;
  for (let l = level; l <= MAX_LEVEL; l += 0.5) {
    if (!isUndefined(maxCPLeague) && calculateCP(atk + IVatk, def + IVdef, sta + IVsta, l) > maxCPLeague) {
      break;
    }
    CP = calculateCP(atk + IVatk, def + IVdef, sta + IVsta, l);
    currentLevel = l;
  }
  return new StatsLeagueCalculate({
    CP,
    level: currentLevel,
  });
};

export const sortStatsProd = (data: IBattleBaseStats[]) => {
  data = data.sort((a, b) => toNumber(a.statsProds) - toNumber(b.statsProds));
  return data.map((item, index) =>
    BattleBaseStats.create({
      ...item,
      ratio: (toNumber(item.statsProds) * 100) / toNumber(data[data.length - 1]?.statsProds, 1),
      rank: data.length - index,
    })
  );
};

export const getBaseStatsByIVandLevel = (
  atk: number,
  def: number,
  sta: number,
  CP: number,
  id = 0,
  level = MAX_LEVEL,
  atkIV = MAX_IV,
  defIV = MAX_IV,
  staIV = MAX_IV
) => {
  const statsATK = calculateStatsBattle(atk, atkIV, level);
  const statsDEF = calculateStatsBattle(def, defIV, level);
  const statsSTA = calculateStatsBattle(sta, staIV, level);
  return BattleBaseStats.create({
    IV: { atk: atkIV, def: defIV, sta: staIV },
    CP,
    level,
    stats: { statsATK, statsDEF, statsSTA },
    statsProds: statsATK * statsDEF * statsSTA,
    id,
  });
};

export const calStatsProd = (atk: number, def: number, sta: number, minCP: number, maxCP: number, pure = false) => {
  const dataList: IBattleBaseStats[] = [];
  if (atk === 0 || def === 0 || sta === 0) {
    return dataList;
  }
  let seqId = 0;
  for (let level = MIN_LEVEL; level <= MAX_LEVEL; level += 0.5) {
    for (let atkIV = MIN_IV; atkIV <= MAX_IV; ++atkIV) {
      for (let defIV = MIN_IV; defIV <= MAX_IV; ++defIV) {
        for (let staIV = MIN_IV; staIV <= MAX_IV; ++staIV) {
          const cp = calculateCP(atk + atkIV, def + defIV, sta + staIV, level);
          if ((minCP === 0 || minCP <= cp) && (maxCP === 0 || cp <= maxCP)) {
            dataList.push(getBaseStatsByIVandLevel(atk, def, sta, cp, seqId, level, atkIV, defIV, staIV));
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
      return StatsBase.setValue(pokemon.baseStats.atk, pokemon.baseStats.def, pokemon.baseStats.sta);
    }
    const form = tag?.toLowerCase();
    const checkNerf = !isInclude(form, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) || pokemon?.pokemonType !== PokemonType.Mega;

    atk = calBaseATK(baseStats, checkNerf);
    def = calBaseDEF(baseStats, checkNerf);
    sta = !isEqual(tag, 'shedinja', EqualMode.IgnoreCaseSensitive) ? calBaseSTA(baseStats, checkNerf) : 1;
  }
  return StatsBase.setValue(atk, def, sta);
};

export const calculateDamagePVE = (
  globalOptions: IOptions | undefined,
  atk: number,
  defObj: number,
  power: number,
  battleState: IBattleState,
  notPure?: boolean,
  isStab?: boolean
) => {
  const stabMultiply = STAB_MULTIPLY(globalOptions);
  let modifier = 0;
  if (battleState) {
    const isStab = battleState.isStab ? stabMultiply : 1;
    const isWb = battleState.isWb ? stabMultiply : 1;
    const isDodge = battleState.isDodge ? 1 - DODGE_REDUCE(globalOptions) : 1;
    const isMega = battleState.isMega ? (battleState.isStab ? stabMultiply : DEFAULT_MEGA_MULTIPLY) : 1;
    const isTrainer = battleState.isTrainer ? DEFAULT_TRAINER_MULTIPLY : 1;
    const multiplyLevelFriendship = MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, battleState.fLevel);
    const multiplyThrowCharge = MULTIPLY_THROW_CHARGE(globalOptions, battleState.cLevel);
    modifier = isStab * isWb * multiplyLevelFriendship * isDodge * multiplyThrowCharge * isMega * isTrainer * battleState.effective;
  } else {
    modifier = isStab ? stabMultiply : 1;
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
    return Math.min(3, bar);
  } else {
    return Number(energy <= 50) + 1;
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
  hp: number | undefined,
  typePoke: string[] | undefined,
  pokemonType = PokemonType.Normal,
  options?: IOptionOtherDPS
) => {
  pokemonType = DEFAULT_POKEMON_SHADOW ? PokemonType.Shadow : pokemonType;
  const stabMultiply = STAB_MULTIPLY(globalOptions);
  const atkBonus = getDmgMultiplyBonus(pokemonType, globalOptions, TypeAction.Atk);
  const defBonus = getDmgMultiplyBonus(pokemonType, globalOptions, TypeAction.Def);
  const multiplyLevelFriendship =
    DEFAULT_TRAINER_FRIEND || options?.isTrainerFriend ? MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, options?.pokemonFriendLevel) : 1;

  const FPow = toNumber(fMove?.pvePower);
  const CPow = toNumber(cMove?.pvePower);
  const FE = Math.abs(toNumber(fMove?.pveEnergy));
  const CE = Math.abs(toNumber(cMove?.pveEnergy));
  const FDur = toNumber(fMove?.durationMs) / 1000;
  const CDur = toNumber(cMove?.durationMs) / 1000;
  const FType = fMove?.type;
  const CType = cMove?.type;
  const CDWS = toNumber(cMove?.damageWindowStartMs) / 1000;

  const FMulti = (findStabType(typePoke, FType) ? stabMultiply : 1) * toNumber(fMove?.accuracyChance);
  const CMulti = (findStabType(typePoke, CType) ? stabMultiply : 1) * toNumber(cMove?.accuracyChance);

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
      atkBonus *
      weatherMultiple(globalOptions, weatherBoost, options.weatherBoosts, FType) *
      multiplyLevelFriendship;
    CDmgBase =
      DEFAULT_DAMAGE_MULTIPLY *
      CPow *
      CMulti *
      atkBonus *
      weatherMultiple(globalOptions, weatherBoost, options.weatherBoosts, CType) *
      multiplyLevelFriendship;

    const FTypeEff = getTypeEffective(typeEff, FType, options.objTypes);
    const CTypeEff = getTypeEffective(typeEff, CType, options.objTypes);

    FDmg = Math.floor((FDmgBase * atk * FTypeEff) / options.pokemonDefObj) + DEFAULT_DAMAGE_CONST;
    CDmg = Math.floor((CDmgBase * atk * CTypeEff) / options.pokemonDefObj) + DEFAULT_DAMAGE_CONST;

    y = 900 / ((def / (FTypeEff * CTypeEff)) * defBonus);
  } else {
    FDmgBase = DEFAULT_DAMAGE_MULTIPLY * FPow * FMulti * atkBonus * (DEFAULT_WEATHER_BOOSTS ? stabMultiply : 1) * multiplyLevelFriendship;
    CDmgBase = DEFAULT_DAMAGE_MULTIPLY * CPow * CMulti * atkBonus * (DEFAULT_WEATHER_BOOSTS ? stabMultiply : 1) * multiplyLevelFriendship;

    FDmg = Math.floor((FDmgBase * atk) / DEFAULT_POKEMON_DEF_OBJ) + DEFAULT_DAMAGE_CONST;
    CDmg = Math.floor((CDmgBase * atk) / DEFAULT_POKEMON_DEF_OBJ) + DEFAULT_DAMAGE_CONST;

    y = 900 / (def * defBonus);
  }

  const fDelay = toNumber(options?.delay?.fTime);
  const cDelay = toNumber(options?.delay?.cTime);

  const FDPS = FDmg / (FDur + fDelay);
  const CDPS = CDmg / (CDur + cDelay);

  const CEPSM = CE === 100 ? 0.5 * FE + 0.5 * y * CDWS : 0;
  const FEPS = FE / (FDur + fDelay);
  const CEPS = (CE + CEPSM) / (CDur + cDelay);

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
    DPS = Math.max(0, DPS0 + ((CDPS - FDPS) / (CEPS + FEPS)) * (DEFAULT_ENERGY_PER_HP_LOST - x / toNumber(hp, 1)) * y);
  }
  return Math.max(FDPS, DPS);
};

export const calculateTDO = (
  globalOptions: IOptions | undefined,
  def: number,
  hp: number,
  dps: number,
  pokemonType = PokemonType.Normal
) => {
  pokemonType = DEFAULT_POKEMON_SHADOW ? PokemonType.Shadow : pokemonType;
  const defBonus = getDmgMultiplyBonus(pokemonType, globalOptions, TypeAction.Def);
  const y = 900 / (def * defBonus);
  return (hp / y) * dps;
};

export const calculateBattleDPSDefender = (
  globalOptions: IOptions | undefined | undefined,
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  attacker: IBattleCalculate,
  defender: IBattleCalculate
) => {
  const defPokemonType = DEFAULT_POKEMON_SHADOW ? PokemonType.Shadow : defender.pokemonType;
  const atkPokemonType = DEFAULT_POKEMON_SHADOW ? PokemonType.Shadow : attacker.pokemonType;
  const stabMultiply = STAB_MULTIPLY(globalOptions);
  const atkBonus = getDmgMultiplyBonus(defPokemonType, globalOptions, TypeAction.Atk);
  const defBonus = getDmgMultiplyBonus(atkPokemonType, globalOptions, TypeAction.Def);

  const FPowDef = toNumber(defender.fMove?.pvePower);
  const CPowDef = toNumber(defender.cMove?.pvePower);
  const CEDef = Math.abs(toNumber(defender.cMove?.pveEnergy));
  const FDurDef = toNumber(defender.fMove?.durationMs) / 1000;
  const CDurDef = toNumber(defender.cMove?.durationMs) / 1000;
  const FTypeDef = defender.fMove?.type;
  const CTypeDef = defender.cMove?.type;

  const FMultiDef = (findStabType(defender.types, FTypeDef) ? stabMultiply : 1) * toNumber(defender.fMove?.accuracyChance);
  const CMultiDef = (findStabType(defender.types, CTypeDef) ? stabMultiply : 1) * toNumber(defender.cMove?.accuracyChance);

  const lambdaMod = (CEDef / 100) * 3;
  const defDuration = lambdaMod * (FDurDef + DEFAULT_ENEMY_ATK_DELAY) + (CDurDef + DEFAULT_ENEMY_ATK_DELAY);

  const FDmgBaseDef =
    DEFAULT_DAMAGE_MULTIPLY *
    FPowDef *
    FMultiDef *
    atkBonus *
    (defender.isStab ? stabMultiply : weatherMultiple(globalOptions, weatherBoost, defender.weatherBoosts, FTypeDef));
  const CDmgBaseDef =
    DEFAULT_DAMAGE_MULTIPLY *
    CPowDef *
    CMultiDef *
    atkBonus *
    (defender.isStab ? stabMultiply : weatherMultiple(globalOptions, weatherBoost, defender.weatherBoosts, CTypeDef));

  const FTypeEff = getTypeEffective(typeEff, FTypeDef, attacker.types);
  const CTypeEff = getTypeEffective(typeEff, CTypeDef, attacker.types);

  const FDmgDef = Math.floor((FDmgBaseDef * toNumber(defender.atk) * FTypeEff) / (attacker.def * defBonus)) + DEFAULT_DAMAGE_CONST;
  const CDmgDef = Math.floor((CDmgBaseDef * toNumber(defender.atk) * CTypeEff) / (attacker.def * defBonus)) + DEFAULT_DAMAGE_CONST;

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
  const atkPokemonType = DEFAULT_POKEMON_SHADOW ? PokemonType.Shadow : attacker.pokemonType;
  const defPokemonType = DEFAULT_POKEMON_SHADOW ? PokemonType.Shadow : defender.pokemonType;
  const stabMultiply = STAB_MULTIPLY(globalOptions);
  const atkBonus = getDmgMultiplyBonus(atkPokemonType, globalOptions, TypeAction.Atk);
  const defBonus = getDmgMultiplyBonus(defPokemonType, globalOptions, TypeAction.Def);
  const multiplyLevelFriendship = MULTIPLY_LEVEL_FRIENDSHIP(globalOptions, attacker.pokemonFriendLevel);

  const FPow = toNumber(attacker.fMove?.pvePower);
  const CPow = toNumber(attacker.cMove?.pvePower);
  const FE = Math.abs(toNumber(attacker.fMove?.pveEnergy));
  const CE = Math.abs(toNumber(attacker.cMove?.pveEnergy));
  const FDur = toNumber(attacker.fMove?.durationMs) / 1000;
  const CDur = toNumber(attacker.cMove?.durationMs) / 1000;
  const FType = attacker.fMove?.type;
  const CType = attacker.cMove?.type;
  const CDWS = toNumber(attacker.cMove?.damageWindowStartMs) / 1000;

  const FMulti = (findStabType(attacker.types, FType) ? stabMultiply : 1) * toNumber(attacker.fMove?.accuracyChance);
  const CMulti = (findStabType(attacker.types, CType) ? stabMultiply : 1) * toNumber(attacker.cMove?.accuracyChance);

  const FDmgBase =
    DEFAULT_DAMAGE_MULTIPLY *
    FPow *
    FMulti *
    atkBonus *
    (attacker.isStab ? stabMultiply : weatherMultiple(globalOptions, weatherBoost, attacker.weatherBoosts, FType)) *
    (attacker.isPokemonFriend ? multiplyLevelFriendship : 1);
  const CDmgBase =
    DEFAULT_DAMAGE_MULTIPLY *
    CPow *
    CMulti *
    atkBonus *
    (attacker.isStab ? stabMultiply : weatherMultiple(globalOptions, weatherBoost, attacker.weatherBoosts, CType)) *
    (attacker.isPokemonFriend ? multiplyLevelFriendship : 1);

  const FTypeEff = getTypeEffective(typeEff, FType, defender.types);
  const CTypeEff = getTypeEffective(typeEff, CType, defender.types);

  const FDmg = Math.floor((FDmgBase * toNumber(attacker.atk) * FTypeEff) / (defender.def * defBonus)) + DEFAULT_DAMAGE_CONST;
  const CDmg = Math.floor((CDmgBase * toNumber(attacker.atk) * CTypeEff) / (defender.def * defBonus)) + DEFAULT_DAMAGE_CONST;

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
    DPS = Math.max(0, DPS0 + ((CDPS - FDPS) / (CEPS + FEPS)) * (DEFAULT_ENERGY_PER_HP_LOST - x / toNumber(attacker.hp, 1)) * DPSDef);
  }
  DPS = Math.max(FDPS, DPS);

  let DPSSec = 0;
  if (attacker.isDoubleCharge) {
    const moveSec = attacker.cMoveSec;
    const CPowSec = toNumber(moveSec?.pvePower);
    const CESec = Math.abs(toNumber(moveSec?.pveEnergy));
    const CTypeSec = moveSec?.type;
    const CDurSec = toNumber(moveSec?.durationMs) / 1000;
    const CDWSSec = toNumber(moveSec?.damageWindowStartMs) / 1000;

    const CMultiSec =
      (isIncludeList(attacker.types, CTypeSec, IncludeMode.IncludeIgnoreCaseSensitive) ? stabMultiply : 1) *
      toNumber(moveSec?.accuracyChance);

    const CDmgBaseSec =
      DEFAULT_DAMAGE_MULTIPLY *
      CPowSec *
      CMultiSec *
      atkBonus *
      weatherMultiple(globalOptions, weatherBoost, attacker.weatherBoosts, CTypeSec) *
      (attacker.isPokemonFriend ? multiplyLevelFriendship : 1);

    const CTypeEffSec = getTypeEffective(typeEff, CTypeSec, defender.types);

    const CDmgSec = Math.floor((CDmgBaseSec * toNumber(attacker.atk) * CTypeEffSec) / (defender.def * defBonus)) + DEFAULT_DAMAGE_CONST;
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
        DPS0Sec + ((CDPSSec - FDPS) / (CEPSSec + FEPS)) * (DEFAULT_ENERGY_PER_HP_LOST - xSec / toNumber(attacker.hp, 1)) * DPSDef
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
    if (value) {
      const isInclude = isIncludeList(getAllMoves(value), move?.name);
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
        const moveType = getMoveType(value, move?.name);
        dataPri.push(
          new PokemonTopMove({
            num: value.num,
            forme: value.forme,
            name: splitAndCapitalize(value.name, '-', ' '),
            baseSpecies: value.baseSpecies,
            sprite: value.sprite,
            releasedGO: value.releasedGO,
            moveType,
            dps,
            tdo,
          })
        );
      }
    }
  });
  return dataPri;
};

const queryMove = (data: QueryMovesPokemon, vf: string, cMove: string[] | undefined, fMoveType: MoveType) => {
  cMove?.forEach((vc) => {
    const mf = data.combat.find((item) => isEqual(item.name, vf));
    const mc = data.combat.find((item) => isEqual(item.name, vc));

    if (mf && mc) {
      const cMoveType = getMoveType(data.pokemon, vc);
      mf.moveType = fMoveType;
      mc.moveType = cMoveType;

      const options = OptionOtherDPS.create({
        delay: Delay.create({
          fTime: DEFAULT_ENEMY_ATK_DELAY,
          cTime: DEFAULT_ENEMY_ATK_DELAY,
        }),
        pokemonDefObj: DEFAULT_POKEMON_DEF_OBJ,
        ivAtk: MAX_IV,
        ivDef: MAX_IV,
        ivHp: MAX_IV,
        pokemonLevel: DEFAULT_POKEMON_LEVEL,
      });

      const statsAtkBattle = calculateStatsBattle(data.atk, options.ivAtk, options.pokemonLevel, true);
      const statsDefBattle = calculateStatsBattle(data.atk, options.ivDef, options.pokemonLevel, true);
      const statsStaBattle = calculateStatsBattle(data.atk, options.ivHp, options.pokemonLevel, true);

      const pokemonType = moveTypeToFormType(cMoveType);

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
        pokemonType
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
        pokemonType,
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
  pokemon: IPokemonData | undefined,
  atk: number,
  def: number,
  sta: number,
  types: string[] | undefined
) => {
  if (!pokemon) {
    return new PokemonQueryRankMove();
  }
  const data = new QueryMovesPokemon(globalOptions, typeEff, weatherBoost, combat, pokemon, atk, def, sta, types);
  pokemon.quickMoves?.forEach((vf) => setQueryMove(data, vf));
  pokemon.eliteQuickMoves?.forEach((vf) => setQueryMove(data, vf));

  return PokemonQueryRankMove.create({
    data: data.dataList,
    maxOff: Math.max(...data.dataList.map((item) => item.eDPS.offensive)),
    maxDef: Math.max(...data.dataList.map((item) => item.eDPS.defensive)),
  });
};

const setQueryMove = (data: QueryMovesPokemon, vf: string) => {
  const quickMoveType = getMoveType(data.pokemon, vf);
  queryMove(data, vf, data.pokemon.cinematicMoves, quickMoveType);
  queryMove(data, vf, data.pokemon.eliteCinematicMoves, quickMoveType);
  queryMove(data, vf, data.pokemon.shadowMoves, quickMoveType);
  queryMove(data, vf, data.pokemon.purifiedMoves, quickMoveType);
  queryMove(data, vf, data.pokemon.specialMoves, quickMoveType);
  queryMove(data, vf, data.pokemon.exclusiveMoves, quickMoveType);
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
  if (isEmpty(item.form)) {
    pokemon = pokemonData.find((value) => value.num === item.id && isEqual(value.slug, item.name, EqualMode.IgnoreCaseSensitive));
  } else {
    pokemon = pokemonData.find(
      (value) => value.num === item.id && isInclude(value.slug, item.form, IncludeMode.IncludeIgnoreCaseSensitive)
    );
  }
  if (!pokemon) {
    pokemon = pokemonData.find((value) => value.num === item.id);
  }
  const pokemonStats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);
  const dataLittle = findCPforLeague(
    pokemonStats.atk,
    pokemonStats.def,
    pokemonStats.sta,
    atkIV,
    defIV,
    staIV,
    level,
    BattleLeagueCPType.Little
  );
  const dataGreat = findCPforLeague(
    pokemonStats.atk,
    pokemonStats.def,
    pokemonStats.sta,
    atkIV,
    defIV,
    staIV,
    level,
    BattleLeagueCPType.Great
  );
  const dataUltra = findCPforLeague(
    pokemonStats.atk,
    pokemonStats.def,
    pokemonStats.sta,
    atkIV,
    defIV,
    staIV,
    level,
    BattleLeagueCPType.Ultra
  );
  const dataMaster = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level);

  const statsProd = calStatsProd(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, MIN_CP, 0, true);
  const ultraStatsProd = sortStatsProd(statsProd.filter((item) => toNumber(item.CP) <= BattleLeagueCPType.Ultra));
  const greatStatsProd = sortStatsProd(ultraStatsProd.filter((item) => toNumber(item.CP) <= BattleLeagueCPType.Great));
  const littleStatsProd = sortStatsProd(greatStatsProd.filter((item) => toNumber(item.CP) <= BattleLeagueCPType.Little));

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
        pokemonStats.sta,
        atkIV,
        defIV,
        staIV,
        level,
        little.level
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
        pokemonStats.sta,
        atkIV,
        defIV,
        staIV,
        level,
        great.level
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
        pokemonStats.sta,
        atkIV,
        defIV,
        staIV,
        level,
        ultra.level
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
        pokemonStats.sta,
        atkIV,
        defIV,
        staIV,
        level,
        master.level
      ),
    });
  }
  return new QueryStatesEvoChain({
    ...item,
    battleLeague,
    maxCP: battleLeague.master.CP,
    form: pokemon?.forme,
  });
};

const queryMoveCounter = (data: QueryMovesCounterPokemon, vf: string, cMove: string[] | undefined, fMoveType: MoveType) => {
  cMove?.forEach((vc) => {
    const mf = data.combat.find((item) => isEqual(item.name, vf));
    const mc = data.combat.find((item) => isEqual(item.name, vc));

    if (mf && mc) {
      const cMoveType = getMoveType(data.pokemon, vc);
      const options = OptionOtherDPS.create({
        objTypes: data.types,
        pokemonDefObj: calculateStatsBattle(data.def, MAX_IV, DEFAULT_POKEMON_LEVEL, true),
        ivAtk: MAX_IV,
        ivDef: MAX_IV,
        ivHp: MAX_IV,
        pokemonLevel: DEFAULT_POKEMON_LEVEL,
      });

      const pokemonType = moveTypeToFormType(cMoveType);

      const dpsOff = calculateAvgDPS(
        data.globalOptions,
        data.typeEff,
        data.weatherBoost,
        mf,
        mc,
        calculateStatsBattle(data.pokemon.baseStats.atk, options.ivAtk, options.pokemonLevel, true),
        calculateStatsBattle(data.pokemon.baseStats.def, options.ivDef, options.pokemonLevel, true),
        calculateStatsBattle(data.pokemon.baseStats.sta, options.ivHp, options.pokemonLevel, true),
        data.pokemon.types,
        pokemonType,
        options
      );

      data.dataList.push(
        new PokemonQueryCounter({
          pokemonId: data.pokemon.num,
          pokemonName: data.pokemon.name,
          pokemonForme: data.pokemon.forme,
          releasedGO: data.pokemon.releasedGO,
          dps: dpsOff,
          fMove: Combat.create({ ...mf, moveType: fMoveType }),
          cMove: Combat.create({ ...mc, moveType: cMoveType }),
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
  types: string[] | undefined,
  combat: ICombat[]
) => {
  const dataList: IPokemonQueryCounter[] = [];
  pokemonList.forEach((pokemon) => {
    if (pokemon && checkMoveSetAvailable(pokemon) && !isInclude(pokemon.fullName, '_FEMALE')) {
      const data = new QueryMovesCounterPokemon(globalOptions, typeEff, weatherBoost, combat, pokemon, def, types, dataList);
      pokemon.quickMoves?.forEach((vf) => setQueryMoveCounter(data, vf));
      pokemon.eliteQuickMoves?.forEach((vf) => setQueryMoveCounter(data, vf));
    }
  });
  return dataList
    .sort((a, b) => b.dps - a.dps)
    .map((item) => new CounterModel({ ...item, ratio: (item.dps * 100) / toNumber(dataList.at(0)?.dps, 1) }));
};

const setQueryMoveCounter = (data: QueryMovesCounterPokemon, vf: string) => {
  const fMoveType = getMoveType(data.pokemon, vf);
  queryMoveCounter(data, vf, data.pokemon.cinematicMoves, fMoveType);
  queryMoveCounter(data, vf, data.pokemon.eliteCinematicMoves, fMoveType);
  queryMoveCounter(data, vf, data.pokemon.shadowMoves, fMoveType);
  queryMoveCounter(data, vf, data.pokemon.purifiedMoves, fMoveType);
  queryMoveCounter(data, vf, data.pokemon.specialMoves, fMoveType);
  queryMoveCounter(data, vf, data.pokemon.exclusiveMoves, fMoveType);
};

export const calculateStatsTopRank = (stats: IStatsBase | undefined, id: number, maxCP: number, level = MAX_LEVEL) => {
  const atk = toNumber(stats?.atk);
  const def = toNumber(stats?.def);
  const sta = toNumber(stats?.sta);
  if (maxCP === BattleLeagueCPType.InsMaster) {
    const maxPokeCP = calculateCP(atk + MAX_IV, def + MAX_IV, sta + MAX_IV, level);
    return getBaseStatsByIVandLevel(atk, def, sta, maxPokeCP, id, level);
  } else {
    let allStats: IBattleBaseStats[] = [];
    let i = 1;
    let cp = MIN_CP;
    while (cp >= MIN_CP && !isNotEmpty(allStats)) {
      cp = maxCP - CP_DIFF_RATIO * i;
      allStats = calStatsProd(atk, def, sta, cp, maxCP);
      maxCP = cp;
      i++;
    }
    if (!isNotEmpty(allStats)) {
      return BattleBaseStats.create({ id });
    }
    return BattleBaseStats.create(allStats[allStats.length - 1]);
  }
};
