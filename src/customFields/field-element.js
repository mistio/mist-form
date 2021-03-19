import {LitElement, html, css} from 'lit-element';
import './field-row.js';

class FieldElement extends LitElement {
  static get properties() {
    return {
      greeting: {type: String},
      data: {attribute: false},
      fields: {type: Array},
    };
  }

  constructor() {
    super();
    this.fields = [];
  }

  static get styles() {
    return css`
      :host {
        display: block;
        color: var(--mist-form-field-element-text-color, black);
        background: var(--mist-form-field-element-background-color, white);
        font-family: var(--mist-form-field-element-font-family, Roboto);
      }

      paper-input {
        width: 50%;
        display: inline-block;
        margin-right:20px;
      }
      paper-dropdown-menu {
        width: 20%;
        display: inline-block;
      }
    `;
  }

  addField() {
      console.log("add field")
      this.fields.push({})
      console.log("fields ", this.fields)
      this.requestUpdate();
  }

  updateValue(e) {
      console.log("e ", e)
    const {index, value} = e.detail;
this.fields[index].name = value.name;
this.fields[index].show = value.show;
console.log("this.fields ", this.fields)
  }
  removeRow(e) {
    console.log(e)
    console.log("e.detail.index ", e.detail.index)
    console.log("this.fields ", this.fields);
    const indexToRemove = e.detail.index;
    this.fields = [...this.fields.slice(0, indexToRemove), ...this.fields.slice(indexToRemove + 1)];
    this.requestUpdate();
  }

  validate() {
      // Check that all fields have a name
      const noFieldsEmpty = this.fields.every(field => field.name)
      console.log("noFieldsEmpty ", noFieldsEmpty)
    return true;
  }

  render() {
      console.log("this.fields in render", this.fields)
    return html`
    <table style="width:100%">
    <tr>
      <th>Field name</th>
      <th>Show</th>
      <th></th>
    </tr>
    ${this.fields.map((field, index) => {
        console.log("field ", field)
        return html`<tr><field-row id="row-${index}" .value=${field} .index=${index} @remove-row=${this.removeRow} @value-changed=${this.updateValue} excludeFromPayload></field-row></tr>`;
    })}
    <tr>
    <td><button>            <paper-icon-button
    icon="icons:add"
    alt="Add field"
    title="Add field"
    class="add"
    @tap=${this.addField}
  >
  </paper-icon-button></button></td>
    <td>Add a new field</td>
    <td></td>
    </tr>
  </table>`
  }
}

customElements.define('field-element', FieldElement);
