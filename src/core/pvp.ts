import { APIPath, APITree } from '../services/models/api.model';
import { ScoreType } from '../util/enums/constants.enum';
import { EqualMode, IncludeMode } from '../util/enums/string.enum';
import { getValueOrDefault, isEqual, isInclude, toNumber, UniqValueInArray } from '../util/extension';
import { getKeyWithData, splitAndCapitalize } from '../util/utils';
import { LeagueBattleType } from './enums/league.enum';
import { ILeague } from './models/league.model';
import { PVPInfo } from './models/pvp.model';

export const pvpConvertPath = (data: APITree, path: string) =>
  data.tree.filter((item) => isInclude(item.path, path)).map((item) => item.path.replace(path, ''));

export const pvpFindFirstPath = (data: APIPath[], path: string) =>
  data.filter((item) => isInclude(item.path, path)).map((item) => item.path);

export const pvpFindPath = (data: string[], path: string) =>
  data.filter((item) => isInclude(item, path)).map((item) => item.replace(path, ''));

const getLeague = (leagues: ILeague[], league: string) => {
  let item: ILeague | undefined;
  if (!isEqual(league, LeagueBattleType.All, EqualMode.IgnoreCaseSensitive)) {
    item = leagues.find((item) => isInclude(item.iconUrl, league, IncludeMode.IncludeIgnoreCaseSensitive));
    if (!item) {
      item = leagues.find((item) => isInclude(item.title.replaceAll('_', ''), league, IncludeMode.IncludeIgnoreCaseSensitive));
    }
    if (!item) {
      item = leagues.find((item) => isInclude(item.id, league, IncludeMode.IncludeIgnoreCaseSensitive));
    }
  }
  return item;
};

export const convertPVPRankings = (data: string[], leagues: ILeague[]) =>
  UniqValueInArray(data.map((league) => league.split('/').at(0))).map((league) => {
    const item = getLeague(leagues, league);
    const result = new PVPInfo();
    result.id = getValueOrDefault(String, league);
    result.name = splitAndCapitalize((item ? item.title : league)?.replaceAll('-', '_'), '_', ' ');
    if (!isInclude(result.name, result.id, IncludeMode.IncludeIgnoreCaseSensitive)) {
      result.name = splitAndCapitalize(league?.replaceAll('-', '_'), '_', ' ');
    }
    result.cp = data
      .filter(
        (item) => item.startsWith(result.id) && isInclude(item, `${league}/${getKeyWithData(ScoreType, ScoreType.Overall)?.toLowerCase()}/`)
      )
      .map((item) => toNumber(item.replace(`${league}/${getKeyWithData(ScoreType, ScoreType.Overall)?.toLowerCase()}/rankings-`, '')))
      .sort((a, b) => a - b);
    result.logo = item?.iconUrl;
    return result;
  });

export const convertPVPTrain = (data: string[], leagues: ILeague[]) =>
  UniqValueInArray(data.map((league) => league.split('/').at(0))).map((league) => {
    const item = getLeague(leagues, league);
    const result = new PVPInfo();
    result.id = getValueOrDefault(String, league);
    result.name = splitAndCapitalize(item ? item.title : league, '_', ' ');
    if (!isInclude(result.name, result.id, IncludeMode.IncludeIgnoreCaseSensitive)) {
      result.name = splitAndCapitalize(league, '_', ' ');
    }
    result.cp = data
      .filter((item) => item.startsWith(result.id) && isInclude(item, `${league}/`))
      .map((item) => toNumber(item.replace(`${league}/`, '')))
      .sort((a, b) => a - b);
    result.logo = item?.iconUrl;
    return result;
  });
