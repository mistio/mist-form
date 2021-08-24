import { LitElement, html, css } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';
import './row.js';

class MultiRow extends elementBoilerplateMixin(LitElement) {
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
      .add {
        color: #424242;
      }

      .show-header {
        margin-top: auto;
        margin-bottom: 15px;
      }

      .container {
        display: grid;
        grid-row-gap: 5px;
      }

      :host .row-header {
        display: grid;
        grid-template-columns: 2fr 4fr 4fr 30px 30px;
        gap: 10px;
        font-weight: bold;
      }
    `;
  }

  addRow() {
    this.value = [...this.value, {}];
  }

  validate() {
    // Check that all fields have a name
    // const noFieldsEmpty = this.value.every(field => field.name);
    // return noFieldsEmpty;
    return true;
  }

  createRow(index, value) {
    return html`<mist-form-row
      .value=${value}
      .index=${index}
      .parent=${this}
      .rowProps=${this.props.rowProps}
      style=${styleMap(this.props.styles && this.props.styles.row)}
      part="row"
    ></mist-form-row>`;
  }

  getValue() {
    const value = [];
    const rows = this.shadowRoot.querySelectorAll('mist-form-row');

    rows.forEach(row => {
      value.push(row.value);
    });

    return value;
  }

  updateRowIndexes(indexToRemove) {
    this.value = [
      ...this.value.slice(0, indexToRemove),
      ...this.value.slice(indexToRemove + 1),
    ];

    const rows = this.shadowRoot.querySelectorAll('mist-form-row');

    rows.forEach((row, index) => {
      row.updateIndexAndFieldPath(index);
    });
    this.requestUpdate();
  }

  // TODO: Trigger this. Or maybe not. It's triggered in mistForm
  valueChanged(e) {
    // Detect value changes of children
    // e Is undefined when removing a row
    if (e) {
      this.props.valueChangedEvent({
        fieldPath: e.fieldPath,
        value: e.value,
      });
    }

    this.value = this.getValue();
  }

  connectedCallback() {
    super.connectedCallback();
    this.value = this.props.value || [];
  }

  render() {
    super.render();
    // I should decide whether to allow styling with styleMaps or parts. Maybe even both?
    // const rowStyles = { backgroundColor: 'blue', color: 'white' };
    return html` <span class="label">${this.props.label}</span>
      <div
        class="container"
        style="width:100%"
        style=${styleMap(this.props.styles && this.props.styles.container)}
        part="container"
      >
        <div
          class="row-header"
          style=${styleMap(this.props.styles && this.props.styles.header)}
          part="row-header"
        >
          ${Object.keys(this.props.rowProps).map(key =>
            !this.props.rowProps[key].hidden
              ? html`<span
                  class="row-item"
                  style=${styleMap(this.props.styles && this.props.styles.item)}
                  part="header-item"
                  >${this.props.rowProps[key].label}</span
                >`
              : ''
          )}
          <span></span>
        </div>
        ${this.value
          ? repeat(
              this.value,
              value => value,
              (value, index) => this.createRow(index, value)
            )
          : ''}

        <div>
          <span class="addrule" part="addrule">
            <paper-button @tap=${this.addRow} class="add">
              <iron-icon icon="icons:add"></iron-icon> Add a new
              ${this.props.newRowLabel || this.props.label}
            </paper-button>
          </span>
        </div>
      </div>`;
  }
}

customElements.define('mist-form-multi-row', MultiRow);
