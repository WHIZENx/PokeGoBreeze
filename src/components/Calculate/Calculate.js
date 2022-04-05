export const sortStatsPoke = (states, megaStats) => {
    states.push(...megaStats.map(item => {return {
        base_attack: item.stats.base_attack,
        base_defense: item.stats.base_defense,
        base_stamina: item.stats.base_stamina,
        form: "Mega" + ((item.form === "Normal") ? "" : "-"+item.form),
        pokemon_id: item.pokemon_id,
        pokemon_name: item.pokemon_name
    }}));
    const attackRanking = Array.from(new Set(states.sort((a,b) => (a.base_attack > b.base_attack) ? 1 : ((b.base_attack > a.base_attack) ? -1 : 0))
    .map((item) => {
        return item.base_attack;
    })));
    const minATK = Math.min(...attackRanking);
    const maxATK = Math.max(...attackRanking);
    const attackStats = states.map((item) => {
        return {id: item.pokemon_id, form: item.form, attack: item.base_attack, rank: attackRanking.length-attackRanking.indexOf(item.base_attack)};
    });

    const defenseRanking = Array.from(new Set(states.sort((a,b) => (a.base_defense > b.base_defense) ? 1 : ((b.base_defense > a.base_defense) ? -1 : 0))
    .map((item) => {
        return item.base_defense;
    })));
    const minDEF = Math.min(...defenseRanking);
    const maxDEF = Math.max(...defenseRanking);
    const defenseStats = states.map((item) => {
        return {id: item.pokemon_id, form: item.form, defense: item.base_defense, rank: defenseRanking.length-defenseRanking.indexOf(item.base_defense)};
    });

    const staminaRanking = Array.from(new Set(states.sort((a,b) => (a.base_stamina > b.base_stamina) ? 1 : ((b.base_stamina > a.base_stamina) ? -1 : 0))
    .map((item) => {
        return item.base_stamina;
    })));
    const minSTA = Math.min(...staminaRanking);
    const maxSTA = Math.max(...staminaRanking);

    const staminaStats = states.map((item) => {
        return {id: item.pokemon_id, form: item.form, stamina: item.base_stamina, rank: staminaRanking.length-staminaRanking.indexOf(item.base_stamina)};
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

// Thank calculate algorithm from pokemongohub.net
export const calBaseATK = (stats) => {
    const lower = stats.find(item => item.stat.name === "attack").base_stat;
    const higher = stats.find(item => item.stat.name === "special-attack").base_stat;

    const speed = stats.find(item => item.stat.name === "speed").base_stat;

    const scaleATK = Math.round(2*((7/8)*higher+(1/8)*lower));
    const speedMod = 1+(speed-75)/500;
    return Math.round(scaleATK * speedMod);
}

export const calBaseDEF = (stats) => {
    const lower = stats.find(item => item.stat.name === "defense").base_stat;
    const higher = stats.find(item => item.stat.name === "special-defense").base_stat;

    const speed = stats.find(item => item.stat.name === "speed").base_stat;

    const scaleDEF = Math.round(2*((5/8)*higher+(3/8)*lower));
    const speedMod = 1+(speed-75)/500;
    return Math.round(scaleDEF * speedMod);
}

export const calBaseSTA = (stats) => {
    const hp = stats.find(item => item.stat.name === "hp").base_stat;

    return Math.floor(hp * 1.75 + 50);
}