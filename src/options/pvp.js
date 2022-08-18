import { splitAndCapitalize } from "../util/Utils"

const leagueModel = () => {
    return {
        id: "",
        name: "",
        cp: 0,
        logo: null
    }
}

export const pvpFindPath = (data, path) => {
    return data.tree.filter(item =>
        item.path.includes(`src/data/${path}/`)
    ).map(item => item.path.replace(`src/data/${path}/`, ""))
}

export const convertPVPRankings = (data, leagues) => {

    return Array.from(new Set(data.map(league => league.split("/")[0])))
    .map(league => {
        let item;
        if (league !== "all") {
            item = leagues.find(item => item.iconUrl.includes(league));
            if (!item) {
                item = leagues.find(item => item.title.replaceAll("_", "").includes(league.toUpperCase()));
            }
            if (!item) {
                item = leagues.find(item => item.id.includes(league.toUpperCase()));
            }
        }

        let result = leagueModel();
        result.id = league;
        result.name = splitAndCapitalize(item ? item.title : league, "_", " ");
        if (!result.name.toLowerCase().includes(result.id)) result.name = splitAndCapitalize(league, "_", " ");
        result.cp = data.filter(item => item.startsWith(league) &&
        item.includes(`${league}/overall/`)).map(item => parseInt(item.replace(`${league}/overall/rankings-`, "")))
        .sort((a,b) => a-b);
        result.logo = item ? item.iconUrl : null;
        return result;
    })
}

export const convertPVPTrain = (data, leagues) => {

    return Array.from(new Set(data.map(league => league.split("/")[0])))
    .map(league => {
        let item;
        if (league !== "all") {
            item = leagues.find(item => item.iconUrl.includes(league));
            if (!item) {
                item = leagues.find(item => item.title.replaceAll("_", "").includes(league.toUpperCase()));
            }
            if (!item) {
                item = leagues.find(item => item.id.includes(league.toUpperCase()));
            }
        }
        let result = leagueModel();
        result.id = league;
        result.name = splitAndCapitalize(item ? item.title : league, "_", " ");
        if (!result.name.toLowerCase().includes(result.id)) result.name = splitAndCapitalize(league, "_", " ");
        result.cp = data.filter(item => item.startsWith(league) &&
        item.includes(`${league}/`)).map(item => parseInt(item.replace(`${league}/`, "")))
        .sort((a,b) => a-b);
        result.logo = item ? item.iconUrl : null;
        return result;
    })
}