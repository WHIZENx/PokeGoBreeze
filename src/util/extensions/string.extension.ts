/* eslint-disable no-unused-vars */
declare global {
  interface String {
    isEmpty(): boolean;
    isNull(): boolean;
    isUndefined(): boolean;
    isNullOrEmpty(): boolean;
    includesWithIgnoreCase(searchElement: string): boolean;
  }
}

String.prototype.isEmpty = function (): boolean {
  return typeof this === 'string' && this === '';
};

String.prototype.isNull = function (): boolean {
  return typeof this !== 'undefined' && this === null;
};

String.prototype.isUndefined = function (): boolean {
  return typeof this === 'undefined' && this === undefined;
};

String.prototype.isNullOrEmpty = function (): boolean {
  return this.isNull() || this.isUndefined() || this.isEmpty();
};

String.prototype.includesWithIgnoreCase = function (searchElement: string): boolean {
  return this.toUpperCase().includes(searchElement.toUpperCase());
};

export {};
