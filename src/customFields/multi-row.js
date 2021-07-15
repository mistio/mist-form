import { LitElement, html, css } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map.js';
import './row.js';

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
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 10px;
        color: var(--mist-form-field-element-text-color, black);
        background: var(--mist-form-field-element-background-color, white);
        font-family: var(--mist-form-field-element-font-family, Roboto);
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

      .show-header,
      .label {
        margin-top: auto;
        margin-bottom: 15px;
      }

      .container {
        display: grid;
        grid-row-gap: 5px;
      }

      :host .row-header {
        display: grid;
        grid-auto-columns: 1fr;
        grid-column-gap: 5px;
        grid-auto-flow: column;
      }
    `;
  }

  addRow() {
    this.value.push({});
    this.requestUpdate();
  }

  validate() {
    // Check that all fields have a name
    // const noFieldsEmpty = this.value.every(field => field.name);
    // return noFieldsEmpty;
    return true;
  }

  createRow(index, field) {
    return html`<mist-form-row
      .field=${field}
      .index=${index}
      .parent=${this}
      .rowProps=${this.props.rowProps}
    ></mist-form-row>`;
  }

  connectedCallback() {
    super.connectedCallback();

    this.fieldPath = this.props.fieldPath;
    this.name = this.props.name;

    console.log('callback ');
  }

  shouldUpdate(changedProperties) {
    let update = true;
    changedProperties.forEach((oldValue, propName) => {
      if (
        propName === 'value' &&
        JSON.stringify(oldValue) !== JSON.stringify(this.value) &&
        oldValue !== undefined
      ) {
        update = false;
      }
    });

    return update;
  }

  getValue() {
    const value = [];
    const rows = this.shadowRoot.querySelectorAll('mist-form-row');
    rows.forEach(row => {
      value.push(row.value);
    });
    return value;
  }

  // TODO: Trigger this. Or maybe not. It's triggered in mistForm
  valueChanged() {
    this.value = this.getValue();
    const event = new CustomEvent('value-changed', {
      detail: {
        value: this.value,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    const styles = {};

    // I should decide whether to allow styling with styleMaps or parts. Maybe even both?
    // const rowStyles = { backgroundColor: 'blue', color: 'white' };
    return html` <span class="label">${this.label}</span>
      <div class="container" style="width:100%">
        <div class="row-header">
          ${Object.keys(this.props.rowProps).map(key =>
            !this.props.rowProps[key].hidden
              ? html`<span class="row-item"
                  >${this.props.rowProps[key].label}</span
                >`
              : ''
          )}
          <span></span>
        </div>

        ${this.value.map((index, field) => this.createRow(index, field))}

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
