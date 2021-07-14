import { LitElement, html, css } from 'lit-element';

// TODO: Set required property that gives error if element has empty value
class MistFormCustomField extends LitElement {
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
    // Maybe allow a validate property?
    return true;
  }

  valueChanged(e) {
    this.props.valueChangedEvent(e);
    this.value = e.detail.value;
  }

  firstUpdated() {
    this.fieldPath = this.props.fieldPath;
    this.name = this.props.name;

    this.addEventListener(this.eventName, e => {
      this.valueChanged(e);
    });
  }

  render() {
    const prototype = this.mistForm.querySelector(
      `#mist-form-custom > [mist-form-type="${this.props.format}"]`
    );
    this.eventName =
      prototype.attributes['mist-form-value-change'].value || 'value-change';
    const valueProp =
      prototype.attributes['mist-form-value-prop'] &&
      prototype.attributes['mist-form-value-prop'].value;

    const customElement = prototype.cloneNode();
    for (const [key, val] of Object.entries(this.props)) {
      customElement.setAttribute(key, val);
      customElement[key] = val;
    }
    // Add value-changed-event-listeners
    return html`${customElement}`;
  }
}

customElements.define('mist-form-custom-field', MistFormCustomField);
