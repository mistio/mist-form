import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { styleMap } from 'lit-html/directives/style-map.js';
import { fieldStyles } from '../styles/fieldStyles.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistDropdown extends elementBoilerplateMixin(LitElement) {
  static get styles() {
<<<<<<< HEAD
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
=======
    return [fieldStyles,
    css`
       paper-checkbox {
      --paper-checkbox-checked-color: #2196f3;
      --paper-checkbox-checked-ink-color: #2196f3;
      --paper-checkbox-unchecked-color: #424242;
    }`];
>>>>>>> 8ca28faffcb5516207291a8c25a8f0968865bb96
  }

  validate() {
    return true;
  }

  render() {
    this.props.checked = this.props.value;
    super.render();
<<<<<<< HEAD
    console.log('this.props.styles ', this.props.styles);
=======
    console.log("this.props.styles ", this.props.styles)
>>>>>>> 8ca28faffcb5516207291a8c25a8f0968865bb96
    return html`<paper-checkbox
        class="${this.props.classes || ''} mist-form-input"
        ...="${spreadProps(this.props)}"
        @checked-changed=${this.valueChanged}
        .checked="${this.props.value}"
        ?excludeFromPayload="${this.props.excludeFromPayload}"
        value=""
        fieldPath="${this.props.fieldPath}"
        style=${styleMap(this.props.styles && this.props.styles.inner)}
        part="mist-form-checkbox"
        >${this.props.hideLabel ? '' : this.props.label}</paper-checkbox
      >${this.helpText(this.props)}`;
  }
}

customElements.define('mist-form-checkbox', MistDropdown);
