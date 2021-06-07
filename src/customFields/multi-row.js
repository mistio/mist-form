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
    this.addEventListener('value-changed', (e)=>{console.log("e ", e)});
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 10px;
        color: var(--mist-form-multi-row-text-color, black);
        background: var(--mist-form-multi-row-background-color, white);
        font-family: var(--mist-form-multi-row-font-family, Roboto);
      }

      paper-input,
      paper-dropdown-menu {
        width: 90%;
        display: inline-block;
        margin-right: 20px;
        margin-top: -20px;
      }

      .row-header, .row {
        display: flex;
        justify-content: space-around;
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
    `;
  }

  addRow() {
    this.value.push(this.emptyRowValue);
    this.requestUpdate();
    this.valueChanged();
  }

  updateNameValue(name, index) {
    this.value[index].name = name;
    this.valueChanged();
  }
  updateCloudValue(cloudId, index) {
    this.value[index].cloud = cloudId;
    this.requestUpdate();
    this.valueChanged();
  }

  updateValueValue(value, index) {
    this.value[index].value = value;
    this.valueChanged();
  }

  updateShowValue(show, index) {
    this.value[index].show = show;
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

  valueChanged() {
    console.log("this.value ", this.value)
    if (!this.value.hasOwnProperty('show') || this.value.show === undefined) {
      this.value.show = false;
    }
    const event = new CustomEvent('value-changed', {
      detail: {
        value: this.value,
      },
    });

    this.dispatchEvent(event);
  }

  connectedCallback() {
    super.connectedCallback();
    this.emptyRowValue = Object.keys(this.rowProps).map(key => this.rowProps[key].name);
  }

  render() {
      return html` <span class="label">${this.label}</span>
        <div style="width:100%">
        <div class="row-header">${Object.keys(this.rowProps).map(key => html`<span class="row-item">${this.rowProps[key].label}</span>`)}</div>

          ${this.value.map((field,index) => {
            const row = Object.keys(this.rowProps).map(key => {
              const prop = this.rowProps[key];
              const valueProperty = util.getValueProperty(prop);
              prop[valueProperty] = field[prop.name];
              return html`${this.mistForm.getTemplate(prop)}`
            })
            return html`<div class="row">${row}
            <paper-icon-button
            icon="icons:delete"
            alt="Remove row"
            title="Remove row"
            class="remove"
            @tap=${() => {
              this.removeRow(index);
            }}
          >
          </paper-icon-button></div>`
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
