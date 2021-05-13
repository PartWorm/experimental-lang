const open_to_close = {
	'(': ')', '[': ']', '{': '}',
};

const close_to_open = {
	')': '(', ']': '[', '}': '{',
};

export const infer_paren = (lines: string[]) => {
	const result: string[] = [];
	const paren_stack: [string, number][] = [];
	for (let i = 0; i < lines.length; ++i) {
		let line = lines[i];
		for (let j = 0; j < line.length; ++j) {
			const c = line[j];
			if (open_to_close[c]) {
				paren_stack.push([c, j + 1]);
			}
			else if (close_to_open[c]) {
				paren_stack.pop();
			}
		}
		const next_line_indent = (lines[i + 1] || '').search(/\S|$/);
		while (paren_stack.length > 0 && paren_stack.slice(-1)[0][1] > next_line_indent) {
			line += open_to_close[paren_stack.pop()![0]];
		}
		result.push(line);
	}
	return result;
};
