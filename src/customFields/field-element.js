import { LitElement, html, css } from 'lit-element';

class FieldElement extends LitElement {
  static get properties() {
    return {
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
        padding: 10px;
        color: var(--mist-form-field-element-text-color, black);
        background: var(--mist-form-field-element-background-color, white);
        font-family: var(--mist-form-field-element-font-family, Roboto);
      }

      paper-input {
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
    `;
  }

  addField() {
    this.value.push({});
    this.requestUpdate();
    this.valueChanged();
  }

  updateNameValue(name, index) {
    this.value[index].name = name;
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
    const noFieldsEmpty = this.value.every(field => field.name);
    return noFieldsEmpty;
  }

  valueChanged() {
    const event = new CustomEvent('value-changed', {
      detail: {
        value: this.value,
      },
    });

    this.dispatchEvent(event);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html` <table style="width:100%">
      <tr>
        <th>Field name</th>
        <th class="show-header">Show</th>
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
            <td class="checkbox-cell">
              <paper-checkbox
                .checked=${field.show}
                @checked-changed=${e => {
                  this.updateShowValue(e.detail.value, index);
                }}
              ></paper-checkbox>
            </td>
            <td>
              <paper-icon-button
                icon="icons:delete"
                alt="Remove field"
                title="Remove field"
                class="remove"
                @tap=${() => {
                  this.removeRow(index);
                }}
              >
              </paper-icon-button>
            </td>
          </tr>
        `;
      })}
      <tr>
        <td>
        <span class="addrule">
        <paper-button @tap=${this.addField} class="add">
          <iron-icon icon="icons:add"></iron-icon> Add a new field
        </paper-button>
      </span>

        </td>
        <td></td>
        <td></td>
      </tr>
    </table>`;
  }
}

customElements.define('field-element', FieldElement);
