import data from "../../data/cp_multiplier.json";
import combat from '../../data/combat.json';
import candyData from '../../data/candy_pokemon_go.json';
import pokemonData from '../../data/pokemon.json';
import pokemonCombatList from "../../data/combat_pokemon_go_list.json";
import pokemonAssets from '../../data/assets_pokemon_go.json';
import typeEffective from "../../data/type_effectiveness.json";
import weatherBoosts from '../../data/weather_boosts.json';

import Moment from 'moment';

const DEFAULT_POKEMON_DEF_OBJ = 160;
const DEFAULT_POKEMON_SHADOW = false;
const DEFAULT_WEATHER_BOOSTS = false;
const DEFAULT_POKEMON_FRIEND_LEVEL = 0;

const DEFAULT_ENERYGY_PER_HP_LOST = 0.5;
const DEFAULT_DAMAGE_MULTIPLY = 0.5;
const DEFAULT_DAMAGE_CONST = 1;

const MIN_LEVEL = 1;
const MAX_LEVEL = 51;

const MIN_IV = 0
const MAX_IV = 15

const getMultiFriendshipMulti = (level) => {
    let dmg = 1;
    if (level === 1) dmg += 0.03;
    else if (level === 2) dmg += 0.05;
    else if (level === 3) dmg += 0.07;
    else if (level === 4) dmg += 0.1;
    return dmg;
}

const weatherMultiple = (weather, type) => {
    return weatherBoosts[weather].find(item => item === capitalize(type.toLowerCase())) ? 1.2 : 1;
}

export const getTypeEffective = (typeMove, typesObj) => {
    let value_effective = 1;
    typesObj.forEach(type => {
        try {value_effective *= typeEffective[typeMove][capitalize(type.type.name)];}
        catch {value_effective *= typeEffective[typeMove][type];}
    });
    return value_effective;
}

export const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const splitAndCapitalize = (string, splitBy, joinBy) => {
    return string.split(splitBy).map(text => capitalize(text.toLowerCase())).join(joinBy);
};

export const getTime = (value, notFull) => {
    return notFull ? Moment((new Date(parseInt(value)))).format('DD MMMM YYYY') : Moment((new Date(parseInt(value)))).format('HH:mm DD MMMM YYYY')
}

export const regionList = {
    1: "Kanto",
    2: "Johto",
    3: "Hoenn",
    4: "Sinnoh",
    5: "Unova",
    6: "Kalos",
    7: "Alola",
    8: "Galar",
}

export const convertName = (text) => {
    return text.toUpperCase()
    .replaceAll("-", "_")
    .replaceAll("NIDORAN_F", "NIDORAN_FEMALE")
    .replaceAll("NIDORAN_M", "NIDORAN_MALE")
    .replaceAll("’", "")
    .replaceAll(".", "")
    .replaceAll(":", "")
    .replaceAll(" ", "_")
    .replaceAll("É", "E")
};

export const computeBgColor = (id) => {
    let data = candyData.find(item => item.familyGroup.map(value => value.id).includes(id));
    if (!data) data = candyData.find(item => item.familyId === 0);
    return `rgb(${Math.round(255*data.SecondaryColor.r)}, ${Math.round(255*data.SecondaryColor.g)}, ${Math.round(255*data.SecondaryColor.b)}, ${data.SecondaryColor.a})`
}

export const computeColor = (id) => {
  let data = candyData.find(item => item.familyGroup.map(value => value.id).includes(id));
  if (!data) data = candyData.find(item => item.familyId === 0);
  return `rgb(${Math.round(255*data.PrimaryColor.r)}, ${Math.round(255*data.PrimaryColor.g)}, ${Math.round(255*data.PrimaryColor.b)}, ${data.PrimaryColor.a})`
}

export const findAssetForm = (id, name) => {
    name = convertName(name).replaceAll("GALAR", "GALARIAN")
    let pokemon = pokemonAssets.find(item => item.id === id);
    if (pokemon.name === convertName(name)) {
        let image = pokemon.image.find(item => item.form === "NORMAL")
        if (image) return image.default;
        image = pokemon.image.find(item => item.form === "STANDARD");
        if (image) return image.default;
        try {return pokemon.image[0].default;}
        catch { return null }
    }
    try {return pokemon.image.find(item => convertName(name).replaceAll(pokemon.name+"_", "") === item.form).default;}
    catch { return null; }
}

// Thank calculate algorithm from pokemongohub.net
export const calBaseATK = (stats, nerf) => {
    const atk = stats.atk !== undefined ? stats.atk : stats.find(item => item.stat.name === "attack").base_stat;
    const spa = stats.spa !== undefined ? stats.spa : stats.find(item => item.stat.name === "special-attack").base_stat;

    const lower = Math.min(atk, spa);
    const higher = Math.max(atk, spa);

    const speed = stats.spe !== undefined ? stats.spe : stats.find(item => item.stat.name === "speed").base_stat;

    const scaleATK = Math.round(2*((7/8)*higher+(1/8)*lower));
    const speedMod = 1+(speed-75)/500;
    const baseATK = Math.round(scaleATK * speedMod);
    if (!nerf) return baseATK;
    if (calculateCP(baseATK+15, calBaseDEF(stats, false)+15, calBaseSTA(stats, false)+15, 40) >= 4000) return Math.round(scaleATK * speedMod * 0.91);
    else return baseATK;
}

export const calBaseDEF = (stats, nerf) => {
    const def = stats.def !== undefined ? stats.def : stats.find(item => item.stat.name === "defense").base_stat;
    const spd = stats.spd !== undefined ? stats.spd : stats.find(item => item.stat.name === "special-defense").base_stat;

    const lower = Math.min(def, spd);
    const higher = Math.max(def, spd);

    const speed = stats.spe !== undefined ? stats.spe : stats.find(item => item.stat.name === "speed").base_stat;

    const scaleDEF = Math.round(2*((5/8)*higher+(3/8)*lower));
    const speedMod = 1+(speed-75)/500;
    const baseDEF = Math.round(scaleDEF * speedMod);
    if (!nerf) return baseDEF;
    if (calculateCP(calBaseATK(stats, false)+15, baseDEF+15, calBaseSTA(stats, false)+15, 40) >= 4000) return Math.round(scaleDEF * speedMod * 0.91);
    else return baseDEF;
}

export const calBaseSTA = (stats, nerf) => {
    const hp = stats.hp !== undefined ? stats.hp : stats.find(item => item.stat.name === "hp").base_stat;

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
            var atk_stat = calculateStatsBettle(atk, IVatk, to_lv+0.5, typeCostPowerUp(type).bonus.atk);
            var def_stat = calculateStatsBettle(def, IVdef, to_lv+0.5, typeCostPowerUp(type).bonus.def);

            var atk_stat_diff = Math.abs(calculateStatsBettle(atk, IVatk, to_lv+0.5) - atk_stat);
            var def_stat_diff = Math.abs(calculateStatsBettle(def, IVdef, to_lv+0.5) - def_stat);
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

export const calculateStatsBettle = (base, iv, level, addition) => {
    let result = (base+iv)*data.find(item => item.level === level).multiplier
    if (addition) return Math.floor(result*addition)
    return Math.floor(result)
}

export const calculateStatsBettlePure = (base, iv, level, addition) => {
    let result = (base+iv)*data.find(item => item.level === level).multiplier
    if (addition) return result*addition
    return result
}

export const calculateBettleLeague = (atk, def, sta, IVatk, IVdef, IVsta, from_lv, currCP, maxCp, type) => {
    let level = MAX_LEVEL;
    if (type !== "lucky") level -= 1;
    if (maxCp && currCP > maxCp) {
        return {elidge: false}
    } else {
        let dataBettle = {};

        dataBettle["elidge"] = true;
        dataBettle["maxCP"] = maxCp;
        dataBettle["IV"] = {atk: IVatk, def: IVdef, sta: IVsta};
        dataBettle["cp"] = 0;
        dataBettle["limit"] = true;
        dataBettle["level"] = null;
        if (maxCp == null) {
            dataBettle["level"] = level;
            dataBettle.cp = calculateCP(atk+IVatk, def+IVdef, sta+IVsta, level);
            dataBettle.limit = false;
        } else {
            for (let i = MIN_LEVEL; i <= level; i+=0.5) {
                if (dataBettle.cp < calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i) && calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i) <= maxCp) {
                    dataBettle["level"] = i;
                    dataBettle.cp = calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i);
                    dataBettle.limit = false;
                };
            }
        }

        let atk_stat = (type === "shadow") ? calculateStatsBettle(atk, IVatk, dataBettle.level, typeCostPowerUp(type).bonus.atk) : calculateStatsBettle(atk, IVatk, dataBettle.level);
        let def_stat = (type === "shadow") ? calculateStatsBettle(def, IVdef, dataBettle.level, typeCostPowerUp(type).bonus.def) : calculateStatsBettle(def, IVdef, dataBettle.level);

        dataBettle["rangeValue"] = calculateBetweenLevel(atk, def, sta, IVatk, IVdef, IVsta, from_lv, dataBettle.level, type);
        dataBettle["stats"] = {
            atk : atk_stat,
            def : def_stat,
            sta : calculateStatsBettle(sta, IVsta, dataBettle.level)
        }
        return dataBettle
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

export const typeCostPowerUp = (type) => {
    if (type === "shadow") {
        return {
            stadust: 1.2,
            candy: 1.2,
            bonus: {
                atk : 1.2,
                def : 0.83333331
            },
            type: type,
        }
    } else if (type === "purified") {
        return {
            stadust: 0.9,
            candy: 0.9,
            type: type,
        }
    } else if (type === "lucky") {
        return {
            stadust: 0.5,
            candy: 1,
            type: type,
        }
    } else return {
        stadust: 1,
        candy: 1,
        type: type,
    };
}

export const sortStatsProd = (data) => {
    // const maxStatsProds = Math.max.apply(Math, dataList.map(item => { return item.statsProds; }));
    data = data.sort((a,b) => a.statsProds - b.statsProds);
    return data.map((item, index) => ({...item, ratio: item.statsProds*100/data[data.length-1].statsProds, rank: data.length-index}));
}

export const calStatsProd = (atk, def, sta, maxCP, pure) => {
    let dataList = [];
    if (atk === 0 || def === 0 || sta === 0) return dataList;
    for (let l = MIN_LEVEL; l <= MAX_LEVEL; l+=0.5) {
        for (let i = MIN_IV; i <= MAX_IV; ++i) {
            for (let j = MIN_IV; j <= MAX_IV; ++j) {
                for (let k = MIN_IV; k <= MAX_IV; ++k) {
                    const cp = calculateCP(atk+i, def+j, sta+k, l);
                    if (maxCP == null || cp <= maxCP) {
                        const statsATK = calculateStatsBettlePure(atk, i, l);
                        const statsDEF = calculateStatsBettlePure(def, j, l);
                        const statsSTA = calculateStatsBettlePure(sta, k, l);
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
    let checkNerf = tag.toLowerCase().includes("mega") ? false : true;
    const atk  = calBaseATK(baseStats, checkNerf);
    const def  = calBaseDEF(baseStats, checkNerf);
    const sta  = tag !== "shedinja" ? calBaseSTA(baseStats, checkNerf) : 1;
    return {
        atk: atk,
        def: def,
        sta: sta,
    };
}

export const calculateDamagePVE = (atk, defObj, power, eff, pure, stab) => {
    let modifier;
    if (eff) {
        const isStab = eff.stab ? 1.2 : 1;
        const isWb = eff.wb ? 1.2 : 1;
        const isDodge = eff.dodge ? 0.25 : 1;
        const isMega = eff.mega ? eff.stab ? 1.3 : 1.1 : 1;
        const isTrainer = eff.trainer ? 1.3 : 1;
        const isFrind = getMultiFriendshipMulti(eff.flevel);
        let isCharge = 0.25;
        if (eff.clevel === 1) isCharge += 0.25;
        else if (eff.clevel === 2) isCharge += 0.5;
        else if (eff.clevel === 3) isCharge += 0.75;
        modifier = isStab * isWb * isFrind * isDodge * isCharge * isMega * isTrainer * eff.effective;
    } else {
        if (stab) modifier = 1.2;
        else modifier = 1;
    }
    if (pure) return (0.5 * power * (atk/defObj) * modifier) + 1
    return Math.floor(0.5 * power * (atk/defObj) * modifier) + 1
}

export const getBarCharge = (isRaid, energy) => {
    if (isRaid) {
        const bar = Math.ceil(100 / Math.abs(energy))
        return bar > 3 ? 3 : bar;
    }
    else return Math.abs(energy) > 50 ? 1 : 2;
}

export const calculateAvgDPS = (fmove, cmove, Atk, Def, HP, bar, typePoke, options, shadow) => {
    const FPow = fmove.pve_power;
    const CPow = cmove.pve_power;
    const FE = Math.abs(fmove.pve_energy);
    const CE = Math.abs(cmove.pve_energy);
    const FDur = fmove.durationMs/1000;
    const CDur = cmove.durationMs/1000;
    const CDWS = cmove.damageWindowStartMs/1000;

    const FMulti = (typePoke.includes(capitalize(fmove.type.toLowerCase())) ? 1.2 : 1)*fmove.accuracyChance
    const CMulti = (typePoke.includes(capitalize(cmove.type.toLowerCase())) ? 1.2 : 1)*cmove.accuracyChance

    let y,FDmg,CDmg,FDmgBase,CDmgBase
    if (options === undefined) {
        FDmgBase = DEFAULT_DAMAGE_MULTIPLY*FPow*FMulti*(DEFAULT_POKEMON_SHADOW ? 1.2 : 1)*(DEFAULT_WEATHER_BOOSTS ? 1.2 : 1)*getMultiFriendshipMulti(DEFAULT_POKEMON_FRIEND_LEVEL)
        CDmgBase = DEFAULT_DAMAGE_MULTIPLY*CPow*CMulti*(DEFAULT_POKEMON_SHADOW ? 1.2 : 1)*(DEFAULT_WEATHER_BOOSTS ? 1.2 : 1)*getMultiFriendshipMulti(DEFAULT_POKEMON_FRIEND_LEVEL)

        FDmg = Math.floor(FDmgBase*Atk/DEFAULT_POKEMON_DEF_OBJ)+DEFAULT_DAMAGE_CONST
        CDmg = Math.floor(CDmgBase*Atk/DEFAULT_POKEMON_DEF_OBJ)+DEFAULT_DAMAGE_CONST

        y = 900/(Def*(DEFAULT_POKEMON_SHADOW ? 0.83333331 : 1));
    } else {
        FDmgBase = options.DAMAGE_MULTIPLY*FPow*FMulti*(shadow ? 1.2 : 1)*(typeof options.WEATHER_BOOSTS === "string" ? weatherMultiple(options.WEATHER_BOOSTS, fmove.type) : options.WEATHER_BOOSTS ? 1.2 : 1)*getMultiFriendshipMulti(options.POKEMON_FRIEND_LEVEL)
        CDmgBase = options.DAMAGE_MULTIPLY*CPow*CMulti*(shadow ? 1.2 : 1)*(typeof options.WEATHER_BOOSTS === "string" ? weatherMultiple(options.WEATHER_BOOSTS, cmove.type) : options.WEATHER_BOOSTS ? 1.2 : 1)*getMultiFriendshipMulti(options.POKEMON_FRIEND_LEVEL)

        FDmg = Math.floor(FDmgBase*Atk/options.POKEMON_DEF_OBJ)+options.DAMAGE_CONST
        CDmg = Math.floor(CDmgBase*Atk/options.POKEMON_DEF_OBJ)+options.DAMAGE_CONST

        y = 900/(Def*(shadow ? 0.83333331 : 1));
    }

    const FDPS = FDmg/(FDur+(options && options.delay ? options.delay.ftime : 0));
    const CDPS = CDmg/(CDur+(options && options.delay ? options.delay.ctime : 0));

    const FEPS = FE/(FDur+(options && options.delay ? options.delay.ftime : 0));

    let CEPSM;
    let x = 0.5*CE+0.5*FE;

    if (bar === 1) CEPSM = 0.5*FE+0.5*y*CDWS;
    else CEPSM = 0;

    const CEPS = (CE+CEPSM)/(CDur+(options && options.delay ? options.delay.ctime : 0));

    if (options !== undefined && options.specific) {
        let λ;
        if (bar === 1) λ = 3;
        else if (bar === 2) λ = 1.5;
        else if (bar === 3) λ = 1;
        x = 0.5*CE+0.5*FE+0.5*λ*options.FDmgenemy+options.CDmgenemy*λ+1
    }

    const DPS0 = (FDPS*CEPS+CDPS*FEPS)/(CEPS+FEPS);

    let DPS;
    if (FDPS > CDPS) DPS = DPS0;
    else DPS = Math.max(0, DPS0+((CDPS-FDPS)/(CEPS+FEPS)*(DEFAULT_ENERYGY_PER_HP_LOST-(x/HP))*y))
    return Math.max(FDPS, DPS);
}

export const calculateTDO = (Def, HP, dps, shadow) => {
    let y;
    if (shadow === undefined) {
        y = 900/(Def*(DEFAULT_POKEMON_SHADOW ? 0.83333331 : 1));
    } else {
        y = 900/(Def*(shadow ? 0.83333331 : 1));
    }
    return HP/y*dps
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
            const stab = value.types.includes(capitalize(move.type.toLowerCase()));
            if (pokemonList) dataPri.push({num: value.num, name: splitAndCapitalize(value.name, "-", " "), baseSpecies: value.baseSpecies, sprite: value.sprite, dps: calculateDamagePVE(calculateStatsBettlePure(calculateStatsByTag(value.baseStats, value.slug).atk, 15, 40), 200, move.pve_power, null, true, stab)});
        }
    });
    return dataPri;
}

const queryMove = (dataList, vf, type, cmove, felite, celite, shadow, purified) => {
    cmove.forEach(vc => {
        let mf = combat.find(item => item.name === vf.replaceAll("_FAST", ""));
        let mc = combat.find(item => item.name === vc);
        let bar = getBarCharge(true, mc.pve_energy)

        mf["elite"] = felite;
        mc["elite"] = celite;
        mc["shadow"] = shadow;
        mc["purified"] = purified;

        let mfPower = mf.pve_power*(type.includes(mf.type.toLowerCase()) ? 1.2 : 1)
        let mcPower = mc.pve_power*(type.includes(mc.type.toLowerCase()) ? 1.2 : 1)

        let offensive = (100/(mf.pve_energy/(mf.durationMs/1000))) + bar*(mc.durationMs/1000)
        let defensive = (100/(mf.pve_energy/((mf.durationMs/1000) + 1.5))) + bar*(mc.durationMs/1000)
        dataList.push({fmove: mf, cmove: mc, eDPS: {offensive: Number.isFinite(offensive) ? ((bar*mcPower)+((100/mf.pve_energy)*mfPower))/offensive : 1, defensive: Number.isFinite(defensive) ? ((bar*mcPower)+((100/mf.pve_energy)*mfPower))/defensive : 1}})
    });
}

export const rankMove = (move, type) => {
    let dataPri = []
    move.QUICK_MOVES.forEach(vf => {
        queryMove(dataPri, vf, type, move.CINEMATIC_MOVES, false, false, false, false);
        queryMove(dataPri, vf, type, move.ELITE_CINEMATIC_MOVES, false, true, false, false);
        queryMove(dataPri, vf, type, move.SHADOW_MOVES, false, false, true, false);
        queryMove(dataPri, vf, type, move.PURIFIED_MOVES, false, false, false, true);
    });
    move.ELITE_QUICK_MOVES.forEach(vf => {
        queryMove(dataPri, vf, type, move.CINEMATIC_MOVES, true, false, false, false);
        queryMove(dataPri, vf, type, move.ELITE_CINEMATIC_MOVES, true, true, false);
        queryMove(dataPri, vf, type, move.SHADOW_MOVES, true, false, true, false);
        queryMove(dataPri, vf, type, move.PURIFIED_MOVES, true, false, false, true);
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
    let pokemonStats = calculateStatsByTag(pokemon.baseStats, pokemon.slug);
    let dataLittle = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, 500);
    let dataGreat = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, 1500);
    let dataUltra = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, 2500);
    let dataMaster = findCPforLeague(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, atkIV, defIV, staIV, level, null);

    let statsProd = calStatsProd(pokemonStats.atk, pokemonStats.def, pokemonStats.sta, null, true);
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
    return {...item, battleLeague, maxCP: battleLeague.master.CP}
}

const queryMoveEncounter = (dataList, pokemon, stats, def, types, vf, cmove, felite, celite, shadow, purified) => {
    cmove.forEach(vc => {
        let mf = combat.find(item => item.name === vf.replaceAll("_FAST", ""));
        let mc = combat.find(item => item.name === vc);

        mf["elite"] = felite;
        mc["elite"] = celite;
        mc["shadow"] = shadow;
        mc["purified"] = purified;

        let bar = getBarCharge(true, mc.pve_energy)
        let mfPower = (0.5*(stats.atk/def)*mf.pve_power*(pokemon.types.includes(mf.type.toLowerCase()) ? 1.2 : 1)*(getTypeEffective(capitalize(mf.type.toLowerCase()), types))*(shadow ? 1.2 : 1))+1
        let mcPower = (0.5*(stats.atk/def)*mc.pve_power*(pokemon.types.includes(mc.type.toLowerCase()) ? 1.2 : 1)*(getTypeEffective(capitalize(mc.type.toLowerCase()), types))*(shadow ? 1.2 : 1))+1

        let offensive = (100/(mf.pve_energy/(mf.durationMs/1000))) + bar*(mc.durationMs/1000)
        let dpsOff = ((bar*mcPower)+((100/mf.pve_energy)*mfPower))/offensive

        dataList.push({
            pokemon_id: pokemon.num,
            pokemon_name: pokemon.name,
            sum_of_DPS: dpsOff,
            fmove: mf,
            cmove: mc
        })
    });
}

const sortEncounterDPS = (data) => {
    data = data.sort((a,b) => b.sum_of_DPS - a.sum_of_DPS);
    return data.map((item, index) => ({...item, ratio: item.sum_of_DPS*100/data[0].sum_of_DPS}));
}

export const encounterPokemon = (def, types) => {
    let dataList = [];
    pokemonCombatList.forEach(value => {
        if (value.QUICK_MOVES[0] !== "STRUGGLE" && value.CINEMATIC_MOVES[0] !== "STRUGGLE") {
            let pokemon = Object.values(pokemonData).find(item => item.num === value.ID && convertName(item.name).includes(value.NAME));
            let stats = calculateStatsByTag(pokemon.baseStats, pokemon.slug);
            value.QUICK_MOVES.forEach(vf => {
                queryMoveEncounter(dataList, pokemon, stats, def, types, vf, value.CINEMATIC_MOVES, false, false, false, false);
                queryMoveEncounter(dataList, pokemon, stats, def, types, vf, value.ELITE_CINEMATIC_MOVES, false, true, false, false);
                queryMoveEncounter(dataList, pokemon, stats, def, types, vf, value.SHADOW_MOVES, false, false, true, false);
                queryMoveEncounter(dataList, pokemon, stats, def, types, vf, value.PURIFIED_MOVES, false, false, false, true);
            });
            value.ELITE_QUICK_MOVES.forEach(vf => {
                queryMoveEncounter(dataList, pokemon, stats, def, types, vf, value.CINEMATIC_MOVES, true, false, false, false);
                queryMoveEncounter(dataList, pokemon, stats, def, types, vf, value.ELITE_CINEMATIC_MOVES, true, true, false);
                queryMoveEncounter(dataList, pokemon, stats, def, types, vf, value.SHADOW_MOVES, true, false, true, false);
                queryMoveEncounter(dataList, pokemon, stats, def, types, vf, value.PURIFIED_MOVES, true, false, false, true);
            });
        }
    });
    return sortEncounterDPS(dataList);
}