import { LitElement, html, css } from 'lit-element';
import * as util from './../utilities.js';
import {styleMap} from 'lit-html/directives/style-map.js';

class MultiRow extends LitElement {
  static get properties() {
    return {
      inputs: { type: Array }
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
        padding: 10px;
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
      :host .label {
        margin-top: auto;
        margin-bottom: 15px;
        color: #424242;
        font-weight: bold;
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

      .show-header,
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

      .container {
        display: grid;
        grid-row-gap: 5px;
      }
      :host .row, :host .row-header {
        display: grid;
        grid-auto-columns: 1fr;
        grid-column-gap: 5px;
        grid-auto-flow: column;
      }
    `;
  }

  addRow() {
    this.value = [...this.getValue(), {}];
    this.requestUpdate();
    this.valueChanged();
  }

  removeRow(indexToRemove) {
    this.value = this.getValue();
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
      const value = [];
        const rows = this.shadowRoot.querySelectorAll('.row');

        for (const row of rows) {
          const rowValue = this.mistForm.getValuesfromDOM(row);
          value.push(rowValue);
        }
    return value;
  }
//TODO: Trigger this. Or maybe not. It's triggered in mistForm
  valueChanged() {
    const event = new CustomEvent('value-changed', {
      detail: {
        value: this.getValue(),
      },
    });

    this.dispatchEvent(event);
  }

  render() {
    const styles = {
      row: {
        backgroundColor: 'blue'
      }
    }
    // I should decide whether to allow styling with styleMaps or parts. Maybe even both?
   // const rowStyles = { backgroundColor: 'blue', color: 'white' };
    return html` <span class="label">${this.label}</span>
      <div class="container" style="width:100%">
        <div class="row-header">
          ${Object.keys(this.rowProps).map(
            key =>
              html`<span class="row-item">${this.rowProps[key].label}</span>`
          )}
          <span></span>
        </div>

        ${this.value.map((field, index) => {
          const row = Object.keys(this.rowProps).map(key => {
            const prop = {...this.rowProps[key]};
            const valueProperty = util.getValueProperty(prop);
            prop[valueProperty] = field[prop.name];
            return html`${this.mistForm.getTemplate(prop)}`;
          });
          return html`<div class="row" part="row" style=${styleMap(styles['row'])}>
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
