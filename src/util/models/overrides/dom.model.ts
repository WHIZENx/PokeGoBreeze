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

interface Touch {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
  pageX: number;
  pageY: number;
  force: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
}

export interface TimelineEventBase<T> {
  changedTouches?: TouchList;
  currentTarget: EventTarget & T;
  nativeEvent: MouseEvent | TouchEvent;
  clientX?: number;
}

export type TimelineEvent<T> = (React.MouseEvent<T> | React.TouchEvent<T>) & TimelineEventBase<T>;

export interface TimelineElement<T> {
  (e: TimelineEvent<T>): void;
  bind<T>(this: T, thisArg: ThisParameterType<T>): OmitThisParameter<T>;
}
