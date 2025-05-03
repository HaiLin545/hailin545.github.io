function sortByRowCol(a: { r: number; c: number }, b: { r: number; c: number }) {
  if (a.r === b.r) {
    return a.c - b.c;
  } else {
    return a.r - b.r;
  }
}

export function debounce(fn: Function, delay: number) {
  let timer: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export const sortMethods = {
  rowCol: sortByRowCol,
};
