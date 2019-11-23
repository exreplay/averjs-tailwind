# @averjs/tailwind

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

- Type: `Boolean`
- Default: `false`

By setting this param to `true`, the creation of the `tailwind.config.js` and `tailwind.css` files are skipped and you have to set it up by yourself.

### `cssPath`

- Type: `String`
- Default: `./`

Change the path where the `tailwind.css` file should be created.