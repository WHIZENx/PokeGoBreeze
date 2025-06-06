import { Action, Location } from 'history';

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
