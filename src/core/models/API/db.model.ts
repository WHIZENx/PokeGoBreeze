interface IDatabase<T> {
  command: string;
  fields: IField[];
  rowAsArray?: boolean;
  rowCount: number;
  rows: T[];
  viaNeonFetch?: boolean;
}

interface IField {
  columnID: number;
  dataTypeID: number;
  dataTypeModifier: number;
  dataTypeSize: number;
  format: string;
  name: string;
  tableID: number;
}

export class Database<T> implements IDatabase<T> {
  command = '';
  fields: IField[];
  rowAsArray?: boolean;
  rowCount = 0;
  rows: T[];
  viaNeonFetch?: boolean;

  constructor() {
    this.fields = [];
    this.rows = [];
  }
}
