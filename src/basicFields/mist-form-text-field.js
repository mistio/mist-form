import '@polymer/paper-input/paper-input.js';
import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { styleMap } from 'lit-html/directives/style-map.js';
import { fieldStyles } from '../styles/fieldStyles.js';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormTextField extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return [
      fieldStyles,
      css`
    paper-input {
      --paper-input-container-label: {
        color: #4b4b4bl
        font-size: 22px;
      };
    }
    paper-input > [slot='prefix'] {
      margin-right: 5px;
    }
    `,
    ];
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
    return html` ${this.props.preffix &&
      html`<span
        slot="prefix"
        style=${styleMap(this.props.styles && this.props.styles.prefix)}
        >${this.props.preffix}</span
      >`}
      <paper-input
        class="${this.props.classes || ''} mist-form-input"
        @value-changed=${this.debouncedEventChange}
        always-float-label
        ...="${spreadProps(this.convertProps(this.props))}"
        .value="${this.convertValue()}"
        .label="${util.getLabel(this.props)}"
        fieldPath="${this.props.fieldPath}"
        style=${styleMap(this.props.styles && this.props.styles.inner)}
      >
      </paper-input>
      ${this.props.suffix &&
      html`<span
        slot="suffix"
        style=${styleMap(this.props.styles && this.props.styles.suffix)}
        >${this.props.suffix}</span
      >`}
      ${this.helpText(this.props)}`;
  }

  convertValue() {
    let value = this.value !== undefined ? this.value : this.props.value;
    if (this.props.type === 'number') {
      value = Number(value);
    } else if (this.props.type === 'integer') {
      value = parseInt(value)
    }
    return value;
  }

  convertProps(props) {
    const newProps = {
      ...props,
      max: props.maximum,
      min: props.minimum,
      type: props.type.replace('integer','number') || 'string',
      multiple: props.multipleOf,
    };
    ['maximum', 'minimum', 'format', 'multipleOf'].forEach(
      e => delete newProps[e]
    );
    return newProps;
  }
}

customElements.define('mist-form-text-field', MistFormTextField);
