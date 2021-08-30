import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { styleMap } from 'lit-html/directives/style-map.js';
import { fieldStyles } from '../styles/fieldStyles.js';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormTextField extends elementBoilerplateMixin(LitElement) {
  static get styles() {
<<<<<<< HEAD
    return [
      fieldStyles,
      css`
=======
    return [fieldStyles, css`
>>>>>>> 8ca28faffcb5516207291a8c25a8f0968865bb96
    paper-input {
      --paper-input-container-label: {
        color: #4b4b4bl
        font-size: 22px;
      };
    }
    paper-input > [slot='prefix'] {
      margin-right: 5px;
    }
<<<<<<< HEAD
    `,
    ];
=======
    `];
>>>>>>> 8ca28faffcb5516207291a8c25a8f0968865bb96
  }

  render() {
    super.render();
    return html`<paper-input
        class="${this.props.classes || ''} mist-form-input"
        @value-changed=${this.debouncedEventChange}
        always-float-label
        ...="${spreadProps(util.getConvertedProps(this.props))}"
        .label="${util.getLabel(this.props)}"
        ?excludeFromPayload="${this.props.excludeFromPayload}"
        fieldPath="${this.props.fieldPath}"
        style=${styleMap(this.props.styles && this.props.styles.inner)}
      >
        ${this.props.preffix &&
        html`<span
          slot="prefix"
          style=${styleMap(this.props.styles && this.props.styles.prefix)}
          >${this.props.preffix}</span
        >`}
        ${this.props.suffix &&
        html`<span
          slot="suffix"
          style=${styleMap(this.props.styles && this.props.styles.suffix)}
          >${this.props.suffix}</span
        >`} </paper-input
      >${this.helpText(this.props)}`;
  }
}

customElements.define('mist-form-text-field', MistFormTextField);
