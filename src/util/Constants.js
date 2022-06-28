import { getOption } from "../options/options";

export const RAID_BOSS_TIER = {
    1: {
        level: 20,
        CPm: 0.61,
        sta: 600,
        timer: 180
    },
    2: {
        level: 25,
        CPm: 0.6679,
        sta: 1800,
        timer: 180
    },
    3: {
        level: 30,
        CPm: 0.7317,
        sta: 3600,
        timer: 180
    },
    4: {
        level: 40,
        CPm: 0.7903,
        sta: 9000,
        timer: 180
    },
    5: {
        level: 40,
        CPm: 0.79,
        sta: 15000,
        timer: 300
    },
    6: {
        level: 40,
        CPm: 0.79,
        sta: 22500,
        timer: 300
    }
};

export const DEFAULT_POKEMON_DEF_OBJ = 160;
export const DEFAULT_POKEMON_SHADOW = false;
export const DEFAULT_TRAINER_FRIEND = false;
export const DEFAULT_WEATHER_BOOSTS = false;
export const DEFAULT_POKEMON_FRIEND_LEVEL = 0;

export const DEFAULT_ENERYGY_PER_HP_LOST = 0.5;
export const DEFAULT_DAMAGE_MULTIPLY = 0.5;
export const DEFAULT_DAMAGE_CONST = 1;
export const DEFAULT_ENEMY_ATK_DELAY = 2;

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 51;

export const MIN_IV = 0;
export const MAX_IV = 15;

export const STAB_MULTIPLY = getOption("battle_options", "stab");

/* Shadow exclusive bonus for Pokémon in battle */
export const SHADOW_ATK_BONUS = getOption("combat_options", "shadow_bonus", "atk");
export const SHADOW_DEF_BONUS = getOption("combat_options", "shadow_bonus", "def");

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

export const typeCostPowerUp = (type) => {
    if (type === "shadow") {
        return {
            stadust: 1.2,
            candy: 1.2,
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