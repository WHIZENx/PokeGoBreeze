import data from "../../data/cp_multiplier.json";

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
    if (calculateCP(baseATK, calBaseDEF(stats, false), calBaseSTA(stats, false), 40) >= 4000) return Math.round(scaleATK * speedMod * 0.91);
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
    if (calculateCP(calBaseATK(stats, false), baseDEF, calBaseSTA(stats, false), 40) >= 4000) return Math.round(scaleDEF * speedMod * 0.91);
    else return baseDEF;
}

export const calBaseSTA = (stats, nerf) => {
    const hp = stats.hp !== undefined ? stats.hp : stats.find(item => item.stat.name === "hp").base_stat;

    const baseSTA = Math.floor(hp * 1.75 + 50);
    if (!nerf) return baseSTA;
    if (calculateCP(calBaseATK(stats, false), calBaseDEF(stats, false), baseSTA, 40) >= 4000) return Math.round((hp * 1.75 + 50) * 0.91);
    else return baseSTA;
}

export const sortStatsPokemon = (states) => {
    const attackRanking = Array.from(new Set(states.sort((a,b) => (a.baseStatsPokeGo.attack > b.baseStatsPokeGo.attack) ? 1 : ((b.baseStatsPokeGo.attack > a.baseStatsPokeGo.attack) ? -1 : 0))
    .map(item => {
        return item.baseStatsPokeGo.attack;
    })));

    const minATK = Math.min(...attackRanking);
    const maxATK = Math.max(...attackRanking);
    const attackStats = states.map((item) => {
        return {id: item.id, form: item.name.split("-")[1] ? item.name.slice(item.name.indexOf("-")+1, item.name.length) : "Normal", attack: item.baseStatsPokeGo.attack, rank: attackRanking.length-attackRanking.indexOf(item.baseStatsPokeGo.attack)};
    });

    const defenseRanking = Array.from(new Set(states.sort((a,b) => (a.baseStatsPokeGo.defense > b.baseStatsPokeGo.defense) ? 1 : ((b.baseStatsPokeGo.defense > a.baseStatsPokeGo.defense) ? -1 : 0))
    .map(item => {
        return item.baseStatsPokeGo.defense;
    })));

    const minDEF = Math.min(...defenseRanking);
    const maxDEF = Math.max(...defenseRanking);
    const defenseStats = states.map((item) => {
        return {id: item.id, form: item.name.split("-")[1] ? item.name.slice(item.name.indexOf("-")+1, item.name.length) : "Normal", defense: item.baseStatsPokeGo.defense, rank: defenseRanking.length-defenseRanking.indexOf(item.baseStatsPokeGo.defense)};
    });

    const staminaRanking = Array.from(new Set(states.sort((a,b) => (a.baseStatsPokeGo.stamina > b.baseStatsPokeGo.stamina) ? 1 : ((b.baseStatsPokeGo.stamina > a.baseStatsPokeGo.stamina) ? -1 : 0))
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

let min_level = 1;
let max_level = 51;

let min_iv = 0
let max_iv = 15

export const calculateCP = (atk, def, sta, level) => {
    return Math.floor(Math.max(10, (atk*(def**0.5)*(sta**0.5)*data.find(item => item.level === level).multiplier**2)/10))
}

export const predictStat = (atk, def, sta, cp) => {
    cp = parseInt(cp)
    let dataStat = {}
    let minLevel = 1;
    let maxLevel = 1;
    for (let i = min_level; i <= max_level; i+=0.5) {
        if (cp <= calculateCP(atk+15, def+15, sta+15, i)) {
            minLevel = i
            break;
        }
    }
    for (let i = minLevel; i <= max_level; i+=0.5) {
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
        for (let i = min_iv; i <= max_iv; i++) {
            for (let j = min_iv; j <= max_iv; j++) {
                for (let k = min_iv; k <= max_iv; k++) {
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
    for (let i = min_level; i <= max_level; i+=0.5) {
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

    for (let i = min_level; i <= max_level; i+=0.5) {
        if (cp === calculateCP(atk+IVatk, def+IVdef, sta+IVsta, i)) {
            dataStat.level = i;
            break;
        }
    }
    return dataStat;
}

export const calculateBetweenLevel = (atk, def, sta, IVatk, IVdef, IVsta, from_lv, to_lv, type) => {
    from_lv -= 0.5;
    to_lv -= 0.5;

    let power_up_count = (to_lv-from_lv)*2;

    if (from_lv > to_lv) {
        return {
            cp: calculateCP(atk+IVatk, def+IVdef, sta+IVsta, to_lv+0.5),
            result_between_stadust: null,
            result_between_candy: null,
            result_between_xl_candy: null,
            power_up_count: null
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

export const calculateBettleLeague = (atk, def, sta, IVatk, IVdef, IVsta, from_lv, currCP, maxCp, type) => {
    let level = max_level;
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
            for (let i = min_level; i <= level; i+=0.5) {
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

export const typeCostPowerUp = (type) => {
    if (type === "shadow") {
        return {
            stadust: 1.2,
            candy: 1.2,
            bonus: {
                atk : 1.2,
                def : 0.8
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

export const calStatsProd = (atk, def, sta, maxCP) => {
    let dataList = []

    for (let l = min_level; l <= max_level; l+=0.5) {
        let currCP = 0;
        for (let i = min_iv; i <= max_iv; i++) {
            for (let j = min_iv; j <= max_iv; j++) {
                for (let k = min_iv; k <= max_iv; k++) {
                    const cp = calculateCP(atk+i, def+j, sta+k, l);
                    if (currCP < cp && (maxCP == null || cp <= maxCP)) {
                        const statsATK = (atk+i)*data.find(item => item.level === l).multiplier;
                        const statsDEF = (def+j)*data.find(item => item.level === l).multiplier;
                        const statsSTA = (sta+k)*data.find(item => item.level === l).multiplier;
                        dataList.push({
                            IV: {atk: i, def: j, sta: k},
                            CP: cp,
                            level: l,
                            stats: {statsATK: statsATK, statsDEF: statsDEF, statsSTA: statsSTA},
                            statsProds: statsATK*statsDEF*statsSTA,
                        });
                        currCP = cp;
                    }
                }
            }
        }
    }
    const maxStatsProds = Math.max.apply(Math, dataList.map(item => { return item.statsProds; }));
    dataList = dataList.map(item => ({...item, ratio: item.statsProds*100/maxStatsProds}));
    dataList = dataList.sort((a,b) => a.statsProds - b.statsProds);
    dataList = dataList.map((item, index) => ({...item, rank: dataList.length-index}));
    return dataList;
}