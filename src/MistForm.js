import { html, LitElement } from 'lit-element';
import { FieldTemplates } from './FieldTemplates.js';
import { DependencyController } from './DependencyController.js';
import * as util from './utilities.js';
import { mistFormStyles } from './styles/mistFormStyles.js';
import './customFields/mist-form-code-block.js'; // TODO: load only if necessary
// Loading schemas from multiple files is supported. For now, the subforms need unique names.
// TODO: Check json schema  if duplicate names are allowed as long as they are in different schemas
// TODO: Update to Lit 2. I haven't updated until now because Lit 2 doesn't support spreadProps, but spreadProps can be replaced
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
    this._value = {};
    this.firstRender = true; // Why do I use this? Can't I used firstUpdated?
    this.fieldTemplates = new FieldTemplates(
      this,
      this.dispatchValueChangedEvent
    );
    this.dependencyController = new DependencyController(this);
    this.jsonOpen = false;
  }

  // Runs the first time after render. Part of the lit lifecycle
  firstUpdated() {
    this.loadSpec(this.src);
    // Transform initial values is a function than can be passed as a prop in mist-form
    // TODO: add example in docs
    if (this.transformInitialValues) {
      this.initialValues = this.transformInitialValues(this.initialValues);
    }
  }

  get value() {
    let domValue = this.getValuesfromDOM(this.shadowRoot, true);
    if (JSON.stringify(domValue) !== JSON.stringify(this._value))  {
      const event = new CustomEvent('mist-form-value-changed', {
        detail: {
          value: domValue,
        },
      });
      this.dispatchEvent(event);
      this._value = domValue;
    }
    return domValue;
  }

  render() {
    if (this.data) {
      // This is used instead of firstUpdate because render runs before firstUpdated and I need to do this before render (or I won't have any fields to render)
      if (this.firstRender) {
        this.setupForm();
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
          ${this.displayCancelButton(this.data.canClose, this)}
          ${this.displaySubmitButton(this)}
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
  loadSpec(url) {
    fetch(url)
      .then(response => response.json())
      .then(async data => {
        const definitions = await this.getDefinitions(data);
        this.data = data;
        this.data.definitions = { ...data.definitions, ...definitions };
      })
      .catch(error => {
        this.dataError = error;
        console.error('Error loading data:', error);
      });
  }

  setupForm() {
    this.fields = (function (data) {
      const jsonProperties = data.properties;
      const fields = Object.keys(jsonProperties).map(key => [
        key,
        jsonProperties[key],
      ]);

      return fields.map(item => {
        const newItem = [...item];
        if (item[1].format === 'subformContainer') {
          const ref =
            item[1].properties.subform && item[1].properties.subform.$ref;
          if (ref) {
            newItem[1].properties.subform.$ref = `#${ref.split('#')[1]}`;
          }
        }
        return newItem;
      });
    })(this.data);

    const jsonDefinitions = this.data.definitions;
    this.subforms =
      jsonDefinitions &&
      Object.keys(jsonDefinitions).map(key => [key, jsonDefinitions[key]]);

    this.fields.forEach((input, index) => {
      const contents = input[1];
      this.fields[index][1] = this.setField(contents);
    });

    this.subforms.forEach((subform, index) => {
      const contents = subform[1];
      this.subforms[index][1] = this.setField(contents);
    });
  }

  submitForm() {
    const payload = this.value;

    if (Object.keys(payload).length === 0) {
      this.formError = 'Please insert some data';
    } else if (this.allFieldsValid) {
      const slot = this.shadowRoot
        .querySelector('slot[name="formRequest"]')
        .assignedNodes()[0];

      const event = new CustomEvent('mist-form-request', {
        detail: {
          payload,
        },
      });

      this.dispatchEvent(event);
      if (slot) {
        slot.dispatchEvent(event);
      }
    } else {
      this.formError = 'There was a problem with the form';
    }
  }

  getDefinitions = async data => {
    let newDefinitions = {};
    const fields = {
      ...data.properties,
      ...data.definitions,
    };
    for (const val of Object.values(fields)) {
      if (val.format === 'subformContainer') {
        const ref =
          val.properties &&
          val.properties.subform &&
          val.properties.subform.$ref;
        if (ref && !ref.startsWith('#')) {
          const src = ref.split('#')[0];
          const response = await fetch(src);
          const jsonData = await response.json();
          const defs = await this.getDefinitions(jsonData);
          newDefinitions = {
            ...newDefinitions,
            ...defs,
          };
        }
      } else if (val.properties) {
        for (const propVal of Object.values(val.properties)) {
          const ref =
            propVal.properties &&
            propVal.properties.subform &&
            propVal.properties.subform.$ref;
          if (ref && !ref.startsWith('#')) {
            const src = ref.split('#')[0];
            const response = await fetch(src);
            const jsonData = await response.json();
            const defs = await this.getDefinitions(jsonData);

            newDefinitions = {
              ...newDefinitions,
              ...defs,
            };
          }
        }
      }
    }
    return { ...data.definitions, ...newDefinitions };
  };

  getValuesfromDOM(root, byName) {
    if (!root) {
      return {};
    }
    let formValues = {};
    // If root is the root of mist-form, search in mist-form-fields instead of root
    const nodeList = this.fieldTemplates.getFirstLevelChildren(root);
    nodeList.forEach(node => {
      const inputName = node.name;
      if (node.hasAttribute('excludefrompayload')) {
        return false;
      }
      if (node.tagName === 'MIST-FORM-SUBFORM') {
        const domValues = node.getValue(byName);
        console.warn('getValuesfromDOM', node, byName, domValues);
        if (!util.valueNotEmpty(domValues)) {
          return {};
        }
        if (node.props.omitNameFromPayload && byName) {
          formValues = { ...formValues, ...domValues };
        } else {
          formValues[inputName] = domValues;
        }
      } else if (util.valueNotEmpty(node.value)) {
        // If the input has a value of undefined and wasn't required, don't add it
        const inputValue =
          node.tagName === 'MIST-FORM-MULTI-ROW'
            ? node.getValue(byName)
            : this.formatInputValue(node);
        formValues = { ...formValues, [inputName]: inputValue };
      }
      return false;
    });
    if (root.flatten) {
      formValues = Object.values(formValues).flat(1);
    }

    return formValues;
  }

  formatInputValue = node => {
    let { value } = node;
    if (!node.props) return value;
    if (node.props.type === 'integer') {
      value = parseInt(value, 10);
    } else if (node.props.type === 'number'){
      value = Number(value);
    } else if (node.props.saveAsArray) {
      if (typeof value === 'string') {
        value = value && value.split(',').map(val => val.trim());
      }
    } else if (node.props.fieldType === 'boolean') {
      // Convert an undefined boolean to false
      value = !!value;
    }
    return value;
  };

  // Initial values are values that are passed to mist-form, not default values defined in the schema
  attachInitialValue(props, parentProps) {
    const _props = { ...props };
    const fieldPath =
      parentProps && parentProps.omitNameFromPayload
        ? _props.fieldPath.split('.').splice(-2, 1).join('.')
        : _props.fieldPath;

    if (this.initialValues) {
      // Fix this
      const initialValue = util.getNestedValueFromPath(
        fieldPath,
        this.initialValues
      );
      if (initialValue !== undefined) {
        if (_props.format === 'subformContainer') {
          if (this.firstRender) {
            _props.fieldsVisible = true;
          }
        } else {
          _props.value = initialValue;
        }
      }
    }
    return _props;
  };

  displaySubmitButton = () =>
    this.fieldTemplates.button({
      label: this.data.submitButtonLabel || 'Submit',
      disabled: !this.allFieldsValid,
      classes: 'submit-btn',
      id: 'submit-btn',
      valueChangedEvent: () => {
        this.submitForm();
      },
    });

  displayCancelButton = (canClose = true) =>
    canClose
      ? this.fieldTemplates.button({
          label: 'Cancel',
          classes: 'cancel-btn',
          id: 'cancel-btn',
          valueChangedEvent: () => {
            this.dispatchEvent(new CustomEvent('mist-form-cancel'));
          },
        })
      : '';

  updateState() {
    this.allFieldsValid = this.fieldTemplates.formFieldsValid(
      this.shadowRoot
    );
    this.shadowRoot
      .querySelector('#submit-btn')
      .setDisabled(!this.allFieldsValid);
  };

  setField(contents) {
    const _contents = { ...contents };

    if (_contents.format !== 'subformContainer') {
      if (_contents.properties) {
        for (const [key, val] of Object.entries(_contents.properties)) {
          _contents.properties[key].name = val.name || key;
          _contents.properties[key].key = key;
          _contents.properties[
            key
          ].fieldType = this.fieldTemplates.getFieldType(val);

          if (Array.isArray(val.value)) {
            _contents.properties[key].value = val.value.join(', ');
          }
        }
      } else {
        _contents.fieldType = this.fieldTemplates.getFieldType(_contents);
      }
    } else {
      _contents.fieldType = 'subformContainer';
    }

    return _contents;
  }

  // Public methods
  dispatchValueChangedEvent = async ({ fieldPath }) => {
    // Logic:
    // 1. Find fields that depend on the field that just changed
    // 2. Change props for the dependant fields
    // 3. A re-render of those fields should happen automatically

    this.updateComplete.then(() => {
      // Check field validity
      this.updateState();
      // Get the field and update via the field
      this.dependencyController.updatePropertiesFromConditions(fieldPath);
    });

    const children = this.shadowRoot.querySelectorAll('*');
    await Promise.all(Array.from(children).map(c => c.updateComplete));
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
      const propertiesWithInitialValues = this.attachInitialValue(
        properties,
        parentProps
      );

      return this.fieldTemplates.getTemplate(propertiesWithInitialValues);
    });
  };
}
