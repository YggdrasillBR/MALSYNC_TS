import { merge } from './utils/merge.mjs';

/** @satisfies {{ [scope: string]: () => Promise<{ default: import('eslint').Linter.FlatConfig }> }} */
const configMap = {
  async node() {
    return import('./configs/node.js');
  },
  async dom() {
    return import('./configs/dom.js');
  },
  async config() {
    return import('./configs/config.js');
  },
  async typescript() {
    return import('./configs/typescript.js');
  },
  'typescript-dom': async () => {
    return import('./configs/typescript-dom.js');
  },
  'vue-typescript': async () => {
    return import('./configs/vue-typescript.js');
  },
};

/**
 * @typedef {{
 *  preset: (keyof typeof configMap)[];
 *  config: import('eslint').Linter.FlatConfig;
 * }} Config
 */

/**
 * @param {Config} config
 * @returns {Promise<import('eslint').Linter.FlatConfig>}
 */
export async function useConfig(config) {
  const configs = config.preset
    .map(
      async scope => typeof configMap[scope] === 'function' && (await configMap[scope]()).default,
    )
    .filter(Boolean);
  const resolvedConfigs = await Promise.all(configs);

  const mergedConfig = merge(
    resolvedConfigs.reduce((acc, scope) => merge(acc, scope), {}),
    config.config,
  );

  if (!mergedConfig) {
    return Promise.reject(new Error('No config found'));
  }

  return mergedConfig;
}

export { merge } from './utils/merge.mjs';
export { mergeAll } from './utils/mergeAllConfig.mjs';
