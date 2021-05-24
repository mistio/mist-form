import { LitElement, html, css } from 'lit-element';

class SizeElement extends LitElement {
  static get properties() {
    return {
      value: { type: Array },
      clouds: { type: Array },
      sizes: { type: Array },
    };
  }

  constructor() {
    super();
    this.value = [];
    this.sizes = [];
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
    `;
  }

  addSize() {
    this.value.push({});
    this.sizes.push({});
    this.requestUpdate();
    this.valueChanged();
  }

  updateCloudValue(cloudId, index) {
    this.value[index].cloud = cloudId;
    this.value[index].size = '';
    this.value[index].userFriendlyName = '';
    const size = this.clouds.find(cloud => cloud.id === cloudId);
    this.sizes[index] = size ? JSON.parse(JSON.stringify(size)) : null;
    this.requestUpdate();
    this.valueChanged();
  }

  updateUserFriendlyNameValue(name, index) {
    this.value[index].userFriendlyName = name;
    this.valueChanged();
  }

  updateSizeValue(size, index) {
    this.value[index].size = size;
    this.valueChanged();
  }

  getSizeFields(index) {
    const { size } = this.value[index];
    const cloudSize = this.sizes[index];
    if (!cloudSize) {
      return false;
    }

    if (size) {
      if (cloudSize.size.value === 'custom') {
        cloudSize.size.customValue = size;
        cloudSize.size.customSizeFields.forEach(field => {
          if (size[field.name] !== undefined) {
            field.value = size[field.name];
          }
        });
      } else {
        cloudSize.size.value = size;
      }
    }

    return cloudSize.size;
  }

  isCustomSize(index) {
    const size = this.getSizeFields(index);
    if (size) {
      return Object.prototype.hasOwnProperty.call(size, 'customSizeFields');
    }
    return false;
  }

  removeRow(indexToRemove) {
    this.value = [
      ...this.value.slice(0, indexToRemove),
      ...this.value.slice(indexToRemove + 1),
    ];
    this.sizes = [
      ...this.sizes.slice(0, indexToRemove),
      ...this.sizes.slice(indexToRemove + 1),
    ];
    this.requestUpdate();
    this.valueChanged();
  }

  validate() {
    if (this.value.length === 0) {
      return true;
    }
    return this.value.every(
      item =>
        Object.prototype.hasOwnProperty.call(item, 'cloud') &&
        Object.prototype.hasOwnProperty.call(item, 'size')
    );
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
    if (this.clouds.length > 0) {
      this.sizes = this.value
        .map(
          value => {
            const cloud = this.clouds.find(c => c.id === value.cloud);
            return cloud ? JSON.parse(JSON.stringify(cloud)) : null;
          }
          // This filters out the empty sizes if any exist
        )
        .filter(size => size);
    }
  }

  render() {
    if (this.clouds.length > 0) {
      return html` <span class="label">${this.label}</span>
        <div style="width:100%">
          ${this.value.map((size, index) => {
            return html`
              <div style="width: 97%">
                <div class="sizeRow">
                  <paper-dropdown-menu
                    label="Cloud"
                    class="mist-form-input"
                    no-animations=""
                    attr-for-selected="value"
                  >
                    <paper-listbox
                      attr-for-selected="value"
                      selected="${size.cloud}"
                      class="dropdown-content"
                      slot="dropdown-content"
                      @selected-changed=${e => {
                        this.updateCloudValue(e.detail.value, index);
                      }}
                    >
                      ${this.clouds.map(
                        cloud => html`
                          <paper-item value="${cloud.id}"
                            >${cloud.title}</paper-item
                          >
                        `
                      )}
                    </paper-listbox>
                  </paper-dropdown-menu>
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
                  <div class="sizeField">
                    ${this.getSizeFields(index)
                      ? html`
                          <mist-size-field
                            id="${index}"
                            .field="${this.getSizeFields(index)}"
                            @value-changed=${e => {
                              this.updateSizeValue(e.detail.value, index);
                            }}
                          ></mist-size-field>
                        `
                      : ''}
                  </div>
                  ${this.isCustomSize(index)
                    ? html`<paper-input
                        label="Human friendly size name"
                        .value=${size.userFriendlyName}
                        @value-changed=${e => {
                          this.updateUserFriendlyNameValue(
                            e.detail.value,
                            index
                          );
                        }}
                      >
                      </paper-input>`
                    : ''}
                </div>
              </div>
            `;
          })}
          <div>
            <span class="addrule">
              <paper-button @tap=${this.addSize} class="add">
                <iron-icon icon="icons:add"></iron-icon> Add a new size
              </paper-button>
            </span>
          </div>
        </div>`;
    } else {
      return html` <span class="label">${this.label}</span>
        <p class="no-clouds">
          Please add some clouds in order to add cloud sizes
        </p>`;
    }
  }
}

customElements.define('size-element', SizeElement);
