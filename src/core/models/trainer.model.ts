export interface AwardItem {
  name: string;
  amount: number;
}

export interface ITrainerLevelUp {
  level: number;
  items: AwardItem[];
  itemsUnlock?: string[];
}

export class TrainerLevelUp implements ITrainerLevelUp {
  level = 0;
  items: AwardItem[] = [];
  itemsUnlock?: string[];

  static create(value: ITrainerLevelUp) {
    const obj = new TrainerLevelUp();
    Object.assign(obj, value);
    return obj;
  }
}
