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

export interface Candy {
  familyId: number;
  familyGroup: FamilyGroup[];
  primaryColor: Color;
  secondaryColor: Color;
  familyName: string | null;
}

export interface CandyModel {
  FamilyId: number;
  PrimaryColor: Color;
  SecondaryColor: Color;
}
