(function () {
    var defines = {};
    var entry = [null];
    function define(name, dependencies, factory) {
        defines[name] = { dependencies: dependencies, factory: factory };
        entry[0] = name;
    }
    define("require", ["exports"], function (exports) {
        Object.defineProperty(exports, "__cjsModule", { value: true });
        Object.defineProperty(exports, "default", { value: function (name) { return resolve(name); } });
    });
    var __assign = (this && this.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var __spreadArrays = (this && this.__spreadArrays) || function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    define("infer", ["require", "exports"], function (require, exports) {
        "use strict";
        exports.__esModule = true;
        exports.infer = void 0;
        var open_to_close = {
            '(': ')', '[': ']', '{': '}'
        };
        var close_to_open = {
            ')': '(', ']': '[', '}': '{'
        };
        exports.infer = function (lines) {
            var result = [];
            var paren_stack = [];
            for (var i = 0; i < lines.length; ++i) {
                var line = lines[i];
                for (var j = 0; j < line.length; ++j) {
                    var c = line[j];
                    if (open_to_close[c]) {
                        paren_stack.push([c, j + 1]);
                    }
                    else if (close_to_open[c]) {
                        paren_stack.pop();
                    }
                }
                var next_line_indent = (lines[i + 1] || '').search(/\S|$/);
                while (paren_stack.length > 0 && paren_stack.slice(-1)[0][1] > next_line_indent) {
                    line += open_to_close[paren_stack.pop()[0]];
                }
                result.push(line);
            }
            return result;
        };
    });
    define("literal", ["require", "exports"], function (require, exports) {
        "use strict";
        exports.__esModule = true;
    });
    define("parse", ["require", "exports"], function (require, exports) {
        "use strict";
        exports.__esModule = true;
        var item = function (_a) {
            var src = _a.src, _b = _a.pos, row = _b.row, col = _b.col;
            if (row >= src.length) {
                return undefined;
            }
            if (col >= src[row].length) {
                return ['\n', { src: src, pos: { src: src, row: row + 1, col: 0 } }];
            }
            return [src[row][col], { src: src, pos: { src: src, row: row, col: col + 1 } }];
        };
        var nothing = function (s) {
            return [undefined, s];
        };
        var eof = function (s) {
            var r = item(s);
            if (r === undefined) {
                return [0, s];
            }
            return undefined;
        };
        var peek = function (f) { return function (s) {
            var r = item(s);
            return r && (f(r[0]) ? [0, s] : undefined);
        }; };
        var attach_pos = function (p) { return function (s) {
            var r = p(s);
            return r && [__assign(__assign({}, r[0]), { pos: s.pos }), r[1]];
        }; };
        var parse = function (p) { return function (src) { return p({ src: src, pos: { src: src, row: 0, col: 0 } }); }; };
        var retn = function (x) { return function (s) { return [x, s]; }; };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var fail = function () { return undefined; };
        var bind = function (p) { return function (f) { return function (s) {
            var r = p(s);
            return r && f(r[0])(r[1]);
        }; }; };
        var or = function (p) { return function (q) { return function (s) { return p(s) || q(s); }; }; };
        var or_chain = function () {
            var ps = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                ps[_i] = arguments[_i];
            }
            return ps.reduce(function (p, q) { return or(p)(q); });
        };
        var then = function (p) { return function (q) { return bind(p)(function () { return q; }); }; };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function then_chain() {
            var ps = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                ps[_i] = arguments[_i];
            }
            return ps.reduce(function (p, q) { return bind(p)(function () { return q; }); });
        }
        var sat_r = function (r) { return sat(r.test.bind(r)); };
        var ch = function (x) { return bind(item)(function (y) { return x == y[0] ? retn(y) : fail; }); };
        var sat = function (f) { return bind(item)(function (x) { return f(x[0]) ? retn(x) : fail; }); };
        var many1 = function (p) { return bind(p)(function (x) { return bind(many(p))(function (xs) { return retn(__spreadArrays([x], xs)); }); }); };
        var many = function (p) { return or(many1(p))(retn([])); };
        var space = sat_r(/[\n\t ]/);
        var many_spaces = many(space);
        var skip_comment = or(then_chain(ch('('), ch('#'), many(sat_r(/[^)]/)), ch(')')))(nothing);
        var skip_spaces = function (p) { return then_chain(many_spaces, skip_comment, many_spaces, p); };
        var ellipsis = attach_pos(then(then(ch('.'))(ch('.')))((retn({
            type: 'ellipsis',
            value: undefined
        }))));
        var symbol = attach_pos(bind(many1(sat_r(/[^()[\]'\n\t ]/)))(function (xs) { return retn({
            type: 'symbol',
            value: xs.join('')
        }); }));
        var atom = attach_pos(then(ch(':'))(bind(symbol)(function (s) { return retn({
            type: 'atom',
            value: s.value
        }); })));
        var digit = sat_r(/\d/);
        var int = attach_pos(bind(many1(digit))(function (xs) { return retn({
            type: 'number',
            value: parseInt(xs.join(''))
        }); }));
        var char_in_string = then(peek(function (s) { return s != '\''; }))(or(then(ch('\\'))(bind(item)(function (c) {
            if (c == 'n') {
                return retn('\n');
            }
            return retn(c);
        })))(sat(function (s) { return s != '\\'; })));
        var string = attach_pos(then(ch('\''))(bind(many(char_in_string))(function (xs) { return then(ch('\''))(retn({
            type: 'string',
            value: xs.join('')
        })); })));
        // eslint-disable-next-line prefer-const
        var exp;
        var array = function (type) { return function (open) { return function (close) { return attach_pos(then(ch(open))(bind(many(bind(many_spaces)(function () { return exp; })))(function (exps) { return skip_spaces(then(ch(close))(retn({
            type: type,
            value: exps
        }))); }))); }; }; };
        var list = array('list')('(')(')');
        var vector = array('vector')('[')(']');
        exp = skip_spaces(or_chain(ellipsis, atom, string, int, list, vector, symbol));
        var program = bind(exp)(function (e) { return then(skip_spaces(eof))(retn(e)); });
        exports["default"] = parse(program);
    });
    define("runtime", ["require", "exports"], function (require, exports) {
        "use strict";
        exports.__esModule = true;
        exports.execute = exports.create_runtime = exports.lang_stringify = void 0;
        var lang_nil = { type: 'atom', value: 'nil' };
        var lang_false = { type: 'bool', value: false };
        var lang_true = { type: 'bool', value: true };
        var make_bool = function (value) {
            return value ? lang_true : lang_false;
        };
        var make_number = function (value) {
            return ({ type: 'number', value: value });
        };
        exports.lang_stringify = function (value) {
            if (value.type == 'lambda') {
                return '[lambda]';
            }
            if (value.type == 'native-lambda' || value.type == 'native-function') {
                return '[native function]';
            }
            if (value.type == 'atom') {
                return ":" + value.value;
            }
            if (value.type == 'vector') {
                return "[" + value.value.map(exports.lang_stringify).join(' ') + "]";
            }
            return "" + value.value;
        };
        var lang_equals = function (a, b) {
            if (a.type != b.type) {
                return false;
            }
            if (a.type == 'lambda' || a.type == 'native-lambda' || a.type == 'native-function') {
                return a == b;
            }
            b = b;
            return a.value == b.value;
        };
        var operator_num_num = function (fn) { return function (args) {
            if (args[0].type != 'number') {
                return panic('arg 0 is not a number');
            }
            return evaluated(make_number(fn(args[0].value)));
        }; };
        var operator_num_num_num = function (fn) { return function (args) {
            var lhs = args[0];
            if (lhs.type != 'number') {
                return panic('arg 0 is not a number');
            }
            var rhs = args[1];
            if (rhs.type != 'number') {
                return panic('arg 1 is not a number');
            }
            return evaluated(make_number(fn(lhs.value, rhs.value)));
        }; };
        var operator_num_num_bool = function (fn) { return function (args) {
            var lhs = args[0];
            if (lhs.type != 'number') {
                return panic('arg 0 is not a number');
            }
            var rhs = args[1];
            if (rhs.type != 'number') {
                return panic('arg 1 is not a number');
            }
            return evaluated(make_bool(fn(lhs.value, rhs.value)));
        }; };
        var bind = function (env_frame, pattern, value) {
            if (pattern.type == 'symbol') {
                env_frame[pattern.value] = value;
                return true;
            }
            else if (pattern.type == 'vector') {
                if (value.type != 'vector')
                    return false;
                var pattern_len = pattern.value.length;
                var value_len = value.value.length;
                var pi = 0, vi = 0;
                while (pi < pattern_len || vi < value_len) {
                    if (pi >= pattern_len)
                        return false;
                    var p = pattern.value[pi];
                    if (p.type == 'ellipsis') {
                        if (pi + 2 != pattern_len) {
                            return false;
                        }
                        return bind(env_frame, pattern.value[pi + 1], {
                            type: 'vector',
                            value: value.value.slice(vi)
                        });
                    }
                    if (vi >= value_len)
                        return false;
                    var v = value.value[vi];
                    if (!bind(env_frame, p, v))
                        return false;
                    ++pi, ++vi;
                }
                return true;
            }
            else if (pattern.type == 'list') {
                return false;
            }
            if (pattern.type != value.type)
                return false;
            return pattern.value == value.value;
        };
        var global_env_frame = {
            "else": lang_true,
            nil: lang_nil,
            "false": lang_false,
            "true": lang_true,
            'let': {
                type: 'native-function',
                func: function (args, env, call_pos) {
                    var let_env_frame = {};
                    env = __spreadArrays([let_env_frame], env);
                    var bindings = args.slice(0, -1);
                    var phase = 0;
                    var pos = 0;
                    var binding;
                    var target;
                    return call(function (value) {
                        for (;;) {
                            switch (phase) {
                                case 0:
                                    if (pos >= bindings.length) {
                                        phase = 2;
                                        continue;
                                    }
                                    binding = bindings[pos];
                                    if (binding.type != 'list') {
                                        return __assign(__assign({}, panic('binding entry is not a list')), { pos: binding.pos });
                                    }
                                    target = binding.value[0];
                                    phase = 1;
                                    return evaluate(binding.value[1], env);
                                case 1:
                                    if (!bind(let_env_frame, target, value)) {
                                        return __assign(__assign({}, panic('failed to bind value to target')), { pos: binding.pos });
                                    }
                                    ++pos;
                                    phase = 0;
                                    continue;
                                case 2:
                                    phase = 3;
                                    return evaluate(args.slice(-1)[0], env);
                                case 3:
                                    return __assign(__assign({}, retn(value)), { pos: call_pos });
                            }
                        }
                    });
                }
            },
            '=': {
                type: 'native-function',
                func: function (args, env, pos) {
                    if (args[0].type != 'symbol') {
                        return panic('assignment target is not a symbol');
                    }
                    var name = args[0].value;
                    var _loop_1 = function (env_frame) {
                        if (Object.prototype.hasOwnProperty.call(env_frame, name)) {
                            var phase_1 = 0;
                            return { value: call(function (value) {
                                    switch (phase_1) {
                                        case 0:
                                            phase_1 = 1;
                                            return evaluate(args[1], env);
                                        case 1:
                                            env_frame[name] = value;
                                            return __assign(__assign({}, retn(lang_nil)), { pos: pos });
                                    }
                                }) };
                        }
                    };
                    for (var _i = 0, env_1 = env; _i < env_1.length; _i++) {
                        var env_frame = env_1[_i];
                        var state_1 = _loop_1(env_frame);
                        if (typeof state_1 === "object")
                            return state_1.value;
                    }
                    return panic("tried to assign to undefined variable " + name);
                }
            },
            'if': {
                type: 'native-function',
                func: function (args, env, pos) {
                    var phase = 0;
                    return call(function (value) {
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
                                return __assign(__assign({}, retn(value)), { pos: pos });
                        }
                    });
                }
            },
            'if-let': {
                type: 'native-function',
                func: function (args, env, pos) {
                    var phase = 0;
                    var env_frame = {};
                    return call(function (value) {
                        switch (phase) {
                            case 0:
                                phase = 1;
                                return evaluate(args[1], env);
                            case 1:
                                phase = 2;
                                if (bind(env_frame, args[0], value)) {
                                    return evaluate(args[2], __spreadArrays([env_frame], env));
                                }
                                else {
                                    return evaluate(args[3], env);
                                }
                            case 2:
                                return __assign(__assign({}, retn(value)), { pos: pos });
                        }
                    });
                }
            },
            'case': {
                type: 'native-function',
                func: function (args, env, call_pos) {
                    var clauses = args.slice(1);
                    var phase = 0;
                    var target;
                    var pos = 0;
                    var clause;
                    var env_frame;
                    return call(function (value) {
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
                                        return __assign(__assign({}, panic('case clause is not a list')), { pos: call_pos });
                                    }
                                    env_frame = {};
                                    if (!bind(env_frame, clause.value[0], target)) {
                                        phase = 5;
                                        continue;
                                    }
                                    phase = 4;
                                    return evaluate(clause.value[1], __spreadArrays([env_frame], env));
                                case 4:
                                    return __assign(__assign({}, retn(value)), { pos: call_pos });
                                case 5:
                                    ++pos;
                                    phase = 1;
                                    continue;
                                case 6:
                                    return __assign(__assign({}, panic('no matching case clauses')), { pos: call_pos });
                            }
                        }
                    });
                }
            },
            when: {
                type: 'native-function',
                func: function (args, env, call_pos) {
                    var phase = 0;
                    var pos = 0;
                    var maybe_clause;
                    var clause;
                    return call(function (value) {
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
                                        return __assign(__assign({}, panic('when clause is not a list')), { pos: call_pos });
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
                                    return __assign(__assign({}, retn(value)), { pos: call_pos });
                                case 4:
                                    ++pos;
                                    phase = 0;
                                    continue;
                                case 5:
                                    return __assign(__assign({}, panic('no matching when clauses')), { pos: call_pos });
                            }
                        }
                    });
                }
            },
            defer: {
                type: 'native-function',
                func: function (args, env) {
                    return evaluated({
                        type: 'lambda',
                        params: [],
                        body: args[0],
                        env: env
                    });
                }
            },
            fn: {
                type: 'native-function',
                func: function (args, env) {
                    if (args[0].type != 'list') {
                        throw 'Parameter must be list';
                    }
                    var params = args[0].value;
                    return evaluated({
                        type: 'lambda',
                        params: params,
                        body: args[1],
                        env: env
                    });
                }
            },
            'do': {
                type: 'native-lambda',
                func: function (args) {
                    return evaluated(args.slice(-1)[0]);
                }
            },
            print: {
                type: 'native-lambda',
                func: function (args) {
                    print_stdout(exports.lang_stringify(args[0]));
                    return evaluated(lang_nil);
                }
            },
            '==': {
                type: 'native-lambda',
                func: function (args) {
                    return evaluated(make_bool(lang_equals(args[0], args[1])));
                }
            },
            'nil?': {
                type: 'native-lambda',
                func: function (args) { return evaluated(make_bool(lang_equals(args[0], lang_nil))); }
            },
            '>': {
                type: 'native-lambda',
                func: operator_num_num_bool(function (a, b) { return a > b; })
            },
            '<': {
                type: 'native-lambda',
                func: operator_num_num_bool(function (a, b) { return a < b; })
            },
            '+': {
                type: 'native-lambda',
                func: operator_num_num_num(function (a, b) { return a + b; })
            },
            '-': {
                type: 'native-lambda',
                func: operator_num_num_num(function (a, b) { return a - b; })
            },
            '*': {
                type: 'native-lambda',
                func: operator_num_num_num(function (a, b) { return a * b; })
            },
            '/': {
                type: 'native-lambda',
                func: operator_num_num_num(function (a, b) { return a / b; })
            },
            '%': {
                type: 'native-lambda',
                func: operator_num_num_num(function (a, b) { return a % b; })
            },
            floor: {
                type: 'native-lambda',
                func: operator_num_num(function (a) { return Math.floor(a); })
            },
            ceil: {
                type: 'native-lambda',
                func: operator_num_num(function (a) { return Math.ceil(a); })
            },
            'panic': {
                type: 'native-lambda',
                func: function (_a) {
                    var reason = _a[0];
                    return panic(exports.lang_stringify(reason));
                }
            },
            'str': {
                type: 'native-lambda',
                func: function (args) {
                    var result = '';
                    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
                        var arg = args_1[_i];
                        result += exports.lang_stringify(arg);
                    }
                    return evaluated({ type: 'string', value: result });
                }
            },
            '$': {
                type: 'native-function',
                func: function (args, env) {
                    return evaluated({
                        type: 'lambda',
                        params: [{ type: 'symbol', value: '_', pos: args[0].pos }],
                        body: args[0],
                        env: env
                    });
                }
            }
        };
        var evaluated = function (value) { return ({ type: 'evaluated', value: value }); };
        var call = function (next) { return ({ type: 'call', frame: { next: next } }); };
        var retn = function (value) { return ({ type: 'return', value: value }); };
        var panic = function (reason) {
            return ({ type: 'panic', reason: reason });
        };
        var call_lambda = function (target, args) {
            var call_frame = {};
            for (var _i = 0, _a = Object.entries(target.params); _i < _a.length; _i++) {
                var _b = _a[_i], i = _b[0], param = _b[1];
                if (!bind(call_frame, param, args[i])) {
                    return __assign(__assign({}, panic('failed to bind arg to param')), { pos: param.pos });
                }
            }
            return evaluate(target.body, __spreadArrays([call_frame], target.env));
        };
        var lambda_call = function (target, args, env, call_pos) {
            var phase = 0;
            var arg_values = [];
            var pos = 0;
            return call(function (value) {
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
                            return __assign(__assign({}, retn(value)), { pos: call_pos });
                    }
                }
            });
        };
        var native_lambda_call = function (target, args, env, call_pos) {
            var phase = 0;
            var arg_values = [];
            var pos = 0;
            return call(function (value) {
                for (;;) {
                    switch (phase) {
                        case 0:
                            if (pos >= args.length) {
                                phase = 3;
                                return __assign(__assign({}, target.func(arg_values, call_pos)), { pos: call_pos });
                            }
                        case 1:
                            phase = 2;
                            return evaluate(args[pos], env);
                        case 2:
                            arg_values[pos++] = value;
                            phase = 0;
                            continue;
                        case 3:
                            return __assign(__assign({}, retn(value)), { pos: call_pos });
                    }
                }
            });
        };
        var native_function_call = function (target, args, env, pos) {
            return target.func(args, env, pos);
        };
        var evaluate = function (exp, env) {
            var pos = exp.pos;
            if (exp.type == 'list') {
                var args_2 = exp.value.slice(1);
                var handle_callable_1 = function (target) {
                    if (target.type == 'lambda') {
                        return lambda_call(target, args_2, env, pos);
                    }
                    else if (target.type == 'native-lambda') {
                        return native_lambda_call(target, args_2, env, pos);
                    }
                    else if (target.type == 'native-function') {
                        return native_function_call(target, args_2, env, pos);
                    }
                    return panic("not callable type " + target.type);
                };
                var target_1 = evaluate(exp.value[0], env);
                var phase_2 = 0;
                return __assign(__assign({}, call(function (value) {
                    switch (phase_2) {
                        case 0:
                            phase_2 = 1;
                            return target_1;
                        case 1:
                            phase_2 = 2;
                            return __assign(__assign({}, handle_callable_1(value)), { pos: pos });
                        case 2:
                            return __assign(__assign({}, retn(value)), { pos: pos });
                    }
                })), { pos: pos });
            }
            else if (exp.type == 'vector') {
                var value_lits_1 = exp.value;
                var phase_3 = 0;
                var values_1 = [];
                var pos_1 = 0;
                return __assign(__assign({}, call(function (value) {
                    for (;;) {
                        switch (phase_3) {
                            case 0:
                                if (pos_1 >= value_lits_1.length) {
                                    return __assign(__assign({}, retn({
                                        type: 'vector',
                                        value: values_1
                                    })), { pos: exp.pos });
                                }
                            case 1:
                                phase_3 = 2;
                                return evaluate(value_lits_1[pos_1], env);
                            case 2:
                                values_1[pos_1++] = value;
                                phase_3 = 0;
                                continue;
                        }
                    }
                })), { pos: exp.pos });
            }
            else if (exp.type == 'symbol') {
                for (var _i = 0, env_2 = env; _i < env_2.length; _i++) {
                    var env_frame = env_2[_i];
                    if (env_frame[exp.value] !== undefined) {
                        return __assign(__assign({}, evaluated(env_frame[exp.value])), { pos: pos });
                    }
                }
                return __assign(__assign({}, panic("undefined variable " + exp.value)), { pos: pos });
            }
            else if (exp.type == 'ellipsis') {
                return __assign(__assign({}, panic('tried to evaluate ellipsis')), { pos: pos });
            }
            return __assign(__assign({}, evaluated(exp)), { pos: pos });
        };
        exports.create_runtime = function (debug) {
            if (debug === void 0) { debug = false; }
            return ({
                env: [__assign({}, global_env_frame)],
                debug: debug
            });
        };
        var returned = function (value) {
            return ({ type: 'returned', value: value });
        };
        var panicked = function (reason, pos) {
            return ({ type: 'panicked', reason: reason, pos: pos });
        };
        var performed = function () {
            return ({ type: 'performed' });
        };
        var execution_loop = function (_a, call_frame) {
            var debug = _a.debug;
            return __awaiter(void 0, void 0, void 0, function () {
                var call_stack, last_result, frame, result, e_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            call_stack = [call_frame];
                            last_result = lang_nil;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 6, , 7]);
                            _b.label = 2;
                        case 2:
                            if (!(call_stack.length > 0)) return [3 /*break*/, 5];
                            frame = call_stack.slice(-1)[0];
                            result = frame.next(last_result);
                            if (debug) {
                                print_stdout(result.type.padEnd(10, ' ') + result.pos.src[result.pos.row]);
                                print_stdout(' '.repeat(result.pos.col + 10) +
                                    (result.type == 'evaluated' || result.type == 'return' ? '⮤ ' + exports.lang_stringify(result.value) : '⭡'));
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
                                return [2 /*return*/, panicked(result.reason, result.pos)];
                            }
                            if (!debug) return [3 /*break*/, 4];
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4: return [3 /*break*/, 2];
                        case 5: return [2 /*return*/, returned(last_result)];
                        case 6:
                            e_1 = _b.sent();
                            console.log(call_stack);
                            throw e_1;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        exports.execute = function (runtime, exp) { return __awaiter(void 0, void 0, void 0, function () {
            var env, args_3, name_1, phase_4, result, phase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        env = runtime.env;
                        if (!(exp.type == 'list')) return [3 /*break*/, 3];
                        if (!(exp.value[0].type == 'symbol')) return [3 /*break*/, 3];
                        if (!(exp.value[0].value == 'def')) return [3 /*break*/, 2];
                        args_3 = exp.value.slice(1);
                        name_1 = args_3[0];
                        if (name_1.type != 'symbol') {
                            return [2 /*return*/, panicked('define target is not a symbol', name_1.pos)];
                        }
                        phase_4 = 0;
                        return [4 /*yield*/, execution_loop(runtime, {
                                next: function (value) {
                                    switch (phase_4) {
                                        case 0:
                                            phase_4 = 1;
                                            return evaluate(args_3[1], env);
                                        case 1:
                                            env[0][name_1.value] = value;
                                            return __assign(__assign({}, retn(lang_nil)), { pos: exp.pos });
                                    }
                                }
                            })];
                    case 1:
                        result = _a.sent();
                        if (result.type == 'returned') {
                            return [2 /*return*/, performed()];
                        }
                        return [2 /*return*/, result];
                    case 2:
                        if (exp.value[0].value == 'defmacro') {
                            return [2 /*return*/, performed()];
                        }
                        _a.label = 3;
                    case 3:
                        phase = 0;
                        return [4 /*yield*/, execution_loop(runtime, {
                                next: function (value) {
                                    switch (phase) {
                                        case 0:
                                            phase = 1;
                                            return evaluate(exp, env);
                                        case 1:
                                            return __assign(__assign({}, retn(value)), { pos: exp.pos });
                                    }
                                }
                            })];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        var print_stdout = function (str) {
            console.log(str);
        };
    });
    /* eslint-disable quotes */
    /* eslint-disable indent */
    define("src", ["require", "exports"], function (require, exports) {
        "use strict";
        exports.__esModule = true;
        exports.srcs = void 0;
        var values_test = [
            "(print-title 'value test'",
            "(def some-atom (# this is comment.) :ok",
            "(def some-number 42",
            "(def some-string 'Hello world!'",
            "(def some-vector [1 :ok 3",
        ];
        var pattern_matching_test = [
            "(print-title 'pattern matching test'",
            "(if-let [a] [] 'bad' 'ok'",
            "(if-let [] [1] 'bad' 'ok'",
            "(if-let [a b] [1 2] (str a ' ' b) 'bad'",
            "(if-let [a b .. e] [1 2 3 4 5 6] (str a ' ' b ' ' e) 'bad'",
            "(if-let [a b c d .. e] [1 2 3] 'bad' 'ok'",
            "(def some-ok [:ok 123",
            "(def some-err [:err 456",
            "\n(def ok-or-err\n  (fn (v\n    (case v (# pattern matching example\n      ([:ok x] (str 'ok value: ' x\n      ([:err x] (str 'error value: ' x\n",
            "(ok-or-err some-ok",
            "(ok-or-err some-err",
        ];
        var example_put_star = [
            "(print-title 'example: put-star'",
            "\n(def repeat\n  (fn (s n\n    (if (== n 0\n      ''\n      (str s (repeat s (- n 1\n",
            "\n(def put-star-rec\n  (fn (n i\n    (if (> i n) :nil\n                (do (print (repeat '*' i\n                    (put-star-rec n (+ i 1\n",
            "\n(def put-star\n  (fn (n) (put-star-rec n 1\n",
            "(put-star 5)",
        ];
        var example_store = [
            "(print-title 'example: store'",
            "\n(def store\n  (defer (let (value 0\n           (fn (cmd arg1\n             (case cmd (:get value\n                       (:set (= value arg1\n",
            "(def s (store",
            "(s :set 3",
            "(s :get",
        ];
        var example_stream = [
            "(print-title 'example: stream'",
            "\n(def stream\n  (fn (begin step\n    [begin\n     (defer (stream (+ begin step) step\n",
            '(def nat (stream 1 1',
            "\n(def print-stream\n  (fn (stream\n    (case stream\n      ([] :nil\n      ([head tail] (do (print head\n                       (print-stream (tail\n",
            "\n(def collect\n  (fn (stream n\n    (if (== n 0) []\n                 (case stream\n                   ([] []\n                   ([head tail] [head\n                                 (defer (collect (tail\n                                          (- n 1\n",
            "(def nat-10 (collect nat 10",
            "(print-stream nat-10",
            "\n(def map\n  (fn (stream fn\n    (case stream\n      ([] []\n      ([head tail] [(fn head\n                    (defer (map (tail) fn\n",
            "(def nat-10-3 (map nat-10 (fn (x) (* x 3",
            "(print-stream nat-10-3",
            "\n(def zip\n  (fn (s t\n    (case [s t\n      ([[] _] []\n      ([_ []] []\n      ([[shead stail] [thead ttail]] [[shead thead]\n                                      (defer (zip (stail) (ttail\n",
            "(print-stream (zip nat-10 nat-10-3",
            "\n(def filter\n  (fn (stream fn\n    (case stream\n      ([] []\n      ([head tail\n       (let (new-tail (defer (filter (tail) fn\n         (if (fn head\n           [head new-tail\n           (new-tail\n",
            "(print-stream (filter nat-10 (fn (x) (== (% x 4) 0",
        ];
        var example_hanoi = [
            "(print-title 'example: hanoi'",
            "\n(def print-hanoi\n  (fn (from to) (print (str from '->' to\n",
            "\n(def hanoi\n  (fn (n from to\n    (if (== n 1) (print-hanoi from to\n                 (let (discs-above (- n 1\n                      (mid (- 6 (+ from to\n                   (do (hanoi discs-above from mid\n                       (print-hanoi from to\n                       (hanoi discs-above mid to\n",
            "(hanoi 3 1 3",
        ];
        exports.srcs = __spreadArrays([
            "\n(def print-title\n  (fn (title\n    (print (str '\\n### ' title ' ###\\n'\n"
        ], values_test, pattern_matching_test, example_put_star, example_store, example_stream, example_hanoi);
    });
    define("index", ["require", "exports", "infer", "parse", "runtime", "src"], function (require, exports, infer_1, parse_1, runtime_1, src_1) {
        "use strict";
        exports.__esModule = true;
        var execute_source = function (runtime, src) {
            var res = parse_1["default"](src);
            if (res == undefined) {
                throw 'Failed to parse code';
            }
            return runtime_1.execute(runtime, res[0]);
        };
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var runtime, _i, srcs_1, src_str, src, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtime = runtime_1.create_runtime();
                        _i = 0, srcs_1 = src_1.srcs;
                        _a.label = 1;
                    case 1:
                        if (!(_i < srcs_1.length)) return [3 /*break*/, 4];
                        src_str = srcs_1[_i];
                        src = infer_1.infer(src_str.split('\n'));
                        console.log('<< ' + src.join('\n'));
                        return [4 /*yield*/, execute_source(runtime, src)];
                    case 2:
                        result = _a.sent();
                        if (result.type == 'returned') {
                            console.log(">> " + runtime_1.lang_stringify(result.value));
                        }
                        else if (result.type == 'panicked') {
                            console.log(">> panicked: " + result.reason);
                            console.log(result.pos.src[result.pos.row]);
                            console.log(' '.repeat(result.pos.col) + '⭡');
                            return [3 /*break*/, 4];
                        }
                        else {
                            console.log('>> performed');
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); })();
    });
    
    'marker:resolver';

    function get_define(name) {
        if (defines[name]) {
            return defines[name];
        }
        else if (defines[name + '/index']) {
            return defines[name + '/index'];
        }
        else {
            var dependencies = ['exports'];
            var factory = function (exports) {
                try {
                    Object.defineProperty(exports, "__cjsModule", { value: true });
                    Object.defineProperty(exports, "default", { value: require(name) });
                }
                catch (_a) {
                    throw Error(['module "', name, '" not found.'].join(''));
                }
            };
            return { dependencies: dependencies, factory: factory };
        }
    }
    var instances = {};
    function resolve(name) {
        if (instances[name]) {
            return instances[name];
        }
        if (name === 'exports') {
            return {};
        }
        var define = get_define(name);
        instances[name] = {};
        var dependencies = define.dependencies.map(function (name) { return resolve(name); });
        define.factory.apply(define, dependencies);
        var exports = dependencies[define.dependencies.indexOf('exports')];
        instances[name] = (exports['__cjsModule']) ? exports["default"] : exports;
        return instances[name];
    }
    if (entry[0] !== null) {
        return resolve(entry[0]);
    }
})();