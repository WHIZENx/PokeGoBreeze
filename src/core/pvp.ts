import { APIPath, APITree } from '../services/models/api.model';
import { EqualMode, IncludeMode } from '../util/enums/string.enum';
import { getValueOrDefault, isEqual, isInclude, toNumber } from '../util/extension';
import { splitAndCapitalize } from '../util/utils';
import { LeagueType } from './enums/league.enum';
import { ILeague, LeaguePVP } from './models/league.model';

export const pvpConvertPath = (data: APITree, path: string) => {
  return data.tree.filter((item) => isInclude(item.path, path)).map((item) => item.path.replace(path, ''));
};

export const pvpFindFirstPath = (data: APIPath[], path: string) => {
  return data.filter((item) => isInclude(item.path, path)).map((item) => item.path);
};

export const pvpFindPath = (data: string[], path: string) => {
  return data.filter((item) => isInclude(item, path)).map((item) => item.replace(path, ''));
};

export const convertPVPRankings = (data: string[], leagues: ILeague[]) => {
  return [...new Set(data.map((league) => league.split('/').at(0)))].map((league) => {
    let item;
    if (!isEqual(league, LeagueType.All, EqualMode.IgnoreCaseSensitive)) {
      item = leagues.find((item) => isInclude(item.iconUrl, league));
      if (!item) {
        item = leagues.find((item) => isInclude(item.title.replaceAll('_', ''), league, IncludeMode.IncludeIgnoreCaseSensitive));
      }
      if (!item) {
        item = leagues.find((item) => isInclude(item.id, league, IncludeMode.IncludeIgnoreCaseSensitive));
      }
    }

    const result = new LeaguePVP();
    result.id = getValueOrDefault(String, league);
    result.name = splitAndCapitalize((item ? item.title : league)?.replaceAll('-', '_'), '_', ' ');
    if (!isInclude(result.name, result.id, IncludeMode.IncludeIgnoreCaseSensitive)) {
      result.name = splitAndCapitalize(league?.replaceAll('-', '_'), '_', ' ');
    }
    result.cp = data
      .filter((item) => item.startsWith(getValueOrDefault(String, league)) && isInclude(item, `${league}/overall/`))
      .map((item) => toNumber(item.replace(`${league}/overall/rankings-`, '')))
      .sort((a, b) => a - b);
    result.logo = item?.iconUrl;
    return result;
  });
};

export const convertPVPTrain = (data: string[], leagues: ILeague[]) => {
  return [...new Set(data.map((league) => league.split('/').at(0)))].map((league) => {
    let item;
    if (!isEqual(league, LeagueType.All, EqualMode.IgnoreCaseSensitive)) {
      item = leagues.find((item) => isInclude(item.iconUrl, league, IncludeMode.IncludeIgnoreCaseSensitive));
      if (!item) {
        item = leagues.find((item) => isInclude(item.title.replaceAll('_', ''), league, IncludeMode.IncludeIgnoreCaseSensitive));
      }
      if (!item) {
        item = leagues.find((item) => isInclude(item.id, league, IncludeMode.IncludeIgnoreCaseSensitive));
      }
    }
    const result = new LeaguePVP();
    result.id = getValueOrDefault(String, league);
    result.name = splitAndCapitalize(item ? item.title : league, '_', ' ');
    if (!isInclude(result.name, result.id, IncludeMode.IncludeIgnoreCaseSensitive)) {
      result.name = splitAndCapitalize(league, '_', ' ');
    }
    result.cp = data
      .filter((item) => item.startsWith(getValueOrDefault(String, league)) && isInclude(item, `${league}/`))
      .map((item) => toNumber(item.replace(`${league}/`, '')))
      .sort((a, b) => a - b);
    result.logo = item?.iconUrl;
    return result;
  });
};
