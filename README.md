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

## Imports

Mist form is based on paper elements https://www.webcomponents.org/collection/PolymerElements/paper-elements. You need to import the components you need depending on which fields you'll be using.
Usual imports are:

```js
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-spinner/paper-spinner.js';
```

This is for the form's buttons to show, the json toggle button, and the spinner when form components are loading.

For `dropdowns` imports are:

```js
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-selector/iron-selector.js';
```

For `inputs` or `text`:

```js
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
```

For `sliders`:

```js
import '@polymer/paper-input/paper-slider.js';
```

For `checkboxes`:

```js
import '@polymer/paper-input/paper-checkbox.js';
```

And for `radio buttons`:

```js
import '@polymer/paper-radio-group/paper-radio-group.js';
```

If the form is not working or responding as intended most likely an import is missing.

## Sample

Below is a sample html script code that creates a form with a dropdown, an input and a slider and its corresponding json schema. We are using `iron-ajax` for the post request, but any other component may
be used like axios, or just a pure fetch.

```html
<div id="demo"></div>
  <!-- Web-animations is a dependency for the paper-dropdown-menu/paper-listbox components -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/web-animations/2.3.2/web-animations-next-lite.min.js"></script>
  <script type="module">
    import { html, render } from 'lit-html';
    import '@polymer/paper-styles/demo-pages.js';
    import '@polymer/paper-button/paper-button.js';
    import '@polymer/paper-spinner/paper-spinner.js';
    import '@polymer/iron-ajax/iron-ajax.js';

    import '@polymer/paper-input/paper-input.js';
    import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
    import '@polymer/paper-item/paper-item.js';
    import '@polymer/paper-listbox/paper-listbox.js';
    import '@polymer/paper-toggle-button/paper-toggle-button.js';
    import '@polymer/paper-slider/paper-slider.js'
    import '../../mist-form.js';

    const jsonUrl = 'constraints_sample.json';
    const id = 'test-mist-form';
    const submitUrl = 'api/v1/tickets';
    const initialValues = {field:{"Tickets": 1}};
    render(
      html`<mist-form id=${id} .src=${jsonUrl} .initialValues=${initialValues}>
        <iron-ajax
          slot="formRequest"
          id="formAjax"
          .url="${submitUrl}"
          .contentType="application/json"
          .submit=${this}
          @mist-form-request=${function (e) {
            this.params = JSON.stringify(e.detail.params);
            console.log("JSON.parse ", JSON.parse(this.params));
            console.log("this params ", this.params)
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
```

In the JSON schema we may define multiple subforms, in this case only one is defined inside the properties
Object, namely `sampleConstraintsContainer`.
We need initial settings like `type`, `format`, `id`, `$schema` which is mostly won't change.
Inside the `properties` object we define the subforms, in this case one the `sampleConstraintsContainer`,
the `label` will show on the form, with the `hasToggle` boolean we can choose whether the subform may
show or not. In the `properties` we pass the path to the subform definition which resides in `definitions`.
Inside `definitions` we define our subform with the desired fields. The `format` property defines which
field type should be used and the `type` the type of the value held within, this may be `string` or `boolean`.

```json
{
"type":"object",
"format": "form",
"id":"constraints-form",
"$schema":"http://json-schema.org/draft-07/schema#",
"label":"Constraints",
"description":"Constraints form",
"submitButtonLabel":"Add",
"canClose":true,
"additionalProperties":false,
"properties":{
  "sampleConstraintContainer":{
    "name":"sample",
    "label":"sample constraints",
    "id":"sample_constraints_container",
    "type":"object",
    "format":"subformContainer",
    "hasToggle":true,
    "properties":{
      "subform":{
      "$ref":"#/definitions/sampleConstraints"
      }
    }
    }
},
"definitions":{
  "sampleConstraints":{
    "id":"sample_constraints",
    "type":"object",
    "format":"subform",
    "properties":{
      "city":{
        "name": "City",
        "label":"City",
        "id":"city",
        "type":"string",
                  "format":"dropdown",
                  "value": "Athens",
                  "helpText":"Choose a city",
                  "enum": [{"id": "Athens", "title":"Athens"},
                          {"id": "LA", "title":"LA"},
                          {"id": "London", "title":"London"},
                          {"id": "Barcelona", "title":"Barcelona"}]
        },
      "name":{
        "label":"Name",
        "id":"name",
        "type": "string",
        "name": "Name"
        },
        "tickets":{
          "label":"Tickets",
          "id":"tickets",
          "type": "string",
          "format":"number",
          "name": "Tickets",
          "minimum": 1,
          "value": "1"
        }
      }
    }
  }
}
```

## Usage

```html
<script type="module">
  import '@mistio/mist-form/mist-form.js';
</script>

<mist-form id=${id} .src=${jsonUrl} .dynamicDataNamespace=${constraintsData}>
          <div id="mist-form-custom">
            <paper-slider mist-form-type="paperSlider" editable></paper-slider>
            <paper-swatch-picker mist-form-type="colorSwatch" mist-form-value-prop="color" mist-form-value-change="color-picker-selected"></paper-swatch-picker>
          </div>
</mist-form>
```

`src`: The url of the json file you want to load
`dynamicDataNamespace`: Functions and data you want to pass

See demos for examples of how to pass data.

Put custom elements in a div with id `"mist-form-custom"`

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

### Field properties

`label`: Label name to add to field

`id`: The html id that the field element will get

`type`: Can take values `string`, `boolean` and if the `format` property is ommited the resulting
element will be an input or a checkbox respectively. For subforms or `"format": "multiRow"` fields
the proper type is `object`.

`format`: This property will determine which element the form will use.

- `dropdown` will result in a dropdown menu
- `number` will result in an input that accepts only integers
- `checkboxGroup` will result in a group of check boxes
- `input`: this can be ommited if `type` is `string`
- `checkbox`: this can be ommited if `type` is `boolean`
- `durationField`: this will result in a composite element made of one number input and a
dropdown with time values (years, months, days, hours, minutes seconds).
- `multiRow`: this is a type of subform that allows the user to add more instances
- `subform`: this is a new mist-form, it is used to group elements locigally, it helps with
the look of the form and with the organization of the json payload of the main form.
- `subformContainer`: this helps to separate subforms and allow for show/hide behavior along with
`hasToggle` property set to true
- custom: Custom is not a valid `format`, if you have custom elements add the tag `mist-form-type`,
and set the same value to the `format` property. Mist-form will use your custom element for this field.

`helpText`: Text to be shown bellow the element, usually with indications on expected values or on
value restrictions.

`autoValidate`: Set to true if you wish for on the fly validation as the user inputs data.

`enum`: Array with strings that will show in the element, this is for dropdowns or checkbox groups.

`value`: Default value for the element

`hideLabel`: Hides the label of the element.

`excludeFromPayload`: Field isn't included in json payload

`styles`: Styles can be passed as properties

### Input properties

`minimum`: For inputs that allow only numbers (the field has `"format": "number"` in the json)
a minimum value can be set, any value less than the minimum will result in validation error.

`maximum`: Same as minimum but this introduces a cap on the accepted value by the input.

`suffix`:  A string to be appended to any value the user introduces.

### Multi row properties

`inline`: Display fields inline instead of in a row

### Dropdown properties

`searchable`: Adds a search bar to a dropdown

### Checkbox properties

`hideLabel`: Hides checkbox label

`saveAsArray`
`transformInitialValues`: Pass a function that formats values before entering them in forms. Useful if you're loading saved data that was formatted on save.

## Dependencies

Dependencies can be added between fields

```js
  "deps": [
    {
    "prop": "hidden", // The property affected
    "func": "hidePaperSlider", // The function or promise you want to run
    "dependsOn": ".hidePaperSlider" // The field that triggers the dependency. The path can start with a dot and be relative, or absolute
    }
  ]
```

You can add multiple dependencies for a field.

## Paths

Each field has a path following the subform structure. You can see this by inspecting a field and looking at the `fieldPath` property.

## Custom web components

You can pass custom web components. Properties you can pass

`mist-form-type`:  Necessary to define component name from json
`mist-form-value-change`: The name of the value change event. Default is value-change
`mist-form-validate`: The name of the validate function. Default is validate
`mist-form-value-prop`: The name of the property that returns the value. Default is value
`mist-form-value-path`: If the value is returned from an event, this is the path of the value in the returned object.

## Styling

Allowed style properties can be found by checking styleMaps in each compoent in each field

Example:

```js
  "styles": {
    "containerOpen": {
      "background-color": "#ebebeb"
    }
  }
```

## Supported json schema version

https://json-schema.org/draft/2019-09/schema