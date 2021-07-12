import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { until } from 'lit-html/directives/until.js';
import * as util from '../utilities.js';
// TODO: Set required property that gives error if element has empty value
class MistFormTextArea extends LitElement {
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
    return html`<paper-textarea
    class="${props.classes || ''} mist-form-input"
    always-float-label
    ...="${spreadProps(getConvertedProps(props))}"
    .label="${util.getLabel(props)}"
    ?excludeFromPayload="${props.excludeFromPayload}"
    @value-changed=${this.valueChanged}
    fieldPath="${props.fieldPath}"
  ></paper-textarea>`
  }
}

customElements.define('mist-form-text-area', MistFormTextArea);
