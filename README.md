# \<mist-form>

A web component to create a form from a json schema using web components
Create a form from a json schema.
*Explain how you can add new fields*
*Explain how to add styling*
*Have a couple examples explaining how to use it*
This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i @mistio/mist-form
```

## Usage

```html
<script type="module">
  import '@mistio/mist-form/mist-form.js';
</script>

<mist-form></mist-form>
```
TODO:
Add some examples in readme, explain how to add new fields, explain how to see demos
## Linting with ESLint, Prettier, and Types

To scan the project for linting errors, run

```bash
npm run lint
```

You can lint with ESLint and Prettier individually as well

```bash
npm run lint:eslint
```

```bash
npm run lint:prettier
```

To automatically fix many linting errors, run

```bash
npm run format
```

You can format using ESLint and Prettier individually as well

```bash
npm run format:eslint
```

```bash
npm run format:prettier
```

## Testing with Karma

To run the suite of karma tests, run

```bash
npm run test
```

To run the tests in watch mode (for <abbr title="test driven development">TDD</abbr>, for example), run

```bash
npm run test:watch
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `es-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
You can also see other form demos:
`demo/createVolume.html` : Demo of the create volume form
