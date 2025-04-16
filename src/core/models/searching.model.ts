import { ISearchingModel } from '../../store/models/searching.model';

export interface SearchingOptionsModel {
  mainSearching: ISearchingModel | null;
  toolSearching: IToolSearching | null;
}

export interface IToolSearching {
  current?: ISearchingModel | null;
  object?: ISearchingModel | null;
}

export class ToolSearching implements IToolSearching {
  current?: ISearchingModel;
  object?: ISearchingModel;

  static create(value: IToolSearching | null) {
    const obj = new ToolSearching();
    if (value) {
      Object.assign(obj, value);
    }
    return obj;
  }
}
