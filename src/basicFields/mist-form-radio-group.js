import { LitElement, html } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { styleMap } from 'lit-html/directives/style-map.js';
import { fieldStyles } from '../styles/fieldStyles.js';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormRadioGroup extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return [fieldStyles];
  }

  update(changedProperties) {
    this.mistForm.dependencyController.updatePropertiesByTarget(this);
    this.style.display = this.props.hidden
      ? 'none'
      : this.props.styles?.outer?.display;
    this.fieldPath = this.props.fieldPath;
    super.update(changedProperties);
  }

  render() {
    // Add support for titles and ids in radioGroup like I have in dropdowns
    return html` <paper-radio-group
        ...="${spreadProps(this.props)}"
        .label="${util.getLabel(this.props)}"
        class="${this.props.classes || ''} mist-form-input"
        .selected="${this.props.value}"
        @selected-changed=${this.valueChanged}
        fieldPath="${this.props.fieldPath}"
        style=${styleMap(this.props.styles && this.props.styles.radioGroup)}
      >
        <label>${util.getLabel(this.props)}</label>
        ${this.props.enum.map(
          item =>
            html`<paper-radio-button
              .id=${item.split(' ').join('-')}
              style=${styleMap(
                this.props.styles && this.props.styles.radioButton
              )}
              .name="${item}"
              >${item}</paper-radio-button
            >`
        )} </paper-radio-group
      >${this.helpText(this.props)}`;
  }
}

customElements.define('mist-form-radio-group', MistFormRadioGroup);
