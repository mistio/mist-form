import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormCheckboxGroup extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return css``;
  }

  validate() {
    return true;
  }

  valueChanged() {
    this.value = this.shadowRoot.querySelector('iron-selector').selectedValues;
    this.props.valueChangedEvent({
      fieldPath: this.fieldPath,
      value: this.value,
    });
  }

  render() {
    super.render();
    return html`
      <iron-selector
        ...="${spreadProps(this.props)}"
        .label="${util.getLabel(this.props)}"
        ?excludeFromPayload="${this.props.excludeFromPayload}"
        @selected-values-changed=${this.valueChanged}
        class="${this.props.classes || ''} checkbox-group mist-form-input"
        attr-for-selected="key"
        selected-attribute="checked"
        multi
        fieldPath="${this.props.fieldPath}"
      >
        ${this.props.enum.map(
          item =>
            html`<paper-checkbox .id=${item.split(' ').join('-')} key="${item}" .checked="${this.props.value.includes(item)}"
                >${item}</paper-checkbox
              >${this.helpText(this.props)}`
        )}
      </iron-selector>
    `;
  }
}

customElements.define('mist-form-checkbox-group', MistFormCheckboxGroup);
