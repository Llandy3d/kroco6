type Falsy = "" | 0 | false | null | undefined;

function exhaustive(_value: never): never {
  return _value;
}

function isTruthy<T>(value: T | Falsy): value is T {
  return Boolean(value);
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export { exhaustive, isTruthy, isDefined, type Falsy };
