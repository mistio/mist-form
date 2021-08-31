import { LitElement, html, css } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map.js';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

const isEvenOrOdd = fieldPath =>
  fieldPath.split('.').length % 2 ? 'odd' : 'even';

class MistFormSubform extends elementBoilerplateMixin(LitElement) {
  static get properties() {
    return {
      value: { type: String },
      props: { type: Object },
      fieldPath: { type: String, reflect: true },
      isOpen: { type: Boolean },
      excludeFromPayload: { type: Boolean, reflect: true },
    };
  }

  static get styles() {
    return css`
      .subform-container {
        border: var(--mist-subform-border, 1px solid white);
        margin: var(--mist-subform-margin, 10px);
        padding: var(--mist-subform-padding, 10px);
        color: var(--mist-subform-text-color, #424242);
        background-color: var(--mist-subform-background-color, white);
        display: flex;
        flex-wrap: wrap;
        --threshold: 30rem;
      }
      .subform-container > * {
        flex-grow: 1;
        flex-basis: calc((var(--threshold) - 100%) * 999);
      }
      .subform-container > * + * {
        margin-top: 10px;
      }
      .subform-container > .subform-container > mist-form-duration-field {
        padding-left: 0;
      }
      .subform-container.open.odd {
        background-color: var(--mist-subform-background-color, #ebebeb);
      }
      .subform-container.open.even {
        background-color: white;
      }

      .subform-name {
        font-weight: bold;
        padding: 0 10px;
      }
      .subform-container > paper-toggle-button {
        flex-basis: unset;
        width: 100%;
      }

      paper-toggle-button {
        margin-bottom: 10px;
        margin-left: 10px;
      }

    `;
  }

  validate() {
    return this.fieldTemplates.formFieldsValid(
      this.shadowRoot.querySelector('.subform-container')
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.isOpen = this.props.fieldsVisible || !this.props.hasToggle;
  }

  getValue() {
    return this.mistForm.getValuesfromDOM(
      this.shadowRoot.querySelector('.subform-container')
    );
  }

  setupInputs() {
    const subForm = util.getSubformFromRef(
      this.mistForm.subforms,
      this.props.properties.subform.$ref
    );

    const path = this.props.fieldPath;
    const parentPath = this.props.omitTitle
      ? path.split('.').slice(0, -1).join('.')
      : path;

    const subFormInputs = Object.keys(subForm.properties).map(key => [
      key,
      {
        ...subForm.properties[key],
        hidden: this.props.hidden || subForm.properties[key].hidden,
      },
    ]);
    this.props.inputs = this.mistForm.renderInputs(subFormInputs, parentPath);
  }

  render() {
    this.setupInputs();
    this.excludeFromPayload = !this.isOpen;
    super.render();
    const label = !this.props.hasToggle ? this.props.label : '';
    return html`<div
      class="${this.props.classes || ''} subform-container ${this.isOpen
        ? 'open'
        : ''} ${isEvenOrOdd(this.props.fieldPath)}"
      style=${styleMap(this.props.styles && this.props.styles.container)}
    >
      ${label
        ? html`<span
            class="${this.props.classes || ''} subform-name"
            style=${styleMap(this.props.styles && this.props.styles.name)}
            >${label}</span
          >`
        : ''}
      ${this.props.hasToggle &&
      html` <paper-toggle-button
        .name="${this.props.name}-toggle"
        excludeFromPayload
        .checked="${this.isOpen}"
        @checked-changed="${e => {
          this.isOpen = e.detail.value;
        }}"
        style=${styleMap(this.props.styles && this.props.styles.toggle)}
        >${this.props.label}</paper-toggle-button
      >`}
      ${this.isOpen ? html`${this.props.inputs}` : ''}
    </div>`;
  }
}

customElements.define('mist-form-subform', MistFormSubform);
