import { splitAndCapitalize } from '../util/Utils';
import { LeaguePVP } from './models/league.model';

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

export const convertPVPRankings = (
  data: {
    // eslint-disable-next-line no-unused-vars
    map: (arg0: (league: any) => any) => Iterable<any> | null | undefined;
    // eslint-disable-next-line no-unused-vars
    filter: (arg0: (item: any) => any) => {
      (): any;
      new (): any;
      map: {
        // eslint-disable-next-line no-unused-vars
        (arg0: (item: any) => number): {
          (): any;
          new (): any;
          // eslint-disable-next-line no-unused-vars
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
    if (!result.name.toLowerCase().includes(result.id)) {
      result.name = splitAndCapitalize(league, '_', ' ');
    }
    result.cp = data
      .filter(
        // eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line no-unused-vars
    map: (arg0: (league: any) => any) => Iterable<any> | null | undefined;
    // eslint-disable-next-line no-unused-vars
    filter: (arg0: (item: any) => any) => {
      (): any;
      new (): any;
      map: {
        // eslint-disable-next-line no-unused-vars
        (arg0: (item: any) => number): {
          (): any;
          new (): any;
          // eslint-disable-next-line no-unused-vars
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
    if (!result.name.toLowerCase().includes(result.id)) {
      result.name = splitAndCapitalize(league, '_', ' ');
    }
    result.cp = data
      .filter(
        // eslint-disable-next-line no-unused-vars
        (item: { startsWith: (arg0: any) => any; includes: (arg0: string) => any }) =>
          item.startsWith(league) && item.includes(`${league}/`)
      )
      .map((item: string) => parseInt(item.replace(`${league}/`, '')))
      .sort((a: number, b: number) => a - b);
    result.logo = item ? item.iconUrl : null;
    return result;
  });
};
