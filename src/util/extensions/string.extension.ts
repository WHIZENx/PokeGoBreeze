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

String.prototype.isEmpty = function () {
  return typeof this === 'string' && this === '';
};

String.prototype.isNull = function () {
  return typeof this !== 'undefined' && this === null;
};

String.prototype.isUndefined = function () {
  return typeof this === 'undefined' && this === undefined;
};

String.prototype.isNullOrEmpty = function () {
  return this.isNull() || this.isUndefined() || this.isEmpty();
};

String.prototype.includesWithIgnoreCase = function (searchElement: string) {
  return this.toUpperCase().includes(searchElement.toUpperCase());
};

export {};
