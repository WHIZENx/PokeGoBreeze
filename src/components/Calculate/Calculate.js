export const sortStatsPoke = (states) => {
    const attackRanking = Array.from(new Set(states.sort((a,b) => (a.base_attack > b.base_attack) ? 1 : ((b.base_attack > a.base_attack) ? -1 : 0))
    .map((item) => {
        return item.base_attack;
    })));
    const minATK = Math.min(...attackRanking);
    const maxATK = Math.max(...attackRanking);
    const attackStats = states.map((item) => {
        return {id: item.pokemon_id, form: item.form, attack: item.base_attack, rank: maxATK-attackRanking.indexOf(item.base_attack)+1};
    });

    const defenseRanking = Array.from(new Set(states.sort((a,b) => (a.base_defense > b.base_defense) ? 1 : ((b.base_defense > a.base_defense) ? -1 : 0))
    .map((item) => {
        return item.base_defense;
    })));
    const minDEF = Math.min(...defenseRanking);
    const maxDEF = Math.max(...defenseRanking);
    const defenseStats = states.map((item) => {
        return {id: item.pokemon_id, form: item.form, defense: item.base_defense, rank: maxDEF-defenseRanking.indexOf(item.base_defense)+1};
    });

    const staminaRanking = Array.from(new Set(states.sort((a,b) => (a.base_stamina > b.base_stamina) ? 1 : ((b.base_stamina > a.base_stamina) ? -1 : 0))
    .map((item) => {
        return item.base_stamina;
    })));
    const minSTA = Math.min(...staminaRanking);
    const maxSTA = Math.max(...staminaRanking);
    const staminaStats = states.map((item) => {
        return {id: item.pokemon_id, form: item.form, stamina: item.base_stamina, rank: maxSTA-staminaRanking.indexOf(item.base_stamina)+1};
    });
    
    return {
        "attack": {
            "ranking": attackStats,
            "min_rank": minATK,
            "max_rank": maxATK
        },
        "defense": {
            "ranking": defenseStats,
            "min_rank": minDEF,
            "max_rank": maxDEF
        },
        "stamina": {
            "ranking": staminaStats,
            "min_rank": minSTA,
            "max_rank": maxSTA
        }
    };
}