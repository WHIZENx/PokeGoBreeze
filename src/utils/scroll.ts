const defaultScrollEndThreshold = 64;

export const isNearScrollEnd = (
  element: Pick<HTMLElement, 'scrollTop' | 'clientHeight' | 'scrollHeight'>,
  threshold = defaultScrollEndThreshold
) => element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
