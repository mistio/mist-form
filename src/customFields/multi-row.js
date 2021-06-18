import { LitElement, html, css } from 'lit-element';
import * as util from './../utilities.js';

class MultiRow extends LitElement {
  static get properties() {
    return {
      value: { type: Array },
      inputs: { type: Array },
    };
  }

  constructor() {
    super();
    this.value = [];
    this.addEventListener('value-changed', e => {
    });
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 10px;
        color: var(--mist-form-size-element-text-color, black);
        background: var(--mist-form-size-element-background-color, white);
        font-family: var(--mist-form-size-element-font-family, Roboto);
      }

      paper-input {
        width: 80%;
        display: inline-block;
        margin-right: 20px;
        margin-top: -20px;
      }
      paper-dropdown-menu {
        width: 100%;
        display: inline-block;
      }

      th {
        text-align: left;
      }
      .sizeRow {
        width: 100%;
        background-color: #ebebeb;
        margin-bottom: 10px;
        padding: 0 0 15px 15px;
      }

      .sizeRow > paper-dropdown-menu,
      .sizeRow > .sizeField {
        width: 89%;
      }
      .label {
        margin-top: auto;
        margin-bottom: 15px;
        color: #424242;
        font-weight: bold;
      }
      table {
        border-collapse: collapse;
      }
      tr {
        border: solid;
        border-width: 1px 0;
      }
      paper-icon-button {
        color: #adadad;
      }
      .add {
        color: #424242;
      }
      .no-clouds {
        font-size: 14px;
        color: #4b4b4b;
      }
      :host {
        display: block;
        padding: 10px;
        color: var(--mist-form-field-element-text-color, black);
        background: var(--mist-form-field-element-background-color, white);
        font-family: var(--mist-form-field-element-font-family, Roboto);
      }

      paper-input,
      paper-dropdown-menu {
        width: 90%;
        display: inline-block;
        margin-right: 20px;
        margin-top: -20px;
      }

      th {
        text-align: left;
      }
      .show-header,
      .checkbox-cell {
        text-align: center;
      }
      .label {
        margin-top: auto;
        margin-bottom: 15px;
      }
      paper-icon-button {
        color: #adadad;
      }
      .add {
        color: #424242;
      }
      paper-checkbox {
        --paper-checkbox-checked-color: #2196f3;
        --paper-checkbox-checked-ink-color: #2196f3;
        --paper-checkbox-unchecked-color: #424242;
      }

      .row-header {
        display: flex;
        justify-content: space-between;
      }
    `;
  }

  addRow() {
    this.value.push({});
    this.requestUpdate();
    this.valueChanged();
  }

  removeRow(indexToRemove) {
    this.value = [
      ...this.value.slice(0, indexToRemove),
      ...this.value.slice(indexToRemove + 1),
    ];
    this.requestUpdate();
    this.valueChanged();
  }

  validate() {
    // Check that all fields have a name
    // const noFieldsEmpty = this.value.every(field => field.name);
    // return noFieldsEmpty;
    return true;
  }

  getValue() {
    if (this.initialValue) {
      this.value = [...this.initialValue];
      this.initialValue = null;
    } else {
      const rows = this.shadowRoot.querySelectorAll('.row');
      console.log("this.value ", this.value)
      const value = [];
      for (const row of rows) {
        const rowValue = this.mistForm.getValuesfromDOM(row);
        value.push(rowValue);
      }
      this.value = value;
    }

    return this.value;
  }
//TODO: Trigger this. Or maybe not. It's triggered in mistForm
  valueChanged() {
    const event = new CustomEvent('value-changed', {
      detail: {
        value: this.value,
      },
    });

    this.dispatchEvent(event);
  }
// TODO: Add initial values
  connectedCallback() {
    super.connectedCallback();
    // this.emptyRowValue = Object.keys(this.rowProps).map(
    //   key => this.rowProps[key].name
    // );

  }

  render() {
    // TODO: Add validations and values
    return html` <span class="label">${this.label}</span>
      <div style="width:100%">
        <div class="row-header">
          ${Object.keys(this.rowProps).map(
            key =>
              html`<span class="row-item">${this.rowProps[key].label}</span>`
          )}
        </div>

        ${this.value.map((field, index) => {
          const row = Object.keys(this.rowProps).map(key => {
            const prop = this.rowProps[key];
            const valueProperty = util.getValueProperty(prop);
            prop[valueProperty] = field[prop.name];
            return html`${this.mistForm.getTemplate(prop)}`;
          });
          return html`<div class="row">
            ${row}
            <paper-icon-button
              icon="icons:delete"
              alt="Remove row"
              title="Remove row"
              class="remove"
              @tap=${() => {
                this.removeRow(index);
              }}
            >
            </paper-icon-button>
          </div>`;
        })}

        <div>
          <span class="addrule">
            <paper-button @tap=${this.addRow} class="add">
              <iron-icon icon="icons:add"></iron-icon> Add a new ${this.label}
            </paper-button>
          </span>
        </div>
      </div>`;
  }
}

customElements.define('multi-row', MultiRow);
