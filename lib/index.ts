import { copy, writeJSONSync, mkdirpSync, existsSync } from 'fs-extra';
import { resolve } from 'path';
import get from 'lodash/get';
import tailwind from 'tailwindcss/resolveConfig';
import { PluginFunction } from '@averjs/core/dist/plugins';

export interface TailwindPluginOptions {
  /**
   * Skip creating tailwind.css and tailwinc.config.js files
   *
   * @default false
   */
  skipCreation?: boolean;
  /**
   * Path where the css file should be placed
   *
   * @default ./
   */
  cssPath?: string;
  /**
   * Path where the config file should be placed
   *
   * @default tailwind.config.js
   */
  configPath?: string;
  /**
   * Resolve the given config path(s) and generate JSON files in the cache folder, which can be used in javascript.
   * Every path also registers an alias for easier referncing.
   * Eg.: colors.blue -> @tailwind.colors.blue.json
   *
   * @default false
   */
  resolveConfig?: boolean | string | string[];
}

const plugin: PluginFunction = async function(options: TailwindPluginOptions = {}) {
  const {
    skipCreation = false,
    cssPath = './',
    configPath = 'tailwind.config.js',
    resolveConfig = false
  } = options;
  const templatesPath = resolve(process.env.NODE_ENV === 'test' ? '' : require.resolve('@averjs/tailwind'), './templates');
  
  const cacheDir = this.aver.config.cacheDir;

  if (!this.config.webpack.postcss) return;

  if (!skipCreation) {
    if (!existsSync(resolve(process.env.PROJECT_PATH, cssPath, 'tailwind.css'))) {
      await copy(
        resolve(templatesPath, './tailwind.css'),
        resolve(process.env.PROJECT_PATH, cssPath, 'tailwind.css')
      );
    }
    
    const projectConfigPath = resolve(process.env.PROJECT_PATH, `../${configPath}`);
    if (!existsSync(projectConfigPath)) {
      await copy(
        resolve(templatesPath, './tailwind.config.js'),
        projectConfigPath
      );
    }
  }

  if (resolveConfig) {
    if (!existsSync(cacheDir)) mkdirpSync(cacheDir);
    
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tailwindConfig = require(resolve(process.env.PROJECT_PATH, `../${configPath}`));
    const config = tailwind(tailwindConfig);

    if (Array.isArray(resolveConfig)) {
      for (const path of resolveConfig) {
        const fileName = `tailwind.${path}.json`;
        const filePath = resolve(cacheDir, `./${fileName}`);

        writeJSONSync(
          filePath,
          get(config, path)
        );

        if (this.aver.config.webpack.alias) this.aver.config.webpack.alias[`@${fileName}`] = filePath;
      }
    } else if (typeof resolveConfig === 'string') {
      const fileName = `tailwind.${resolveConfig}.json`;
      const filePath = resolve(cacheDir, `./${fileName}`);

      writeJSONSync(
        filePath,
        get(config, resolveConfig)
      );

      if (this.aver.config.webpack.alias) this.aver.config.webpack.alias[`@${fileName}`] = filePath;
    } else {
      const filePath = resolve(cacheDir, './tailwind.config.json');
      
      writeJSONSync(
        filePath,
        config
      );

      if (this.aver.config.webpack.alias) this.aver.config.webpack.alias['@tailwind.config.json'] = filePath;
    }
  }

  if (!this.config.webpack.postcss.plugins) this.config.webpack.postcss.plugins = {};
  this.config.webpack.postcss.plugins.tailwindcss = configPath;
  this.config.webpack.postcss.preset = { stage: 1 };
};

export default plugin;
