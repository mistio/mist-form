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
    console.log('index ', index);
    console.log('field ', field);
    return html`<mist-form-row
      .field=${field}
      .index=${index}
      .parent=${this}
      .rowProps=${this.props.rowProps}
    ></mist-form-row>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.name = this.props.name;
    this.fieldPath = this.props.fieldPath;
    this.mistForm.dependencyController.addElementReference(this);
  }

  // shouldUpdate(changedProperties) {
  //   let update = true;
  //   changedProperties.forEach((oldValue, propName) => {
  //     if (
  //       propName === 'value' &&
  //       JSON.stringify(oldValue) !== JSON.stringify(this.value) &&
  //       oldValue !== undefined
  //     ) {
  //       update = false;
  //     }
  //   });

  //   return update;
  // }

  getValue() {
    const value = [];
    const rows = this.shadowRoot.querySelectorAll('mist-form-row');
    console.log('rows ', rows);
    rows.forEach(row => {
      value.push(row.value);
    });
    return value;
  }

  updateRowIndexes() {
    const rows = this.shadowRoot.querySelectorAll('mist-form-row');
    console.log('rows after remove ', rows);
    rows.forEach((row, index) => {
      //   row.updateIndexAndFieldPath(index);
      console.log('row ', row);
    });
    //  this.valueChanged();
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

  render() {
    console.log('multirow render ', this.value);
    const styles = {};
    this.style.display = this.props.hidden ? 'none' : 'inherit';
    this.fieldPath = this.props.fieldPath;
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

        ${this.value.map((field, index) => this.createRow(index, field))}

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

customElements.define('mist-form-multi-row', MultiRow);
