function append<T extends { next: T | null }>(
  newBlock: T,
  target: T | null,
): T {
  if (target === null) {
    return newBlock;
  }

  return {
    ...target,
    next: append(newBlock, target.next),
  };
}

export { append };
