function tryParseJSON(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export { tryParseJSON };
