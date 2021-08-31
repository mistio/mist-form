import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { styleMap } from 'lit-html/directives/style-map.js';
import { fieldStyles } from '../styles/fieldStyles.js';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormRadioGroup extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return [fieldStyles];
  }


  render() {
    super.render();
    return html` <paper-radio-group
        ...="${spreadProps(this.props)}"
        .label="${util.getLabel(this.props)}"
        class="${this.props.classes || ''} mist-form-input"
        ?excludeFromPayload="${this.props.excludeFromPayload}"
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
              >${item}</paper-radio-button
            >`
        )} </paper-radio-group
      >${this.helpText(this.props)}`;
  }
}

customElements.define('mist-form-radio-group', MistFormRadioGroup);
