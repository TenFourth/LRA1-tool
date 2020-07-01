module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jest/globals": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parsers": [
        "@typescript-eslint/parser"
    ],
    "parserOptions": {
        "ecmaVersion": 2018,
        "project": "./tsconfig.eslint.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "jest"
    ],
    "rules": {
        "no-irregular-whitespace": ["error", { "skipRegExps": true }],
        "semi": "error"
    }
};
