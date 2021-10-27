import { LitElement, html, css } from 'lit-element';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';
import * as util from '../utilities.js';
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

const getValuePath = el =>
  el.attributes['mist-form-value-path'] &&
  el.attributes['mist-form-value-path'].value;

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
    this.value = this.valuePath
      ? util.getNestedValueFromPath(this.valuePath, e)
      : this.customElement[this.valueProp];
    this.props.valueChangedEvent({
      fieldPath: this.fieldPath,
      value: this.value,
    });
  }

  setupComponent() {
    const prototype = this.mistForm.querySelector(
      `#mist-form-custom > [mist-form-type="${this.props.format}"]`
    );

    this.valueChangeName =
      getValueChangeName(prototype) || this.valueChangeName;
    this.validateName = getValidateName(prototype) || this.validateName;
    this.valueProp = getValueProp(prototype) || this.valueProp;
    this.valuePath = getValuePath(prototype);
    this.customElement = prototype.cloneNode();

    this.addEventListener(this.valueChangeName, e => {
      this.valueChanged(e);
    });
    this.props[this.valueProp] = this.props.value;
    this.value = this.props.value;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupComponent();
  }

  update(changedProperties) {
    if (!changedProperties.has('value')) {
      this.mistForm.dependencyController.updatePropertiesByTarget(this);
    }

    this.style.display = this.props.hidden ? 'none' : '';
    this.fieldPath = this.props.fieldPath;
    super.update(changedProperties);
  }

  render() {
    // super.render();
    for (const [key, val] of Object.entries(this.props)) {
      this.customElement[key] = val;
    }

    return html`${this.customElement}`;
  }
}

customElements.define('mist-form-custom-field', MistFormCustomField);
