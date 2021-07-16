import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import * as util from '../utilities.js';
// TODO: Set required property that gives error if element has empty value
class MistFormTextArea extends LitElement {
  static get properties() {
    return {
      value: { type: String },
      props: { type: Object },
      fieldPath: { type: String, reflect: true },
    };
  }

  static get styles() {
    return css``;
  }

  validate() {
    return this.shadowRoot.querySelector('paper-textarea').validate();
  }

  valueChanged(e) {
    this.value = e.detail.value;
    this.props.valueChangedEvent({ element: this });
  }

  connectedCallback() {
    super.connectedCallback();
    this.fieldPath = this.props.fieldPath;
    this.name = this.props.name;
    this.mistForm.dependencyController.addElementReference(this);
  }

  render() {
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
