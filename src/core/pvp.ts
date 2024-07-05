import { APIPath, APITree } from '../services/models/api.model';
import { splitAndCapitalize } from '../util/Utils';
import { ILeague, LeaguePVP } from './models/league.model';

export const pvpConvertPath = (data: APITree, path: string) => {
  return data.tree.filter((item) => item.path.includes(path)).map((item) => item.path.replace(path, ''));
};

export const pvpFindFirstPath = (data: APIPath[], path: string) => {
  return data?.filter((item) => item.path.includes(path)).map((item) => item.path);
};

export const pvpFindPath = (data: string[], path: string) => {
  return data?.filter((item) => item.includes(path)).map((item) => item.replace(path, ''));
};

export const convertPVPRankings = (data: string[], leagues: ILeague[]) => {
  return [...new Set(data.map((league) => league.split('/').at(0)))].map((league) => {
    let item;
    if (league !== 'all') {
      item = leagues.find((item) => item.iconUrl?.includes(league ?? ''));
      if (!item) {
        item = leagues.find((item) => item.title.replaceAll('_', '').includes(league?.toUpperCase() ?? ''));
      }
      if (!item) {
        item = leagues.find((item) => item.id?.includes(league?.toUpperCase() ?? ''));
      }
    }

    const result = new LeaguePVP();
    result.id = league ?? '';
    result.name = splitAndCapitalize(item ? item.title : league, '_', ' ');
    if (!result.name.toLowerCase().includes(result.id)) {
      result.name = splitAndCapitalize(league, '_', ' ');
    }
    result.cp = data
      .filter((item) => item.startsWith(league ?? '') && item.includes(`${league}/overall/`))
      .map((item) => parseInt(item.replace(`${league}/overall/rankings-`, '')))
      .sort((a, b) => a - b);
    result.logo = item?.iconUrl ?? null;
    return result;
  });
};

export const convertPVPTrain = (data: string[], leagues: ILeague[]) => {
  return [...new Set(data.map((league) => league.split('/').at(0)))].map((league) => {
    let item;
    if (league !== 'all') {
      item = leagues.find((item) => item.iconUrl?.includes(league ?? ''));
      if (!item) {
        item = leagues.find((item) => item.title.replaceAll('_', '').includes(league?.toUpperCase() ?? ''));
      }
      if (!item) {
        item = leagues.find((item) => item.id?.includes(league?.toUpperCase() ?? ''));
      }
    }
    const result = new LeaguePVP();
    result.id = league ?? '';
    result.name = splitAndCapitalize(item ? item.title : league, '_', ' ');
    if (!result.name.toLowerCase().includes(result.id)) {
      result.name = splitAndCapitalize(league, '_', ' ');
    }
    result.cp = data
      .filter((item) => item.startsWith(league ?? '') && item.includes(`${league}/`))
      .map((item) => parseInt(item.replace(`${league}/`, '')))
      .sort((a, b) => a - b);
    result.logo = item?.iconUrl ?? null;
    return result;
  });
};
