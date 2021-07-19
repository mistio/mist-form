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
    this.value = e.detail.value;
    this.props.valueChangedEvent({
      fieldPath: this.fieldPath,
      value: this.value,
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.name = this.props.name;
    this.fieldPath = this.props.fieldPath;
    this.mistForm.dependencyController.addElementReference(this);
  }

  render() {
    this.style.display = this.props.hidden ? 'none' : 'inherit';
    this.fieldPath = this.props.fieldPath;
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
