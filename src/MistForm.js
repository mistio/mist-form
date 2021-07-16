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
      data: { type: Object },
      dataError: { type: Object },
      formError: { type: String },
      allFieldsValid: { type: Boolean }, // Used to enable/disable the submit button,
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

    // this.fieldTemplates.setupCustomComponents();
  }

  getFieldType(val) {
    if (this.fieldTemplates.defaultFieldTypes.includes(val.format)) {
      return val.format;
    }
    if (val.type === 'string') {
      if (!val.format || val.format === 'number') {
        return 'input';
      }
      return 'custom';
    }
    if (!val.format) {
      return val.type;
    }
    return 'custom';
  }

  setInput(contents) {
    const _contents = { ...contents };
    if (_contents.format !== 'subformContainer') {
      for (const [key, val] of Object.entries(_contents.properties)) {
        if (!val.name) {
          _contents.properties[key].name = key;
        }

        _contents.properties[key].fieldType = this.getFieldType(val);

        if (Array.isArray(val.value)) {
          _contents.properties[key].value = val.value.join(', ');
        }
      }
    } else {
      _contents.fieldType = 'subformContainer';
    }

    return _contents;
  }

  setupInputs() {
    this.inputs = util.getInputs(this.data);
    this.subforms = util.getSubforms(this.data);

    this.inputs.forEach((input, index) => {
      const contents = input[1];
      this.inputs[index][1] = this.setInput(contents);
    });

    this.subforms.forEach((input, index) => {
      const contents = input[1];
      this.subforms[index][1] = this.setInput(contents);
    });
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

  // updateDynamicData(fieldPath) {
  //   if (this.dynamicDataNamespace && this.dynamicDataNamespace.dynamicData) {
  //     // Update dynamic data that depends on dependencies
  //     for (const [key, val] of Object.entries(
  //       this.dynamicDataNamespace.dynamicData
  //     )) {
  //       if (val.dependencies && val.dependencies.includes(fieldPath)) {
  //         this.loadDynamicData(key, val.target);
  //       }
  //     }
  //   }
  // }

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

  dispatchValueChangedEvent = async element => {
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
      if (element.tagName === 'MULTI-ROW') {
        // el.getRootNode().host.requestUpdate();
      }

      // Check field validity
      this.mistFormHelpers.updateState();
      // Get the field and update via the field
      // this.updateDynamicData(el.fieldPath);

      this.dependencyController.updatePropertiesFromConditions(
        element.fieldPath
      );
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

      // If the field is a subform container, render its respective template, and hide/show fields
      if (properties.format === 'subformContainer') {
        // const subForm = util.getSubformFromRef(
        //   subforms,
        //   properties.properties.subform.$ref
        // );
        // let parentPath;
        // if (properties.omitTitle) {
        //   parentPath = path || '';
        // } else {
        //   parentPath = path
        //     ? [path, properties.name].join('.')
        //     : properties.name;
        // }
        // const subFormInputs = Object.keys(subForm.properties).map(key => [
        //   key,
        //   {
        //     ...subForm.properties[key],
        //     hidden: properties.hidden || subForm.properties[key].hidden,
        //   },
        // ]);
        // properties.inputs = this.renderInputs(
        //   subFormInputs,
        //   subforms,
        //   parentPath
        // );
      } else if (properties.format === 'multiRow') {
        const subForm = util.getSubformFromRef(
          this.subforms,
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
      const propertiesWithInitialValues = this.mistFormHelpers.attachInitialValue(
        properties
      );
      return this.fieldTemplates.getTemplate(propertiesWithInitialValues);
    });
  }
}
