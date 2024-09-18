interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface FamilyGroup {
  id: number;
  name: string;
}

export interface ICandy {
  familyId: number;
  familyGroup: FamilyGroup[];
  primaryColor: Color;
  secondaryColor: Color;
  familyName: string;
}

export interface ICandyModel {
  FamilyId: number;
  PrimaryColor: Color;
  SecondaryColor: Color;
}
