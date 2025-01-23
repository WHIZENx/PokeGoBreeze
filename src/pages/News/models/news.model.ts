import { IInformation, ITicketReward } from '../../../core/models/information';
import { DateEvent } from '../enums/item-type.enum';

export interface IRewardNews extends Partial<ITicketReward> {
  imageSrc: string | undefined;
  title: string;
  count?: number;
}

export class RewardNews implements IRewardNews {
  imageSrc: string | undefined;
  title = '';

  static create(value: IRewardNews) {
    const obj = new RewardNews();
    Object.assign(obj, value);
    return obj;
  }
}

export interface INewsModel extends Partial<IInformation> {
  eventType: DateEvent;
  rewardNews: IRewardNews[];
}

export class NewsModel implements INewsModel {
  eventType = DateEvent.None;
  rewardNews: IRewardNews[] = [];

  static create(value: INewsModel) {
    const obj = new NewsModel();
    Object.assign(obj, value);
    return obj;
  }
}
