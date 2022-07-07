import data from "../data/cp_multiplier.json";
import combat from '../data/combat.json';
import pokemonData from '../data/pokemon.json';
import pokemonCombatList from "../data/combat_pokemon_go_list.json";
import typeEffective from "../data/type_effectiveness.json";
import weatherBoosts from '../data/weather_boosts.json';
import { DEFAULT_DAMAGE_CONST, DEFAULT_DAMAGE_MULTIPLY, DEFAULT_ENEMY_ATK_DELAY, DEFAULT_ENERYGY_PER_HP_LOST, DEFAULT_POKEMON_DEF_OBJ, DEFAULT_POKEMON_FRIEND_LEVEL, DEFAULT_POKEMON_SHADOW, DEFAULT_TRAINER_FRIEND, DEFAULT_WEATHER_BOOSTS, MAX_IV, MAX_LEVEL, MIN_IV, MIN_LEVEL, RAID_BOSS_TIER, SHADOW_ATK_BONUS, SHADOW_DEF_BONUS, STAB_MULTIPLY, typeCostPowerUp } from "./Constants";
import { getOption } from "../options/options";
import { capitalize, convertName, splitAndCapitalize } from "./Utils";

const getMultiFriendshipMulti = (level) => {
    return getOption("trainer_friendship", level.toString(), "atk_bonus");
}

const weatherMultiple = (weather, type) => {
    return weatherBoosts[weather].find(item => item === capitalize(type.toLowerCase())) ? STAB_MULTIPLY : 1;
}

export const getTypeEffective = (typeMove, typesObj) => {
    let value_effective = 1;
    typesObj.forEach(type => {
        try {value_effective *= typeEffective[capitalize(typeMove.toLowerCase())][capitalize(type.type.name.toLowerCase())];}
        catch {value_effective *= typeEffective[capitalize(typeMove.toLowerCase())][capitalize(type.toLowerCase())];}
    });
    return value_effective;
}

/* Thank algorithm from pokemongohub.net */
export const calBaseATK = (stats, nerf) => {
    const atk = stats.atk ?? stats.find(item => item.stat.name === "attack").base_stat;
    const spa = stats.spa ?? stats.find(item => item.stat.name === "special-attack").base_stat;

    const lower = Math.min(atk, spa);
    const higher = Math.max(atk, spa);

    const speed = stats.spe ?? stats.find(item => item.stat.name === "speed").base_stat;

    const scaleATK = Math.round(2*((7/8)*higher+(1/8)*lower));
    const speedMod = 1+(speed-75)/500;
    const baseATK = Math.round(scaleATK * speedMod);
    if (!nerf) return baseATK;
    if (calculateCP(baseATK+15, calBaseDEF(stats, false)+15, calBaseSTA(stats, false)+15, 40) >= 4000) return Math.round(scaleATK * speedMod * 0.91);
    else return baseATK;
}

export const calBaseDEF = (stats, nerf) => {
    const def = stats.def ?? stats.find(item => item.stat.name === "defense").base_stat;
    const spd = stats.spd ?? stats.find(item => item.stat.name === "special-defense").base_stat;

    const lower = Math.min(def, spd);
    const higher = Math.max(def, spd);

    const speed = stats.spe ?? stats.find(item => item.stat.name === "speed").base_stat;

    const scaleDEF = Math.round(2*((5/8)*higher+(3/8)*lower));
    const speedMod = 1+(speed-75)/500;
    const baseDEF = Math.round(scaleDEF * speedMod);
    if (!nerf) return baseDEF;
    if (calculateCP(calBaseATK(stats, false)+15, baseDEF+15, calBaseSTA(stats, false)+15, 40) >= 4000) return Math.round(scaleDEF * speedMod * 0.91);
    else return baseDEF;
}

export const calBaseSTA = (stats, nerf) => {
    const hp = stats.hp ?? stats.find(item => item.stat.name === "hp").base_stat;

    const baseSTA = Math.floor(hp * 1.75 + 50);
    if (!nerf) return baseSTA;
    if (calculateCP(calBaseATK(stats, false)+15, calBaseDEF(stats, false)+15, baseSTA+15, 40) >= 4000) return Math.round((hp * 1.75 + 50) * 0.91);
    else return baseSTA;
}

export const sortStatsPokemon = (states) => {
    const attackRanking = Array.from(new Set(states.sort((a,b) => a.baseStatsPokeGo.attack - b.baseStatsPokeGo.attack)
    .map(item => {
        return item.baseStatsPokeGo.attack;
    })));

    const minATK = Math.min(...attackRanking);
    const maxATK = Math.max(...attackRanking);
    const attackStats = states.map((item) => {
        return {id: item.id, form: item.name.split("-")[1] ? item.name.slice(item.name.indexOf("-")+1, item.name.length) : "Normal", attack: item.baseStatsPokeGo.attack, rank: attackRanking.length-attackRanking.indexOf(item.baseStatsPokeGo.attack)};
    });

    const defenseRanking = Array.from(new Set(states.sort((a,b) => a.baseStatsPokeGo.defense - b.baseStatsPokeGo.defense)
    .map(item => {
        return item.baseStatsPokeGo.defense;
    })));

    const minDEF = Math.min(...defenseRanking);
    const maxDEF = Math.max(...defenseRanking);
    const defenseStats = states.map((item) => {
        return {id: item.id, form: item.name.split("-")[1] ? item.name.slice(item.name.indexOf("-")+1, item.name.length) : "Normal", defense: item.baseStatsPokeGo.defense, rank: defenseRanking.length-defenseRanking.indexOf(item.baseStatsPokeGo.defense)};
    });

    const staminaRanking = Array.from(new Set(states.sort((a,b) => a.baseStatsPokeGo.stamina - b.baseStatsPokeGo.stamina)
    .map(item => {
        return item.baseStatsPokeGo.stamina;
    })));

    const minSTA = Math.min(...staminaRanking);
    const maxSTA = Math.max(...staminaRanking);
    const staminaStats = states.map((item) => {
        return {id: item.id, form: item.name.split("-")[1] ? item.name.slice(item.name.indexOf("-")+1, item.name.length) : "Normal", stamina: item.baseStatsPokeGo.stamina, rank: staminaRanking.length-staminaRanking.indexOf(item.baseStatsPokeGo.stamina)};
    });

    return {
        "attack": {
            "ranking": attackStats,
            "min_rank": 1,
            "max_rank": attackRanking.length,
            "min_stats": minATK,
            "max_stats": maxATK
        },
        "defense": {
            "ranking": defenseStats,
            "min_rank": 1,
            "max_rank": defenseRanking.length,
            "min_stats": minDEF,
            "max_stats": maxDEF
        },
        "stamina": {
            "ranking": staminaStats,
            "min_rank": 1,
            "max_rank": staminaRanking.length,
            "min_stats": minSTA,
            "max_stats": maxSTA
        }
    };
}

export const calculateCP = (atk, def, sta, level) => {
    return Math.floor(Math.max(10, (atk*(def**0.5)*(sta**0.5)*data.find(item => item.level === level).multiplier**2)/10))
}

export const calculateRaidStat = (stat, tier) => {
    return Math.floor((stat+15)*RAID_BOSS_TIER[tier].CPm)
}

export const calculateRaidCP = (atk, def, tier) => {
    return Math.floor(((atk+15)*Math.sqrt(def+15)*Math.sqrt(RAID_BOSS_TIER[tier].sta))/10)
}

export const calculateDmgOutput = (atk, dps) => {
    return atk*dps;
}

export const calculateTankiness = (def, HP) => {
    return def*HP;
}

export const calculateDuelAbility = (dmgOutput, tanki) => {
    return dmgOutput*tanki;
}

export const predictStat = (atk, def, sta, cp) => {
    cp = parseInt(cp)
    let dataStat = {}
    let minLevel = 1;
    let maxLevel = 1;
    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i+=0.5) {
        if (cp <= calculateCP(atk+15, def+15, sta+15, i)) {
            minLevel = i
            break;
        }
    }
    for (let i = minLevel; i <= MAX_LEVEL; i+=0.5) {
        if (calculateCP(atk, def, sta, i) >= cp) {
            maxLevel = i;
            break;
        }
    }
    dataStat["cp"] = cp;
    dataStat["minLevel"] = minLevel;
    dataStat["maxLevel"] = maxLevel;

    let predictArr = [];
    for (let l = minLevel; l <= maxLevel; l+=0.5) {
        for (let i = MIN_IV; i <= MAX_IV; i++) {
            for (let j = MIN_IV; j <= MAX_IV; j++) {
                for (let k = MIN_IV; k <= MAX_IV; k++) {
                    if (calculateCP(atk+i, def+j, sta+k, l) === cp) predictArr.push({atk: i,
                        def: j,
                        sta: k,
                        level: l,
                        percent: parseFloat(((i+j+k)*100/45).toFixed(2)),
                        hp: Math.floor((sta+k)*data.find(item => item.level === l).multiplier)})
                }
            }
        }
    }
    dataStat["result"] = predictArr;
    return dataStat;
}

export const predictCPList = (atk, def, sta, IVatk, IVdef, IVsta) => {
    IVatk = parseInt(IVatk);
    IVdef = parseInt(IVdef);
    IVsta = parseInt(IVsta);

    let dataStat = {};
    dataStat["IV"] = {atk: IVatk, def: IVdef, sta: IVsta};

    let predictArr = [];
    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i+=0.5) {
        predictArr.push({level: i,
            cp: calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i),
            hp: Math.floor((sta+IVsta)*data.find(item => item.level === i).multiplier)})
    }
    dataStat["result"] = predictArr;
    return dataStat;
}

export const calculateStats = (atk, def, sta, IVatk, IVdef, IVsta, cp) => {
    cp = parseInt(cp)

    let dataStat = {};
    dataStat["IV"] = {atk: IVatk, def: IVdef, sta: IVsta};
    dataStat["CP"] = cp;
    dataStat["level"] = null;

    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i+=0.5) {
        if (cp === calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i)) {
            dataStat.level = i;
            break;
        }
    }
    return dataStat;
}

export const calculateBetweenLevel = (atk, def, sta, IVatk, IVdef, IVsta, from_lv, to_lv, type) => {
    // from_lv -= 0.5;
    to_lv -= 0.5;

    let power_up_count = (to_lv-from_lv)*2;

    if (from_lv > to_lv) {
        return {
            cp: calculateCP(atk+IVatk, def+IVdef, sta+IVsta, to_lv+0.5),
            result_between_stadust: 0,
            result_between_candy: 0,
            result_between_xl_candy: 0,
            power_up_count: 0
        }
    } else {
        let between_stadust = 0;
        let between_candy = 0;
        let between_xl_candy = 0;

        let between_stadust_diff = 0;
        let between_candy_diff = 0;
        let between_xl_candy_diff = 0;

        if (type === "shadow") {
            var atk_stat = calculateStatsBattle(atk, IVatk, to_lv+0.5, true, SHADOW_ATK_BONUS);
            var def_stat = calculateStatsBattle(def, IVdef, to_lv+0.5, true, SHADOW_DEF_BONUS);

            var atk_stat_diff = Math.abs(calculateStatsBattle(atk, IVatk, to_lv+0.5) - atk_stat, true);
            var def_stat_diff = Math.abs(calculateStatsBattle(def, IVdef, to_lv+0.5) - def_stat, true);
        }

        data.forEach(ele => {
            if (ele.level >= from_lv && ele.level <= to_lv) {
                between_stadust += Math.ceil(ele.stadust*typeCostPowerUp(type).stadust);
                between_candy += Math.ceil(ele.candy*typeCostPowerUp(type).candy);
                between_xl_candy += Math.ceil(ele.xl_candy*typeCostPowerUp(type).candy);
                between_stadust_diff += Math.abs(ele.stadust-(Math.ceil(ele.stadust*typeCostPowerUp(type).stadust)));
                between_candy_diff += Math.abs(ele.candy-(Math.ceil(ele.candy*typeCostPowerUp(type).candy)));
                between_xl_candy_diff += Math.abs(ele.xl_candy-(Math.ceil(ele.xl_candy*typeCostPowerUp(type).candy)));
            };
        });

        let dataList = {
            cp: calculateCP(atk+IVatk, def+IVdef, sta+IVsta, to_lv+0.5),
            result_between_stadust: between_stadust,
            result_between_stadust_diff: between_stadust_diff,
            result_between_candy: between_candy,
            result_between_candy_diff: between_candy_diff,
            result_between_xl_candy: between_xl_candy,
            result_between_xl_candy_diff: between_xl_candy_diff,
            power_up_count: power_up_count,
            type: type
        }

        if (type === "shadow") {
            dataList['atk_stat'] = atk_stat;
            dataList['def_stat'] = def_stat;
            dataList['atk_stat_diff'] = atk_stat_diff;
            dataList['def_stat_diff'] = def_stat_diff;
        }

        return dataList;
    }
}

export const calculateStatsBattle = (base, iv, level, floor, addition) => {
    let result = (base+iv)*data.find(item => item.level === level).multiplier;
    if (addition) result *= addition;
    if (floor) return Math.floor(result);
    return result
}

export const calculateBattleLeague = (atk, def, sta, IVatk, IVdef, IVsta, from_lv, currCP, maxCp, type) => {
    let level = MAX_LEVEL;
    if (type !== "lucky") level -= 1;
    if (maxCp && currCP > maxCp) {
        return {elidge: false}
    } else {
        let dataBattle = {};

        dataBattle["elidge"] = true;
        dataBattle["maxCP"] = maxCp;
        dataBattle["IV"] = {atk: IVatk, def: IVdef, sta: IVsta};
        dataBattle["cp"] = 0;
        dataBattle["limit"] = true;
        dataBattle["level"] = null;
        if (maxCp == null) {
            dataBattle["level"] = level;
            dataBattle.cp = calculateCP(atk+IVatk, def+IVdef, sta+IVsta, level);
            dataBattle.limit = false;
        } else {
            for (let i = MIN_LEVEL; i <= level; i+=0.5) {
                if (dataBattle.cp < calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i) && calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i) <= maxCp) {
                    dataBattle["level"] = i;
                    dataBattle.cp = calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i);
                    dataBattle.limit = false;
                };
            }
        }

        let atk_stat = (type === "shadow") ? calculateStatsBattle(atk, IVatk, dataBattle.level, true, SHADOW_ATK_BONUS) : calculateStatsBattle(atk, IVatk, dataBattle.level, true);
        let def_stat = (type === "shadow") ? calculateStatsBattle(def, IVdef, dataBattle.level, true, SHADOW_DEF_BONUS) : calculateStatsBattle(def, IVdef, dataBattle.level, true);

        dataBattle["rangeValue"] = calculateBetweenLevel(atk, def, sta, IVatk, IVdef, IVsta, from_lv, dataBattle.level, type);
        dataBattle["stats"] = {
            atk : atk_stat,
            def : def_stat,
            sta : calculateStatsBattle(sta, IVsta, dataBattle.level, true)
        }
        return dataBattle
    }
}

export const findCPforLeague = (atk, def, sta, IVatk, IVdef, IVsta, level, maxCPLeague) => {
    let cp = 10;
    let l = level;
    for (let i = level; i <= MAX_LEVEL; i+=0.5) {
        if (calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i) > maxCPLeague && maxCPLeague !== null) break;
        cp = calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i);
        l = i;
    }
    return {
        cp: cp,
        level: l
    }
}

export const sortStatsProd = (data) => {
    data = data.sort((a,b) => a.statsProds - b.statsProds);
    return data.map((item, index) => ({...item, ratio: item.statsProds*100/data[data.length-1].statsProds, rank: data.length-index}));
}

export const calStatsProd = (atk, def, sta, minCP, maxCP, pure) => {
    let dataList = [];
    if (atk === 0 || def === 0 || sta === 0) return dataList;
    for (let l = MIN_LEVEL; l <= MAX_LEVEL; l+=0.5) {
        for (let i = MIN_IV; i <= MAX_IV; ++i) {
            for (let j = MIN_IV; j <= MAX_IV; ++j) {
                for (let k = MIN_IV; k <= MAX_IV; ++k) {
                    const cp = calculateCP(atk+i, def+j, sta+k, l);
                    if ((!minCP || minCP <= cp) && (!maxCP || cp <= maxCP)) {
                        const statsATK = calculateStatsBattle(atk, i, l);
                        const statsDEF = calculateStatsBattle(def, j, l);
                        const statsSTA = calculateStatsBattle(sta, k, l);
                        dataList.push({
                            IV: {atk: i, def: j, sta: k},
                            CP: cp,
                            level: l,
                            stats: {statsATK: statsATK, statsDEF: statsDEF, statsSTA: statsSTA},
                            statsProds: statsATK*statsDEF*statsSTA,
                        });
                    }
                }
            }
        }
    }

    if (!pure) {
        return sortStatsProd(dataList);
    } else return dataList;
}

export const calculateStatsByTag = (baseStats, tag) => {
    let checkNerf = tag && tag.toLowerCase().includes("mega") ? false : true;
    const atk  = calBaseATK(baseStats, checkNerf);
    const def  = calBaseDEF(baseStats, checkNerf);
    const sta  = tag !== "shedinja" ? calBaseSTA(baseStats, checkNerf) : 1;
    return {
        atk: atk,
        def: def,
        sta: sta,
    };
}

export const calculateDamagePVE = (atk, defObj, power, eff, notPure, stab) => {
    let modifier;
    if (eff) {
        const isStab = eff.stab ? STAB_MULTIPLY : 1;
        const isWb = eff.wb ? STAB_MULTIPLY : 1;
        const isDodge = eff.dodge ? 0.25 : 1;
        const isMega = eff.mega ? eff.stab ? 1.3 : 1.1 : 1;
        const isTrainer = eff.trainer ? 1.3 : 1;
        const isFrind = eff.flevel ? getMultiFriendshipMulti(eff.flevel) : 1;
        let isCharge = eff.clevel ? getOption("throw_charge", "normal") : 1;
        if (eff.clevel === 1) isCharge = getOption("throw_charge", "nice");
        else if (eff.clevel === 2) isCharge = getOption("throw_charge", "great");
        else if (eff.clevel === 3) isCharge = getOption("throw_charge", "excellent");
        modifier = isStab * isWb * isFrind * isDodge * isCharge * isMega * isTrainer * eff.effective;
    } else {
        if (stab) modifier = STAB_MULTIPLY;
        else modifier = 1;
    }
    if (notPure) return (0.5 * power * (atk/defObj) * modifier) + 1
    return Math.floor(0.5 * power * (atk/defObj) * modifier) + 1
}

export const getBarCharge = (isRaid, energy) => {
    energy = Math.abs(energy);
    if (isRaid) {
        const bar = Math.ceil(100 / energy)
        return bar > 3 ? 3 : bar;
    } else return energy > 50 ? 1 : 2;
}

export const calculateAvgDPS = (fmove, cmove, Atk, Def, HP, typePoke, options, shadow) => {
    const FPow = fmove.pve_power;
    const CPow = cmove.pve_power;
    const FE = Math.abs(fmove.pve_energy);
    const CE = Math.abs(cmove.pve_energy);
    const FDur = fmove.durationMs/1000;
    const CDur = cmove.durationMs/1000;
    const FTYPE = capitalize(fmove.type.toLowerCase());
    const CTYPE = capitalize(cmove.type.toLowerCase());
    const CDWS = cmove.damageWindowStartMs/1000;

    const FMulti = (typePoke.includes(FTYPE) ? STAB_MULTIPLY : 1)*fmove.accuracyChance;
    const CMulti = (typePoke.includes(CTYPE) ? STAB_MULTIPLY : 1)*cmove.accuracyChance;

    let y,FDmg,CDmg,FDmgBase,CDmgBase;
    if (options) {
        FDmgBase = DEFAULT_DAMAGE_MULTIPLY*FPow*FMulti*(shadow ? SHADOW_ATK_BONUS : 1)*(typeof options.WEATHER_BOOSTS === "string" ? weatherMultiple(options.WEATHER_BOOSTS, FTYPE) : options.WEATHER_BOOSTS ? STAB_MULTIPLY : 1)*(options.TRAINER_FRIEND ? getMultiFriendshipMulti(options.TRAINER_FRIEND_LEVEL) : 1);
        CDmgBase = DEFAULT_DAMAGE_MULTIPLY*CPow*CMulti*(shadow ? SHADOW_ATK_BONUS : 1)*(typeof options.WEATHER_BOOSTS === "string" ? weatherMultiple(options.WEATHER_BOOSTS, CTYPE) : options.WEATHER_BOOSTS ? STAB_MULTIPLY : 1)*(options.TRAINER_FRIEND ? getMultiFriendshipMulti(options.TRAINER_FRIEND_LEVEL) : 1);

        FDmg = Math.floor(FDmgBase*Atk*(options.objTypes ? getTypeEffective(FTYPE, options.objTypes) : 1)/options.POKEMON_DEF_OBJ)+DEFAULT_DAMAGE_CONST;
        CDmg = Math.floor(CDmgBase*Atk*(options.objTypes ? getTypeEffective(CTYPE, options.objTypes) : 1)/options.POKEMON_DEF_OBJ)+DEFAULT_DAMAGE_CONST;

        y = 900/((Def/(options.objTypes ? getTypeEffective(FTYPE, options.objTypes)*getTypeEffective(CTYPE, options.objTypes) : 1))*(shadow ? SHADOW_DEF_BONUS : 1));
    } else {
        FDmgBase = DEFAULT_DAMAGE_MULTIPLY*FPow*FMulti*(DEFAULT_POKEMON_SHADOW ? SHADOW_ATK_BONUS : 1)*(DEFAULT_WEATHER_BOOSTS ? STAB_MULTIPLY : 1)*(DEFAULT_TRAINER_FRIEND ? getMultiFriendshipMulti(DEFAULT_POKEMON_FRIEND_LEVEL) : 1);
        CDmgBase = DEFAULT_DAMAGE_MULTIPLY*CPow*CMulti*(DEFAULT_POKEMON_SHADOW ? SHADOW_ATK_BONUS : 1)*(DEFAULT_WEATHER_BOOSTS ? STAB_MULTIPLY : 1)*(DEFAULT_TRAINER_FRIEND ? getMultiFriendshipMulti(DEFAULT_POKEMON_FRIEND_LEVEL) : 1);

        FDmg = Math.floor(FDmgBase*Atk/DEFAULT_POKEMON_DEF_OBJ)+DEFAULT_DAMAGE_CONST;
        CDmg = Math.floor(CDmgBase*Atk/DEFAULT_POKEMON_DEF_OBJ)+DEFAULT_DAMAGE_CONST;

        y = 900/(Def*(DEFAULT_POKEMON_SHADOW ? SHADOW_DEF_BONUS : 1));
    }

    const FDPS = FDmg/(FDur+(options && options.delay ? options.delay.ftime : 0));
    const CDPS = CDmg/(CDur+(options && options.delay ? options.delay.ctime : 0));

    const CEPSM = CE === 100 ? 0.5*FE+0.5*y*CDWS : 0;
    const FEPS = FE/(FDur+(options && options.delay ? options.delay.ftime : 0));
    const CEPS = (CE+CEPSM)/(CDur+(options && options.delay ? options.delay.ctime : 0));

    let x = 0.5*CE+0.5*FE;
    if (options && options.specific) {
        const bar = getBarCharge(true, CE);
        let λ;
        if (bar === 1) λ = 3;
        else if (bar === 2) λ = 1.5;
        else if (bar === 3) λ = 1;
        x += 0.5*λ*options.specific.FDmgenemy+options.specific.CDmgenemy*λ+1;
    }

    const DPS0 = (FDPS*CEPS+CDPS*FEPS)/(CEPS+FEPS);

    let DPS;
    if (FDPS > CDPS) DPS = DPS0;
    else DPS = Math.max(0, DPS0+((CDPS-FDPS)/(CEPS+FEPS)*(DEFAULT_ENERYGY_PER_HP_LOST-(x/HP))*y));
    return Math.max(FDPS, DPS);
}

export const calculateTDO = (Def, HP, dps, shadow) => {
    let y;
    if (shadow) y = 900/(Def*(shadow ? SHADOW_DEF_BONUS : 1));
    else y = 900/(Def*(DEFAULT_POKEMON_SHADOW ? SHADOW_DEF_BONUS : 1));
    return HP/y*dps;
}

export const calculateBattleDPSDefender = (Attacker, Defender) => {
    const FPowDef = Defender.fmove.pve_power;
    const CPowDef = Defender.cmove.pve_power;
    const CEDef = Math.abs(Defender.cmove.pve_energy);
    const FDurDef = Defender.fmove.durationMs/1000;
    const CDurDef = Defender.cmove.durationMs/1000;
    const FTYPEDef = capitalize(Defender.fmove.type.toLowerCase());
    const CTYPEDef = capitalize(Defender.cmove.type.toLowerCase());

    const FMultiDef = (Defender.types.includes(FTYPEDef) ? STAB_MULTIPLY : 1)*Defender.fmove.accuracyChance;
    const CMultiDef = (Defender.types.includes(CTYPEDef) ? STAB_MULTIPLY : 1)*Defender.cmove.accuracyChance;

    const lambdaMod = CEDef/100*3;
    const defDuration = lambdaMod*(FDurDef+DEFAULT_ENEMY_ATK_DELAY)+(CDurDef+DEFAULT_ENEMY_ATK_DELAY);

    const FDmgBaseDef = DEFAULT_DAMAGE_MULTIPLY*FPowDef*FMultiDef*(Defender.shadow ? SHADOW_ATK_BONUS : 1)*(typeof Defender.WEATHER_BOOSTS === "string" ? weatherMultiple(Defender.WEATHER_BOOSTS, FTYPEDef) : Defender.WEATHER_BOOSTS ? STAB_MULTIPLY : 1);
    const CDmgBaseDef = DEFAULT_DAMAGE_MULTIPLY*CPowDef*CMultiDef*(Defender.shadow ? SHADOW_ATK_BONUS : 1)*(typeof Defender.WEATHER_BOOSTS === "string" ? weatherMultiple(Defender.WEATHER_BOOSTS, CTYPEDef) : Defender.WEATHER_BOOSTS ? STAB_MULTIPLY : 1);

    const FDmgDef = Math.floor(FDmgBaseDef*Defender.atk*getTypeEffective(FTYPEDef, Attacker.types)/(Attacker.def*(Attacker.shadow ? SHADOW_DEF_BONUS : 1)))+DEFAULT_DAMAGE_CONST;
    const CDmgDef = Math.floor(CDmgBaseDef*Defender.atk*getTypeEffective(CTYPEDef, Attacker.types)/(Attacker.def*(Attacker.shadow ? SHADOW_DEF_BONUS : 1)))+DEFAULT_DAMAGE_CONST;

    const DefDmg = lambdaMod*FDmgDef+CDmgDef;
    return DefDmg/defDuration;
}

export const calculateBattleDPS = (Attacker, Defender, DPSDef) => {
    const FPow = Attacker.fmove.pve_power;
    const CPow = Attacker.cmove.pve_power;
    const FE = Math.abs(Attacker.fmove.pve_energy);
    const CE = Math.abs(Attacker.cmove.pve_energy);
    const FDur = Attacker.fmove.durationMs/1000;
    const CDur = Attacker.cmove.durationMs/1000;
    const FTYPE = capitalize(Attacker.fmove.type.toLowerCase());
    const CTYPE = capitalize(Attacker.cmove.type.toLowerCase());
    const CDWS = Attacker.cmove.damageWindowStartMs/1000;

    const FMulti = (Attacker.types.includes(FTYPE) ? STAB_MULTIPLY : 1)*Attacker.fmove.accuracyChance;
    const CMulti = (Attacker.types.includes(CTYPE) ? STAB_MULTIPLY : 1)*Attacker.cmove.accuracyChance;

    const FDmgBase = DEFAULT_DAMAGE_MULTIPLY*FPow*FMulti*(Attacker.shadow ? SHADOW_ATK_BONUS : 1)*(typeof Attacker.WEATHER_BOOSTS === "string" ? weatherMultiple(Attacker.WEATHER_BOOSTS, FTYPE) : Attacker.WEATHER_BOOSTS ? STAB_MULTIPLY : 1)*(Attacker.POKEMON_FRIEND ? getMultiFriendshipMulti(Attacker.POKEMON_FRIEND_LEVEL) : 1);
    const CDmgBase = DEFAULT_DAMAGE_MULTIPLY*CPow*CMulti*(Attacker.shadow ? SHADOW_ATK_BONUS : 1)*(typeof Attacker.WEATHER_BOOSTS === "string" ? weatherMultiple(Attacker.WEATHER_BOOSTS, CTYPE) : Attacker.WEATHER_BOOSTS ? STAB_MULTIPLY : 1)*(Attacker.POKEMON_FRIEND ? getMultiFriendshipMulti(Attacker.POKEMON_FRIEND_LEVEL) : 1);

    const FDmg = Math.floor(FDmgBase*Attacker.atk*getTypeEffective(FTYPE, Defender.types)/(Defender.def*(Defender.shadow ? SHADOW_DEF_BONUS : 1)))+DEFAULT_DAMAGE_CONST;
    const CDmg = Math.floor(CDmgBase*Attacker.atk*getTypeEffective(CTYPE, Defender.types)/(Defender.def*(Defender.shadow ? SHADOW_DEF_BONUS : 1)))+DEFAULT_DAMAGE_CONST;

    const FDPS = FDmg/FDur;
    const CDPS = CDmg/CDur;

    const CEPSM = CE === 100 ? 0.5*FE+0.5*DPSDef*CDWS : 0;
    const FEPS = FE/FDur;
    const CEPS = (CE+CEPSM)/CDur;

    const x = 0.5*CE+0.5*FE;

    const DPS0 = (FDPS*CEPS+CDPS*FEPS)/(CEPS+FEPS);

    let DPS;
    if (FDPS > CDPS) DPS = DPS0;
    else DPS = Math.max(0, DPS0+((CDPS-FDPS)/(CEPS+FEPS)*(DEFAULT_ENERYGY_PER_HP_LOST-(x/Attacker.hp))*DPSDef));
    DPS = Math.max(FDPS, DPS);

    let DPSSec = 0;
    if (Attacker.isDoubleCharge) {
        const moveSec = Attacker.cmove2;
        const CPowSec = moveSec.pve_power;
        const CESec = Math.abs(moveSec.pve_energy);
        const CTYPESec = capitalize(moveSec.type.toLowerCase());
        const CDurSec = moveSec.durationMs/1000;
        const CDWSSec = moveSec.damageWindowStartMs/1000;

        const CMultiSec = (Attacker.types.includes(CTYPESec) ? STAB_MULTIPLY : 1)*moveSec.accuracyChance;

        const CDmgBaseSec = DEFAULT_DAMAGE_MULTIPLY*CPowSec*CMultiSec*(Attacker.shadow ? SHADOW_ATK_BONUS : 1)*(typeof Attacker.WEATHER_BOOSTS === "string" ? weatherMultiple(Attacker.WEATHER_BOOSTS, CTYPE) : Attacker.WEATHER_BOOSTS ? STAB_MULTIPLY : 1)*(Attacker.POKEMON_FRIEND ? getMultiFriendshipMulti(Attacker.POKEMON_FRIEND_LEVEL) : 1);
        const CDmgSec = Math.floor(CDmgBaseSec*Attacker.atk*getTypeEffective(CTYPESec, Defender.types)/(Defender.def*(Defender.shadow ? SHADOW_DEF_BONUS : 1)))+DEFAULT_DAMAGE_CONST;
        const CDPSSec = CDmgSec/CDurSec;

        const CEPSMSec = CESec === 100 ? 0.5*FE+0.5*DPSDef*CDWSSec : 0;
        const CEPSSec = (CESec+CEPSMSec)/CDurSec;

        const xSec = 0.5*CESec+0.5*FE;

        const DPS0Sec = (FDPS*CEPSSec+CDPSSec*FEPS)/(CEPSSec+FEPS);

        if (FDPS > CDPSSec) DPSSec = DPS0Sec;
        else DPSSec = Math.max(0, DPS0Sec+((CDPSSec-FDPS)/(CEPSSec+FEPS)*(DEFAULT_ENERYGY_PER_HP_LOST-(xSec/Attacker.hp))*DPSDef));
        DPSSec = Math.max(FDPS, DPSSec);
    }
    return Math.max(FDPS, DPS, DPSSec);
}

export const TimeToKill = (HP, dpsDef) => {
    return HP/dpsDef;
}

export const queryTopMove = (move) => {
    let dataPri = [];
    Object.values(pokemonData).forEach(value => {
        let combatPoke = pokemonCombatList.filter(item => item.ID === value.num
            && item.BASE_SPECIES === (value.baseSpecies ? convertName(value.baseSpecies) : convertName(value.name))
        );
        let result = combatPoke.find(item => item.NAME === convertName(value.name));
        if (result === undefined) combatPoke = combatPoke[0]
        else combatPoke = result;
        if (combatPoke !== undefined) {
            let pokemonList;
            if (move.type_move === "FAST") {
                pokemonList = combatPoke.QUICK_MOVES.map(item => item.replaceAll("_FAST", "")).includes(move.name);
                if (!pokemonList) pokemonList = combatPoke.ELITE_QUICK_MOVES.map(item => item.replaceAll("_FAST", "")).includes(move.name);
            }
            else if (move.type_move === "CHARGE") {
                pokemonList = combatPoke.CINEMATIC_MOVES.includes(move.name);
                if (!pokemonList) pokemonList = combatPoke.SHADOW_MOVES.includes(move.name);
                if (!pokemonList) pokemonList = combatPoke.PURIFIED_MOVES.includes(move.name)
                if (!pokemonList) pokemonList = combatPoke.ELITE_CINEMATIC_MOVES.includes(move.name);
            }
            if (pokemonList) {
                const stats = calculateStatsByTag(value.baseStats, value.forme);
                let dps = calculateAvgDPS(move,
                    move,
                    calculateStatsBattle(stats.atk, MAX_IV, 40),
                    calculateStatsBattle(stats.def, MAX_IV, 40),
                    calculateStatsBattle(stats.sta, MAX_IV, 40),
                    value.types
                );
                let tdo = calculateTDO(
                    calculateStatsBattle(stats.def, MAX_IV, 40),
                    calculateStatsBattle(stats.sta, MAX_IV, 40),
                    dps
                );
                dataPri.push({num: value.num, forme: value.forme, name: splitAndCapitalize(value.name, "-", " "), baseSpecies: value.baseSpecies, sprite: value.sprite, releasedGO: value.releasedGO, dps: dps, tdo: tdo});
            }
        }
    });
    return dataPri;
}

const queryMove = (dataList, vf, atk, def, sta, type, cmove, felite, celite, shadow, purified) => {
    cmove.forEach(vc => {
        let mf = combat.find(item => item.name === vf.replaceAll("_FAST", ""));
        let mc = combat.find(item => item.name === vc);

        mf["elite"] = felite;
        mc["elite"] = celite;
        mc["shadow"] = shadow;
        mc["purified"] = purified;

        let options = {
            delay: {
                ftime: DEFAULT_ENEMY_ATK_DELAY,
                ctime: DEFAULT_ENEMY_ATK_DELAY
            },
            POKEMON_DEF_OBJ: 160,
            IV_ATK: 15,
            IV_DEF: 15,
            IV_HP: 15,
            POKEMON_LEVEL: 40
        }

        let offensive = calculateAvgDPS(mf, mc,
            calculateStatsBattle(atk, options.IV_ATK, options.POKEMON_LEVEL, true),
            calculateStatsBattle(def, options.IV_DEF, options.POKEMON_LEVEL, true),
            calculateStatsBattle(sta, options.IV_HP, options.POKEMON_LEVEL, true), type);
        let defensive = calculateAvgDPS(mf, mc,
            calculateStatsBattle(atk, options.IV_ATK, options.POKEMON_LEVEL, true),
            calculateStatsBattle(def, options.IV_DEF, options.POKEMON_LEVEL, true),
            calculateStatsBattle(sta, options.IV_HP, options.POKEMON_LEVEL, true), type, options);

        dataList.push({fmove: mf, cmove: mc, eDPS: {offensive: offensive, defensive: defensive}});
    });
}

export const rankMove = (move, atk, def, sta, type) => {
    if (!move) return {data: []};
    let dataPri = []
    move.QUICK_MOVES.forEach(vf => {
        queryMove(dataPri, vf, atk, def, sta, type, move.CINEMATIC_MOVES, false, false, false, false);
        queryMove(dataPri, vf, atk, def, sta, type, move.ELITE_CINEMATIC_MOVES, false, true, false, false);
        queryMove(dataPri, vf, atk, def, sta, type, move.SHADOW_MOVES, false, false, true, false);
        queryMove(dataPri, vf, atk, def, sta, type, move.PURIFIED_MOVES, false, false, false, true);
    });
    move.ELITE_QUICK_MOVES.forEach(vf => {
        queryMove(dataPri, vf, atk, def, sta, type, move.CINEMATIC_MOVES, true, false, false, false);
        queryMove(dataPri, vf, atk, def, sta, type, move.ELITE_CINEMATIC_MOVES, true, true, false);
        queryMove(dataPri, vf, atk, def, sta, type, move.SHADOW_MOVES, true, false, true, false);
        queryMove(dataPri, vf, atk, def, sta, type, move.PURIFIED_MOVES, true, false, false, true);
    });

    return {
        data: dataPri,
        maxOff: Math.max(...dataPri.map(item => item.eDPS.offensive)),
        maxDef: Math.max(...dataPri.map(item => item.eDPS.defensive))
    };
}

export const queryStatesEvoChain = (item, level, atkIV, defIV, staIV) => {
    let pokemon;
    if (item.form === "") pokemon = Object.values(pokemonData).find(value => value.num === item.id && value.slug === item.name.toLowerCase());
    else pokemon = Object.values(pokemonData).find(value => value.num === item.id && value.slug.includes(item.form.toLowerCase()));
    if (!pokemon) pokemon = Object.values(pokemonData).find(value => value.num === item.id);
    let pokemonStats = calculateStatsByTag(pokemon.baseStats, pokemon.forme);
    let dataLittle = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, 500);
    let dataGreat = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, 1500);
    let dataUltra = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, 2500);
    let dataMaster = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, null);

    let statsProd = calStatsProd(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, null, null, true);
    let ultraStatsProd = sortStatsProd(statsProd.filter(item => item.CP <= 2500));
    let greatStatsProd = sortStatsProd(ultraStatsProd.filter(item => item.CP <= 1500));
    let littleStatsProd = sortStatsProd(greatStatsProd.filter(item => item.CP <= 500));

    let battleLeague = {
        little: littleStatsProd.find(item => item.level === dataLittle.level && item.CP === dataLittle.cp && item.IV.atk === atkIV && item.IV.def === defIV && item.IV.sta === staIV),
        great: greatStatsProd.find(item => item.level === dataGreat.level && item.CP === dataGreat.cp && item.IV.atk === atkIV && item.IV.def === defIV && item.IV.sta === staIV),
        ultra: ultraStatsProd.find(item => item.level === dataUltra.level && item.CP === dataUltra.cp && item.IV.atk === atkIV && item.IV.def === defIV && item.IV.sta === staIV),
        master: sortStatsProd(statsProd).find(item => item.level === dataMaster.level && item.CP === dataMaster.cp && item.IV.atk === atkIV && item.IV.def === defIV && item.IV.sta === staIV)
    }

    if (battleLeague.little) battleLeague.little = {...battleLeague.little, ...calculateBetweenLevel(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, battleLeague.little.level)};
    if (battleLeague.great) battleLeague.great = {...battleLeague.great, ...calculateBetweenLevel(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, battleLeague.great.level)};
    if (battleLeague.ultra) battleLeague.ultra = {...battleLeague.ultra, ...calculateBetweenLevel(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, battleLeague.ultra.level)};
    if (battleLeague.master) battleLeague.master = {...battleLeague.master, ...calculateBetweenLevel(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, battleLeague.master.level)};
    return {...item, battleLeague, maxCP: battleLeague.master.CP, form: pokemon.forme}
}

const queryMoveCounter = (dataList, pokemon, stats, def, types, vf, cmove, felite, celite, shadow, purified) => {
    cmove.forEach(vc => {
        let mf = combat.find(item => item.name === vf.replaceAll("_FAST", ""));
        let mc = combat.find(item => item.name === vc);

        mf["elite"] = felite;
        mc["elite"] = celite;
        mc["shadow"] = shadow;
        mc["purified"] = purified;

        let options = {
            objTypes: types,
            POKEMON_DEF_OBJ: calculateStatsBattle(def, 15, 40, true),
            IV_ATK: 15,
            IV_DEF: 15,
            IV_HP: 15,
            POKEMON_LEVEL: 40
        }

        let dpsOff = calculateAvgDPS(mf, mc,
            calculateStatsBattle(stats.atk, options.IV_ATK, options.POKEMON_LEVEL, true),
            calculateStatsBattle(stats.def, options.IV_DEF, options.POKEMON_LEVEL, true),
            calculateStatsBattle(stats.sta, options.IV_HP, options.POKEMON_LEVEL, true), pokemon.types, options);

        dataList.push({
            pokemon_id: pokemon.num,
            pokemon_name: pokemon.name,
            pokemon_forme: pokemon.forme,
            releasedGO: pokemon.releasedGO,
            dps: dpsOff,
            fmove: mf,
            cmove: mc
        })
    });
}

const sortCounterDPS = (data) => {
    data = data.sort((a,b) => b.dps - a.dps);
    return data.map((item, index) => ({...item, ratio: item.dps*100/data[0].dps}));
}

export const counterPokemon = (def, types) => {
    let dataList = [];
    pokemonCombatList.forEach(value => {
        if (value.QUICK_MOVES[0] !== "STRUGGLE" && value.CINEMATIC_MOVES[0] !== "STRUGGLE") {
            let pokemon = Object.values(pokemonData).find(item => item.num === value.ID && convertName(item.name).includes(value.NAME));
            if (pokemon === undefined) {
                console.log(value.ID, value.NAME);
                return;
            }
            let stats = calculateStatsByTag(pokemon.baseStats, pokemon.forme);
            value.QUICK_MOVES.forEach(vf => {
                queryMoveCounter(dataList, pokemon, stats, def, types, vf, value.CINEMATIC_MOVES, false, false, false, false);
                queryMoveCounter(dataList, pokemon, stats, def, types, vf, value.ELITE_CINEMATIC_MOVES, false, true, false, false);
                queryMoveCounter(dataList, pokemon, stats, def, types, vf, value.SHADOW_MOVES, false, false, true, false);
                queryMoveCounter(dataList, pokemon, stats, def, types, vf, value.PURIFIED_MOVES, false, false, false, true);
            });
            value.ELITE_QUICK_MOVES.forEach(vf => {
                queryMoveCounter(dataList, pokemon, stats, def, types, vf, value.CINEMATIC_MOVES, true, false, false, false);
                queryMoveCounter(dataList, pokemon, stats, def, types, vf, value.ELITE_CINEMATIC_MOVES, true, true, false);
                queryMoveCounter(dataList, pokemon, stats, def, types, vf, value.SHADOW_MOVES, true, false, true, false);
                queryMoveCounter(dataList, pokemon, stats, def, types, vf, value.PURIFIED_MOVES, true, false, false, true);
            });
        }
    });
    return sortCounterDPS(dataList);
}

/* ------------- PVP Calculate ------------- */
