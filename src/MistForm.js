import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';
import { DependencyController } from './DependencyController.js';
import * as util from './utilities.js';
import { MistFormHelpers } from './mistFormHelpers.js';
import { mistFormStyles } from './styles/mistFormStyles.js';

export class MistForm extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      dynamicFieldData: { type: Object },
      conditionalData: { type: Object },
      data: { type: Object },
      dataError: { type: Object },
      formError: { type: String },
      allFieldsValid: { type: Boolean }, // Used to enable/disable the submit button,
      initialValues: { type: Object },
      subformOpenStates: { type: Object },
    };
  }

  static get styles() {
    return mistFormStyles;
  }

  // Lifecycle Methods
  constructor() {
    super();
    this.allFieldsValid = true;
    this.dynamicFieldData = {};
    this.conditionalData = {};
    this.value = {};
    this.subformOpenStates = {};
    this.customComponents = {};
    this.firstRender = true;
    this.fieldTemplates = new FieldTemplates(
      this,
      this.dispatchValueChangedEvent
    );
    this.dependencyController = new DependencyController(this);
    this.mistFormHelpers = new MistFormHelpers(this, this.fieldTemplates);
    this.getValuesfromDOM = this.mistFormHelpers.getValuesfromDOM;
  }

  firstUpdated() {
    this.getJSON(this.src);
    if (this.transformInitialValues) {
      this.initialValues = this.transformInitialValues(this.initialValues);
    }

    this.fieldTemplates.setupCustomComponents();
  }

  render() {
    if (this.data) {
      // The data here will come validated so no checks required
      const inputs = this.mistFormHelpers.getInputs(this.data);
      const subforms = this.mistFormHelpers.getSubforms(this.data);
      const formFields = this.renderInputs(inputs, subforms);

      if (this.firstRender) {
        this.firstRender = false;
      }

      return html`
        <div class="mist-header">${this.data.label}</div>
        ${formFields}

        <div class="buttons">
          ${this.fieldTemplates.displayCancelButton(this.data.canClose, this)}
          ${this.fieldTemplates.displaySubmitButton(this)}
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
      .then(data => {
        this.data = data;
      })
      .catch(error => {
        this.dataError = error;
        console.error('Error loading data:', error);
      });
  }

  updateDynamicData(fieldPath) {
    if (this.dynamicDataNamespace && this.dynamicDataNamespace.dynamicData) {
      // Update dynamic data that depends on dependencies
      for (const [key, val] of Object.entries(
        this.dynamicDataNamespace.dynamicData
      )) {
        if (val.dependencies && val.dependencies.includes(fieldPath)) {
          this.loadDynamicData(key, val.target);
        }
      }
    }
  }

  updateCustomValues(fieldPath, value) {
    this.customValues[fieldPath] = value;
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

  // Public methods

  setSubformState(fieldPath, state) {
    this.subformOpenStates[fieldPath] = state;
  }

  getSubformState(fieldPath) {
    return this.subformOpenStates[fieldPath];
  }

  dispatchValueChangedEvent = async e => {
    // Logic:
    // 1. Find fields that depend on the field that just changed
    // 2. Change props for the dependant fields
    // 3. A re-render of those fields should happen automatically
    // 4. TODO: See how to handle multirows
    // For multirows, maybe it will be better if each row has a field path with a number corresponding to index
    //   this.shadowRoot.querySelector('[fieldpath="cost.max_team_run_rate"]').value = "10204"
    // TODO: Debounce the event, especially when it comes from text input fields
    // TODO: I should check if this works for subform fields
    this.updateComplete.then(() => {
      const el = e.path[0];

      if (el.getRootNode().host.tagName === 'MULTI-ROW') {
        // el.getRootNode().host.requestUpdate();
      }

      // Check field validity
      this.MistFormHelpers.updateState();
      // Get the field and update via the field
      //this.updateDynamicData(el.fieldPath);

      this.dependencyController.updatePropertiesFromConditions(el.fieldPath);
    });

    const children = this.shadowRoot.querySelectorAll('*');
    await Promise.all(Array.from(children).map(c => c.updateComplete));
    this.value = this.getValuesfromDOM(this.shadowRoot);

    const event = new CustomEvent('mist-form-value-changed', {
      detail: {
        value: this.value,
      },
    });
    this.dispatchEvent(event);
  };

  renderInputs(inputs, subforms, path) {
    // Ignore subform, its data was already passed to subform container
    return inputs.map(input => {
      let [name, properties] = input;
      // Subforms just contain data, they shouldn't be rendered by themselves.
      // They should be rendered in subform containers
      const fieldName =
        properties.format === 'subformContainer' ? properties.name : name;
      properties.name = fieldName;
      properties.fieldPath = path ? [path, name].join('.') : fieldName;
      // If the field is a subform container, render its respective template, and hide/show fields
      if (properties.format === 'subformContainer') {
        const subForm = util.getSubformFromRef(
          subforms,
          properties.properties.subform.$ref
        );
        let parentPath;
        if (properties.omitTitle) {
          parentPath = path || '';
        } else {
          parentPath = path
            ? [path, properties.name].join('.')
            : properties.name;
        }

        const subFormInputs = Object.keys(subForm.properties).map(key => [
          key,
          {
            ...subForm.properties[key],
            hidden: properties.hidden || subForm.properties[key].hidden,
          },
        ]);

        properties.inputs = this.renderInputs(
          subFormInputs,
          subforms,
          parentPath
        );
      } else if (properties.format === 'multiRow') {
        const subForm = util.getSubformFromRef(
          subforms,
          properties.properties.subform.$ref
        );
        const rowProps = subForm.properties;
        properties.rowProps = {};
        for (const [key, val] of Object.entries(rowProps)) {
          properties.rowProps[key] = {
            name: key,
            ...val, // If user gave a separate name it will be overwritten here
            fieldPath: `${properties.fieldPath}.${val.name || key}`,
          };
        }
      }
      properties = this.mistFormHelpers.attachInitialValue(properties);
      if (this.firstRender) {
        // for (const [key, val] of Object.entries(properties.deps)) {
        this.dependencyController.updateConditionMap(properties);

        // this.updateConditionMap(key, val, fieldPath);

        // const formValues = this.getValuesfromDOM(this.shadowRoot);
        // const { dependencies } = this.dynamicDataNamespace.conditionals[val];
        // const dependencyValues = util.getDependencyValues(
        //   formValues,
        //   dependencies
        // );
        // const newData = this.dynamicDataNamespace.conditionals[val].func(
        //   dependencyValues
        // );

        // if (newData !== undefined) {
        //   properties[key] = newData;
        // }

        // }
      }
      return this.fieldTemplates.getTemplate(properties);
    });
  }
}
