import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { styleMap } from 'lit-html/directives/style-map.js';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormCheckboxGroup extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return css`
    paper-checkbox {
      padding-top: 13px;
      margin-right: 10px;
    }

    .label {
      font-weight: bold;
    }

    iron-selector {
      margin-top: 10px;
      margin-left: 10px;
    }
    `;
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

  connectedCallback() {
    super.connectedCallback();
    this.value = this.props.value || [];
  }

  render() {
    super.render();
    return html`
      <span class="label">${this.props.label}:</span>
      <iron-selector
        ...="${spreadProps(this.props)}"
        .label="${util.getLabel(this.props)}"
        ?excludeFromPayload="${this.props.excludeFromPayload}"
        @selected-values-changed=${this.valueChanged}
        class="${this.props.classes || ''} checkbox-group mist-form-input"
        .selectedValues="${this.value}"
        attr-for-selected="key"
        selected-attribute="checked"
        multi
        fieldPath="${this.props.fieldPath}"
        style=${styleMap(this.props.styles && this.props.styles.selector)}
      >
        ${this.props.enum.map(
          item =>
            html`<paper-checkbox
                .id=${item.split(' ').join('-')}
                key="${item}"
                .checked="${this.props.value &&
                this.props.value.includes(item)}"
                style=${styleMap(
                  this.props.styles && this.props.styles.checkbox
                )}
                >${item}</paper-checkbox
              >${this.helpText(this.props)}`
        )}
      </iron-selector>
    `;
  }
}

customElements.define('mist-form-checkbox-group', MistFormCheckboxGroup);
