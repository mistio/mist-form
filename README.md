# \<mist-form>

A web component that renders a form based on a JSONSchema & a UISchema specification.

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendations.

## Installation

```bash
npm i @mistio/mist-form
```

## Usage

Import mist-form

```html
<script type="module">
  import '@mistio/mist-form/mist-form.js';
</script>
```

Add mist-form to the DOM, providing a JSON Schema document. You may also provide a UI Schema & the initial form data.
```html
<mist-form .jsonSchema=${jsonSchema} .uiSchema=${uiSchema} .formData=${formData}>

</mist-form>
```

As an alternative, pass a url to the JSON Schema. The file may include the UI Schema & initial form data.
```html
<mist-form .url=${url}>

</mist-form>
```

## Sample

Below is a sample html file that renders a simple form. Note the jsonSchema, uiSchema & formData objects that are passed to the form. We are using `iron-ajax` for the post request, but any other component may be used instead.

```html
<!DOCTYPE html>
<html lang="en-US">
<body>
  <div id="demo"></div>
  <script type="module">
    import { html, render } from 'lit-html';
    import '@polymer/iron-ajax/iron-ajax.js';
    import '../../mist-form.js';

    const jsonSchema = {
        "title": "Three questions",
        "description": "Must answer me these questions three, 'ere the other side he see.",
        "type": "object",
        "required": [
          "name",
          "quest",
          "color",
          "velocity",
          "origin"
        ],
        "properties": {
          "name": {
            "type": "string",
            "title": "What is your name?"
          },
          "quest": {
            "type": "string",
            "title": "What is your quest?"
          },
          "color": {
            "type": "string",
            "title": "What is your favorite color?"
          },
          "velocity": {
              "type": "number",
              "title": "What is the air-speed velocity of an unladen swallow?",
              "minimum": 2,
              "maximum": 20
          },
          "origin": {
              "type": "string",
              "title": "Specify the swallow's origin",
              "enum": ["Africa", "Europe"]
          }
        }
      };
    const uiSchema = {
      "quest": {
        "ui:widget": "textarea"
      },
      "color": {
        "ui:widget": "color"
      },
      "velocity": {
        "ui:controls": true,
        "ui:suffix": "knots",
        "ui:options": {
          "style": "min-width: 350px;"
        }
      },
      "ui:submit": "Enter"
    };
    const formData = {
      "name": "Sir Lancelot of Camelot",
      "quest": "To seek the Holy Grail",
      "color": "blue"
    };
    let submitUrl='/api/v1/three';
    
    render(
      html`<mist-form .jsonSchema=${jsonSchema} .uiSchema=${uiSchema} .formData=${formData}>
        <iron-ajax
          slot="formRequest"
          id="formAjax"
          method="POST"
          handle-as="json"
          .url="${submitUrl}"
          .contentType="application/json"
          .submit=${this}
          @mist-form-request=${function (e) {
            this.body = JSON.stringify(e.detail.payload);
            this.generateRequest();
          }}
          @response=${() => {
            console.log('on response');
          }}
          @request=${() => {
            console.log('on request');
          }}
          @error=${() => {
            console.log('on error');
          }}
        ></iron-ajax>
      </mist-form> `,
      document.querySelector('#demo')
    );
  </script>
</body>
</html>
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

TODO



### Field properties
TODO

## Conditionals

TODO


## Custom widgets

TODO

## Styling

TODO

## Supported json schema version

https://json-schema.org/draft/2019-09/schema