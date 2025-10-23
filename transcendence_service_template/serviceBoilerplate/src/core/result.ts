type Ok<V> = { 
	ok: true;
	value: V
};

type Err<E> = {
	ok: false;
	error: E
};

export type Result<V, E> = Ok<V> | Err<E>;

export function ok<V>(value: V): Result<V, never> {
	return ({ ok: true, value });
}

export function err<E>(error: E): Result<never, E> {
	return ({ ok: false, error });
}

export const isOk = <V, E>(result: Result<V,E>): result is Ok<V> => result.ok;
export const isErr = <V, E>(result: Result<V,E>): result is Err<E> => !result.ok;

export function mapOk<V, E, W>(
	res: Result<V, E>,
	fct: (a: V) => W
): Result<W, E> {
	return (res.ok) ? ok(fct(res.value)) : res ;
}

export function mapErr<V, E, F>(
	res: Result<V, E>,
	fct: (e: E) => F
): Result<V, F> {
	return (res.ok) ? res : err(fct(res.error));
}

export function andThen<V, E, W>(
	res: Result<V, E>,
	fct: (a: V) => Result<W, E>
) : Result <W, E> {
	return (res.ok) ? fct(res.value) : res;
}
