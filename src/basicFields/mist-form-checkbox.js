import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';

// TODO: Set required property that gives error if element has empty value
class MistDropdown extends LitElement {
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
    return true;
  }

  valueChanged(e) {
    this.props.valueChangedEvent(e);
    this.value = e.detail.value;
  }

  firstUpdated() {
    this.fieldPath = this.props.fieldPath;
    this.name = this.props.name;
  }

  render() {
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
