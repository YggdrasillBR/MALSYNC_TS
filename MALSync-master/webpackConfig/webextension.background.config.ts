import { NormalModuleReplacementPlugin, ProvidePlugin, DefinePlugin } from 'webpack';
import { resolve as _resolve, join } from 'path';
const appTarget = process.env.APP_TARGET || 'general';
import packageJson from '../package.json';

import { getKeys } from './utils/keys';

plugins = [
  new NormalModuleReplacementPlugin(/(.*)-general/, function(resource) {
    resource.request = resource.request.replace(/-general/, `-${appTarget}`);
  }),
  new ProvidePlugin({
    con: _resolve(__dirname, './../src/utils/consoleBG'),
    utils: _resolve(__dirname, './../src/utils/general'),
    api: _resolve(__dirname, './../src/api/webextension'),
  }),
  new DefinePlugin({
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __MAL_SYNC_KEYS__: JSON.stringify(getKeys()),
  }),
]

export const entry = {
  index: join(__dirname, '..', 'src/index-webextension/serviceworker.ts'),
};
export const module = {
  rules: [
    {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    },
  ],
};
export const devtool = 'source-map';
export const resolve = {
  extensions: ['.tsx', '.ts', '.js'],
};
export const mode = 'development';
export const output = {
  filename: 'background.js',
  path: _resolve(__dirname, '..', 'dist', 'webextension'),
};
export const plugins = plugins;
