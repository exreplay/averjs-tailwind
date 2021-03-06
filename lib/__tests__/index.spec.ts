import { emptyDir, writeFile, readFile, existsSync } from 'fs-extra';
import path from 'path';
import plugin from '../index';

describe('tailwind plugin', () => {
  process.env.PROJECT_PATH = path.resolve(__dirname, '../__fixtures__/src');
  const cacheDir = path.resolve(__dirname, '../__fixtures__/.cache');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockThis: any = null;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = {
      cacheDir,
      webpack: {
        alias: {},
        postcss: {}
      }
    };
  
    mockThis = {
      config,
      aver: {
        config
      }
    };
  });

  afterEach(async() => {
    await emptyDir(path.resolve(__dirname, '../__fixtures__'));
  });

  test('should do nothing when postcss is not defined', async() => {
    delete mockThis.config.webpack.postcss;
    const returnValue = await plugin.call(mockThis);
    expect(returnValue).toBeFalsy();
  });

  test('should create but not overwrite template files', async() => {
    if (!process.env.PROJECT_PATH) return;

    const cssPath = path.resolve(process.env.PROJECT_PATH, './tailwind.css');
    const configPath = path.resolve(process.env.PROJECT_PATH, '../tailwind.config.js');
    const cssContent = 'tailwind.css';
    const configContent = 'tailwind.config.js';

    await plugin.call(mockThis);

    expect(existsSync(cssPath)).toBeTruthy();
    expect(existsSync(configPath)).toBeTruthy();

    // modify content of both files and confirm that they are not overwritten by calling the plugin again
    await writeFile(cssPath, cssContent);
    await writeFile(configPath, configContent);

    await plugin.call(mockThis);

    expect(await readFile(cssPath, 'UTF-8')).toBe(cssContent);
    expect(await readFile(configPath, 'UTF-8')).toBe(configContent);
  });

  test('should not create files when "skipCreation" is set to true', async() => {
    if (!process.env.PROJECT_PATH) return;
  
    const cssPath = path.resolve(process.env.PROJECT_PATH, './tailwind.css');
    const configPath = path.resolve(process.env.PROJECT_PATH, '../tailwind.config.js');

    await plugin.call(mockThis, { skipCreation: true });

    expect(existsSync(cssPath)).toBeFalsy();
    expect(existsSync(configPath)).toBeFalsy();
  });

  test('should use the cssPath in creation when passed', async() => {
    if (!process.env.PROJECT_PATH) return;

    const cssPath = './new-path';
    const newCssPath = path.resolve(process.env.PROJECT_PATH, cssPath, './tailwind.css');

    await plugin.call(mockThis, { cssPath });

    expect(existsSync(newCssPath)).toBeTruthy();
  });

  test('should use different config path and pass it to tailwindcss postcss plugin', async() => {
    if (!process.env.PROJECT_PATH) return;
  
    const configPath = './tailwind.config.ts';
    const newConfigPath = path.resolve(process.env.PROJECT_PATH, '../tailwind.config.ts');
    writeFile(newConfigPath, '');

    await plugin.call(mockThis, { configPath });

    expect(existsSync(newConfigPath)).toBeTruthy();
  });

  test('should update postcss config correctly', async() => {
    mockThis.config.webpack.postcss = {};
    await plugin.call(mockThis);
    expect(mockThis.config.webpack.postcss.plugins?.tailwindcss).toBe('tailwind.config.js');
    expect(mockThis.config.webpack.postcss.preset).toEqual({ stage: 1 });
  });

  test('should extract tailwind config, write it into json file and add alias', async() => {
    const configPath = path.resolve(mockThis.config.cacheDir, './tailwind.config.json');

    await plugin.call(mockThis, { resolveConfig: true });
    expect(mockThis.config.webpack.alias).toEqual({
      '@tailwind.config.json': configPath
    });
    expect(existsSync(configPath)).toBeTruthy();
  });

  test('should only extract the given path, write it into json file and add alias', async() => {
    const configPath = path.resolve(mockThis.config.cacheDir, './tailwind.theme.colors.json');

    await plugin.call(mockThis, { resolveConfig: 'theme.colors' });
    expect(mockThis.config.webpack.alias).toEqual({
      '@tailwind.theme.colors.json': configPath
    });
    expect(existsSync(configPath)).toBeTruthy();
  });

  test('should extract all the given paths, write them into json files and add aliases', async() => {
    const colorsPath = path.resolve(mockThis.config.cacheDir, './tailwind.theme.colors.json');
    const fontSizePath = path.resolve(mockThis.config.cacheDir, './tailwind.theme.fontSize.json');

    await plugin.call(mockThis, { resolveConfig: [ 'theme.colors', 'theme.fontSize' ] });
    expect(mockThis.config.webpack.alias).toEqual({
      '@tailwind.theme.colors.json': colorsPath,
      '@tailwind.theme.fontSize.json': fontSizePath
    });
    expect(existsSync(colorsPath)).toBeTruthy();
    expect(existsSync(fontSizePath)).toBeTruthy();
  });
});
