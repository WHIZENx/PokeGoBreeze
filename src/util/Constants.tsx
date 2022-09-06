import { getOption } from "../options/options";
import APIService from "../services/API.service";

export const RAID_BOSS_TIER: any = {
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

export const STAB_MULTIPLY = (options: any) => { return getOption(options, ["battle_options", "stab"]); }
export const MULTIPLY_LEVEL_FRIENDSHIP = (options: any, level: number = DEFAULT_POKEMON_FRIEND_LEVEL) => {
    return getOption(options, ["trainer_friendship", level.toString(), "atk_bonus"]);
}
export const MULTIPLY_THROW_CHARGE = (options: any, type: string) => { return getOption(options, ["throw_charge", type]);}

/* Shadow exclusive bonus for Pokémon in battle */
export const SHADOW_ATK_BONUS = (options: any) => { return getOption(options, ["combat_options", "shadow_bonus", "atk"]); }
export const SHADOW_DEF_BONUS = (options: any) => { return getOption(options, ["combat_options", "shadow_bonus", "def"]); }

export const regionList: any = {
    1: "Kanto",
    2: "Johto",
    3: "Hoenn",
    4: "Sinnoh",
    5: "Unova",
    6: "Kalos",
    7: "Alola",
    8: "Galar",
}

export const typeCostPowerUp = (type: string) => {
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

export const leaguesRanking = [
    {
        id: "all",
        name: "Little Cup",
        cp: 500,
        logo: APIService.getPokeOtherLeague("GBL_littlecup")
    },
    {
        id: "all",
        name: "Great League",
        cp: 1500,
        logo: APIService.getPokeLeague("great_league")
    },
    {
        id: "all",
        name: "Ultra League",
        cp: 2500,
        logo: APIService.getPokeLeague("ultra_league")
    },
    {
        id: "all",
        name: "Master League",
        cp: 10000,
        logo: APIService.getPokeLeague("master_league")
    },
    // {
    //     id: "adl",
    //     name: "Adl",
    //     cp: [500,1500,2500,1000],
    //     logo: null
    // },
    {
        id: "alchemy",
        name: "Silph Factions (Alchemy)",
        cp: 1500,
        logo: null
    },
    {
        id: "architect",
        name: "Silph Architect Cup",
        cp: 1500,
        logo: null
    },
    // {
    //     id: "championship",
    //     name: "2022 Championship Series",
    //     cp: [500,1500,2500,1000],
    //     logo: null
    // },
    {
        id: "classic",
        name: "Master League (Classic)",
        cp: 10000,
        logo: APIService.getAssetPokeGo("pogo_master_league.png")
    },
    // {
    //     id: "cliffhanger",
    //     name: "cliffhanger",
    //     cp: [500,1500,2500,1000],
    //     logo: null
    // },
    {
        id: "colony",
        name: "Silph Factions (Colony)",
        cp: 1500,
        logo: null
    },
    {
        id: "firefly",
        name: "Fire Fly Cup",
        cp: 1500,
        logo: null
    },
    {
        id: "flying",
        name: "Flying Cup",
        cp: 1500,
        logo: APIService.getAssetPokeGo("LeagueIcons/flying_cup.png")
    },
    {
        id: "forged",
        name: "Forged Cup",
        cp: 1500,
        logo: APIService.getAssetPokeGo("LeagueIcons/catch2022_icon_high.png")
    },
    {
        id: "fossil",
        name: "Fossil Cup",
        cp: 1500,
        logo: APIService.getAssetPokeGo("LeagueIcons/fossil_gblcup.png")
    },
    // {
    //     id: "gobattleleague",
    //     name: "Go Battle League",
    //     cp: [500,1500,2500,1000],
    //     logo: null
    // },
    // {
    //     id: "goteamup",
    //     name: "Go Team Up",
    //     cp: [1500,2500,1000],
    //     logo: null
    // },
    {
        id: "hisui",
        name: "Hisui Cup",
        cp: 1500,
        logo: APIService.getAssetPokeGo("LeagueIcons/hisui_icon.png")
    },
    {
        id: "kanto",
        name: "Kanto Cup",
        cp: 1500,
        logo: APIService.getAssetPokeGo("LeagueIcons/kantoLeague2022_icon.png")
    },
    // {
    //     id: "litlerremix",
    //     name: "Litle Remix",
    //     cp: [500, 1500],
    //     logo: APIService.getAssetPokeGo("LeagueIcons/GBL_littlecupremix.png")
    // },
    {
        id: "mega",
        name: "Mega Master League",
        cp: 10000,
        logo: APIService.getAssetPokeGo("pogo_master_league.png")
    },
    // {
    //     id: "premierclassic",
    //     name: "Premier Classic League",
    //     cp: [1500, 2500, 10000],
    //     logo: "premierball_sprite.png"
    // },
    // {
    //     id: "remix",
    //     name: "Remix",
    //     cp: [1500, 2500, 10000],
    //     logo: null
    // },
    {
        id: "retro",
        name: "Retro Cup",
        cp: 1500,
        logo: APIService.getAssetPokeGo("LeagueIcons/GBL_retrocup.png")
    },
    {
        id: "river",
        name: "River Cup",
        cp: 1500,
        logo: null
    },
    {
        id: "summer",
        name: "Summer Cup",
        cp: 1500,
        logo: null
    },
]

export const leaguesTeam = [
    {
        id: "all",
        name: "Great League",
        cp: 1500,
        logo: APIService.getPokeLeague("great_league")
    },
    {
        id: "all",
        name: "Ultra League",
        cp: 2500,
        logo: APIService.getPokeLeague("ultra_league")
    },
    {
        id: "all",
        name: "Master League",
        cp: 10000,
        logo: APIService.getPokeLeague("master_league")
    },
    {
        id: "classic",
        name: "Master League (Classic)",
        cp: 10000,
        logo: APIService.getAssetPokeGo("pogo_master_league.png")
    },
    {
        id: "hisui",
        name: "Hisui Cup",
        cp: 1500,
        logo: APIService.getAssetPokeGo("LeagueIcons/hisui_icon.png")
    },
    {
        id: "kanto",
        name: "Kanto Cup",
        cp: 1500,
        logo: APIService.getAssetPokeGo("LeagueIcons/kantoLeague2022_icon.png")
    },
    {
        id: "remix",
        name: "Great League Remix",
        cp: 1500,
        logo: APIService.getAssetPokeGo("LeagueIcons/league_icon_great_pokemon_limit.png")
    },
    {
        id: "remix",
        name: "Ultra League Remix",
        cp: 2500,
        logo: APIService.getAssetPokeGo("LeagueIcons/league_icon_ultra_pokemon_limit.png")
},
    {
        id: "retro",
        name: "Retro Cup",
        cp: 1500,
        logo: APIService.getAssetPokeGo("LeagueIcons/GBL_retrocup.png")
    },
]

export const leaguesTeamBattle = [
    {
        id: "all",
        name: "Little Cup",
        cp: 500,
        logo: APIService.getPokeOtherLeague("GBL_littlecup")
    },
    {
        id: "all",
        name: "Great League",
        cp: 1500,
        logo: APIService.getPokeLeague("great_league")
    },
    {
        id: "all",
        name: "Ultra League",
        cp: 2500,
        logo: APIService.getPokeLeague("ultra_league")
    },
    {
        id: "all",
        name: "Master League",
        cp: 10000,
        logo: APIService.getPokeLeague("master_league")
    },
]