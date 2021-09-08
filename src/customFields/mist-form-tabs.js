import { LitElement, html, css } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map.js';
import { fieldStyles } from '../styles/fieldStyles.js';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormSubform extends elementBoilerplateMixin(LitElement) {
  static get properties() {
    return {
      value: { type: String },
      props: { type: Object },
      fieldPath: { type: String, reflect: true },
      excludeFromPayload: { type: Boolean, reflect: true },
    };
  }

  static get styles() {
    return [
      fieldStyles,
      css`
      `,
    ];
  }
  validate() {
    // Should this element support validate? It's just a presentational layer that hides subforms
    return this.fieldTemplates.formFieldsValid(
      this.shadowRoot.querySelector('.subform-container')
    );
  }

  connectedCallback() {
    super.connectedCallback();
  }

  getValue() {
    // Get value from the visible subform
    return this.mistForm.getValuesfromDOM(
      this.shadowRoot.querySelector('.subform-container')
    );
  }

  tabSwitchingLogic() {
    // Capture value changes from checboxGroup and hide/show tabs accordingly
    // Pass hide show props to the subforms
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
    super.render();
    return html`<div
      class="${this.props.classes || ''}"
      style=${styleMap(this.props.styles && this.props.styles.container)}
    >
      ${label
        ? html`<span
            class="${this.props.classes || ''} tabs-name"
            style=${styleMap(this.props.styles && this.props.styles.name)}
            >${label}</span
          >`
        : ''}

        ${this.checkBoxGroupFunc(checkBoxGroupProps)
        }
        ${this.props.subforms.map(subform => this.subformFunc(subform.props))}
    </div>`;
  }
}

customElements.define('mist-form-subform', MistFormSubform);
