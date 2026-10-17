export type PokemonKeyboardDirection = -1 | 1;

export const getPokemonKeyboardIndex = (
  itemCount: number,
  currentIndex: number,
  direction: PokemonKeyboardDirection
) => {
  if (itemCount <= 0) {
    return -1;
  }

  if (currentIndex < 0) {
    return direction === 1 ? 0 : itemCount - 1;
  }

  return Math.min(Math.max(currentIndex + direction, 0), itemCount - 1);
};

export const getScrollTopToReveal = (
  scrollTop: number,
  containerTop: number,
  containerBottom: number,
  itemTop: number,
  itemBottom: number
) => {
  if (itemTop < containerTop) {
    return scrollTop + itemTop - containerTop;
  }
  if (itemBottom > containerBottom) {
    return scrollTop + itemBottom - containerBottom;
  }
  return scrollTop;
};
