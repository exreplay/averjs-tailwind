import { copy, exists, writeJSONSync } from 'fs-extra';
import { resolve } from 'path';
import get from 'lodash/get';
import tailwind from 'tailwindcss/resolveConfig';

export default async function(options = {}) {
  const {
    skipCreation = false,
    cssPath = './',
    defaultExtractor,
    configPath = 'tailwind.config.js',
    resolveConfig = false
  } = options;
  const cacheDir = this.aver.config.cacheDir;

  if (!this.config.webpack.postcss) return;

  if (!skipCreation) {
    if (!await exists(resolve(process.env.PROJECT_PATH, cssPath, 'tailwind.css'))) {
      await copy(
        resolve(__dirname, './templates/tailwind.css'),
        resolve(process.env.PROJECT_PATH, cssPath, 'tailwind.css')
      );
    }
    
    const projectConfigPath = resolve(process.env.PROJECT_PATH, `../${configPath}`);
    if (!await exists(projectConfigPath)) {
      await copy(
        resolve(__dirname, './templates/tailwind.config.js'),
        projectConfigPath
      );
    }
  }

  if (resolveConfig) {
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

        this.aver.config.webpack.alias[`@${fileName}`] = filePath;
      }
    } else if (typeof resolveConfig === 'string') {
      const fileName = `tailwind.${resolveConfig}.json`;
      const filePath = resolve(cacheDir, `./${fileName}`);

      writeJSONSync(
        filePath,
        get(config, resolveConfig)
      );

      this.aver.config.webpack.alias[`@${fileName}`] = filePath;
    } else {
      const filePath = resolve(cacheDir, './tailwind.config.json');
      
      writeJSONSync(
        filePath,
        config
      );

      this.aver.config.webpack.alias['@tailwind.config.json'] = filePath;
    }
  }

  if (!this.config.webpack.postcss.plugins) this.config.webpack.postcss.plugins = {};
  this.config.webpack.postcss.plugins.tailwindcss = configPath;
  this.config.webpack.postcss.preset = { stage: 1 };

  const extractor = /* istanbul ignore next */ content => {
    const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '');
    return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:!]*[A-Za-z0-9-_/]+/g) || [];
  };

  if (!this.config.purgecss) this.config.purgecss = {};
  this.config.purgecss.defaultExtractor = defaultExtractor || extractor;
}
