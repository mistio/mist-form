import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import * as util from '../utilities.js';

// TODO: Set required property that gives error if element has empty value
class MistFormRadioGroup extends LitElement {
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
    return this.shadowRoot.querySelector('paper-radio-group').validate();
  }

  valueChanged(e) {
    this.value = e.detail.value;
    this.props.valueChangedEvent({ fieldPath: this.fieldPath });
  }

  connectedCallback() {
    super.connectedCallback();
    this.fieldPath = this.props.fieldPath;
    this.name = this.props.name;
    this.mistForm.dependencyController.addElementReference(this);
  }

  render() {
    this.style.display = this.props.hidden ? 'none' : 'initial';
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
