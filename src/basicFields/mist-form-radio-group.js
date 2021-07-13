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

  valueChanged(e) {
    this.valueChangedEvent(e);
    this.value = e.detail.value;
  }

  firstUpdated() {
    this.fieldPath = this.props.fieldPath;
    this.name = this.props.name;
  }

  render() {
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
      )}
    </paper-radio-group>`;
  }
}

customElements.define('mist-form-radio-group', MistFormRadioGroup);
