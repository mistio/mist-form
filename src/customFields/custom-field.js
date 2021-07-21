import { LitElement, html, css } from 'lit-element';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';
// We can set these fields when passing web components to the form
// 1. mist-form-type:  Necessary to define component name from json
// 2. mist-form-value-change: The name of the value change event. Default is value-change
// 3. mist-form-validate: The name of the validate function. Default is validate
// 4.  mist-form-value-prop: The name of the property that returns the value. Default is value
const getValueChangeName = el =>
  el.attributes['mist-form-value-change'] &&
  el.attributes['mist-form-value-change'].value;

const getValidateName = el =>
  el.attributes['mist-form-validate'] &&
  el.attributes['mist-form-validate'].value;

const getValueProp = el =>
  el.attributes['mist-form-value-prop'] &&
  el.attributes['mist-form-value-prop'].value;

class MistFormCustomField extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return css``;
  }

  constructor() {
    super();
    this.valueChangeName = 'value-change';
    this.validateName = 'validate';
    this.valueProp = 'value';
  }

  validate() {
    const validateFunction = this.customElement[this.validateName];
    return validateFunction ? this.customElement.validateFunction() : true;
  }

  valueChanged(e) {
    this.props.valueChangedEvent(e);
    this.value = e.detail[this.valueProp];
  }

  setupComponent() {
    const prototype = this.mistForm.querySelector(
      `#mist-form-custom > [mist-form-type="${this.props.format}"]`
    );

    this.valueChangeName =
      getValueChangeName(prototype) || this.valueChangeName;
    this.validateName = getValidateName(prototype) || this.validateName;
    this.valueProp = getValueProp(prototype) || this.valueProp;

    this.customElement = prototype.cloneNode();

    this.addEventListener(this.valueChangeName, e => {
      this.valueChanged(e);
      this.value = this.customElement[this.valueProp];
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupComponent();
  }

  render() {
    super.render();
    for (const [key, val] of Object.entries(this.props)) {
      this.customElement[key] = val;
    }

    return html`${this.customElement}`;
  }
}

customElements.define('mist-form-custom-field', MistFormCustomField);
