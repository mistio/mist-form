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
      selectedTab: { type: String },
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
      .subform-container.stacked > * {
        flex-grow: 1;
        flex-basis: 100%;
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
      .subform-container > paper-toggle-button,
      .subform-container > mist-form-radio-group {
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
    this.selectedTab =
      this.props.properties.tabs && this.props.properties.tabs.enum[0].label;
    this.isOpen = this.props.fieldsVisible || !this.props.hasToggle;
  }

  getValue() {
    return this.mistForm.getValuesfromDOM(
      this.shadowRoot.querySelector('.subform-container')
    );
  }

  getParentPath(tabIndex) {
    const path =
      tabIndex !== undefined
        ? `${this.props.fieldPath}[${[tabIndex]}]`
        : this.props.fieldPath;
    // const parentPath = this.props.omitTitle
    //   ? path.split('.').slice(0, -1).join('.')
    //   : path;
    const parentPath = path;
    return parentPath;
  }

  getSubformInputs(ref, tabIndex) {
    const subForm = util.getSubformFromRef(this.mistForm.subforms, ref);
    const subFormInputs = Object.keys(subForm.properties).map(key => [
      key,
      {
        ...subForm.properties[key],
        hidden: this.props.hidden || subForm.properties[key].hidden,
      },
    ]);
    return this.mistForm.renderInputs(
      subFormInputs,
      this.getParentPath(tabIndex),
      this.props
    );
  }

  setupInputs() {
    // If subform
    if (this.props.properties.subform) {
      this.props.inputs = this.getSubformInputs(
        this.props.properties.subform.$ref
      );
      // If tabbed
    } else if (this.props.properties.tabs) {
      this.props.inputs = this.props.properties.tabs.enum.map((tab, index) => ({
        label: tab.label,
        inputs: this.getSubformInputs(tab && tab.$ref, index),
      }));
    }
    // If tabbed, this.props.inputs is an Array
  }

  getTabs() {
    return html`${this.radioGroupFunc({
      enum: this.props.properties.tabs.enum.map(tab => tab.label),
      value: this.selectedTab,
      excludeFromPayload: true,
      valueChangedEvent: e => {
        this.selectedTab = e.value;
        this.valueChanged({ detail: { value: e.value } });
      },
    })}
    ${this.props.inputs.find(input => input.label === this.selectedTab).inputs}`;
  }

  getInputs = hasTabs =>
    hasTabs ? html`${this.getTabs()}` : html`${this.props.inputs}`;

  update(changedProperties) {
    this.setupInputs();
    this.excludeFromPayload = !this.isOpen;
    this.mistForm.dependencyController.updatePropertiesByTarget(this);
    this.style.display = this.props.hidden
      ? 'none'
      : this.props.styles?.outer?.display || '';
    this.fieldPath = this.props.fieldPath;
    super.update(changedProperties);
  }

  render() {
    const hasTabs = this.props.properties.tabs;
    const label = !this.props.hasToggle ? this.props.label : '';
    const containerStyles =
      this.props.styles &&
      (this.isOpen
        ? { ...this.props.styles.container, ...this.props.styles.containerOpen }
        : {
            ...this.props.styles.container,
            ...this.props.styles.containerClosed,
          });
    return html`<div
      class="${this.props.classes || ''} subform-container ${this.isOpen
        ? 'open'
        : ''} ${isEvenOrOdd(this.props.fieldPath)}"
      style=${styleMap(containerStyles)}
    >
      ${label
        ? html`<span
            class="${this.props.classes || ''} subform-name"
            style=${styleMap(this.props.styles && this.props.styles.name)}
            >${label}</span
          >`
        : ''}
      ${this.props.hasToggle
        ? html` <paper-toggle-button
            .name="${this.props.name}-toggle"
            excludeFromPayload
            .checked="${this.isOpen}"
            @checked-changed="${e => {
              this.isOpen = e.detail.value;
            }}"
            style=${styleMap(this.props.styles && this.props.styles.toggle)}
            >${this.props.label}</paper-toggle-button
          >`
        : ''}
      ${this.isOpen ? this.getInputs(hasTabs) : ''}
    </div>`;
  }
}

customElements.define('mist-form-subform', MistFormSubform);
