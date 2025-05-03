function sortByRowCol(a: { r: number; c: number }, b: { r: number; c: number }) {
  if (a.r === b.r) {
    return a.c - b.c;
  } else {
    return a.r - b.r;
  }
}




export const sortMethods = {
  rowCol: sortByRowCol,
};
