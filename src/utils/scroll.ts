const defaultScrollEndThreshold = 64;

export const getViewportPrefetchThreshold = (element: Pick<HTMLElement, 'clientHeight'>) =>
  Math.max(defaultScrollEndThreshold, element.clientHeight);

export const isNearScrollEnd = (
  element: Pick<HTMLElement, 'scrollTop' | 'clientHeight' | 'scrollHeight'>,
  threshold = defaultScrollEndThreshold
) => element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;

export const shouldPreventScrollChaining = (
  element: Pick<HTMLElement, 'scrollTop' | 'clientHeight' | 'scrollHeight'>,
  deltaY: number
) => {
  if (deltaY === 0) {
    return false;
  }
  if (element.scrollHeight <= element.clientHeight) {
    return true;
  }
  if (deltaY < 0) {
    return element.scrollTop <= 0;
  }
  return element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
};
