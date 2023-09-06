export interface DbModel {
  command: string;
  fields: Field[];
  rowAsArray?: boolean;
  rowCount: number;
  rows: any[];
  viaNeonFetch?: boolean;
}

interface Field {
  columnID: number;
  dataTypeID: number;
  dataTypeModifier: number;
  dataTypeSize: number;
  format: string;
  name: string;
  tableID: number;
}

export class DbModel {
  command!: string;
  fields: Field[];
  rowAsArray?: boolean;
  rowCount!: number;
  rows: any[];
  viaNeonFetch?: boolean;

  constructor() {
    this.fields = [];
    this.rows = [];
  }
}
