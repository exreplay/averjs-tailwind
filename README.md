# @averjs/tailwind

<p align="center">
    <a href="https://www.npmjs.com/package/@averjs/tailwind"><img src="https://badgen.net/npm/v/@averjs/tailwind?icon=npm" alt="Version"></a>
    <img src="https://img.shields.io/npm/dm/@averjs/tailwind.svg" alt="Downloads"></a>
    <a href="https://circleci.com/gh/exreplay/averjs-tailwind"><img src="https://circleci.com/gh/exreplay/averjs-tailwind.svg?style=shield" alt="CircleCi"></a>
    <a href="https://codecov.io/gh/exreplay/averjs-tailwind"><img src="https://codecov.io/gh/exreplay/averjs-tailwind/branch/development/graph/badge.svg" alt="Codecov"></a>
</p>

This Plugin gets you started with tailwind. It adds `tailwind` as `postcss` plugin, changes the `process-env` stage to `1` and adds the right configuration for `PurgeCSS`.

## Installation

You just have to install the package and add it to the aver.config.js file to the plugins array.

```bash
yarn add @averjs/tailwind
```

```js
// aver.config.js
{
  plugins: [
    '@averjs/tailwind'
  ]
}
```

## Usage

By just running the `aver` command, the plugin checks if there are the following files (paths are relative to project root folder):

- `./tailwind.config.js`
- `./src/tailwind.css`

If they are not present, they are getting generated. The last thing you have to do is, to import the `css` file anywhere in your project.

## Configuration

### `skipCreation`

- Type: `boolean`
- Default: `false`

By setting this param to `true`, the creation of the `tailwind.config.js` and `tailwind.css` files are skipped and you have to set it up by yourself.

### `cssPath`

- Type: `string`
- Default: `./`

Change the path where the `tailwind.css` file should be created.

### `configPath`

- Type: `string`
- Default: `tailwind.config.js`

Change the default path to the tailwind config file.

### `resolveConfig`

- Type: `boolean | string | string[]`
- Default: `false`

Sometimes you need your tailwind config in javascript. Doing it yourself you cannot install tailwind in devDependencies, tailwind.config.js and the tailwind plugin is bundled into production. This adds unecessary KBs into your production files. This parameter helps you with this by creating a json file inside the aver cache folder and adds an alias to the webpack config for you to require it.

By just passing `true`, the whole config is resolved and saved inside a `tailwind.config.json` file. This json file can be referenced by require `@tailwind.config.json`.

You can also pass a string or an array of strings. This lets you resolve a specific path inside your tailwind config. This is helpfull when you just need eg. the colors from the config. This also saves KBs because the whole resolved config could take up quite some space. Interally we resolve those paths by using the lodash [get](https://lodash.com/docs/4.17.15#get) function.

```js
{
  plugins: [
    [ '@averjs/tailwind', { resolveConfig: 'theme.colors' } ]
  ]
}
```
This generates a `tailwind.theme.colors.json` file with the alias `@tailwind.theme.colors.json`, just holding the configured colors.

```js
{
  plugins: [
    [ '@averjs/tailwind', { resolveConfig: [ 'theme.colors', 'theme.fontSize' ] } ]
  ]
}
```
This generates `tailwind.theme.colors.json` and `tailwind.theme.fontSize.json` files with the aliases `@tailwind.theme.colors.json` and `@tailwind.theme.fontSize.json`. Each file holds the given configuration.