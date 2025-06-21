export interface IFloatPaddingOption {
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
}

export class FloatPaddingOption implements IFloatPaddingOption {
  defaultValue = 0;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;

  static setOptions(value: IFloatPaddingOption) {
    const obj = new FloatPaddingOption();
    Object.assign(obj, value);
    return obj;
  }
}
