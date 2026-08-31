import APIService from './api.service';
import { APIUrl } from './constants';
import type { AxiosRequestConfig } from 'axios';

export const PROCESSED_DATA_SCHEMA_VERSION = 3;

export class UnsupportedProcessedDataSchemaError extends Error {
  constructor(actualVersion: unknown) {
    super(
      `Processed data schema ${String(actualVersion ?? 'unknown')} is not supported. ` +
        `This web version requires schema ${PROCESSED_DATA_SCHEMA_VERSION}.`
    );
    this.name = 'UnsupportedProcessedDataSchemaError';
  }
}

export interface ProcessedDataMeta {
  schemaVersion: number;
  webVersion: string | null;
  generatedAt: string;
  appIcon?: string;
  source: {
    gameMaster: number;
    gameMasterSha?: string;
    gameMasterCommitSha?: string;
    assets: number;
    items?: number;
    icon?: number;
    sounds: number;
    pvp: number;
  };
  sections: Record<string, number>;
  sectionHashes?: Record<string, string>;
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

export type ProcessedDataSection =
  | 'options'
  | 'cpm'
  | 'pvp'
  | 'statsRankings'
  | 'pokemons'
  | 'combats'
  | 'assets'
  | 'evolutionChains'
  | 'trainers';

const endpoint = (path: string) => `${APIUrl.POKEGO_BREEZE_API_URL}/api/v1/${path}`;

class ProcessedDataService {
  private sectionRequests = new Map<ProcessedDataSection, Promise<unknown>>();
  private generatedAt?: string;

  isConfigured() {
    return Boolean(APIUrl.POKEGO_BREEZE_API_URL);
  }

  async getMeta() {
    const meta = (await APIService.getFetchUrl<ProcessedDataMeta>(endpoint('meta'))).data;
    if (meta.schemaVersion !== PROCESSED_DATA_SCHEMA_VERSION) {
      throw new UnsupportedProcessedDataSchemaError(meta.schemaVersion);
    }
    if (this.generatedAt && this.generatedAt !== meta.generatedAt) {
      this.sectionRequests.clear();
    }
    this.generatedAt = meta.generatedAt;
    return meta;
  }

  getSection<T>(name: ProcessedDataSection) {
    const cachedRequest = this.sectionRequests.get(name) as Promise<T> | undefined;
    if (cachedRequest) {
      return cachedRequest;
    }

    const request = APIService.getFetchUrl<{ data: T }>(`${endpoint('section')}?name=${encodeURIComponent(name)}`)
      .then(({ data }) => data.data)
      .catch((error: unknown) => {
        if (this.sectionRequests.get(name) === request) {
          this.sectionRequests.delete(name);
        }
        throw error;
      });
    this.sectionRequests.set(name, request);
    return request;
  }

  async getPage<T>(
    section: string,
    params: {
      page?: number;
      limit?: number;
      q?: string;
      sort?: string;
      order?: 'asc' | 'desc';
      type?: string;
      typeMove?: number;
    } = {},
    options?: AxiosRequestConfig
  ) {
    const query = new URLSearchParams({ section });
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.set(key, String(value));
      }
    });
    return (await APIService.getFetchUrl<ProcessedDataPage<T>>(`${endpoint('data')}?${query}`, options)).data;
  }
}

export default new ProcessedDataService();
