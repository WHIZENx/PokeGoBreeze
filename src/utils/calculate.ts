import { CounterModel } from '../components/Table/Counter/models/counter.model';
import { IPokemonDetail, Stats } from '../core/models/API/info.model';
import { Combat, ICombat } from '../core/models/combat.model';
import { CPMData, CPMDetail, ICPM } from '../core/models/cpm.model';
import { IEvolution } from '../core/models/evolution.model';
import { IPokemonData, PokemonData } from '../core/models/pokemon.model';
import {
  IStatsPokemon,
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
  StatsIV,
  StatsPokemonGO,
  IStatsPokemonGO,
} from '../core/models/stats.model';
import { ITypeEff } from '../core/models/type-eff.model';
import { IWeatherBoost } from '../core/models/weatherBoost.model';
import dataCPM from '../data/cp_multiplier.json';
import { MoveType, PokemonType, TypeAction, TypeMove } from '../enums/type.enum';
import { Delay, IOptionOtherDPS, OptionOtherDPS, Specific } from '../store/models/options.model';
import { findStabType } from './compute';
import { RAID_BOSS_TIER, typeCostPowerUp } from './constants';
import {
  splitAndCapitalize,
  checkMoveSetAvailable,
  getDmgMultiplyBonus,
  getMoveType,
  getAllMoves,
  moveTypeToFormType,
} from './utils';
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
  ICalculateDPS,
  CalculateDPS,
  StatsBaseCalculate,
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
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  isUndefined,
  sparseIndexOf,
  toFloat,
  toNumber,
  UniqValueInArray,
} from './extension';
import { IBattleState } from '../core/models/damage.model';
import { IArrayStats } from './models/util.model';
import { EqualMode, IncludeMode } from './enums/string.enum';
import { BattleLeagueCPType } from './enums/compute.enum';
import {
  battleStab,
  combatMaxEnergy,
  dodgeDamageReductionPercent,
  getMultiplyThrownByType,
  getMultiplyFriendship,
  maxIv,
  minIv,
  minLevel,
  maxLevel,
  formMega,
  defaultMegaMultiply,
  defaultTrainerMultiply,
  defaultEnergyPerHpLost,
  defaultPokemonShadow,
  defaultDamageMultiply,
  defaultWeatherBoosts,
  defaultDamageConst,
  defaultPokemonDefObj,
  defaultTrainerFriend,
  defaultEnemyAtkDelay,
  defaultPokemonLevel,
  cpDiffRatio,
  minCp,
  stepLevel,
} from './helpers/context.helpers';

const weatherMultiple = (
  weatherBoost: IWeatherBoost | undefined,
  weather: string | undefined,
  type: string | undefined
) =>
  (weatherBoost as unknown as DynamicObj<string[]>)[
    getValueOrDefault(String, weather?.toUpperCase().replaceAll(' ', '_'))
  ]?.find((item) => isEqual(item, type?.replaceAll(' ', '_'), EqualMode.IgnoreCaseSensitive))
    ? battleStab()
    : 1;

export const getTypeEffective = (
  typeEffective: ITypeEff | undefined,
  typeMove: string | undefined,
  typesObj: string[] | undefined
) => {
  let valueEffective = 1;
  if (!typeEffective) {
    return valueEffective;
  }
  const moveType = getValueOrDefault(String, typeMove).toUpperCase();
  typesObj?.forEach((type) => {
    type = getValueOrDefault(String, type).toUpperCase();
    valueEffective *= toNumber((typeEffective as unknown as DynamicObj<DynamicObj<number>>)[moveType][type], 1);
  });
  return valueEffective;
};

const convertStatsArray = (stats: Stats[] | undefined, name: string) =>
  toNumber(stats?.find((item) => isEqual(item.stat.name, name))?.base_stat);

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

export const sortStatsPokemon = (stats: IArrayStats[]) => {
  const attackRanking = UniqValueInArray(stats.map((item) => item.statsGO.atk)).sort((a, b) => a - b);

  const minATK = Math.min(...attackRanking);
  const maxATK = Math.max(...attackRanking);
  const attackStats = stats.map((item) =>
    StatsAtk.create({
      id: item.id,
      form: item.form,
      attack: item.statsGO?.atk,
      rank: attackRanking.length - sparseIndexOf(attackRanking, item.statsGO?.atk),
    })
  );

  const defenseRanking = UniqValueInArray(stats.map((item) => item.statsGO?.def)).sort((a, b) => a - b);

  const minDEF = Math.min(...defenseRanking);
  const maxDEF = Math.max(...defenseRanking);
  const defenseStats = stats.map((item) =>
    StatsDef.create({
      id: item.id,
      form: item.form,
      defense: item.statsGO.def,
      rank: defenseRanking.length - sparseIndexOf(defenseRanking, item.statsGO.def, 0),
    })
  );

  const staminaRanking = UniqValueInArray(stats.map((item) => item.statsGO.sta)).sort((a, b) => a - b);

  const minSTA = Math.min(...staminaRanking);
  const maxSTA = Math.max(...staminaRanking);
  const staminaStats = stats.map((item) =>
    StatsSta.create({
      id: item.id,
      form: item.form,
      stamina: item.statsGO.sta,
      rank: staminaRanking.length - sparseIndexOf(staminaRanking, item.statsGO.sta, 0),
    })
  );

  const prodRanking = UniqValueInArray(
    stats.sort((a, b) => a.statsGO.prod - b.statsGO.prod).map((item) => item.statsGO.prod)
  );

  const minPROD = Math.min(...prodRanking);
  const maxPROD = Math.max(...prodRanking);
  const prodStats = stats.map((item) =>
    StatsProd.create({
      id: item.id,
      form: item.form,
      product: item.statsGO.prod,
      rank: prodRanking.length - sparseIndexOf(prodRanking, item.statsGO.prod, 0),
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

export const calculateCP = (atk: number, def: number, sta: number, level: number) =>
  Math.floor(
    Math.max(
      minCp(),
      (atk * def ** 0.5 * sta ** 0.5 * toNumber(dataCPM.find((item: ICPM) => item.level === level)?.multiplier) ** 2) /
        10
    )
  );

export const calculateRaidStat = (stat: number | undefined, tier: number) =>
  Math.floor((toNumber(stat) + maxIv()) * RAID_BOSS_TIER[tier].CPm);

export const calculateRaidCP = (atk: number, def: number, tier: number) =>
  Math.floor(((atk + maxIv()) * Math.sqrt(def + maxIv()) * Math.sqrt(RAID_BOSS_TIER[tier].sta)) / 10);

export const calculateDmgOutput = (atk: number, dps: number) => atk * dps;

export const calculateTankiness = (def: number, HP: number) => def * HP;

export const calculateDuelAbility = (dmgOutput: number, tankiness: number) => dmgOutput * tankiness;

export const calculateCatchChance = (baseCaptureRate: number | undefined, level: number, multiplier: number) =>
  1 -
  Math.pow(
    Math.max(
      0,
      1 - toNumber(baseCaptureRate) / (2 * toNumber(dataCPM.find((item: ICPM) => item.level === level)?.multiplier))
    ),
    multiplier
  );

export const predictStat = (atk: number, def: number, sta: number, cp: string) => {
  const maxCP = toNumber(cp);
  let minLV = minLevel();
  for (let level = minLevel(); level <= maxLevel(); level += stepLevel()) {
    if (maxCP <= calculateCP(atk + maxIv(), def + maxIv(), sta + maxIv(), level)) {
      minLV = level;
      break;
    }
  }
  let maxLV = minLV + 1;
  for (let level = minLV; level <= maxLevel(); level += stepLevel()) {
    if (calculateCP(atk, def, sta, level) >= maxCP) {
      maxLV = level;
      break;
    }
  }
  const cpCache = new Map<string, number>();
  const getCachedCP = (baseAtk: number, baseDef: number, baseSta: number, level: number) => {
    const key = `${baseAtk}-${baseDef}-${baseSta}-${level}`;
    if (!cpCache.has(key)) {
      cpCache.set(key, calculateCP(baseAtk, baseDef, baseSta, level));
    }
    return cpCache.get(key);
  };

  const predictArr: IPredictStatsModel[] = [];
  for (let level = minLV; level <= maxLV; level += stepLevel()) {
    const ivCombinations = new Set<string>();
    for (let atkIV = minIv(); atkIV <= maxIv(); atkIV++) {
      for (let defIV = minIv(); defIV <= maxIv(); defIV++) {
        const minPossibleCP = getCachedCP(atk + atkIV, def + defIV, sta + minIv(), level);
        const maxPossibleCP = getCachedCP(atk + atkIV, def + defIV, sta + maxIv(), level);

        if (!minPossibleCP || !maxPossibleCP || minPossibleCP > maxCP || maxPossibleCP < maxCP) {
          continue;
        }

        for (let staIV = minIv(); staIV <= maxIv(); staIV++) {
          const currentCP = getCachedCP(atk + atkIV, def + defIV, sta + staIV, level);

          if (currentCP === maxCP) {
            const ivKey = `${atkIV}-${defIV}-${staIV}-${level}`;

            if (!ivCombinations.has(ivKey)) {
              ivCombinations.add(ivKey);

              const hp = Math.max(1, calculateStatsBattle(sta, staIV, level, true));
              const percent = toFloat(((atkIV + defIV + staIV) * 100) / (maxIv() * 3), 2);

              predictArr.push(
                PredictStatsModel.create({
                  atk: atkIV,
                  def: defIV,
                  sta: staIV,
                  level,
                  percent,
                  hp,
                })
              );
            }
          }
        }
      }
    }
  }
  return new PredictStatsCalculate(maxCP, minLV, maxLV, predictArr);
};

export const predictCPList = (atk: number, def: number, sta: number, IVatk: number, IVdef: number, IVsta: number) => {
  const predictArr: IPredictCPModel[] = [];
  for (let level = minLevel(); level <= maxLevel(); level += stepLevel()) {
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

export const calculateStats = (
  atk: number,
  def: number,
  sta: number,
  IVatk: number,
  IVdef: number,
  IVsta: number,
  cp: string
) => {
  const maxCP = toNumber(cp);
  const dataStat = new StatsCalculate(IVatk, IVdef, IVsta, maxCP, 0);

  for (let level = minLevel(); level <= maxLevel(); level += stepLevel()) {
    if (maxCP === calculateCP(atk + IVatk, def + IVdef, sta + IVsta, level)) {
      dataStat.level = level;
      break;
    }
  }
  return dataStat;
};

export const calculateStatsBattle = (base?: number, iv?: number, level?: number, floor = false, addition = 1) => {
  const result =
    (toNumber(base) + toNumber(iv)) *
    toNumber(dataCPM.find((item: ICPM) => item.level === toNumber(level))?.multiplier) *
    addition;
  if (floor) {
    return Math.floor(result);
  }
  return result;
};

export const calculateBetweenLevel = (
  atk: number,
  def: number,
  sta: number,
  IVAtk: number,
  IVDef: number,
  IVSta: number,
  fromLV: number,
  toLV: number | undefined,
  pokemonType?: PokemonType
) => {
  toLV = toNumber(toLV) - stepLevel();
  if (fromLV > toLV) {
    return new BetweenLevelCalculate({
      CP: calculateCP(atk + IVAtk, def + IVDef, sta + IVSta, toLV + stepLevel()),
      resultBetweenStardust: 0,
      resultBetweenCandy: 0,
      resultBetweenXLCandy: 0,
      powerUpCount: 0,
    });
  } else {
    const powerUpCount = (toLV - fromLV) * 2;
    let betweenStardust = 0;
    let betweenCandy = 0;
    let betweenXlCandy = 0;

    let betweenStardustDiff = 0;
    let betweenCandyDiff = 0;
    let betweenXlCandyDiff = 0;

    const typeCost = typeCostPowerUp(pokemonType);
    dataCPM.forEach((ele: CPMData) => {
      const result = CPMDetail.mapping(ele);
      if (ele.level >= fromLV && ele.level <= toNumber(toLV)) {
        betweenStardust += Math.ceil(result.stardust * typeCost.stardust);
        betweenCandy += Math.ceil(result.candy * typeCost.candy);
        betweenXlCandy += Math.ceil(result.xlCandy * typeCost.candy);
        betweenStardustDiff += Math.abs(result.stardust - Math.ceil(result.stardust * typeCost.stardust));
        betweenCandyDiff += Math.abs(result.candy - Math.ceil(result.candy * typeCost.candy));
        betweenXlCandyDiff += Math.abs(result.xlCandy - Math.ceil(result.xlCandy * typeCost.candy));
      }
    });

    const dataList = new BetweenLevelCalculate({
      CP: calculateCP(atk + IVAtk, def + IVDef, sta + IVSta, toLV + stepLevel()),
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
      const atkStat = calculateStatsBattle(
        atk,
        IVAtk,
        toLV + stepLevel(),
        true,
        getDmgMultiplyBonus(pokemonType, TypeAction.Atk)
      );
      const defStat = calculateStatsBattle(
        def,
        IVDef,
        toLV + stepLevel(),
        true,
        getDmgMultiplyBonus(pokemonType, TypeAction.Def)
      );

      const atkStatDiff = Math.abs(calculateStatsBattle(atk, IVAtk, toLV + stepLevel(), true) - atkStat);
      const defStatDiff = Math.abs(calculateStatsBattle(def, IVDef, toLV + stepLevel(), true) - defStat);

      dataList.atkStat = atkStat;
      dataList.defStat = defStat;
      dataList.atkStatDiff = atkStatDiff;
      dataList.defStatDiff = defStatDiff;
    }

    return dataList;
  }
};

export const calculateBattleLeague = (
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
  let level = maxLevel();
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
      for (let l = minLevel(); l <= level; l += stepLevel()) {
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

    const atkStat = calculateStatsBattle(atk, IVatk, dataBattle.level, true, getDmgMultiplyBonus(type, TypeAction.Atk));
    const defStat = calculateStatsBattle(def, IVdef, dataBattle.level, true, getDmgMultiplyBonus(type, TypeAction.Def));

    dataBattle.rangeValue = calculateBetweenLevel(atk, def, sta, IVatk, IVdef, IVsta, fromLV, dataBattle.level, type);
    dataBattle.stats = StatsPokemonGO.create(
      atkStat,
      defStat,
      calculateStatsBattle(sta, IVsta, dataBattle.level, true)
    );
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
  let CP = minCp();
  let currentLevel = level;
  for (let l = level; l <= maxLevel(); l += stepLevel()) {
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
  data = data.sort((a, b) => toNumber(a.stats?.statPROD) - toNumber(b.stats?.statPROD));
  return data.map((item, index) =>
    BattleBaseStats.create({
      ...item,
      ratio: (toNumber(item.stats?.statPROD) * 100) / toNumber(data[data.length - 1]?.stats?.statPROD, 1),
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

export const calStatsProd = (atk: number, def: number, sta: number, minCp: number, maxCP: number, isPure = false) => {
  const dataList: IBattleBaseStats[] = [];
  if (atk === 0 || def === 0 || sta === 0) {
    return dataList;
  }
  const cpCache = new Map<string, number>();
  const getCachedCP = (baseAtk: number, baseDef: number, baseSta: number, level: number) => {
    const key = `${baseAtk}-${baseDef}-${baseSta}-${level}`;
    if (!cpCache.has(key)) {
      cpCache.set(key, calculateCP(baseAtk, baseDef, baseSta, level));
    }
    return cpCache.get(key);
  };

  let seqId = 0;
  let minLV = minLevel();
  let maxLV = maxLevel();

  if (maxCP > 0) {
    for (let level = minLV; level <= maxLV; level += stepLevel()) {
      const maxPossibleCP = getCachedCP(atk + maxIv(), def + maxIv(), sta + maxIv(), level);
      if (!isUndefined(maxPossibleCP) && maxPossibleCP > maxCP) {
        maxLV = level - stepLevel();
        break;
      }
    }
  }

  if (minCp > 0) {
    for (let level = minLV; level <= maxLV; level += stepLevel()) {
      const minPossibleCP = getCachedCP(atk + minIv(), def + minIv(), sta + minIv(), level);
      if (!isUndefined(minPossibleCP) && minPossibleCP >= minCp) {
        minLV = level;
        break;
      }
    }
  }

  for (let level = minLV; level <= maxLV; level += stepLevel()) {
    const minLevelCP = getCachedCP(atk + minIv(), def + minIv(), sta + minIv(), level);
    const maxLevelCP = getCachedCP(atk + maxIv(), def + maxIv(), sta + maxIv(), level);

    if (
      (maxCP > 0 && !isUndefined(minLevelCP) && minLevelCP > maxCP) ||
      (minCp > 0 && !isUndefined(maxLevelCP) && maxLevelCP < minCp)
    ) {
      continue;
    }

    for (let atkIV = minIv(); atkIV <= maxIv(); ++atkIV) {
      for (let defIV = minIv(); defIV <= maxIv(); ++defIV) {
        const minAtkDefCP = getCachedCP(atk + atkIV, def + defIV, sta + minIv(), level);
        const maxAtkDefCP = getCachedCP(atk + atkIV, def + defIV, sta + maxIv(), level);

        if (
          (maxCP > 0 && !isUndefined(minAtkDefCP) && minAtkDefCP > maxCP) ||
          (minCp > 0 && !isUndefined(maxAtkDefCP) && maxAtkDefCP < minCp)
        ) {
          continue;
        }

        for (let staIV = minIv(); staIV <= maxIv(); ++staIV) {
          const cp = getCachedCP(atk + atkIV, def + defIV, sta + staIV, level);

          if (!isUndefined(cp) && (minCp === 0 || minCp <= cp) && (maxCP === 0 || cp <= maxCP)) {
            dataList.push(getBaseStatsByIVandLevel(atk, def, sta, cp, seqId, level, atkIV, defIV, staIV));
            seqId++;
          } else if (maxCP > 0 && !isUndefined(cp) && cp > maxCP) {
            break;
          }
        }
      }
    }
  }

  return isPure ? dataList : sortStatsProd(dataList);
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

export const calculateDamagePVE = (
  atk: number,
  defObj: number,
  power: number,
  battleState: IBattleState | undefined,
  notPure?: boolean,
  isStab?: boolean
) => {
  const stabMultiply = battleStab();
  let modifier = 0;
  if (battleState) {
    const isStab = battleState.isStab ? stabMultiply : 1;
    const isWb = battleState.isWb ? stabMultiply : 1;
    const isDodge = battleState.isDodge ? 1 - dodgeDamageReductionPercent() : 1;
    const isMega = battleState.isMega ? (battleState.isStab ? stabMultiply : defaultMegaMultiply()) : 1;
    const isTrainer = battleState.isTrainer ? defaultTrainerMultiply() : 1;
    const multiplyLevelFriendship = getMultiplyFriendship(battleState.friendshipLevel);
    const multiplyThrowCharge = getMultiplyThrownByType(battleState.throwLevel);
    modifier =
      isStab *
      isWb *
      multiplyLevelFriendship *
      isDodge *
      multiplyThrowCharge *
      isMega *
      isTrainer *
      battleState.effective;
  } else {
    modifier = isStab ? stabMultiply : 1;
  }
  const result = 0.5 * power * (atk / defObj) * modifier;
  if (notPure) {
    return result + 1;
  }
  return Math.floor(result) + 1;
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

const calculateDPS = (data: ICalculateDPS, specific?: Specific) => {
  const fastDPS = data.fastDamage / toNumber(data.fastDuration + toNumber(data.fastDelay), 1);
  const chargeDPS = data.chargeDamage / toNumber(data.chargeDuration + toNumber(data.chargeDelay), 1);

  const chargeEnergy =
    data.chargeEnergy === combatMaxEnergy() ? 0.5 * data.fastEnergy + 0.5 * data.y * data.chargeDamageWindowStart : 0;
  const fastEnergyPerSec = data.fastEnergy / toNumber(data.fastDuration + toNumber(data.fastDelay), 1);
  const chargeEnergyPerSec =
    (data.chargeEnergy + chargeEnergy) / toNumber(data.chargeDuration + toNumber(data.chargeDelay), 1);

  let x = 0.5 * data.chargeEnergy + 0.5 * data.fastEnergy;
  if (specific) {
    const bar = getBarCharge(data.chargeEnergy, true);
    const λ = 3 / toNumber(bar, 1);
    x += 0.5 * λ * specific.FDmgEnemy + specific.CDmgEnemy * λ + 1;
  }

  const baseDPS =
    (fastDPS * chargeEnergyPerSec + chargeDPS * fastEnergyPerSec) / toNumber(chargeEnergyPerSec + fastEnergyPerSec, 1);

  let DPS = 0;
  if (fastDPS > chargeDPS) {
    DPS = baseDPS;
  } else {
    DPS = Math.max(
      0,
      baseDPS +
        ((chargeDPS - fastDPS) / toNumber(chargeEnergyPerSec + fastEnergyPerSec, 1)) *
          (defaultEnergyPerHpLost() - x / toNumber(data.hp, 1)) *
          data.y
    );
  }
  return Math.max(fastDPS, DPS);
};

export const calculateAvgDPS = (
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
  pokemonType = defaultPokemonShadow() ? PokemonType.Shadow : pokemonType;
  const stabMultiply = battleStab();
  const atkBonus = getDmgMultiplyBonus(pokemonType, TypeAction.Atk);
  const defBonus = getDmgMultiplyBonus(pokemonType, TypeAction.Def);
  const multiplyLevelFriendship =
    defaultTrainerFriend() || options?.isTrainerFriend ? getMultiplyFriendship(options?.pokemonFriendLevel) : 1;

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
      defaultDamageMultiply() *
      FPow *
      FMulti *
      atkBonus *
      weatherMultiple(weatherBoost, options.weatherBoosts, FType) *
      multiplyLevelFriendship;
    CDmgBase =
      defaultDamageMultiply() *
      CPow *
      CMulti *
      atkBonus *
      weatherMultiple(weatherBoost, options.weatherBoosts, CType) *
      multiplyLevelFriendship;

    const FTypeEff = getTypeEffective(typeEff, FType, options.objTypes);
    const CTypeEff = getTypeEffective(typeEff, CType, options.objTypes);

    FDmg = Math.floor((FDmgBase * atk * FTypeEff) / options.pokemonDefObj) + defaultDamageConst();
    CDmg = Math.floor((CDmgBase * atk * CTypeEff) / options.pokemonDefObj) + defaultDamageConst();

    y = 900 / ((def / (FTypeEff * CTypeEff)) * defBonus);
  } else {
    FDmgBase =
      defaultDamageMultiply() *
      FPow *
      FMulti *
      atkBonus *
      (defaultWeatherBoosts() ? stabMultiply : 1) *
      multiplyLevelFriendship;
    CDmgBase =
      defaultDamageMultiply() *
      CPow *
      CMulti *
      atkBonus *
      (defaultWeatherBoosts() ? stabMultiply : 1) *
      multiplyLevelFriendship;

    FDmg = Math.floor((FDmgBase * atk) / defaultPokemonDefObj()) + defaultDamageConst();
    CDmg = Math.floor((CDmgBase * atk) / defaultPokemonDefObj()) + defaultDamageConst();

    y = 900 / (def * defBonus);
  }

  return calculateDPS(
    new CalculateDPS({
      fastDamage: FDmg,
      chargeDamage: CDmg,
      fastDuration: FDur,
      fastDelay: options?.delay?.fTime,
      chargeDuration: CDur,
      chargeDelay: options?.delay?.cTime,
      fastEnergy: FE,
      chargeEnergy: CE,
      chargeDamageWindowStart: CDWS,
      y,
      hp,
    }),
    options?.specific
  );
};

export const calculateTDO = (def: number, hp: number, dps: number, pokemonType = PokemonType.Normal) => {
  pokemonType = defaultPokemonShadow() ? PokemonType.Shadow : pokemonType;
  const defBonus = getDmgMultiplyBonus(pokemonType, TypeAction.Def);
  const y = 900 / (def * defBonus);
  return (hp / y) * dps;
};

export const calculateBattleDPSDefender = (
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  attacker: IBattleCalculate,
  defender: IBattleCalculate
) => {
  const defPokemonType = defaultPokemonShadow() ? PokemonType.Shadow : defender.pokemonType;
  const atkPokemonType = defaultPokemonShadow() ? PokemonType.Shadow : attacker.pokemonType;
  const stabMultiply = battleStab();
  const atkBonus = getDmgMultiplyBonus(defPokemonType, TypeAction.Atk);
  const defBonus = getDmgMultiplyBonus(atkPokemonType, TypeAction.Def);

  const FPowDef = toNumber(defender.fMove?.pvePower);
  const CPowDef = toNumber(defender.cMove?.pvePower);
  const CEDef = Math.abs(toNumber(defender.cMove?.pveEnergy));
  const FDurDef = toNumber(defender.fMove?.durationMs) / 1000;
  const CDurDef = toNumber(defender.cMove?.durationMs) / 1000;
  const FTypeDef = defender.fMove?.type;
  const CTypeDef = defender.cMove?.type;

  const FMultiDef =
    (findStabType(defender.types, FTypeDef) ? stabMultiply : 1) * toNumber(defender.fMove?.accuracyChance);
  const CMultiDef =
    (findStabType(defender.types, CTypeDef) ? stabMultiply : 1) * toNumber(defender.cMove?.accuracyChance);

  const lambdaMod = (CEDef / 100) * 3;
  const defDuration = lambdaMod * (FDurDef + defaultEnemyAtkDelay()) + (CDurDef + defaultEnemyAtkDelay());

  const FDmgBaseDef =
    defaultDamageMultiply() *
    FPowDef *
    FMultiDef *
    atkBonus *
    (defender.isStab ? stabMultiply : weatherMultiple(weatherBoost, defender.weatherBoosts, FTypeDef));
  const CDmgBaseDef =
    defaultDamageMultiply() *
    CPowDef *
    CMultiDef *
    atkBonus *
    (defender.isStab ? stabMultiply : weatherMultiple(weatherBoost, defender.weatherBoosts, CTypeDef));

  const FTypeEff = getTypeEffective(typeEff, FTypeDef, attacker.types);
  const CTypeEff = getTypeEffective(typeEff, CTypeDef, attacker.types);

  const FDmgDef =
    Math.floor((FDmgBaseDef * toNumber(defender.atk) * FTypeEff) / (attacker.def * defBonus)) + defaultDamageConst();
  const CDmgDef =
    Math.floor((CDmgBaseDef * toNumber(defender.atk) * CTypeEff) / (attacker.def * defBonus)) + defaultDamageConst();

  const DefDmg = lambdaMod * FDmgDef + CDmgDef;
  return DefDmg / defDuration;
};

export const calculateBattleDPS = (
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  attacker: IBattleCalculate,
  defender: IBattleCalculate,
  DPSDef: number
) => {
  const atkPokemonType = defaultPokemonShadow() ? PokemonType.Shadow : attacker.pokemonType;
  const defPokemonType = defaultPokemonShadow() ? PokemonType.Shadow : defender.pokemonType;
  const stabMultiply = battleStab();
  const atkBonus = getDmgMultiplyBonus(atkPokemonType, TypeAction.Atk);
  const defBonus = getDmgMultiplyBonus(defPokemonType, TypeAction.Def);
  const multiplyLevelFriendship = getMultiplyFriendship(attacker.pokemonFriendLevel);

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
    defaultDamageMultiply() *
    FPow *
    FMulti *
    atkBonus *
    (attacker.isStab ? stabMultiply : weatherMultiple(weatherBoost, attacker.weatherBoosts, FType)) *
    (attacker.isPokemonFriend ? multiplyLevelFriendship : 1);
  const CDmgBase =
    defaultDamageMultiply() *
    CPow *
    CMulti *
    atkBonus *
    (attacker.isStab ? stabMultiply : weatherMultiple(weatherBoost, attacker.weatherBoosts, CType)) *
    (attacker.isPokemonFriend ? multiplyLevelFriendship : 1);

  const FTypeEff = getTypeEffective(typeEff, FType, defender.types);
  const CTypeEff = getTypeEffective(typeEff, CType, defender.types);

  const FDmg =
    Math.floor((FDmgBase * toNumber(attacker.atk) * FTypeEff) / (defender.def * defBonus)) + defaultDamageConst();
  const CDmg =
    Math.floor((CDmgBase * toNumber(attacker.atk) * CTypeEff) / (defender.def * defBonus)) + defaultDamageConst();

  const DPS = calculateDPS(
    new CalculateDPS({
      fastDamage: FDmg,
      chargeDamage: CDmg,
      fastDuration: FDur,
      chargeDuration: CDur,
      fastEnergy: FE,
      chargeEnergy: CE,
      chargeDamageWindowStart: CDWS,
      y: DPSDef,
      hp: attacker?.hp,
    })
  );

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
      defaultDamageMultiply() *
      CPowSec *
      CMultiSec *
      atkBonus *
      weatherMultiple(weatherBoost, attacker.weatherBoosts, CTypeSec) *
      (attacker.isPokemonFriend ? multiplyLevelFriendship : 1);

    const CTypeEffSec = getTypeEffective(typeEff, CTypeSec, defender.types);

    const CDmgSec =
      Math.floor((CDmgBaseSec * toNumber(attacker.atk) * CTypeEffSec) / (defender.def * defBonus)) +
      defaultDamageConst();
    DPSSec = calculateDPS(
      new CalculateDPS({
        fastDamage: FDmg,
        chargeDamage: CDmgSec,
        fastDuration: FDur,
        chargeDuration: CDurSec,
        fastEnergy: FE,
        chargeEnergy: CESec,
        chargeDamageWindowStart: CDWSSec,
        y: DPSDef,
        hp: attacker?.hp,
      })
    );
  }
  return Math.max(DPS, DPSSec);
};

export const TimeToKill = (hp: number, dpsDef: number) => hp / dpsDef;

export const queryTopMove = (
  pokemonList: IPokemonData[] | undefined,
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  move: ICombat | undefined
) => {
  const dataPri: IPokemonTopMove[] = [];
  if (move) {
    pokemonList?.forEach((pokemon) => {
      if (pokemon) {
        let name = move.name;
        if (move.isMultipleWithType) {
          name = move.name.replace(`_${move.type}`, '');
        }
        const moveType = getMoveType(pokemon, name);
        if (!isEqual(moveType, MoveType.Unavailable)) {
          const stats = calculateStatsByTag(pokemon, pokemon.baseStats, pokemon.slug);
          const statsAtkBattle = calculateStatsBattle(stats.atk, maxIv(), defaultPokemonLevel());
          const statsDefBattle = calculateStatsBattle(stats.def, maxIv(), defaultPokemonLevel());
          const statsStaBattle = calculateStatsBattle(stats.sta, maxIv(), defaultPokemonLevel());
          const dps = calculateAvgDPS(
            typeEff,
            weatherBoost,
            move,
            move,
            statsAtkBattle,
            statsDefBattle,
            statsStaBattle,
            pokemon.types
          );
          const tdo = calculateTDO(statsDefBattle, statsStaBattle, dps);

          dataPri.push(
            new PokemonTopMove({
              num: pokemon.num,
              form: pokemon.form,
              name: splitAndCapitalize(pokemon.name, '-', ' '),
              baseSpecies: pokemon.baseSpecies,
              sprite: pokemon.sprite,
              releasedGO: pokemon.releasedGO,
              moveType,
              dps,
              tdo,
            })
          );
        }
      }
    });
  }
  return dataPri;
};

const queryMove = (data: QueryMovesPokemon, mf: ICombat, cMove: string[], fMoveType: MoveType) => {
  cMove.forEach((vc) => {
    const mc = data.combats.find((item) => isEqual(item.name, vc));

    if (mc) {
      const cMoveType = getMoveType(data.pokemon, vc);
      if (!isEqual(cMoveType, MoveType.Dynamax)) {
        mf.moveType = fMoveType;
        mc.moveType = cMoveType;

        const options = OptionOtherDPS.create({
          delay: Delay.create({
            fTime: defaultEnemyAtkDelay(),
            cTime: defaultEnemyAtkDelay(),
          }),
          pokemonDefObj: defaultPokemonDefObj(),
          ivAtk: maxIv(),
          ivDef: maxIv(),
          ivHp: maxIv(),
          pokemonLevel: defaultPokemonLevel(),
        });

        const statsAtkBattle = calculateStatsBattle(data.atk, options.ivAtk, options.pokemonLevel, true);
        const statsDefBattle = calculateStatsBattle(data.def, options.ivDef, options.pokemonLevel, true);
        const statsStaBattle = calculateStatsBattle(data.sta, options.ivHp, options.pokemonLevel, true);

        const pokemonType = moveTypeToFormType(cMoveType);

        const offensive = calculateAvgDPS(
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
    }
  });
};

export const rankMove = (
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  combats: ICombat[],
  pokemon: Partial<IPokemonDetail> | undefined,
  atk: number | undefined,
  def: number | undefined,
  sta: number | undefined,
  types: string[] | undefined
) => {
  if (!pokemon) {
    return new PokemonQueryRankMove();
  }
  const data = new QueryMovesPokemon(typeEff, weatherBoost, combats, pokemon, atk, def, sta, types);
  const fastMoveSet = getAllMoves(pokemon, TypeMove.Fast);
  const chargedMoveSet = getAllMoves(pokemon, TypeMove.Charge);
  setQueryMove(data, fastMoveSet, chargedMoveSet);

  return PokemonQueryRankMove.create({
    data: data.dataList,
    maxOff: Math.max(...data.dataList.map((item) => item.eDPS.offensive)),
    maxDef: Math.max(...data.dataList.map((item) => item.eDPS.defensive)),
  });
};

const setQueryMove = (data: QueryMovesPokemon, fastMoveSet: string[], chargedMoveSet: string[]) => {
  fastMoveSet.forEach((vf) => {
    const fMove = data.combats.find((item) => isEqual(item.name, vf));
    if (!fMove) {
      return;
    }
    const quickMoveType = getMoveType(data.pokemon, vf);
    queryMove(data, fMove, chargedMoveSet, quickMoveType);
  });
};

export const queryStatesEvoChain = (
  pokemonData: IPokemonData[],
  item: IEvolution,
  level: number,
  atkIV: number,
  defIV: number,
  staIV: number
) => {
  let pokemon: IPokemonData | undefined = new PokemonData();
  if (!item.form) {
    pokemon = pokemonData.find(
      (value) => value.num === item.id && isEqual(value.slug, item.name, EqualMode.IgnoreCaseSensitive)
    );
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

  const statsProd = calStatsProd(
    pokemonStats.atk,
    pokemonStats.def,
    pokemonStats.sta,
    minCp(),
    BattleLeagueCPType.Master,
    true
  );
  const ultraStatsProd = sortStatsProd(statsProd.filter((item) => toNumber(item.CP) <= BattleLeagueCPType.Ultra));
  const greatStatsProd = sortStatsProd(ultraStatsProd.filter((item) => toNumber(item.CP) <= BattleLeagueCPType.Great));
  const littleStatsProd = sortStatsProd(
    greatStatsProd.filter((item) => toNumber(item.CP) <= BattleLeagueCPType.Little)
  );

  const little = littleStatsProd.find(
    (item) =>
      item.level === dataLittle.level &&
      item.CP === dataLittle.CP &&
      item.IV &&
      item.IV.atkIV === atkIV &&
      item.IV.defIV === defIV &&
      item.IV.staIV === staIV
  );
  const great = greatStatsProd.find(
    (item) =>
      item.level === dataGreat.level &&
      item.CP === dataGreat.CP &&
      item.IV &&
      item.IV.atkIV === atkIV &&
      item.IV.defIV === defIV &&
      item.IV.staIV === staIV
  );
  const ultra = ultraStatsProd.find(
    (item) =>
      item.level === dataUltra.level &&
      item.CP === dataUltra.CP &&
      item.IV &&
      item.IV.atkIV === atkIV &&
      item.IV.defIV === defIV &&
      item.IV.staIV === staIV
  );
  const master = sortStatsProd(statsProd).find(
    (item) =>
      item.level === dataMaster.level &&
      item.CP === dataMaster.CP &&
      item.IV &&
      item.IV.atkIV === atkIV &&
      item.IV.defIV === defIV &&
      item.IV.staIV === staIV
  );

  const battleLeague = new BattleLeague();

  if (little) {
    battleLeague.little = BattleBaseStats.create({
      ...little,
      ...calculateBetweenLevel(
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
    form: pokemon?.form,
  });
};

const queryMoveCounter = (data: QueryMovesCounterPokemon, mf: ICombat, cMove: string[], fMoveType: MoveType) => {
  cMove.forEach((vc) => {
    const mc = data.combats.find((item) => isEqual(item.name, vc));

    if (mc) {
      const cMoveType = getMoveType(data.pokemon, vc);
      if (!isEqual(cMoveType, MoveType.Dynamax)) {
        const options = OptionOtherDPS.create({
          objTypes: data.types,
          pokemonDefObj: calculateStatsBattle(data.def, maxIv(), defaultPokemonLevel(), true),
          ivAtk: maxIv(),
          ivDef: maxIv(),
          ivHp: maxIv(),
          pokemonLevel: defaultPokemonLevel(),
        });

        const pokemonType = moveTypeToFormType(cMoveType);

        const dpsOff = calculateAvgDPS(
          data.typeEff,
          data.weatherBoost,
          mf,
          mc,
          calculateStatsBattle(data.pokemon.statsGO.atk, options.ivAtk, options.pokemonLevel, true),
          calculateStatsBattle(data.pokemon.statsGO.def, options.ivDef, options.pokemonLevel, true),
          calculateStatsBattle(data.pokemon.statsGO.sta, options.ivHp, options.pokemonLevel, true),
          data.pokemon.types,
          pokemonType,
          options
        );

        data.dataList.push(
          new PokemonQueryCounter({
            pokemonId: data.pokemon.num,
            pokemonName: data.pokemon.name,
            pokemonForm: data.pokemon.form,
            releasedGO: data.pokemon.releasedGO,
            dps: dpsOff,
            fMove: Combat.create({ ...mf, moveType: fMoveType }),
            cMove: Combat.create({ ...mc, moveType: cMoveType }),
          })
        );
      }
    }
  });
};

export const counterPokemon = (
  pokemonList: IPokemonData[],
  typeEff: ITypeEff | undefined,
  weatherBoost: IWeatherBoost | undefined,
  def: number,
  types: string[] | undefined,
  combats: ICombat[]
) => {
  const dataList: IPokemonQueryCounter[] = [];
  pokemonList.forEach((pokemon) => {
    if (
      checkMoveSetAvailable(pokemon) &&
      !isInclude(pokemon.fullName, '_FEMALE') &&
      !isEqual(pokemon.pokemonType, PokemonType.GMax)
    ) {
      const data = new QueryMovesCounterPokemon(typeEff, weatherBoost, combats, pokemon, def, types, dataList);
      const fastMoveSet = getAllMoves(pokemon, TypeMove.Fast);
      const chargedMoveSet = getAllMoves(pokemon, TypeMove.Charge);
      setQueryMoveCounter(data, fastMoveSet, chargedMoveSet);
    }
  });
  return dataList
    .sort((a, b) => b.dps - a.dps)
    .map((item) => new CounterModel({ ...item, ratio: (item.dps * 100) / toNumber(dataList.at(0)?.dps, 1) }));
};

const setQueryMoveCounter = (data: QueryMovesCounterPokemon, fastMoveSet: string[], chargedMoveSet: string[]) => {
  fastMoveSet.forEach((vf) => {
    const fMove = data.combats.find((item) => isEqual(item.name, vf));
    if (!fMove) {
      return;
    }
    const fMoveType = getMoveType(data.pokemon, vf);
    queryMoveCounter(data, fMove, chargedMoveSet, fMoveType);
  });
};

export const calculateStatsTopRank = (
  stats: IStatsPokemonGO | undefined,
  id: number,
  maxCP: number,
  level = maxLevel()
) => {
  if (!stats) {
    stats = new StatsPokemonGO();
  }
  const atk = stats.atk;
  const def = stats.def;
  const sta = stats.sta;
  if (maxCP > BattleLeagueCPType.Ultra) {
    const maxPokeCP = calculateCP(atk + maxIv(), def + maxIv(), sta + maxIv(), level);
    return getBaseStatsByIVandLevel(atk, def, sta, maxPokeCP, id, level);
  } else {
    let allStats: IBattleBaseStats[] = [];
    let i = 1;
    let cp = minCp();
    while (cp >= minCp() && !isNotEmpty(allStats)) {
      cp = maxCP - cpDiffRatio() * i;
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
