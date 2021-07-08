# \<mist-form>

## What is mist-form?

Mist form is a web component that generates forms from a json file following the JSON schema standards.
The form ui elements are made of web components. You can use the basic predefined elements or pass any other ewb components.
## Installation

```bash
npm i @mistio/mist-form
```

## Getting started
You can get started with a json configuration file. Read more information in the get started guide
```html
<mist-form></mist-form>
```

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

## Testing with Cypress

To run the suite of karma tests, run

```bash
npm run test:cypress
```

## Demoing with Storybook

To run a local instance of Storybook for your component, run

```bash
npm run storybook
```

To build a production version of Storybook, run

```bash
npm run storybook:build
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `es-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
