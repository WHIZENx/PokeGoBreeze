import { toNumber } from '../../util/extension';

const convertHexByRgba = (color: string) =>
  `#${color
    .replace(/^rgba?\(|\s+|\)$/gi, '')
    .split(',')
    .map((c, i) =>
      (i < 3 ? toNumber(c).toString(16) : Math.round(Math.max(0, Math.min(toNumber(c, 1), 1)) * 255).toString(16)).padStart(2, '0')
    )
    .join('')}`;

export interface IColor {
  r: number;
  g: number;
  b: number;
  a: number;
  hex: string;
}

export class Color implements IColor {
  r = 0;
  g = 0;
  b = 0;
  a = 1;
  hex = convertHexByRgba('0,0,0,1');

  static create(r = 0, g = 0, b = 0, a = 1) {
    const obj = new Color();
    obj.r = Math.max(0, Math.min(r, 255));
    obj.g = Math.max(0, Math.min(g, 255));
    obj.b = Math.max(0, Math.min(b, 255));
    obj.a = Math.max(0, Math.min(a, 1));
    return obj;
  }

  static createByRatio(r = 0, g = 0, b = 0, a = 1) {
    const obj = new Color();
    obj.r = Math.max(0, Math.min(r, 1));
    obj.g = Math.max(0, Math.min(g, 1));
    obj.b = Math.max(0, Math.min(b, 1));
    obj.a = Math.max(0, Math.min(a, 1));
    return obj;
  }

  static createRgb(r = 0, g = 0, b = 0, a = 1, isRatio = true) {
    if (isRatio) {
      const obj = this.createByRatio(r, g, b, a);
      obj.r = Math.round(255 * obj.r);
      obj.g = Math.round(255 * obj.g);
      obj.b = Math.round(255 * obj.b);
      return obj;
    }
    return this.create(r, g, b, a);
  }

  static createColor(r = 0, g = 0, b = 0, a = 1, isRatio = true) {
    const obj = this.createRgb(r, g, b, a, isRatio);
    obj.hex = convertHexByRgba(`${obj.r},${obj.g},${obj.b},${obj.a}`);
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
