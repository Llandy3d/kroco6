function partitionBy<T>(items: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const left: T[] = [];
  const right: T[] = [];

  for (const item of items) {
    if (predicate(item)) {
      left.push(item);
    } else {
      right.push(item);
    }
  }

  return [left, right];
}

export { partitionBy };
