export interface SearchingModel {
  searching?: string;
  data: {
    id: number;
    name?: string;
    form?: string;
    timestamp: Date;
  };
}
