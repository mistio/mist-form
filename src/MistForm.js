import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';
import { DependencyController } from './DependencyController.js';
import * as util from './utilities.js';
import { MistFormHelpers } from './mistFormHelpers.js';
import { mistFormStyles } from './styles/mistFormStyles.js';
import './customFields/mist-form-code-block.js';
// Loading schemas from multiple files is supported. For now, the subforms need unique names.
// TODO: Check json schema  if duplicate names are allowed as long as they are in different schemas
// TODO: Updae to Lit 2. I haven't updated until now because Lit 2 doesn't support spreadProps, but spreadProps can be replaced
// Idea for the future: Dependencies can be handled with a Finite State Machine
export class MistForm extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      data: { type: Object },
      dataError: { type: Object },
      formError: { type: String },
      initialValues: { type: Object },
      jsonOpen: { type: Boolean },
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
    this.firstRender = true; // Why do I use this? Can't I used firstUpdated?
    this.fieldTemplates = new FieldTemplates(
      this,
      this.dispatchValueChangedEvent
    );
    this.dependencyController = new DependencyController(this);
    this.mistFormHelpers = new MistFormHelpers(this, this.fieldTemplates);
    this.getValuesfromDOM = this.mistFormHelpers.getValuesfromDOM.bind(
      this.mistFormHelpers
    );
    this.jsonOpen = false;
  }

  // Runs the first time after render. Part of the lit lifecycle
  firstUpdated() {
    this.getJSON(this.src);
    // Transform initial values is a function than can be passed as a prop in mist-form
    // TODO: add example in docs
    if (this.transformInitialValues) {
      this.initialValues = this.transformInitialValues(this.initialValues);
    }
  }

  render() {
    if (this.data) {
      // This is used instead of firstUpdate because render runs before firstUpdated and I need to do this before render (or I won't have any fields to render)
      if (this.firstRender) {
        this.setupFields();
      }
      // The data here will come validated so no checks required

      const formFields = this.renderFields(this.fields);

      if (this.firstRender) {
        this.firstRender = false;
      }

      return html`
        <div class="mist-header">${this.data.label}</div>
        ${this.data.showJSON
          ? html`<paper-toggle-button
              .name="mist-form-json-toggle"
              excludeFromPayload
              .checked="${this.jsonOpen}"
              @checked-changed="${e => {
                this.jsonOpen = e.detail.value;
              }}}"
              >Show Json</paper-toggle-button
            >`
          : ''}
        <mist-form-code-block
          id="json-view"
          excludeFromPayload
          .value=${this.value}
          .isOpen=${this.jsonOpen}
        >
        </mist-form-code-block>

        <span
          id="mist-form-fields"
          style="${this.jsonOpen ? 'visibility: hidden; height: 0' : ''}"
          >${formFields}</span
        >

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
      .then(async data => {
        const definitions = await util.getDefinitions(data);
        this.data = data;
        this.data.definitions = { ...data.definitions, ...definitions };
      })
      .catch(error => {
        this.dataError = error;
        console.error('Error loading data:', error);
      });
  }

  // Maybe it would be better to have InputElements instead of just inputs. Or maybe this function could be named setupForm
  setupFields() {
    this.fields = util.getFields(this.data);
    this.subforms = util.getSubforms(this.data);
    this.fields.forEach((input, index) => {
      const contents = input[1];
      this.fields[index][1] = this.mistFormHelpers.setField(contents);
    });

    this.subforms.forEach((subform, index) => {
      const contents = subform[1];
      this.subforms[index][1] = this.mistFormHelpers.setField(contents);
    });
  }

  submitForm() {
    const params = this.getValuesfromDOM(this.shadowRoot, true);

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
    this.value = this.getValuesfromDOM(this.shadowRoot, true);
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

  renderFields(fields, path, parentProps) {
    // Ignore subform, its data was already passed to subform container
    return fields.map(field => {
      const [key] = field;
      const properties = field[1];
      properties.fieldPath = util.getFieldPath(field, path);
      properties.key = key;
      if (properties.format === 'multiRow') {
        const subForm = util.getSubformFromRef(
          this.subforms,
          properties.properties.subform.$ref
        );
        // rowProps are the props for each row
        const rowProps = subForm.properties;
        properties.rowProps = {};
        for (const [rowPropKey, val] of Object.entries(rowProps)) {
          properties.rowProps[rowPropKey] = {
            ...val,
            key,
            fieldPath: `${properties.fieldPath}.${val.name || rowPropKey}`,
          };
        }
      }
      // Initial values are not default values that can be passed in the json.
      // These are usually loaded when opening form not hardcoded
      const propertiesWithInitialValues = this.mistFormHelpers.attachInitialValue(
        properties,
        parentProps
      );

      return this.fieldTemplates.getTemplate(propertiesWithInitialValues);
    });
  }
}
