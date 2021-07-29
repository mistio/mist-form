import { html } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map.js';
import { FieldTemplateHelpers } from './FieldTemplateHelpers.js';
import './basicFields/mist-form-button.js';
import './basicFields/mist-form-checkbox-group.js';
import './basicFields/mist-form-checkbox.js';
import './basicFields/mist-form-dropdown.js';
import './basicFields/mist-form-radio-group.js';
import './basicFields/mist-form-text-area.js';
import './basicFields/mist-form-text-field.js';
import './basicFields/mist-form-subform.js';
import './customFields/mist-form-duration-field.js';
import './customFields/mist-form-multi-row.js';
import './customFields/custom-field.js';

export class FieldTemplates extends FieldTemplateHelpers {
  constructor(mistForm, valueChangedEvent) {
    super();
    this.mistForm = mistForm;
    this.valueChangedEvent = valueChangedEvent;
    this.inputFields = [
      'mist-form-dropdown',
      'mist-form-text-area',
      'mist-form-text-field',
      'mist-form-checkbox',
      'mist-form-radio-group',
      'mist-form-checkbox-group',
      'mist-form-duration-field',
      'paper-toggle-button',
      'mist-form-subform',
      'mist-form-multi-row',
      'mist-form-custom-field',
    ];

    this.defaultFieldTypes = [
      'dropdown',
      'textArea',
      'input',
      'checkbox',
      'radioGroup',
      'checkboxGroup',
      'durationField',
      'subformContainer',
      'multiRow',
    ];
  }

  // Combine field and helpText and return template
  getTemplate(props) {
    const _props = { ...props };
    const { fieldType, valueChangedEvent } = _props;
    _props.valueChangedEvent = valueChangedEvent || this.valueChangedEvent;
    if (this[fieldType]) {
      const template = this[fieldType](_props);
      return html` ${template}`;
    }
    console.error(`Invalid field type: ${fieldType}`);
    return '';
  }

  dropdown = props =>
    html`<mist-form-dropdown
      id="${props.id}"
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
      style=${styleMap(props.styles && props.styles.outer)}
    ></mist-form-dropdown>`;

  radioGroup = props =>
    html`<mist-form-radio-group
      id="${props.id}"
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
      style=${styleMap(props.styles && props.styles.outer)}
    ></mist-form-radio-group>`;

  checkboxGroup = props =>
    html`<mist-form-checkbox-group
      id="${props.id}"
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
      style=${styleMap(props.styles && props.styles.outer)}
    ></mist-form-checkbox-group>`;

  input = props =>
    html`<mist-form-text-field
      id="${props.id}"
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
      style=${styleMap(props.styles && props.styles.outer)}
      part="mist-form-text-field"
    ></mist-form-text-field>`;

  textArea = props =>
    html`<mist-form-text-area
      id="${props.id}"
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
      style=${styleMap(props.styles && props.styles.outer)}
    ></mist-form-text-area>`;

  boolean = props =>
    html`<mist-form-checkbox
      id="${props.id}"
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
      style=${styleMap(props.styles && props.styles.outer)}
    ></mist-form-checkbox>`;

  durationField = props =>
    html`<mist-form-duration-field
      id="${props.id}"
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
      style=${styleMap(props.styles && props.styles.outer)}
    ></mist-form-duration-field>`;

  multiRow = props => html`<mist-form-multi-row
    id="${props.id}"
    .mistForm=${this.mistForm}
    .props="${props}"
    part="row"
    .fieldTemplates="${this}"
    .helpText=${this.helpText}
    style=${styleMap(props.styles && props.styles.outer)}
    exportparts="container: mist-form-multi-row-container, row-header: mist-form-multi-row-header, header-item: mist-form-multi-row-header-item, addrule: mist-form-multi-row-add-rule, row: mist-form-multi-row-row"
  ></mist-form-multi-row>`;

  custom = props =>
    html`<mist-form-custom-field
      id="${props.id}"
      .props="${props}"
      .mistForm=${this.mistForm}
      .helpText=${this.helpText}
      style=${styleMap(props.styles && props.styles.outer)}
    >
    </mist-form-custom-field>`;

  subformContainer = props =>
    html`<mist-form-subform
      id="${props.id}"
      .props="${props}"
      .mistForm=${this.mistForm}
      .fieldTemplates=${this}
      .helpText=${this.helpText}
      style=${styleMap(props.styles && props.styles.outer)}
      exportparts="mist-form-text-field, mist-form-dropdown, mist-form-radio-group, mist-form-checkbox-group, mist-form-text-field, mist-form-text-area, mist-form-checkbox, mist-form-duration-field, mist-form-multi-row, mist-form-custom-field, mist-form-button"
    ></mist-form-subform>`;

  spinner = html`<paper-spinner active></paper-spinner>`;

  // Submit button should be disabled until all required fields are filled
  button = props =>
    html`<mist-form-button
      id="${props.id}"
      .props="${props}"
      .mistForm=${this.mistForm}
      style=${styleMap(props.styles && props.styles.outer)}
    >
    </mist-form-button>`;

  helpText = ({ helpUrl, helpText, styles }) => {
    if (helpUrl) {
      return html` <div
        class="helpText"
        style=${styleMap(styles && styles.outer)}
      >
        ${helpText}<a
          href="${helpUrl}"
          target="new"
          style=${styleMap(styles && styles.url)}
        >
          <paper-icon-button
            icon="icons:help"
            alt="open docs"
            title="open docs"
            class="docs"
            style=${styleMap(styles && styles.button)}
          >
          </paper-icon-button>
        </a>
      </div>`;
    }
    if (helpText) {
      return html`<div
        class="helpText"
        style=${styleMap(styles && styles.outer)}
      >
        ${helpText}
      </div>`;
    }
    return '';
  };
}
