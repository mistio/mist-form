import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';
// TODO: Think of how to structure json for sub form

export class SubForm extends LitElement {
  static get properties() {
    return {
      data: { type: Object },
    };
  }

  static _getTemplate(name, properties) {
    return FieldTemplates[properties.type]
      ? FieldTemplates[properties.type](name, properties)
      : console.error(`Invalid field type: ${properties.type}`);
  }

  render() {
    if (this.data) {
      // The data here will come validated so no checks required
      const jsonData = this.data.properties;
      const inputs = Object.keys(jsonData).map(key => [key, jsonData[key]]);

      return html`
        <div>${this.data.label}</div>
        ${inputs.map(input => SubForm._getTemplate(input[0], input[1]))}
      `;
    }
    return FieldTemplates.spinner;
  }
}
