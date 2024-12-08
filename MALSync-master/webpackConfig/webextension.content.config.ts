import { ProvidePlugin, DefinePlugin } from 'webpack';
import { join, resolve as _resolve } from 'path';
import { existsSync } from 'fs';
import { VueLoaderPlugin } from 'vue-loader';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const pages = require('./utils/pages').pages();
import { getKeys } from './utils/keys';
import { getVirtualScript } from './utils/general';

let entry = {
  'content-script': join(
    __dirname,
    '..',
    'src/index-webextension/content.ts',
  ),
  'mal-script': join(
    __dirname,
    '..',
    'src/index-webextension/myanimelist.ts',
  ),
  'anilist-script': join(
    __dirname,
    '..',
    'src/index-webextension/anilist.ts',
  ),
  'kitsu-script': join(
    __dirname,
    '..',
    'src/index-webextension/kitsu.ts',
  ),
  'simkl-script': join(
    __dirname,
    '..',
    'src/index-webextension/simkl.ts',
  ),
  'oauth-script': join(
    __dirname,
    '..',
    'src/index-webextension/oauth.ts',
  ),
  'oauth-anilist-script': join(
    __dirname,
    '..',
    'src/index-webextension/anilistOauth.ts',
  ),
  'oauth-shiki-script': join(
    __dirname,
    '..',
    'src/index-webextension/shikiOauth.ts',
  ),
  'pwa-script': join(
    __dirname,
    '..',
    'src/index-webextension/pwa.ts',
  ),
  iframe: join(__dirname, '..', 'src/iframe.ts'),
  popup: join(__dirname, '..', 'src/popup.ts'),
}

pages.forEach(page => {
  pageRoot = join(__dirname, '..', 'src/pages/', page);
  entry['page_' + page] = 'expose-loader?exposes=_Page|' + page + '!' + join(pageRoot, 'main.ts');
  if (existsSync(join(pageRoot, 'proxy.ts'))) {
    entry['proxy/proxy_' + page] = getVirtualScript('proxy_' + page, `
      import { script } from './src/pages/${page}/proxy.ts';
      import { ScriptProxyWrapper } from './src/utils/scriptProxyWrapper.ts';

      ScriptProxyWrapper(script);
    `);
  }
})

console.log(entry);

export const entry = entry;
export const module = {
  rules: [
    {
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
      options: {
        appendTsSuffixTo: [/\.vue$/],
      },
    },
    {
      test: /\.less$/,
      exclude: /node_modules/,
      use: ['style-loader', 'css-loader', 'less-loader'],
    },
    {
      test: /\.vue$/,
      exclude: /node_modules/,
      loader: 'vue-loader',
      options: {
        customElement: true,
        shadowMode: true,
        exposeFilename: true,
      },
    },
  ],
};
export const devtool = 'source-map';
export const resolve = {
  extensions: ['.tsx', '.ts', '.js', '.less', '.vue'],
  alias: {
    vue: '@vue/runtime-dom',
  },
};
export const mode = 'development';
export const output = {
  filename: 'content/[name].js',
  path: _resolve(__dirname, '..', 'dist', 'webextension'),
};
export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    typescript: {
      configFile: _resolve(__dirname, '../tsconfig.json'),
      extensions: {
        vue: {
          enabled: true,
          compiler: '@vue/compiler-sfc',
        },
      },
    },
  }),
  new VueLoaderPlugin(),
  new ProvidePlugin({
    con: _resolve(__dirname, './../src/utils/console'),
    utils: _resolve(__dirname, './../src/utils/general'),
    j: _resolve(__dirname, './../src/utils/j'),
    api: _resolve(__dirname, './../src/api/webextension'),
  }),
  new DefinePlugin({
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __MAL_SYNC_KEYS__: JSON.stringify(getKeys()),
  }),
];
