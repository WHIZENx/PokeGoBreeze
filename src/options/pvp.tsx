import { splitAndCapitalize } from '../util/Utils';
import { LeaguePVP } from './models/league';

const leagueModel = () => {
  return {
    id: '',
    name: '',
    cp: 0,
    logo: null,
  };
};

export const pvpFindPath = (data: { tree: any[] }, path: string) => {
  return data.tree
    .filter((item: { path: string | string[] }) => item.path.includes(path))
    .map((item: { path: string }) => item.path.replace(path, ''));
};

export const convertPVPRankings = (
  data: {
    map: (arg0: (league: any) => any) => Iterable<any> | null | undefined;
    filter: (arg0: (item: any) => any) => {
      (): any;
      new (): any;
      map: {
        (arg0: (item: any) => number): {
          (): any;
          new (): any;
          sort: { (arg0: (a: any, b: any) => number): number; new (): any };
        };
        new (): any;
      };
    };
  },
  leagues: any[]
) => {
  return Array.from(new Set(data.map((league: string) => league.split('/')[0]))).map((league: any) => {
    let item;
    if (league !== 'all') {
      item = leagues.find((item: { iconUrl: any[] }) => item.iconUrl.includes(league));
      if (!item) {
        item = leagues.find((item: { title: string }) => item.title.replaceAll('_', '').includes(league.toUpperCase()));
      }
      if (!item) {
        item = leagues.find((item: { id: string | any[] }) => item.id.includes(league.toUpperCase()));
      }
    }

    const result: LeaguePVP = leagueModel();
    result.id = league;
    result.name = splitAndCapitalize(item ? item.title : league, '_', ' ');
    if (!result.name.toLowerCase().includes(result.id)) result.name = splitAndCapitalize(league, '_', ' ');
    result.cp = data
      .filter(
        (item: { startsWith: (arg0: any) => any; includes: (arg0: string) => any }) =>
          item.startsWith(league) && item.includes(`${league}/overall/`)
      )
      .map((item: string) => parseInt(item.replace(`${league}/overall/rankings-`, '')))
      .sort((a: number, b: number) => a - b);
    result.logo = item ? item.iconUrl : null;
    return result;
  });
};

export const convertPVPTrain = (
  data: {
    map: (arg0: (league: any) => any) => Iterable<any> | null | undefined;
    filter: (arg0: (item: any) => any) => {
      (): any;
      new (): any;
      map: {
        (arg0: (item: any) => number): {
          (): any;
          new (): any;
          sort: { (arg0: (a: any, b: any) => number): number; new (): any };
        };
        new (): any;
      };
    };
  },
  leagues: any[]
) => {
  return Array.from(new Set(data.map((league: string) => league.split('/')[0]))).map((league: any) => {
    let item;
    if (league !== 'all') {
      item = leagues.find((item: { iconUrl: any[] }) => item.iconUrl.includes(league));
      if (!item) {
        item = leagues.find((item: { title: string }) => item.title.replaceAll('_', '').includes(league.toUpperCase()));
      }
      if (!item) {
        item = leagues.find((item: { id: string | any[] }) => item.id.includes(league.toUpperCase()));
      }
    }
    const result: LeaguePVP = leagueModel();
    result.id = league;
    result.name = splitAndCapitalize(item ? item.title : league, '_', ' ');
    if (!result.name.toLowerCase().includes(result.id)) result.name = splitAndCapitalize(league, '_', ' ');
    result.cp = data
      .filter(
        (item: { startsWith: (arg0: any) => any; includes: (arg0: string) => any }) =>
          item.startsWith(league) && item.includes(`${league}/`)
      )
      .map((item: string) => parseInt(item.replace(`${league}/`, '')))
      .sort((a: number, b: number) => a - b);
    result.logo = item ? item.iconUrl : null;
    return result;
  });
};
