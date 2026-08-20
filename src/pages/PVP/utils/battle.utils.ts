import { isNotEmpty, toNumber } from '../../../utils/extension';

export const getRandomNumber = (min: number, max: number, step = 1) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  if (step === 1) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } else {
    const steps = Math.floor((max - min) / step) + 1;
    return min + Math.floor(Math.random() * steps) * step;
  }
};

export const pushBoundingById = (arr: (DOMRect | undefined)[], id: number | string) => {
  arr.push(document.getElementById(id.toString())?.getBoundingClientRect());
};

export const pushOffsetById = (arr: number[], id: number | string) => {
  const el = document.getElementById(id.toString());
  arr.push(el ? el.offsetLeft : 0);
};

/**
 * Detects which elements are overlapped by a given position as it moves from left to right.
 * Specifically designed for timeline interactions where we need to know which element's left edge
 * the position has just crossed.
 *
 * @param pos - The horizontal position (in pixels) to check for overlaps
 * @param selectors - CSS selectors for potential overlapping elements to check against
 * @returns The element whose left edge is closest to the position from the left, or undefined if no overlaps
 */
export const getOverlappingElements = (pos = 0, selectors = '[id]') => {
  // Get all potential elements to check for overlap
  const potentialElements = Array.from(document.querySelectorAll(selectors)) as HTMLElement[];

  // Filter elements to only those with numeric IDs
  const numericIdElements = potentialElements.filter((el) => {
    const id = el.getAttribute('id');
    return id !== null && /^\d+$/.test(id);
  });

  // Sort elements by their left position (ascending)
  const sortedElements = [...numericIdElements].sort((a, b) => {
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();
    return rectA.left - rectB.left;
  });

  const sortedRects = sortedElements.map((el) => el.getBoundingClientRect());
  const index = overlappingPos(sortedRects, pos);
  if (index !== -1) {
    return sortedElements[index];
  }
};

/**
 * Efficiently finds the number of elements in an array of DOM rectangles that have
 * their left positions less than or equal to the specified position.
 * Uses binary search algorithm for O(log n) performance.
 *
 * @param arr - Array of DOM rectangles (or undefined values) to check against
 * @param pos - The horizontal position (in pixels) to compare against. Defaults to 0
 * @returns The number of elements with left position ≤ specified position, or -1 if array is invalid
 */
export const overlappingPosFromOffsets = (offsets: number[], pos: number) => {
  if (!isNotEmpty(offsets)) {
    return -1;
  }
  let left = 0;
  let right = offsets.length - 1;
  let index = 0;
  if (pos < offsets[0]) {
    index = 0;
  } else if (pos >= offsets[offsets.length - 1]) {
    index = offsets.length;
  } else {
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (offsets[mid] <= pos) {
        index = mid + 1;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return index;
};

export const overlappingPos = (arr: (DOMRect | undefined)[], pos = 0) => {
  if (!isNotEmpty(arr)) {
    return -1;
  }

  let left = 0;
  let right = arr.length - 1;
  let index = 0;

  if (pos < toNumber(arr[0]?.left)) {
    index = 0;
  } else if (pos >= toNumber(arr[arr.length - 1]?.left)) {
    index = arr.length;
  } else {
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midPos = toNumber(arr[mid]?.left);

      if (midPos <= pos) {
        index = mid + 1;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return index;
};
