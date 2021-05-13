import { EllipsisLiteral, Literal, SymbolLiteral } from './literal';

export type Pos = { src: string[], row: number, col: number };

type State = { src: string[], pos: Pos };
type Parser<T> = (s: State) => [T, State] | undefined;

const item: Parser<string> = ({ src, pos: { row, col } }: State) => {
	if (row >= src.length) {
		return undefined;
	}
	if (col >= src[row].length) {
		return ['\n', { src, pos: { src, row: row + 1, col: 0 } }];
	}
	return [src[row][col], { src, pos: { src, row, col: col + 1 } }];
};

const nothing: Parser<any> = (s: State) => {
	return [undefined, s];
};

const eof: Parser<unknown> = (s: State) => {
	const r = item(s);
	if (r === undefined) {
		return [0, s];
	}
	return undefined;
};

const peek: (f: (a: string) => boolean) => Parser<number> = f => (s: State) => {
	const r = item(s);
	return r && (f(r[0]) ? [0, s] : undefined);
};

const attach_pos = <T>(p: Parser<T>): Parser<T & { pos: Pos }> => (s: State) => {
	const r = p(s);
	return r && [{ ...r[0], pos: s.pos }, r[1]];
};

const parse = <T>(p: Parser<T>) => (src: string[]) => p({ src, pos: { src, row: 0, col: 0 } });

const retn: <T>(a: T) => Parser<T> = <T>(x: T) => s => [x, s];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fail: Parser<any> = () => undefined;

const bind = <T>(p: Parser<T>) => <U>(f: (a: T) => Parser<U>) => (s: State) => {
	const r = p(s);
	return r && f(r[0])(r[1]);
};

const or = <T>(p: Parser<T>) => (q: Parser<T>): Parser<T> => (s: State) => p(s) || q(s);
const or_chain = <T>(...ps: Parser<T>[]): Parser<T> =>
	ps.reduce((p, q) => or(p)(q));

const then = <T>(p: Parser<T>) => <U>(q: Parser<U>): Parser<U> => bind(p)(() => q);
function then_chain<A, B, C, D>(a: Parser<A>, b: Parser<B>, c: Parser<C>, d: Parser<D>): Parser<D>;
function then_chain<A, B, C>(a: Parser<A>, b: Parser<B>, c: Parser<C>): Parser<C>;
function then_chain<A, B>(a: Parser<A>, b: Parser<B>): Parser<B>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function then_chain(...ps: Parser<any>[]): Parser<any> {
	return ps.reduce((p, q) => bind(p)(() => q));
}

const sat_r = (r: RegExp) => sat(r.test.bind(r));

const ch = (x: string): Parser<[string, Pos]> => bind(item)(y => x == y[0] ? retn(y) : fail);
const sat = (f: (a: string) => boolean): Parser<string> => bind(item)(x => f(x[0]) ? retn(x) : fail);
const many1: <T>(p: Parser<T>) => Parser<T[]> = <T>(p: Parser<T>) => bind(p)(x => bind(many(p))(xs => retn([x, ...xs])));
const many: <T>(p: Parser<T>) => Parser<T[]> = <T>(p: Parser<T>) => or(many1(p))(retn([]));

const space = sat_r(/[\n\t ]/);
const many_spaces = many(space);

const skip_comment = or(then_chain(
	ch('('),
	ch('#'),
	many(sat_r(/[^)]/)),
	ch(')'),
))(nothing);

const skip_spaces = <T>(p: Parser<T>) => then_chain(many_spaces, skip_comment, many_spaces, p);

const ellipsis: Parser<EllipsisLiteral> = attach_pos(then(then(ch('.'))(ch('.')))((retn({
	type: 'ellipsis',
	value: undefined,
}))));

const symbol: Parser<SymbolLiteral> = attach_pos(bind(many1(sat_r(/[^()[\]'\n\t ]/)))(xs => retn({
	type: 'symbol',
	value: xs.join(''),
})));

const atom: Parser<Literal> = attach_pos(then(ch(':'))(bind(symbol)(s => retn({
	type: 'atom',
	value: s.value,
}))));

const digit = sat_r(/\d/);
const int: Parser<Literal> = attach_pos(bind(many1(digit))(xs => retn({
	type: 'number',
	value: parseInt(xs.join('')),
})));

const char_in_string = then(peek(s => s != '\''))(or(then(ch('\\'))(bind(item)(c => {
	if (c == 'n') {
		return retn('\n');
	}
	return retn(c);
})))(sat(s => s != '\\')));

const string: Parser<Literal> = attach_pos(then(ch('\''))(bind(many(char_in_string))(xs => then(ch('\''))(retn({
	type: 'string',
	value: xs.join(''),
})))));

// eslint-disable-next-line prefer-const
let exp: Parser<Literal>;

const array: (type: 'list' | 'vector') => (open: string) => (close: string) => Parser<Literal> =
	type => open => close => attach_pos(then(ch(open))(
		bind(many(bind(many_spaces)(() => exp)))(exps => skip_spaces(then(ch(close))(retn({
			type,
			value: exps,
		}))))));

const list = array('list')('(')(')');
const vector = array('vector')('[')(']');

exp = skip_spaces(or_chain(ellipsis, atom, string, int, list, vector, symbol));

const program = bind(exp)(e => then(skip_spaces(eof))(retn(e)));

export default parse(program);
