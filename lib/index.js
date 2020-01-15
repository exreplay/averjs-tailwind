import { copy, exists } from 'fs-extra';
import { resolve } from 'path';

export default async function(options) {
  const {
    skipCreation = false,
    cssPath = './',
    defaultExtractor
  } = options;

  if (!this.config.webpack.postcss) return;
  
  if (!skipCreation) {
    if (!await exists(resolve(process.env.PROJECT_PATH, cssPath, 'tailwind.css'))) {
      await copy(
        resolve(__dirname, './templates/tailwind.css'),
        resolve(process.env.PROJECT_PATH, cssPath, 'tailwind.css')
      );
    }
      
    if (!await exists(resolve(process.env.PROJECT_PATH, '../tailwind.config.js'))) {
      await copy(
        resolve(__dirname, './templates/tailwind.config.js'),
        resolve(process.env.PROJECT_PATH, '../tailwind.config.js')
      );
    }
  }

  if (!this.config.webpack.postcss.plugins) this.config.webpack.postcss.plugins = {};
  this.config.webpack.postcss.plugins.tailwindcss = {};
  this.config.webpack.postcss.preset = { stage: 1 };

  const extractor = content => {
    const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '');
    return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:!]*[A-Za-z0-9-_/]+/g) || [];
  };

  if (!this.config.purgecss) this.config.purgecss = {};
  this.config.purgecss.defaultExtractor = defaultExtractor || extractor;
}
