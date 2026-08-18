import APIService from './api.service';
import { APIUrl } from './constants';

export interface ProcessedDataMeta {
  schemaVersion: number;
  webVersion: string | null;
  generatedAt: string;
  source: {
    gameMaster: number;
    assets: number;
    sounds: number;
    pvp: number;
  };
  sections: Record<string, number>;
}

export interface ProcessedDataPage<T> {
  data: T[];
  meta: {
    section: string;
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const endpoint = (path: string) => `${APIUrl.POKEGO_BREEZE_API_URL}/api/v1/${path}`;

class ProcessedDataService {
  isConfigured() {
    return Boolean(APIUrl.POKEGO_BREEZE_API_URL);
  }

  async getMeta() {
    return (await APIService.getFetchUrl<ProcessedDataMeta>(endpoint('meta'))).data;
  }

  async getSection<T>(name: string) {
    return (await APIService.getFetchUrl<{ data: T }>(`${endpoint('section')}?name=${encodeURIComponent(name)}`)).data
      .data;
  }

  async getPage<T>(
    section: string,
    params: { page?: number; limit?: number; q?: string; sort?: string; order?: 'asc' | 'desc' } = {}
  ) {
    const query = new URLSearchParams({ section });
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.set(key, String(value));
      }
    });
    return (await APIService.getFetchUrl<ProcessedDataPage<T>>(`${endpoint('data')}?${query}`)).data;
  }
}

export default new ProcessedDataService();
