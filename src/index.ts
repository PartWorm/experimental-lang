import { infer } from './infer';
import parse_exp from './parse';
import { create_runtime, execute, lang_stringify, Runtime } from './runtime';
import { srcs } from './src';

const execute_source = (runtime: Runtime, src: string[]) => {
	const res = parse_exp(src);
	if (res == undefined) {
		throw 'Failed to parse code';
	}
	return execute(runtime, res[0]);
};

(async () => {
	const runtime = create_runtime();
	for (const src_str of srcs) {
		const src = infer(src_str.split('\n'));
		console.log('<< ' + src.join('\n'));
		const result = await execute_source(runtime, src);
		if (result.type == 'returned') {
			console.log(`>> ${lang_stringify(result.value)}`);
		}
		else if (result.type == 'panicked') {
			console.log(`>> panicked: ${result.reason}`);
			console.log(result.pos.src[result.pos.row]);
			console.log(' '.repeat(result.pos.col) + '⭡');
			break;
		}
		else {
			console.log('>> performed');
		}
	}
})();
