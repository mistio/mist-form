# \<mist-form>

A web component to create a form from a json schema using web components.
Properties can be grouped and reused in subforms. Properties and subforms can be split in multiple files.
Create a form from a json schema.
*Explain how you can add new fields*

*Add supported json schema version to readme*
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
Look at the demos for examples on how to use `<mist-form>`

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

To run the suite of Cypress tests, run

```bash
npm run test:cypress
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

## Properties

### Form properties
`canClose`:
`showJson`: Shows toggle that switches between form view and json view

### Subform properties
`hasToggle`: Shows toggle that can be used to open and close subform
`isOpen`: Initial state of subform
`omitNameFromPayload`: Omit subform's name from payload. Useful when using a subform strictly for layout/grouping purposes.

## Field properties
`excludeFromPayload`: Field isn't included in json payload
`styles`: Styles can be passed as properties


## Multi row properties
`inline`: Display fields inline instead of in a row

## Dropdown properties
`searchable`: Adds a search bar to a dropdown

## Checkbox
`hideLabel`: Hides checkbox label

`saveAsArray`
`transformInitialValues`: Pass a function that formats values before entering them in forms. Useful if you're loading saved data that was formatted on save.

## Dependencies


## Styling

Allowed style properties can be found by checking styleMaps in each compoent in each field

Example:
```
  "styles": {
    "containerOpen": {
      "background-color": "#ebebeb"
    }
  }
```

## Supported json schema version
https://json-schema.org/draft/2019-09/schema