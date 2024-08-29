interface ILocalTimeStamp {
  gamemaster: number | null;
  pvp: number | null;
  images: number | null;
  sounds: number | null;
}

export class LocalTimeStamp implements ILocalTimeStamp {
  gamemaster: number | null = null;
  pvp: number | null = null;
  images: number | null = null;
  sounds: number | null = null;

  static create(value: ILocalTimeStamp) {
    const obj = new LocalTimeStamp();
    Object.assign(obj, value);
    return obj;
  }
}
