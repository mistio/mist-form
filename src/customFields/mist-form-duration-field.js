import { LitElement, html, css } from 'lit-element';
// TODO: Set required property that gives error if element has empty value
class DurationField extends LitElement {
  static get properties() {
    return {
      value: { type: String },
      props: { type: Object },
      fieldPath: { type: String, reflect: true },
    };
  }

  constructor() {
    super();
    this.units = this.enum || [
      { name: '', value: '' },
      { name: 'months', value: 'mo' },
      { name: 'days', value: 'd' },
      { name: 'hours', value: 'h' },
      { name: 'minutes', value: 'm' },
      { name: 'seconds', value: 's' },
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
        width: 30%;
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
    this.textValue = e.detail.value;
    this.valueChanged();
  }

  updateUnitValue(e) {
    this.unitValue = e.detail.value;
    this.valueChanged();
  }

  valueChanged() {
    this.value =
      this.textValue && this.unitValue
        ? `${this.textValue}${this.unitValue}`
        : undefined;
    this.props.valueChangedEvent({
      fieldPath: this.fieldPath,
      value: this.value,
    });
  }

  validate() {
    const numberValid =
      this.shadowRoot.querySelector('paper-input') &&
      this.shadowRoot.querySelector('paper-input').validate();

    if (!this.textValue) {
      return true;
    }
    return !!this.unitValue && numberValid;
  }

  getFieldPath() {
    return this.fieldPath;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.props.value) {
      this.textValue = this.value.replace(/[^0-9]/g, '');
      this.unitValue = this.value.match(/\D/g).join('');
    }

    this.name = this.props.name;
    this.fieldPath = this.props.fieldPath;
    this.mistForm.dependencyController.addElementReference(this);
  }

  render() {
    // TODO: Style this like the other element labels
    this.style.display = this.props.hidden ? 'none' : 'inherit';
    this.fieldPath = this.props.fieldPath;
    return html` <span class="label">${this.props.label}</span>
      <paper-input
        .step="1"
        .min=${this.props.min || 1}
        .max=${this.props.max}
        type="number"
        autovalidate="true"
        excludeFromPayload
        .value="${this.props.textValue}"
        @value-changed="${this.updateTextValue}"
      ></paper-input>
      <paper-dropdown-menu no-animations="" excludeFromPayload>
        <paper-listbox
          @selected-changed=${this.updateUnitValue}
          class="dropdown-content"
          slot="dropdown-content"
          attr-for-selected="value"
          selected="${this.unitValue || ''}"
        >
          ${this.units.map(
            unit =>
              html`<paper-item value="${unit.value}">${unit.name}</paper-item>`
          )}
        </paper-listbox>
      </paper-dropdown-menu>`;
  }
}

customElements.define('mist-form-duration-field', DurationField);
