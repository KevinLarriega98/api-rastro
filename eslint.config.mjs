import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
    { ignores: ["dist/", "coverage/", "node_modules/"] },

    js.configs.recommended,
    tseslint.configs.recommended,

    {
        languageOptions: {
            globals: globals.node,
        },
    },

    {
        rules: {
            eqeqeq: "error",
            "no-var": "error",
            "prefer-const": "error",
            "no-empty": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
        },
    },
);