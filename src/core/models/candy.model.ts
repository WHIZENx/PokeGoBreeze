export interface IColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export class Color implements IColor {
  r = 0;
  g = 0;
  b = 0;
  a?: number;

  static create(value: IColor) {
    const obj = new Color();
    Object.assign(obj, value);
    return obj;
  }
}

interface FamilyGroup {
  id: number;
  name: string;
}

export interface ICandy {
  familyId: number;
  familyGroup: FamilyGroup[];
  primaryColor: IColor;
  secondaryColor: IColor;
  familyName: string;
}

export interface ICandyModel {
  FamilyId: number;
  PrimaryColor: IColor;
  SecondaryColor: IColor;
}
