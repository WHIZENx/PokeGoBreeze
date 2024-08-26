export interface ISearchingModel {
  id: number;
  name?: string;
  form?: string;
  fullName?: string;
  timestamp: Date;
}

export class SearchingModel implements ISearchingModel {
  id: number = 0;
  name?: string;
  form?: string;
  fullName?: string;
  timestamp: Date = new Date();

  constructor({ ...props }: ISearchingModel) {
    Object.assign(this, props);
  }
}
