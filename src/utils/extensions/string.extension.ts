declare global {
  interface String {
    isEmpty(): boolean;
    isNull(): boolean;
    isUndefined(): boolean;
    isEqual(value: string): boolean;
    isEqualWithIgnoreCase(value: string): boolean;
    includesWithIgnoreCase(searchElement: string): boolean;
  }
}

String.prototype.isEmpty = function () {
  return String(this) === '';
};

String.prototype.isNull = function () {
  return typeof this !== 'undefined' && this === null;
};

String.prototype.isUndefined = function () {
  return typeof this === 'undefined' && this === undefined;
};

String.prototype.isEqual = function (value: string) {
  return String(this) === value;
};

String.prototype.isEqualWithIgnoreCase = function (value: string) {
  return String(this).toUpperCase() === value.toUpperCase();
};

String.prototype.includesWithIgnoreCase = function (searchElement: string) {
  return String(this).toUpperCase().includes(searchElement.toUpperCase());
};

export {};
