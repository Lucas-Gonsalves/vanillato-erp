import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    'src/generated/**',
    '.prettierrc',
    '.yml',
    '.md',
    '.env',
  ]),
  prettier,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // normal rules
      semi: ['warn', 'never'], // Disallow semicolons at the end of statements

      indent: ['warn', 2], // Enforce consistent indentation of 2 spaces

      'comma-dangle': ['warn', 'always-multiline'], // Require trailing commas in multiline objects, arrays, etc.

      'object-curly-spacing': ['warn', 'always'], // Require spaces inside curly braces (e.g., { foo: "bar" })

      'arrow-parens': ['warn', 'always'], // Require parentheses around arrow function parameters

      'jsx-quotes': ['warn', 'prefer-double'], // Enforce double quotes in JSX attributes

      'simple-import-sort/imports': 'warn', // turn import sort to warn

      'simple-import-sort/exports': 'warn', // turn export sort to warn

      'prettier/prettier': 'warn', // turn prettier error in warning
    },
  },
])

export default eslintConfig
