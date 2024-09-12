/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
declare global {
  interface String {
    isEmpty(): boolean;
    isNullOrEmpty(): boolean;
  }
}

String.prototype.isEmpty = function (): boolean {
  return typeof this === 'string' && this === '';
};

String.prototype.isNullOrEmpty = function (): boolean {
  return this === null || this === undefined || this.isEmpty();
};

export {};
