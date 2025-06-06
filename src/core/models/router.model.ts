import { Location } from 'history';

export interface LocationState {
  id: number;
  url: string;
  stats?: string;
}

export type RouterLocation = (Location & { state?: LocationState }) | null;
