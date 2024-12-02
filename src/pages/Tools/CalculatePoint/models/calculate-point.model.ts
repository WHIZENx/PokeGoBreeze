import { Color, IColor } from '../../../../core/models/candy.model';
import { DynamicObj } from '../../../../util/extension';

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
  colorTone: DynamicObj<ColorTone>;
}

export interface BreakPointDef {
  dataDef: number[][];
  dataSta: number[][];
  colorToneDef: DynamicObj<ColorTone>;
  colorToneSta: DynamicObj<ColorTone>;
}

export interface BulkPointDef {
  data: number[][];
  maxLength: number;
}
