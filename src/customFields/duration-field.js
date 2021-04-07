import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
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
        display: block;
        color: var(--mist-form-duration-text-color, black);
        background: var(--mist-form-duration-background-color, white);
        font-family: var(--mist-form-duration-font-family, Roboto);
      }

      paper-input {
        width: 50%;
        display: inline-block;
        margin-right: 20px;
      }
      paper-dropdown-menu {
        width: 20%;
        display: inline-block;
      }
    `;
  }
  updateTextValue(e) {
    if (!e.detail.value) {
      //TODO: Check if this is working
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
    return html` <span>${this.label}</span>
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

customElements.define('duration-field', DurationField);
