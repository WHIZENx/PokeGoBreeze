import { ISearchingModel } from '../../store/models/searching.model';

export interface SearchingOptionsModel {
  mainSearching: ISearchingModel | null;
  toolSearching: IToolSearching | null;
}

export interface IToolSearching {
  id: number;
  name?: string;
  form?: string;
  fullName?: string;
  timestamp: Date;
  obj?: ISearchingModel;
}

export class ToolSearching implements IToolSearching {
  id: number = 0;
  name?: string;
  form?: string;
  fullName?: string;
  timestamp: Date = new Date();
  obj?: ISearchingModel;

  static create(value: IToolSearching) {
    const obj = new ToolSearching();
    Object.assign(obj, value);
    return obj;
  }
}
