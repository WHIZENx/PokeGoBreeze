interface IDatabase {
  command: string;
  fields: IField[];
  rowAsArray?: boolean;
  rowCount: number;
  rows: any[];
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

export class Database implements IDatabase {
  command!: string;
  fields: IField[];
  rowAsArray?: boolean;
  rowCount!: number;
  rows: any[];
  viaNeonFetch?: boolean;

  constructor() {
    this.fields = [];
    this.rows = [];
  }
}
