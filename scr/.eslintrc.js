module.exports = {
	'env': {
		'browser': true,
		'es2020': true
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 11,
		'sourceType': 'module'
	},
	'rules': {
		// Prefer single quotes
		'quotes': ['warn', 'single', { 'avoidEscape': true }],
		// All instructions must end with semicolons
		'semi': ['error', 'always'],
		// Indent with tabs
		'indent': ['warn', 'tab'],
		// Force Unix new-lines
		'linebreak-style': ['warn', 'windows'],
		// Force strict mode
		'strict': ['error', 'safe'],
		// Force curly-braces style
		'curly': ['warn', 'multi-or-nest'],
		// Default case always must be last one
		'default-case-last': 'error',
		// Use === or !== instead of == or !=
		'eqeqeq': ['error', 'smart'],
		// Allow only one class per file
		'max-classes-per-file': 'warn',
		// No empty functions, at least a comment is needed
		'no-empty-function': 'warn',
		// Eval function is dangerous and slow
		'no-eval': 'error',
		// Avoid extend native objects
		'no-extend-native': 'error',
		// Avoid vars in loops that returns functions
		'no-loop-func': 'error',
		// Avoid multiline strings with backslash
		'no-multi-str': 'error',
		// Avoid javascript: pseudoprotocol within .js files
		'no-script-url': 'error',
		// Avoid comparing a variable with itself
		'no-self-compare': 'error',
		// Avoid loops that do not change condition
		'no-unmodified-loop-condition': 'warn'
	}
};
