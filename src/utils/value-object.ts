export abstract class ValueObject<T> {
  value!: T;

  constructor(valueObj: T, defaultValue: Partial<T> | any = null) {
    if (!valueObj) {
      return;
    }

    if (!defaultValue) {
      this.value = valueObj;
      return;
    }

    this.value = {
      ...defaultValue,
      ...valueObj,
    };
  }
}
