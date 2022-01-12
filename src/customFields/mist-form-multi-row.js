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
        margin: 10px;
        width: 100%;
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
        grid-template-columns: 2fr 4fr 4fr 30px 4fr 30px;
        gap: 10px;
        font-weight: bold;
      }

      .row-item {
        padding: 0 10px;
      }
    `;
  }

  addRow() {
    this.value = [...this.value, {}];
  }

  createRow(index, value) {
    return html`<mist-form-row
      .value=${value}
      .index=${index}
      .parent=${this}
      .rowProps=${this.props.rowProps}
      style=${styleMap(this.props.styles && this.props.styles.row)}
      part="row"
      class="${this.props.inline ? 'inline' : ''}"
    ></mist-form-row>`;
  }

  getValue(byName) {
    const rows = this.shadowRoot.querySelectorAll('mist-form-row');
    const val = Array.from(rows).map(row => byName ? row.valueByName : row.value);
    return val;
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

  update(changedProperties) {
    this.style.display = this.props.hidden
      ? 'none'
      : this.props.styles?.outer?.display || '';
    this.fieldPath = this.props.fieldPath;
    this.mistForm.dependencyController.updatePropertiesByTarget(this.fieldPath);
    super.update(changedProperties);
  }

  render() {
    // I should decide whether to allow styling with styleMaps or parts. Maybe even both?
    // const rowStyles = { backgroundColor: 'blue', color: 'white' };
    return html`<span class="label">${this.props.label}</span>
      <div
        class="container"
        style=${styleMap(this.props.styles && this.props.styles.container)}
        part="container"
      >
        ${!this.props.hideHeader
          ? html`<div
              class="row-header"
              style=${styleMap(this.props.styles && this.props.styles.header)}
              part="row-header"
            >
              ${this.props.numbered
                ? html`<span
                    class="row-item"
                    style=${styleMap(
                      this.props.styles && this.props.styles.item
                    )}
                    part="header-item"
                    >No.</span
                  >`
                : ''}
              ${Object.keys(this.props.rowProps).map(key =>
                !this.props.rowProps[key].hidden
                  ? html`<span
                      class="row-item"
                      style=${styleMap(
                        this.props.styles && this.props.styles.item
                      )}
                      part="header-item"
                      >${this.props.rowProps[key].label}</span
                    >`
                  : ''
              )}
              <span></span>
            </div>`
          : ''}
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
