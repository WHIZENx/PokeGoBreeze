// Define local types to avoid import issues with history package in Vite
export type Action = 'POP' | 'PUSH' | 'REPLACE';

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state?: any;
  key?: string;
}

export interface LocationState {
  id: number;
  url: string;
  stats?: string;
}

export type RouterLocation = (Location & { state?: LocationState }) | null;

export interface RouterChange {
  location: RouterLocation;
  action: Action | null;
}

export interface RouterModify {
  path: string;
  state?: LocationState;
}
