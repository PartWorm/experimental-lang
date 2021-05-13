/* eslint-disable no-fallthrough */
import { ListLiteral, Literal } from './literal';
import { Pos } from './parse';

type LangAtom = { type: 'atom', value: string };
type LangString = { type: 'string', value: string };
type LangBool = { type: 'bool', value: boolean };
type LangNumber = { type: 'number', value: number };
type LangVector = { type: 'vector', value: LangValue[] };
type LangLambda = {
	type: 'lambda',
	params: Literal[],
	body: Literal,
	env: Environment,
};
type LangNativeLambda = {
	type: 'native-lambda',
	func: (args: LangValue[], pos: Pos) => EvaluationResult,
};
type LangNativeFunction = {
	type: 'native-function',
	func: (args: Literal[], env: Environment, pos: Pos) => EvaluationResult,
};

export type LangValue = LangAtom | LangString | LangNumber | LangVector | LangLambda | LangNativeLambda | LangNativeFunction | LangBool;

type EnvironmentFrame = { [name: string]: LangValue };
type Environment = EnvironmentFrame[];

const lang_nil: LangAtom = { type: 'atom', value: 'nil' };
const lang_false: LangBool = { type: 'bool', value: false };
const lang_true: LangBool = { type: 'bool', value: true };

const make_bool = (value: boolean): LangBool =>
	value ? lang_true : lang_false;

const make_number = (value: number): LangNumber =>
	({ type: 'number', value });

export const lang_stringify = (value: LangValue): string => {
	if (value.type == 'lambda') {
		return '[lambda]';
	}
	if (value.type == 'native-lambda' || value.type == 'native-function') {
		return '[native function]';
	}
	if (value.type == 'atom') {
		return `:${value.value}`;
	}
	if (value.type == 'vector') {
		return `[${value.value.map(lang_stringify).join(' ')}]`;
	}
	return `${value.value}`;
};

const lang_equals = (a: LangValue, b: LangValue) => {
	if (a.type != b.type) {
		return false;
	}
	if (a.type == 'lambda' || a.type == 'native-lambda' || a.type == 'native-function') {
		return a == b;
	}
	b = b as typeof a;
	return a.value == b.value;
};

const operator_num_num = (fn: (a: number) => number) => (args: LangValue[]): EvaluationResult => {
	if (args[0].type != 'number') {
		return panic('arg 0 is not a number');
	}
	return evaluated(make_number(fn(args[0].value)));
};

const operator_num_num_num = (fn: (a: number, b: number) => number) => (args: LangValue[]): EvaluationResult => {
	const lhs = args[0];
	if (lhs.type != 'number') {
		return panic('arg 0 is not a number');
	}
	const rhs = args[1];
	if (rhs.type != 'number') {
		return panic('arg 1 is not a number');
	}
	return evaluated(make_number(fn(lhs.value, rhs.value)));
};

const operator_num_num_bool = (fn: (a: number, b: number) => boolean) => (args: LangValue[]): EvaluationResult => {
	const lhs = args[0];
	if (lhs.type != 'number') {
		return panic('arg 0 is not a number');
	}
	const rhs = args[1];
	if (rhs.type != 'number') {
		return panic('arg 1 is not a number');
	}
	return evaluated(make_bool(fn(lhs.value, rhs.value)));
};

const bind = (env_frame: EnvironmentFrame, pattern: Literal, value: LangValue): boolean => {
	if (pattern.type == 'symbol') {
		env_frame[pattern.value] = value;
		return true;
	}
	else if (pattern.type == 'vector') {
		if (value.type != 'vector') return false;
		const pattern_len = pattern.value.length;
		const value_len = value.value.length;
		let pi = 0, vi = 0;
		while (pi < pattern_len || vi < value_len) {
			if (pi >= pattern_len) return false;
			const p = pattern.value[pi];
			if (p.type == 'ellipsis') {
				if (pi + 2 != pattern_len) {
					return false;
				}
				return bind(env_frame, pattern.value[pi + 1], {
					type: 'vector',
					value: value.value.slice(vi),
				});
			}
			if (vi >= value_len) return false;
			const v = value.value[vi];
			if (!bind(env_frame, p, v)) return false;
			++pi, ++vi;
		}
		return true;
	}
	else if (pattern.type == 'list') {
		return false;
	}
	if (pattern.type != value.type) return false;
	return pattern.value == value.value;
};

const global_env_frame: EnvironmentFrame = {
	else: lang_true,
	nil: lang_nil,
	false: lang_false,
	true: lang_true,
	'let': {
		type: 'native-function',
		func: (args, env, call_pos) => {
			const let_env_frame = {};
			env = [let_env_frame, ...env];
			const bindings = args.slice(0, -1);
			let phase = 0;
			let pos = 0;
			let binding: Literal;
			let target: Literal;
			return call(value => {
				for (;;) {
					switch (phase) {
					case 0:
						if (pos >= bindings.length) {
							phase = 2;
							continue;
						}
						binding = bindings[pos];
						if (binding.type != 'list') {
							return { ...panic('binding entry is not a list'), pos: binding.pos };
						}
						target = binding.value[0];
						phase = 1;
						return evaluate(binding.value[1], env);
					case 1:
						if (!bind(let_env_frame, target, value)) {
							return { ...panic('failed to bind value to target'), pos: binding.pos };
						}
						++pos;
						phase = 0;
						continue;
					case 2:
						phase = 3;
						return evaluate(args.slice(-1)[0], env);
					case 3:
						return { ...retn(value), pos: call_pos };
					}
				}
			});
		},
	},
	'=': {
		type: 'native-function',
		func: (args, env, pos) => {
			if (args[0].type != 'symbol') {
				return panic('assignment target is not a symbol');
			}
			const name = args[0].value;
			for (const env_frame of env) {
				if (Object.prototype.hasOwnProperty.call(env_frame, name)) {
					let phase: 0 | 1 = 0;
					return call(value => {
						switch (phase) {
						case 0:
							phase = 1;
							return evaluate(args[1], env);
						case 1:
							env_frame[name] = value;
							return { ...retn(lang_nil), pos };
						}
					});
				}
			}
			return panic(`tried to assign to undefined variable ${name}`);
		},
	},
	'if': {
		type: 'native-function',
		func: (args, env, pos) => {
			let phase: 0 | 1 | 2 = 0;
			return call(value => {
				switch (phase) {
				case 0:
					phase = 1;
					return evaluate(args[0], env);
				case 1:
					phase = 2;
					if (lang_equals(value, lang_true)) {
						return evaluate(args[1], env);
					}
					else {
						return evaluate(args[2], env);
					}
				case 2:
					return { ...retn(value), pos };
				}
			});
		},
	},
	'if-let': {
		type: 'native-function',
		func: (args, env, pos) => {
			let phase: 0 | 1 | 2 = 0;
			const env_frame: EnvironmentFrame = {};
			return call(value => {
				switch (phase) {
				case 0:
					phase = 1;
					return evaluate(args[1], env);
				case 1:
					phase = 2;
					if (bind(env_frame, args[0], value)) {
						return evaluate(args[2], [env_frame, ...env]);
					}
					else {
						return evaluate(args[3], env);
					}
				case 2:
					return { ...retn(value), pos };
				}
			});
		},
	},
	'case': {
		type: 'native-function',
		func: (args, env, call_pos) => {
			const clauses = args.slice(1);
			let phase = 0;
			let target: LangValue;
			let pos = 0;
			let clause: Literal;
			let env_frame: EnvironmentFrame;
			return call(value => {
				for (;;) {
					switch (phase) {
					case 0:
						phase = 1;
						return evaluate(args[0], env);
					case 1:
						target = value;
					case 2:
						if (pos >= clauses.length) {
							phase = 6;
							continue;
						}
					case 3:
						clause = clauses[pos];
						if (clause.type != 'list') {
							return { ...panic('case clause is not a list'), pos: call_pos };
						}
						env_frame = {};
						if (!bind(env_frame, clause.value[0], target)) {
							phase = 5;
							continue;
						}
						phase = 4;
						return evaluate(clause.value[1], [env_frame, ...env]);
					case 4:
						return { ...retn(value), pos: call_pos };
					case 5:
						++pos;
						phase = 1;
						continue;
					case 6:
						return { ...panic('no matching case clauses'), pos: call_pos };
					}
				}
			});
		},
	},
	when: {
		type: 'native-function',
		func: (args, env, call_pos) => {
			let phase = 0;
			let pos = 0;
			let maybe_clause: Literal;
			let clause: ListLiteral;
			return call(value => {
				for (;;) {
					switch (phase) {
					case 0:
						if (pos >= args.length) {
							phase = 5;
							continue;
						}
					case 1:
						maybe_clause = args[pos];
						if (maybe_clause.type != 'list') {
							return { ...panic('when clause is not a list'), pos: call_pos };
						}
						clause = maybe_clause;
						phase = 2;
						return evaluate(clause.value[0], env);
					case 2:
						if (!lang_equals(value, lang_true)) {
							phase = 4;
							continue;
						}
						phase = 3;
						return evaluate(clause.value[1], env);
					case 3:
						return { ...retn(value), pos: call_pos };
					case 4:
						++pos;
						phase = 0;
						continue;
					case 5:
						return { ...panic('no matching when clauses'), pos: call_pos };
					}
				}
			});
		},
	},
	defer: {
		type: 'native-function',
		func: (args, env) => {
			return evaluated({
				type: 'lambda',
				params: [],
				body: args[0],
				env,
			});
		},
	},
	fn: {
		type: 'native-function',
		func: (args, env) => {
			if (args[0].type != 'list') {
				throw 'Parameter must be list';
			}
			const params = args[0].value;
			return evaluated({
				type: 'lambda',
				params,
				body: args[1],
				env,
			});
		},
	},
	'do': {
		type: 'native-lambda',
		func: args => {
			return evaluated(args.slice(-1)[0]);
		},
	},
	print: {
		type: 'native-lambda',
		func: args => {
			print_stdout(lang_stringify(args[0]));
			return evaluated(lang_nil);
		},
	},
	'==': {
		type: 'native-lambda',
		func: args =>
			evaluated(make_bool(lang_equals(args[0], args[1]))),
	},
	'nil?': {
		type: 'native-lambda',
		func: args => evaluated(make_bool(lang_equals(args[0], lang_nil))),
	},
	'>': {
		type: 'native-lambda',
		func: operator_num_num_bool((a, b) => a > b),
	},
	'<': {
		type: 'native-lambda',
		func: operator_num_num_bool((a, b) => a < b),
	},
	'+': {
		type: 'native-lambda',
		func: operator_num_num_num((a, b) => a + b),
	},
	'-': {
		type: 'native-lambda',
		func: operator_num_num_num((a, b) => a - b),
	},
	'*': {
		type: 'native-lambda',
		func: operator_num_num_num((a, b) => a * b),
	},
	'/': {
		type: 'native-lambda',
		func: operator_num_num_num((a, b) => a / b),
	},
	'%': {
		type: 'native-lambda',
		func: operator_num_num_num((a, b) => a % b),
	},
	floor: {
		type: 'native-lambda',
		func: operator_num_num(a => Math.floor(a)),
	},
	ceil: {
		type: 'native-lambda',
		func: operator_num_num(a => Math.ceil(a)),
	},
	'panic': {
		type: 'native-lambda',
		func: ([reason]) => panic(lang_stringify(reason)),
	},
	'str': {
		type: 'native-lambda',
		func: args => {
			let result = '';
			for (const arg of args) {
				result += lang_stringify(arg);
			}
			return evaluated({ type: 'string', value: result });
		},
	},
	'$': {
		type: 'native-function',
		func: (args, env) => {
			return evaluated({
				type: 'lambda',
				params: [{ type: 'symbol', value: '_', pos: args[0].pos }],
				body: args[0],
				env,
			});
		},
	},
};

/*
const bind = (result: EvaluationResult) => (fn: (value: LangValue) => EvaluationResult): EvaluationResult => {
	if (result.type == 'call') {
		let step = 0;
		return ({
			type: 'call',
			frame: { next(value) {
				if (step++ == 0) {
					return result;
				}
				return fn(value);
			} },
		});
	}
	return result;
};
const many1: (r: EvaluationResult) => EvaluationResult = (r: EvaluationResult) => bind(r)(x => bind(many(r))(xs => done([x, ...xs])));
const many: (r: EvaluationResult) => EvaluationResult = (r: EvaluationResult) => or(many1(r))(done([]));
*/

type OngoingEvaluation = (value: LangValue) => PositionedEvaluationResult;

type CallFrame = {
	next: OngoingEvaluation;
};

type EvaluationResult = Evaluated | Call | Return | Panic;
type PositionedEvaluationResult = EvaluationResult & { pos: Pos };

type Call = { type: 'call', frame: CallFrame };
type Return = { type: 'return', value: LangValue };
type Evaluated = { type: 'evaluated', value: LangValue };
type Panic = { type: 'panic', reason: string };

const evaluated = (value: LangValue): Evaluated => ({ type: 'evaluated', value });
const call = (next: OngoingEvaluation): Call => ({ type: 'call', frame: { next } });
const retn = (value: LangValue): Return => ({ type: 'return', value });
const panic = (reason: string): Panic => {
	return ({ type: 'panic', reason });
};

const call_lambda = (target: LangLambda, args: LangValue[]): PositionedEvaluationResult => {
	const call_frame = {};
	for (const [i, param] of Object.entries(target.params)) {
		if (!bind(call_frame, param, args[i])) {
			return { ...panic('failed to bind arg to param'), pos: param.pos };
		}
	}
	return evaluate(target.body, [call_frame, ...target.env]);
};

const lambda_call = (target: LangLambda, args: Literal[], env: Environment, call_pos: Pos): EvaluationResult => {
	let phase = 0;
	const arg_values: LangValue[] = [];
	let pos = 0;
	return call(value => {
		for (;;) {
			switch (phase) {
			case 0:
				if (pos >= args.length) {
					phase = 3;
					return call_lambda(target, arg_values);
				}
			case 1:
				phase = 2;
				return evaluate(args[pos], env);
			case 2:
				arg_values[pos++] = value;
				phase = 0;
				continue;
			case 3:
				return { ...retn(value), pos: call_pos };
			}
		}
	});
};

const native_lambda_call = (target: LangNativeLambda, args: Literal[], env: Environment, call_pos: Pos): EvaluationResult => {
	let phase = 0;
	const arg_values: LangValue[] = [];
	let pos = 0;
	return call(value => {
		for (;;) {
			switch (phase) {
			case 0:
				if (pos >= args.length) {
					phase = 3;
					return { ...target.func(arg_values, call_pos), pos: call_pos };
				}
			case 1:
				phase = 2;
				return evaluate(args[pos], env);
			case 2:
				arg_values[pos++] = value;
				phase = 0;
				continue;
			case 3:
				return { ...retn(value), pos: call_pos };
			}
		}
	});
};

const native_function_call = (target: LangNativeFunction, args: Literal[], env: Environment, pos: Pos) => {
	return target.func(args, env, pos);
};

const evaluate = (exp: Literal, env: Environment): PositionedEvaluationResult => {
	const pos = exp.pos;
	if (exp.type == 'list') {
		const args = exp.value.slice(1);
		const handle_callable = (target: LangValue): EvaluationResult => {
			if (target.type == 'lambda') {
				return lambda_call(target, args, env, pos);
			}
			else if (target.type == 'native-lambda') {
				return native_lambda_call(target, args, env, pos);
			}
			else if (target.type == 'native-function') {
				return native_function_call(target, args, env, pos);
			}
			return panic(`not callable type ${target.type}`);
		};
		const target = evaluate(exp.value[0], env);
		let phase: 0 | 1 | 2 = 0;
		return { ...call(value => {
			switch (phase) {
			case 0:
				phase = 1;
				return target;
			case 1:
				phase = 2;
				return { ...handle_callable(value), pos };
			case 2:
				return { ...retn(value), pos };
			}
		}), pos };
	}
	else if (exp.type == 'vector') {
		const value_lits = exp.value;
		let phase = 0;
		const values: LangValue[] = [];
		let pos = 0;
		return { ...call(value => {
			for (;;) {
				switch (phase) {
				case 0:
					if (pos >= value_lits.length) {
						return { ...retn({
							type: 'vector',
							value: values,
						}), pos: exp.pos };
					}
				case 1:
					phase = 2;
					return evaluate(value_lits[pos], env);
				case 2:
					values[pos++] = value;
					phase = 0;
					continue;
				}
			}
		}), pos: exp.pos };
	}
	else if (exp.type == 'symbol') {
		for (const env_frame of env) {
			if (env_frame[exp.value] !== undefined) {
				return { ...evaluated(env_frame[exp.value]), pos };
			}
		}
		return { ...panic(`undefined variable ${exp.value}`), pos };
	}
	else if (exp.type == 'ellipsis') {
		return { ...panic('tried to evaluate ellipsis'), pos };
	}
	return { ...evaluated(exp), pos };
};

export type Runtime = {
	env: Environment;
	debug: boolean;
};

export const create_runtime = (debug = false): Runtime =>
	({
		env: [{ ...global_env_frame }],
		debug,
	});

export type Returned = {
	type: 'returned';
	value: LangValue;
};
export type Panicked = {
	type: 'panicked';
	reason: string;
	pos: Pos;
};
export type Performed = {
	type: 'performed';
};
export type ExecutionResult = Returned | Panicked | Performed;

const returned = (value: LangValue): Returned =>
	({ type: 'returned', value });
const panicked = (reason: string, pos: Pos): Panicked =>
	({ type: 'panicked', reason, pos });
const performed = (): Performed =>
	({ type: 'performed' });

const execution_loop = async ({ debug }: Runtime, call_frame: CallFrame) => {
	const call_stack: CallFrame[] = [call_frame];
	let last_result: LangValue = lang_nil;
	try {
		while (call_stack.length > 0) {
			const frame = call_stack.slice(-1)[0];
			const result = frame.next(last_result);
			if (debug) {
				print_stdout(result.type.padEnd(10, ' ') + result.pos.src[result.pos.row]);
				print_stdout(' '.repeat(result.pos.col + 10) +
					(result.type == 'evaluated' || result.type == 'return' ? '⮤ ' + lang_stringify(result.value) : '⭡'),
				);
			}
			if (result.type == 'evaluated') {
				last_result = result.value;
			}
			else if (result.type == 'call') {
				call_stack.push(result.frame);
			}
			else if (result.type == 'return') {
				last_result = result.value;
				call_stack.pop();
			}
			else if (result.type == 'panic') {
				return panicked(result.reason, result.pos);
			}
			if (debug) { await new Promise(resolve => setTimeout(resolve, 50)); }
		}
		return returned(last_result);
	}
	catch (e) {
		console.log(call_stack);
		throw e;
	}
};

export const execute = async (runtime: Runtime, exp: Literal) => {
	const { env } = runtime;
	// Process defs, trait definition, enum definition
	if (exp.type == 'list') {
		if (exp.value[0].type == 'symbol') {
			if (exp.value[0].value == 'def') {
				const args = exp.value.slice(1);
				const name = args[0];
				if (name.type != 'symbol') {
					return panicked('define target is not a symbol', name.pos);
				}
				let phase: 0 | 1 = 0;
				const result = await execution_loop(runtime, {
					next(value) {
						switch (phase) {
						case 0:
							phase = 1;
							return evaluate(args[1], env);
						case 1:
							env[0][name.value] = value;
							return { ...retn(lang_nil), pos: exp.pos };
						}
					},
				});
				if (result.type == 'returned') {
					return performed();
				}
				return result;
			}
			else if (exp.value[0].value == 'defmacro') {
				return performed();
			}
		}
	}
	let phase: 0 | 1 = 0;
	return await execution_loop(
		runtime,
		{
			next(value) {
				switch (phase) {
				case 0:
					phase = 1;
					return evaluate(exp, env);
				case 1:
					return { ...retn(value), pos: exp.pos };
				}
			},
		},
	);
};

const print_stdout = (str: string) => {
	console.log(str);
};
