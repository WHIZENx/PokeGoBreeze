/* eslint-disable no-unused-vars */
declare global {
  interface String {
    isEmpty(): boolean;
    isNullOrEmpty(): boolean;
    includesWithIgnoreCase(searchElement: string): boolean;
  }
}

String.prototype.isEmpty = function (): boolean {
  return typeof this === 'string' && this === '';
};

String.prototype.isNullOrEmpty = function (): boolean {
  return this === null || this === undefined || this.isEmpty();
};

String.prototype.includesWithIgnoreCase = function (searchElement: string): boolean {
  return this.toUpperCase().includes(searchElement.toUpperCase());
};

export {};
