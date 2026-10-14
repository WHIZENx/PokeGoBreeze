import { Color, IColor } from '../../../../core/models/candy.model';
import { DynamicObj } from '../../../../utils/extension';

export interface IColorTone {
  number: number;
  color: IColor;
}

export class ColorTone implements IColorTone {
  number = 0;
  color = new Color();

  constructor(num: number, color: IColor) {
    this.number = num;
    this.color = color;
  }
}

export interface BreakPointAtk {
  data: number[][];
  levels: number[];
  ivs: number[];
  colorTone: DynamicObj<ColorTone>;
  target: { level: number; iv: number };
}

export interface BreakPointDef {
  dataDef: number[][];
  dataSta: number[][];
  levels: number[];
  ivs: number[];
  colorToneDef: DynamicObj<ColorTone>;
  colorToneSta: DynamicObj<ColorTone>;
  target: { level: number; iv: number };
}

export interface BulkPointDef {
  data: number[][];
  maxLength: number;
  levels: number[];
  ivs: number[];
  target: { level: number; iv: number };
}
