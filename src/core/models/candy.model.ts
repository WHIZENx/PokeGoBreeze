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
