import { TicketRewardType } from '../enums/information.enum';

interface RewardItem {
  item: string;
  amount?: number;
}

export interface RewardPokemon {
  id: number | undefined;
  pokemonId: string;
  costume?: string;
  form?: string;
}

export interface RewardCandy {
  id: number | undefined;
  pokemonId: string;
  amount: number;
}

interface NeutralAvatarItem {
  neutralAvatarItemTemplateString1: string;
  neutralAvatarItemTemplateString2: string;
}

export interface ITicketReward {
  type?: TicketRewardType;
  item?: RewardItem;
  pokemon?: RewardPokemon;
  stardust?: number;
  pokeCoin?: number;
  exp?: number;
  avatarTemplateId?: string;
  neutralAvatarItemTemplate?: NeutralAvatarItem;
  candy?: RewardCandy;
}

export class TicketReward implements ITicketReward {
  type?: TicketRewardType;
  item?: RewardItem;
  pokemon?: RewardPokemon;
  stardust?: number;
  pokeCoin?: number;
  exp?: number;
  avatarTemplateId?: string;
  neutralAvatarItemTemplate?: NeutralAvatarItem;
  candy?: RewardCandy;

  static create(value: ITicketReward) {
    const obj = new TicketReward();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IInformationData {
  data: IInformation[];
  isLoaded: boolean;
}

export class InformationData implements IInformationData {
  data: IInformation[] = [];
  isLoaded = false;

  static create(value: IInformationData) {
    const obj = new InformationData();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IInformation {
  id: string;
  title: string | undefined;
  desc: string | undefined;
  type: string | undefined;
  startTime: string | undefined;
  endTime: string | undefined;
  ticketItem?: string;
  bannerUrl: string | undefined;
  backgroundImgUrl: string | undefined;
  titleImgUrl: string | undefined;
  giftItem?: string;
  giftAble: boolean;
  detailsLink?: string;
  rewards: ITicketReward[];
}

export class Information implements IInformation {
  id = '';
  type: string | undefined;
  title: string | undefined;
  desc: string | undefined;
  startTime: string | undefined;
  endTime: string | undefined;
  ticketItem?: string;
  bannerUrl: string | undefined;
  backgroundImgUrl: string | undefined;
  titleImgUrl: string | undefined;
  giftItem?: string;
  giftAble = false;
  detailsLink?: string;
  rewards: ITicketReward[] = [];

  static create(value: IInformation) {
    const obj = new Information();
    Object.assign(obj, value);
    return obj;
  }
}
