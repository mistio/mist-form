import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormTextArea extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return css``;
  }

  render() {
    super.render();
    return html`<paper-textarea
        class="${this.props.classes || ''} mist-form-input"
        always-float-label
        ...="${spreadProps(util.getConvertedProps(this.props))}"
        .label="${util.getLabel(this.props)}"
        ?excludeFromPayload="${this.props.excludeFromPayload}"
        @value-changed=${this.valueChanged}
        fieldPath="${this.props.fieldPath}"
      ></paper-textarea
      >${this.helpText(this.props)}`;
  }
}

customElements.define('mist-form-text-area', MistFormTextArea);
