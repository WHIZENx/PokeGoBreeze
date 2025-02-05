import { toNumber } from '../../util/extension';

export interface IColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class Color implements IColor {
  r = 0;
  g = 0;
  b = 0;
  a = 1;

  static create(r?: number, g?: number, b?: number, a?: number) {
    const obj = new Color();
    obj.r = Math.max(0, toNumber(r));
    obj.g = Math.max(0, toNumber(g));
    obj.b = Math.max(0, toNumber(b));
    obj.a = Math.max(0, toNumber(a, 1));
    return obj;
  }

  static createRgb(r?: number, g?: number, b?: number, a?: number) {
    const obj = this.create(r, g, b, a);
    obj.r = Math.round(255 * obj.r);
    obj.g = Math.round(255 * obj.g);
    obj.b = Math.round(255 * obj.b);
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
