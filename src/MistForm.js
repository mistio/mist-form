import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';
import { DependencyController } from './DependencyController.js';
import * as util from './utilities.js';
import { MistFormHelpers } from './mistFormHelpers.js';
import { mistFormStyles } from './styles/mistFormStyles.js';
// Loading schemas from multiple files is supported. For know, the subforms need unique names.
// TODO: Check json schema  if duplicate names are allowed as long as they are in different schemas
export class MistForm extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      data: { type: Object },
      dataError: { type: Object },
      formError: { type: String },
      initialValues: { type: Object },
    };
  }

  static get styles() {
    return mistFormStyles;
  }

  // Lifecycle Methods
  constructor() {
    super();
    this.allFieldsValid = true;
    this.value = {};
    this.firstRender = true;
    this.fieldTemplates = new FieldTemplates(
      this,
      this.dispatchValueChangedEvent
    );
    this.dependencyController = new DependencyController(this);
    this.mistFormHelpers = new MistFormHelpers(this, this.fieldTemplates);
    this.getValuesfromDOM = this.mistFormHelpers.getValuesfromDOM.bind(
      this.mistFormHelpers
    );
  }

  firstUpdated() {
    this.getJSON(this.src);
    if (this.transformInitialValues) {
      this.initialValues = this.transformInitialValues(this.initialValues);
    }
  }

  render() {
    if (this.data) {
      if (this.firstRender) {
        this.setupInputs();
      }
      // The data here will come validated so no checks required

      const formFields = this.renderInputs(this.inputs);

      if (this.firstRender) {
        this.firstRender = false;
      }

      return html`
        <div class="mist-header">${this.data.label}</div>
        ${formFields}

        <div class="buttons">
          ${this.mistFormHelpers.displayCancelButton(this.data.canClose, this)}
          ${this.mistFormHelpers.displaySubmitButton(this)}
        </div>
        <div class="formError">${this.formError}</div>
        <slot name="formRequest"></slot>
      `;
    }
    if (this.dataError) {
      return html`We couldn't load the form. Please try again`;
    }
    return this.fieldTemplates.spinner;
  }

  // "Private" Methods
  getJSON(url) {
    fetch(url)
      .then(response => response.json())
      .then(async (data) => {
        const definitions = await util.getDefinitions(data);
        this.data = data;
        this.data.definitions = {...data.definitions, ...definitions};
      })
      .catch(error => {
        this.dataError = error;
        console.error('Error loading data:', error);
      });
  }

  setupInputs() {
    this.inputs = util.getInputs(this.data);
    this.subforms = util.getSubforms(this.data);
    this.inputs.forEach((input, index) => {
      const contents = input[1];
      this.inputs[index][1] = this.mistFormHelpers.setInput(contents);
    });

    this.subforms.forEach((subform, index) => {
      const contents = subform[1];
      this.subforms[index][1] = this.mistFormHelpers.setInput(contents);
    });
  }

  submitForm() {
    const params = this.getValuesfromDOM(this.shadowRoot);

    if (Object.keys(params).length === 0) {
      this.formError = 'Please insert some data';
    } else if (this.allFieldsValid) {
      const slot = this.shadowRoot
        .querySelector('slot[name="formRequest"]')
        .assignedNodes()[0];

      const event = new CustomEvent('mist-form-request', {
        detail: {
          params,
        },
      });
      this.value = params;

      this.dispatchEvent(event);
      if (slot) {
        slot.dispatchEvent(event);
      }
    } else {
      this.formError = 'There was a problem with the form';
    }
  }

  updateMistFormValue() {
    this.value = this.getValuesfromDOM(this.shadowRoot);
    const event = new CustomEvent('mist-form-value-changed', {
      detail: {
        value: this.value,
      },
    });
    this.dispatchEvent(event);
  }
  // Public methods

  dispatchValueChangedEvent = async ({ fieldPath }) => {
    // Logic:
    // 1. Find fields that depend on the field that just changed
    // 2. Change props for the dependant fields
    // 3. A re-render of those fields should happen automatically

    this.updateComplete.then(() => {
      // Check field validity
      this.mistFormHelpers.updateState();
      // Get the field and update via the field
      this.dependencyController.updatePropertiesFromConditions(fieldPath);
    });

    const children = this.shadowRoot.querySelectorAll('*');
    await Promise.all(Array.from(children).map(c => c.updateComplete));
    this.updateMistFormValue();
  };

  renderInputs(inputs, path) {
    // Ignore subform, its data was already passed to subform container
    return inputs.map(input => {
      const properties = input[1];
      properties.fieldPath = util.getFieldPath(input, path);

      if (properties.format === 'multiRow') {
        const subForm = util.getSubformFromRef(
          this.subforms,
          properties.properties.subform.$ref
        );
        const rowProps = subForm.properties;
        properties.rowProps = {};
        for (const [key, val] of Object.entries(rowProps)) {
          properties.rowProps[key] = {
            ...val,
            fieldPath: `${properties.fieldPath}.${val.name || key}`,
          };
        }
      }
      const propertiesWithInitialValues = this.mistFormHelpers.attachInitialValue(
        properties
      );
      return this.fieldTemplates.getTemplate(propertiesWithInitialValues);
    });
  }
}
