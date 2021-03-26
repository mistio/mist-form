import { LitElement, html, css } from 'lit-element';
import './field-row.js';

class FieldElement extends LitElement {
  static get properties() {
    return {
      greeting: { type: String },
      data: { attribute: false },
      value: { type: Array },
    };
  }

  constructor() {
    super();
    this.value = [];
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
        margin-right: 20px;
      }
      paper-dropdown-menu {
        width: 20%;
        display: inline-block;
      }
    `;
  }

  addField() {
    console.log('add field');
    this.value.push({});
    console.log('fields ', this.value);
    this.requestUpdate();
  }
  updateNameValue(name, index) {
    this.value[index].name = name;
  }
  updateShowValue(show, index) {
    this.value[index].show = show;
  }

  removeRow(indexToRemove) {
    this.value = [
      ...this.value.slice(0, indexToRemove),
      ...this.value.slice(indexToRemove + 1),
    ];
    this.requestUpdate();
  }

  validate() {
    // Check that all fields have a name
    const noFieldsEmpty = this.value.every(field => field.name);
    console.log('noFieldsEmpty ', noFieldsEmpty);
    return true;
  }

  render() {
    return html` <table style="width:100%">
      <tr>
        <th>Field name</th>
        <th>Show</th>
        <th></th>
      </tr>
      ${this.value.map((field, index) => {
        return html`
          <tr>
            <td>
              <paper-input
                .value=${field.name}
                @value-changed=${e => {
                  this.updateNameValue(e.detail.value, index);
                }}
              ></paper-input>
            </td>
            <td>
              <paper-checkbox
                .checked=${field.show}
                @checked-changed=${e => {
                  this.updateShowValue(e.detail.value, index);
                }}
              ></paper-checkbox>
            </td>
            <td>
              <paper-icon-button
                icon="icons:close"
                alt="open docs"
                title="open docs"
                class="docs"
                @tap=${() => {
                  this.removeRow(index);
                }}
              >
              </paper-icon-button>
            </td>
          </tr>
        `;
        //return html`<tr><field-row id="row-${index}" .value=${field} .index=${index} @remove-row=${this.removeRow} @value-changed=${this.updateValue} excludeFromPayload></field-row></tr>`;
      })}
      <tr>
        <td>
          <paper-icon-button
            icon="icons:add"
            alt="Add field"
            title="Add field"
            class="add"
            @tap=${this.addField}
          >
          </paper-icon-button>
        </td>
        <td>Add a new field</td>
        <td></td>
      </tr>
    </table>`;
  }
}

customElements.define('field-element', FieldElement);
