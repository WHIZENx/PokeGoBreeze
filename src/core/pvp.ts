import { splitAndCapitalize } from '../util/Utils';
import { League, LeaguePVP } from './models/league.model';

const leagueModel = () => {
  return {
    id: '',
    name: '',
    cp: 0,
    logo: null,
  };
};

export const pvpConvertPath = (data: { tree: any[] }, path: string) => {
  return data.tree
    .filter((item: { path: string | string[] }) => item.path.includes(path))
    .map((item: { path: string }) => item.path.replace(path, ''));
};

export const pvpFindFirstPath = (data: any[], path: string) => {
  return data.filter((item: { path: string | string[] }) => item.path.includes(path)).map((item: { path: string }) => item.path);
};

export const pvpFindPath = (data: any[], path: string) => {
  return data.filter((item: string) => item.includes(path)).map((item: string) => item.replace(path, ''));
};

export const convertPVPRankings = (data: any[], leagues: League[]) => {
  return Array.from(new Set(data.map((league) => league.split('/')[0]))).map((league: string) => {
    let item;
    if (league !== 'all') {
      item = leagues.find((item) => item.iconUrl.includes(league));
      if (!item) {
        item = leagues.find((item) => item.title.replaceAll('_', '').includes(league.toUpperCase()));
      }
      if (!item) {
        item = leagues.find((item) => item.id.includes(league.toUpperCase()));
      }
    }

    const result: LeaguePVP = leagueModel();
    result.id = league;
    result.name = splitAndCapitalize(item ? item.title : league, '_', ' ');
    if (!result.name.toLowerCase().includes(result.id)) {
      result.name = splitAndCapitalize(league, '_', ' ');
    }
    result.cp = data
      .filter((item) => item.startsWith(league) && item.includes(`${league}/overall/`))
      .map((item) => parseInt(item.replace(`${league}/overall/rankings-`, '')))
      .sort((a, b) => a - b);
    result.logo = item ? item.iconUrl : null;
    return result;
  });
};

export const convertPVPTrain = (data: any[], leagues: League[]) => {
  return Array.from(new Set(data.map((league) => league.split('/')[0]))).map((league: string) => {
    let item;
    if (league !== 'all') {
      item = leagues.find((item) => item.iconUrl.includes(league));
      if (!item) {
        item = leagues.find((item) => item.title.replaceAll('_', '').includes(league.toUpperCase()));
      }
      if (!item) {
        item = leagues.find((item) => item.id.includes(league.toUpperCase()));
      }
    }
    const result: LeaguePVP = leagueModel();
    result.id = league;
    result.name = splitAndCapitalize(item ? item.title : league, '_', ' ');
    if (!result.name.toLowerCase().includes(result.id)) {
      result.name = splitAndCapitalize(league, '_', ' ');
    }
    result.cp = data
      .filter((item) => item.startsWith(league) && item.includes(`${league}/`))
      .map((item) => parseInt(item.replace(`${league}/`, '')))
      .sort((a, b) => a - b);
    result.logo = item ? item.iconUrl : null;
    return result;
  });
};
