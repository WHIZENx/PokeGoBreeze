interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Candy {
  familyId: number;
  familyGroup: { id: number; name: string }[];
  primaryColor: Color;
  secondaryColor: Color;
  familyName: string | null;
}

export interface CandyModel {
  FamilyId: number;
  PrimaryColor: Color;
  SecondaryColor: Color;
}

export class CandyDataModel {
  familyId!: number;
  familyGroup!: { id: number; name: string }[];
  primaryColor!: Color;
  secondaryColor!: Color;
  familyName!: string | null;

  constructor() {
    this.familyId = 0;
    this.familyGroup = [];
    this.primaryColor = {
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    };
    this.secondaryColor = {
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    };
  }
}
