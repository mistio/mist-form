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
    this.mistForm.dependencyController.updatePropertiesByTarget(this);
    this.style.display = this.props.hidden
      ? 'none'
      : this.props.styles?.outer?.display || '';
    this.fieldPath = this.props.fieldPath;
    super.update(changedProperties);
  }

  render() {
    return html`<paper-textarea
        class="${this.props.classes || ''} mist-form-input"
        always-float-label
        ...="${spreadProps(util.getConvertedProps(this.props))}"
        .value="${this.value !== undefined ? this.value : this.props.value}"
        .label="${util.getLabel(this.props)}"
        @value-changed=${this.debouncedEventChange}
        fieldPath="${this.props.fieldPath}"
        style=${styleMap(this.props.styles && this.props.styles.inner)}
      ></paper-textarea
      >${this.helpText(this.props)}`;
  }
}

customElements.define('mist-form-text-area', MistFormTextArea);
