import { LitElement, html, css } from 'lit-element';
import * as util from '../utilities.js';
// TODO: Set required property that gives error if element has empty value
const isEvenOrOdd = fieldPath =>
  fieldPath.split('.').length % 2 ? 'odd' : 'even';

class MistFormSubform extends LitElement {
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
      }
    `;
  }

  getFieldsValid() {
    return this.fieldTemplates.formFieldsValid(
      this.shadowRoot.querySelector('.subform-container')
    );
  }

  valueChanged(e) {
    this.props.valueChangedEvent(e);
    this.value = e.detail.value;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fieldPath = this.props.fieldPath;
    this.name = this.props.name;
    this.isOpen = this.props.fieldsVisible || !this.props.hasToggle;

    this.mistForm.dependencyController.addElementReference(this);
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
    return html`<div
      class="${this.props.classes || ''} subform-container ${this.isOpen
        ? 'open'
        : ''} ${isEvenOrOdd(this.props.fieldPath)}"
    >
      <span class="${this.props.classes || ''} subform-name"
        >${!this.props.hasToggle ? this.props.label : ''}</span
      >

      ${this.props.hasToggle &&
      html` <paper-toggle-button
        .name="${this.props.name}-toggle"
        excludeFromPayload
        .checked="${this.isOpen}"
        @checked-changed="${e => {
          this.isOpen = e.detail.value;
        }}"
        >${this.props.label}</paper-toggle-button
      >`}
      ${this.isOpen ? html`${this.props.inputs}` : ''}
    </div>`;
  }
}

customElements.define('mist-form-subform', MistFormSubform);
