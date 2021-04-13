import { LitElement, html, css } from 'lit-element';

// TODO: Set required property that gives error if element has empty value
class DurationField extends LitElement {
  static get properties() {
    return {
      value: { type: String },
      name: { type: String },
      label: { type: String },
      units: { type: Array },
      max: { type: Number },
      min: { type: Number },
      textValue: { type: Number },
      unitValue: { type: String },
    };
  }

  constructor() {
    super();
    this.min = 1;
    this.units = this.enum || [
      { name: '', value: '' },
      { name: 'months', value: 'mo' },
      { name: 'weeks', value: 'w' },
      { name: 'days', value: 'd' },
      { name: 'hours', value: 'h' },
      { name: 'minutes', value: 'm' },
    ];
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        color: var(--mist-form-duration-text-color, rgba(0, 0, 0, 0.54));
        background: var(--mist-form-duration-background-color, white);
        font-family: var(--mist-form-duration-font-family, Roboto);
        margin: 0 10px;
        padding-left: 22px;
        padding-bottom: 10px;
      }
      .subform-container > :host {
        padding-left: 0;
      }
      paper-input {
        width: 55%;
        display: inline-block;
        margin-right: 20px;
        margin-left: auto;
      }
      paper-dropdown-menu {
        width: 20%;
        display: inline-block;
        margin-right: 20px;
      }
      .label {
        margin-top: auto;
        margin-bottom: 5px;
      }
    `;
  }
  updateTextValue(e) {
    if (!e.detail.value) {
      this.shadowRoot.querySelector('paper-listbox').selectIndex(0);
    }

    this.textValue = e.detail.value;
    this.updateValue();
  }
  updateUnitValue(e) {
    this.unitValue = this.units[e.detail.value].value;
    this.updateValue();
  }
  updateValue() {
    // if values valid, set value to new value, or else set to undefined
    this.value =
      this.textValue && this.unitValue
        ? `${this.textValue}${this.unitValue}`
        : undefined;
    let event = new CustomEvent('value-changed', {
      detail: {
        value: this.value,
      },
    });

    this.dispatchEvent(event);
  }

  validate() {
    if (!this.textValue) {
      return true;
    } else {
      return (
        (parseInt(this.textValue, 10) &&
          !!(this.textValue && this.unitValue)) ||
        !!(!this.textValue && !this.unitValue)
      );
    }
  }

  render() {
    // TODO: Style this like the other element labels
    return html` <span class="label">${this.label}</span>
      <paper-input
        step="1"
        min=${this.min}
        max=${this.max}
        type="number"
        autovalidate="true"
        excludeFromPayload
        @value-changed=${this.updateTextValue}
      ></paper-input>
      <paper-dropdown-menu excludeFromPayload>
        <paper-listbox
          @selected-changed=${this.updateUnitValue}
          class="dropdown-content"
          slot="dropdown-content"
        >
          ${this.units.map(unit => html`<paper-item>${unit.name}</paper-item>`)}
        </paper-listbox>
      </paper-dropdown-menu>`;
  }
}

customElements.define('mist-form-duration-field', DurationField);
