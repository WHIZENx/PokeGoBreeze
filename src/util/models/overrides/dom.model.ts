/* eslint-disable no-unused-vars */
export interface ScrollModifyEvent extends Event {
  target: TargetModify | null;
}

type TargetModify = Omit<EventTarget, 'documentElement'> & { documentElement?: HTMLElement };

interface TouchList {
  [index: number]: Touch;
  length: number;
  item(index: number): Touch;
  identifiedTouch(identifier: number): Touch;
}

export interface TimelineEvent<T> extends React.MouseEvent<T>, React.TouchEvent<T> {
  changedTouches: TouchList;
  currentTarget: EventTarget & T;
  nativeEvent: any;
}

export interface TimelineElement<T> {
  (e: TimelineEvent<T>): void;
  bind<T>(this: T, thisArg: ThisParameterType<T>): OmitThisParameter<T>;
}
