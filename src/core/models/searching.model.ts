import { SearchingModel } from '../../store/models/searching.model';

export interface SearchingOptionsModel {
  mainSearching: SearchingModel | null;
  toolSearching: ToolSearching | null;
}

export interface ToolSearching {
  id: number;
  name?: string;
  form?: string;
  fullName?: string;
  timestamp: Date;
  obj?: SearchingModel;
}
