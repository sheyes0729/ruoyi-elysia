import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import vueeslint from 'eslint-plugin-vue'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

const vueRules = {
  'vue/multi-word-component-names': 'off',
  'vue/no-v-html': 'off',
  'vue/require-default-prop': 'off',
  'vue/require-explicit-emits': 'off',
  'vue/html-self-closing': 'off',
  'vue/max-attributes-per-line': 'off',
}

const tsRules = {
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
}

const vueGlobals = {
  onBeforeMount: 'readonly',
  onMounted: 'readonly',
  onBeforeUpdate: 'readonly',
  onUpdated: 'readonly',
  onBeforeUnmount: 'readonly',
  onUnmounted: 'readonly',
  onErrorCaptured: 'readonly',
  onServerPrefetch: 'readonly',
  onRenderTracked: 'readonly',
  onRenderTriggered: 'readonly',
  nextTick: 'readonly',
  defineComponent: 'readonly',
  ref: 'readonly',
  computed: 'readonly',
  reactive: 'readonly',
  readonly: 'readonly',
  watch: 'readonly',
  watchEffect: 'readonly',
  inject: 'readonly',
  provide: 'readonly',
}

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    rules: {
      ...config.rules,
      ...tsRules,
    },
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...vueGlobals,
      },
    },
    plugins: {
      vue: vueeslint,
    },
    rules: {
      ...vueRules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
)
