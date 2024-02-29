type Falsy = '' | 0 | false | null | undefined;

export function exhaustive(_value: never): never {
	return _value;
}

export function isTruthy<T>(value: T | Falsy): value is T {
	return Boolean(value);
}
