import '@polymer/paper-input/paper-textarea.js';
import { LitElement, html } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { styleMap } from 'lit-html/directives/style-map.js';
import { fieldStyles } from '../styles/fieldStyles.js';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormTextArea extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return [fieldStyles];
  }

  update(changedProperties) {
    this.style.display = this.props.hidden
      ? 'none'
      : this.props.styles?.outer?.display || '';
    this.fieldPath = this.props.fieldPath;
    this.mistForm.dependencyController.updatePropertiesByTarget(this.fieldPath);
    super.update(changedProperties);
  }

  render() {
    return html`<paper-textarea
        class="${this.props.classes || ''} mist-form-input"
        always-float-label
        ...="${spreadProps(this.convertProps(this.props))}"
        .value="${this.convertValue()}"
        .label="${util.getLabel(this.props)}"
        @value-changed=${this.debouncedEventChange}
        fieldPath="${this.props.fieldPath}"
        style=${styleMap(this.props.styles && this.props.styles.inner)}
      ></paper-textarea
      >${this.helpText(this.props)}`;
  }

  convertValue() {
    let value = this.value !== undefined ? this.value : this.props.value;
    return value;
  }

  convertProps(props) {
    const newProps = {
      ...props,
      max: props.maximum,
      min: props.minimum,
      multiple: props.multipleOf,
    };
    ['maximum', 'minimum', 'format', 'multipleOf'].forEach(
      e => delete newProps[e]
    );
    return newProps;
  }
}

customElements.define('mist-form-text-area', MistFormTextArea);
