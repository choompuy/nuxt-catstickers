import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: [".nuxt/**", ".output/**", "node_modules/**", "dist/**"],
    },
    {
        files: ["**/*.{ts,tsx}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "prefer-const": "warn",
        },
    },
];
