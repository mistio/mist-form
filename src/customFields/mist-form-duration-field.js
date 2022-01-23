import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-input/paper-input.js';

import { LitElement, html, css } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map.js';
import { fieldStyles } from '../styles/fieldStyles.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class DurationField extends elementBoilerplateMixin(LitElement) {
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
    return [
      fieldStyles,
      css`
        :host {
          display: flex;
          color: var(--mist-form-duration-text-color, rgba(0, 0, 0, 0.54));
          background: var(--mist-form-duration-background-color, white);
          font-family: var(--mist-form-duration-font-family, Roboto);
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
      `,
    ];
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
      this.shadowRoot.querySelector('#text') &&
      this.shadowRoot.querySelector('#text').validate();

    if (!this.textValue && !this.unitValue) {
      return true;
    }
    if (!this.textValue || !this.unitValue) {
      return false;
    }
    return numberValid;
  }

  connectedCallback() {
    super.connectedCallback();
    this.value = this.props.value;
    if (this.props.value) {
      this.textValue = this.value && this.value.replace(/[^0-9]/g, '');
      this.unitValue = this.value && this.value.match(/\D/g).join('');
    }
  }

  update(changedProperties) {
    this.mistForm.dependencyController.updatePropertiesByTarget(this);
    this.style.display = this.props.hidden
      ? 'none'
      : this.props.styles?.outer?.display || '';
    this.fieldPath = this.props.fieldPath;
    super.update(changedProperties);
  }

  render() {
    return html` <span
        class="label"
        style=${styleMap(this.props.styles && this.props.styles.label)}
        >${this.props.label}</span
      >
      <paper-input
        id="text"
        .step="1"
        .min=${this.props.min || 1}
        .max=${this.props.max}
        type="number"
        autovalidate="true"
        excludeFromPayload
        .value="${this.textValue}"
        @value-changed="${this.updateTextValue}"
        style=${styleMap(this.props.styles && this.props.styles.input)}
      ></paper-input>
      <paper-dropdown-menu
        no-animations=""
        excludeFromPayload
        id="unit"
        style=${styleMap(this.props.styles && this.props.styles.dropdown)}
      >
        <paper-listbox
          @selected-changed=${this.updateUnitValue}
          class="dropdown-content"
          slot="dropdown-content"
          attr-for-selected="value"
          selected="${this.unitValue || ''}"
          style=${styleMap(this.props.styles && this.props.styles.listbox)}
        >
          ${this.units.map(
            unit =>
              html`<paper-item
                value="${unit.value}"
                style=${styleMap(this.props.styles && this.props.styles.item)}
                >${unit.name}</paper-item
              >`
          )}
        </paper-listbox>
      </paper-dropdown-menu>`;
  }
}

customElements.define('mist-form-duration-field', DurationField);
