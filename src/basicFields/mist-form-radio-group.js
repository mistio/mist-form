import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormRadioGroup extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return css``;
  }

  render() {
    super.render();
    return html` <paper-radio-group
        ...="${spreadProps(this.props)}"
        .label="${util.getLabel(this.props)}"
        class="${this.props.classes || ''} mist-form-input"
        ?excludeFromPayload="${this.props.excludeFromPayload}"
        @selected-changed=${this.valueChanged}
        fieldPath="${this.props.fieldPath}"
      >
        <label>${util.getLabel(this.props)}</label>
        ${this.props.enum.map(
          item =>
            html`<paper-radio-button .id=${item.split(' ').join('-')}
              >${item}</paper-radio-button
            >`
        )} </paper-radio-group
      >${this.helpText(this.props)}`;
  }
}

customElements.define('mist-form-radio-group', MistFormRadioGroup);
