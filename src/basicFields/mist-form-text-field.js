import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { until } from 'lit-html/directives/until.js';
import * as util from '../utilities.js';
// TODO: Set required property that gives error if element has empty value
class MistFormTextField extends LitElement {
  static get properties() {
    return {
      value: { type: String },
      props: {type: Object},
      fieldPath: {type: String, reflect: true}
    };
  }

  constructor() {
    super();
  }

  static get styles() {
    return css`
    `;
  }

  valueChanged(e) {
    this.valueChangedEvent(e);
  }

firstUpdated() {
  this.fieldPath = this.props.fieldPath;
}
  render() {
      console.log("render ")

      return html`<paper-input
      class="${props.classes || ''} mist-form-input"
      @value-changed=${this.valueChanged}
      always-float-label
      ...="${spreadProps(getConvertedProps(props))}"
      .label="${util.getLabel(props)}"
      ?excludeFromPayload="${props.excludeFromPayload}"
      fieldPath="${props.fieldPath}"
    >
      ${props.preffix && html`<span slot="prefix">${props.preffix}</span>`}
      ${props.suffix && html`<span slot="suffix">${props.suffix}</span>`}
    </paper-input>`
  }
}

customElements.define('mist-form-text-field', MistFormTextField);
