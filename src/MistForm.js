import { html, css, LitElement } from 'lit';
import '@vaadin/form-layout';
import '@vaadin/button';
import './types/string.js';
import './types/number.js';
import './types/integer.js';
import './types/boolean.js';
import './types/array.js';
import './types/object.js';


export class MistForm extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        color: var(--mist-form-text-color, #000);
      }
      ${!this.subform && css`
        vaadin-form-layout {
          margin-bottom: 16px !important;
        }`}

    `;
  }

  static get properties() {
    return {
      subform: { type: Boolean, reflect: true },  // Are we a subform?
      valid: { type: Boolean, reflect: true },  // All fields validated?
      dialog: { type: Boolean, reflect: true, value: false },  // Inside a dialog?
      url: { type: String, reflect: true },  // Spec URL
      jsonSchema: { type: Object },
      uiSchema: { type: Object },
      spec: { type: Object },
      specError: { type: Object },
      formError: { type: String },
      formData: { type: Object },  // Payload to be submitted
      responsiveSteps: { type: Array }  // Form layout configuration
    };
  }

  constructor() {
    super();
    this.valid = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('field-value-changed', this._handleValueChanged);
    if (!this.responsiveSteps) {
      this.responsiveSteps = [
        // Use one column by default
        { minWidth: 0, columns: 1 },
        // Use two columns, if the layout's width exceeds 320px
        { minWidth: '320px', columns: 2 },
        // Use three columns, if the layout's width exceeds 500px
        { minWidth: '500px', columns: 3 },
      ];
    }
  }

  disconnectedCallback() {
    this.removeEventListener('field-value-changed', this._handleValueChanged);
    super.disconnectedCallback();
  }


  updated(changedProperties) {
    console.log(`updated(). changedProps: `, changedProperties);

    if (changedProperties.has('url')) {
      if (this.url) {
        this.loadSpec(this.url);
      }  
    }
    
    if (changedProperties.has('jsonSchema')) {
      // const oldValue = changedProperties.get("jsonSchema");
      const newValue = this.jsonSchema;
      this.spec = JSON.parse(JSON.stringify(newValue));
      this.validate();
    }
    
    if (changedProperties.has('formData')) {
      this.shadowRoot.querySelectorAll('.mist-form-field').forEach(el => {
        if (this.formData) {
          el.formData = this.formData[el.id];
        }
      });
      this.validate();
    }
  }

  render() {
    if (this.jsonSchema) {
      let formFields;
      if (this.jsonSchema.type === 'object') {
        formFields = this.renderObject(this.jsonSchema);
      } else {
        formFields = this.renderField({jsonSchema: this.jsonSchema, uiSchema: this.uiSchema, formData: this.formData});
      }

      const footer = this.subform ? html`` : html`
        <vaadin-horizontal-layout theme="spacing">
            ${this.dialog && this.displayCancelButton(this.jsonSchema.canClose, this)}
            ${this.displaySubmitButton(this)}
            ${!this.dialog && this.displayCancelButton(this.jsonSchema.canClose, this) || ''}
        </vaadin-horizontal-layout>
        <div class="formError">${this.formError}</div>
        <slot name="formRequest"></slot>
      `;
      const title = this.jsonSchema.title ? html`<h1>${this.jsonSchema.title}</h1>` : html``;
      const description = this.jsonSchema.description ? html`<p>${this.jsonSchema.description}</p>` : html``
      return html`
        <div class="form">
          ${title}
          ${description}
          <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}">
            <span id="mist-form-fields">${formFields}</span>
          </vaadin-form-layout>
          ${footer}
        </div>
      `;
    }
    if (this.specError) {
      return html`We couldn't load the form. Please try again`;
    }
    return html`<paper-spinner active></paper-spinner>`;
  }

  renderObject(obj) {
    let properties = this.computeProperties(obj);
    Object.keys(this.formData || {}).forEach(function(k) {
      if (properties[k] === undefined && this.formData[k]) {
        delete this.formData[k];
      }
      if (properties[k] && properties[k].enum && properties[k].enum.indexOf(this.formData[k]) == -1) {
        this.formData[k] = '';
      }
    }.bind(this))
    return this.renderFields(properties, obj.required);
  }

  computeProperties(obj) {
    let properties = {...obj.properties};
    if (obj.allOf) {
      obj.allOf.forEach(function(i) {
        properties = {...properties, ...this.computeProperties(i)};
      }.bind(this));
    }
    if (obj.if) {
      let satisfied = true;
      Object.keys(obj.if.properties).forEach(k => {
        if (obj.if.properties[k].const && obj.if.properties[k].const !== this.formData[k]) {
         satisfied = false;
        }
      });
      if (satisfied) {
        properties = {...properties, ...this.jsonSchema.properties, ...obj.then.properties};
      } else {
        properties = {...properties, ...this.jsonSchema.properties};
      }
    }
    return properties;
  }

  renderFields(properties, required) {
    return Object.keys(properties).map(propertyId => {
      const defaultValue = properties[propertyId].value || properties[propertyId].default;
      const fieldSpec = {
        jsonSchema: this.resolveDefinitions(properties[propertyId]) || {},
        uiSchema: this.uiSchema && this.uiSchema[propertyId] || {},
        formData: this.formData && this.formData[propertyId] || defaultValue
      };
      fieldSpec.id = propertyId;
      if (
        required &&
        required.findIndex(x => x === propertyId) > -1
      ) {
        fieldSpec.jsonSchema.required = true;
      }
      if (this.formData && this.formData[propertyId] !== undefined) {
        fieldSpec.formData = this.formData[propertyId];
      }
      return this.renderField(fieldSpec);
    });
  }

  resolveDefinitions(propertySchema) {
    if (propertySchema && propertySchema.$ref) {
      const [addr, path] = propertySchema.$ref.split('#');
            const [, section, ref] = path.split('/');
      if (addr) {
        // TODO
      }
      let ret = this.spec[section] ? {
        ...propertySchema, ...this.spec[section][ref]
      } : propertySchema;
      ret[section] = {}
      ret[section][ref] = this.spec[section][ref]
      return ret;
    }
    return propertySchema;
  }

  renderField(fieldSpec) {
    if (!fieldSpec.jsonSchema) return '';
    switch(fieldSpec.jsonSchema.type) {
      case "string":
        return html`<mist-form-string-field id="${fieldSpec.id}" class="mist-form-field" .spec=${fieldSpec}></mist-form-string-field>`;
      case "number":
        return html`<mist-form-number-field id="${fieldSpec.id}" class="mist-form-field" .spec=${fieldSpec}></mist-form-number-field>`;
      case "integer":
        return html`<mist-form-integer-field id="${fieldSpec.id}" class="mist-form-field" .spec=${fieldSpec}></mist-form-integer-field>`;
      case "object":
        return html`<mist-form-object-field id="${fieldSpec.id}" class="mist-form-field" .spec=${fieldSpec}></mist-form-object-field>`;
      case "array":
        return html`<mist-form-array-field id="${fieldSpec.id}" class="mist-form-field" .spec=${fieldSpec}></mist-form-array-field>`;
      case "boolean":
        return html`<mist-form-boolean-field id="${fieldSpec.id}" class="mist-form-field" .spec=${fieldSpec}></mist-form-boolean-field>`;
      case "null":
        return html`<mist-form-null-field id="${fieldSpec.id}" class="mist-form-field" .spec=${fieldSpec}></mist-form-null-field>`;
      default:
        if (fieldSpec.jsonSchema.length)
          return html`<mist-form-array-field id="${fieldSpec.id}" class="mist-form-field" .spec=${fieldSpec}></mist-form-array-field>`;
        return html`<mist-form-string-field id="${fieldSpec.id}" class="mist-form-field" .spec=${fieldSpec}></mist-form-string-field>`;
        // return html`Invalid field type: ${fieldSpec.type}`
    }
  }

  displaySubmitButton() {
    return html`
      <vaadin-button
        class="submit-btn"
        theme="primary"
        ?disabled=${!this.valid}
        @click="${this.submitForm}">
        ${this.jsonSchema.submitButtonLabel || "Submit"}
      </vaadin-button>`
  }

  displayCancelButton(canClose = true) {
    if (!canClose) return html``;
    return html`
      <vaadin-button
        class="cancel-btn"
        @click="${() => this.dispatchEvent(new CustomEvent('mist-form-cancel'))}">
        ${this.jsonSchema.cancelButtonLabel || "Cancel"}
      </vaadin-button>`;
  }

  loadSpec(url) {
    fetch(url)
      .then(response => response.json())
      .then(async spec => {
        this.jsonSchema = spec.jsonSchema || spec;
        this.uiSchema = spec.uiSchema || {};
        this.formData = spec.formData || {};
      })
      .catch(error => {
        this.specError = error;
        console.error('Error loading spec:', error);
      });
  }

  submitForm() {
    const payload = this.formData;
    if (Object.keys(payload).length === 0) {
      this.formError = 'Please insert some data';
    } else if (this.valid) {
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

  _handleValueChanged(e) {
    console.debug('_handleValueChanged',e ,this);
    e.stopPropagation();
    const eventName = `${this.subform ? 'sub' : ''  }form-data-changed`;
    const formDataChangedEvent = new CustomEvent(eventName, {
      detail: {
        id: this.jsonSchema.id
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(formDataChangedEvent);
  }

  validate() {
    let valid = true;
    this.shadowRoot.querySelectorAll('#mist-form-fields > *').forEach((field) => {
      valid = valid && field.validate();
    });
    console.debug("form validation", valid);
    this.valid = valid;
    return valid;
  }

  get domValue() {
    if (this.jsonSchema.type === 'array') {
      let ret;
      this.shadowRoot.querySelectorAll('.mist-form-field').forEach(el => {
        ret = el.domValue;
      });
      return ret;
    }
    const ret = {};
    this.shadowRoot.querySelectorAll('.mist-form-field').forEach(el => {
      ret[el.id] = el.domValue;
    })
    return ret;
  }

}
