import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { styleMap } from 'lit-html/directives/style-map.js';
import { fieldStyles } from '../styles/fieldStyles.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormCheckbox extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return [
      fieldStyles,
      css`
        paper-checkbox {
          --paper-checkbox-checked-color: #2196f3;
          --paper-checkbox-checked-ink-color: #2196f3;
          --paper-checkbox-unchecked-color: #424242;
        }
      `,
    ];
  }

  update(changedProperties) {
    this.props.checked = this.props.value;

    this.mistForm.dependencyController.updatePropertiesByTarget(this);
    this.style.display = this.props.hidden
      ? 'none'
      : this.props.styles?.outer?.display || '';
    this.fieldPath = this.props.fieldPath;
    super.update(changedProperties);
  }

  render() {
    return html`<paper-checkbox
        class="${this.props.classes || ''} mist-form-input"
        ...="${spreadProps(this.props)}"
        @checked-changed=${this.valueChanged}
        .checked="${this.props.value}"
        fieldPath="${this.props.fieldPath}"
        style=${styleMap(this.props.styles && this.props.styles.inner)}
        part="mist-form-checkbox"
        >${this.props.hideLabel ? '' : this.props.label}</paper-checkbox
      >${this.helpText(this.props)}`;
  }
}

customElements.define('mist-form-checkbox', MistFormCheckbox);
