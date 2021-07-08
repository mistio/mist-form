## Getting started

To get started after installing mist-form in your project you need a json file describing your form

The example below displays a form with a single text input
```
{
  "type": "object",
  "format": "form",
  "id": "constraints-form",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "label": "Constraints",
  "description": "Constraints form",
  "properties": {
    "textInput": {
      "label": "Basic text input",
      "id": "basic_text_input",
      "type": "string"
    }
  }
}

**TODO** Add

```
Then you call mist-form pointing to the url of your json file
`<mist-form id=${id} .src=${jsonUrl}></mist-form>`

Mist-form uses [polymer paper elements](https://www.webcomponents.org/collection/PolymerElements/paper-input-elements) by default. You can pass any of the element properties in the json definition.