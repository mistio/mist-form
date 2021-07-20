import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistDropdown extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return css``;
  }

  validate() {
    return true;
  }

  render() {
    super.render();
    return html`<paper-checkbox
        class="${this.props.classes || ''} mist-form-input"
        ...="${spreadProps(this.props)}"
        @checked-changed=${this.valueChanged}
        ?excludeFromPayload="${this.props.excludeFromPayload}"
        value=""
        fieldPath="${this.props.fieldPath}"
        >${this.props.label}</paper-checkbox
      >${this.helpText(this.props)}`;
  }
}

customElements.define('mist-form-checkbox', MistDropdown);
