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
      subform: { type: Boolean, reflect: true },
      valid: { type: Boolean, reflect: true },
      dialog: { type: Boolean, reflect: true, value: false },
      url: { type: String, reflect: true },
      jsonSchema: { type: Object },
      uiSchema: { type: Object },
      spec: { type: Object },
      specError: { type: Object },
      formError: { type: String },
      formData: { type: Object },
    };
  }

  constructor() {
    super();
    this.valid = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('field-value-changed', this._handleValueChanged);
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
      // get the old value here
      // const oldValue = changedProperties.get("jsonSchema");
      // new value is
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
    if (this.spec) {
      const formFields = this.renderFields(this.spec);

      const footer = this.subform ? html`` : html`
        <vaadin-horizontal-layout theme="spacing">
            ${this.dialog && this.displayCancelButton(this.spec.canClose, this)}
            ${this.displaySubmitButton(this)}
            ${!this.dialog && this.displayCancelButton(this.spec.canClose, this) || ''}
        </vaadin-horizontal-layout>
        <div class="formError">${this.formError}</div>
        <slot name="formRequest"></slot>
      `;
      const title = this.spec.title ? html`<h1>${this.spec.title}</h1>` : html``;
      const description = this.spec.description ? html`<p>${this.spec.description}</p>` : html``      
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

  renderFields(spec) {
    let properties = spec.properties || {};
    return Object.keys(properties).map(propertyId => {
      const defaultValue = spec.properties[propertyId].value || spec.properties[propertyId].default;
      const fieldSpec = {
        jsonSchema: this.resolveDefinitions(spec.properties[propertyId]) || {},
        uiSchema: this.uiSchema && this.uiSchema[propertyId] || {},
        formData: this.formData && this.formData[propertyId] || defaultValue
      };
      fieldSpec.id = propertyId;
      if (
        spec.required &&
        spec.required.findIndex(x => x === propertyId) > -1
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
    if (propertySchema && propertySchema["$ref"]) {
      let [addr, path] = propertySchema['$ref'].split('#'),
          [_, section, ref] = path.split('/');
      if (addr) {
        debugger; // TODO
      }
      return {
        ...propertySchema, ...this.spec[section][ref]
      }
    }
    // if (propertySchema && propertySchema.length) {
    //   debugger;
    // }
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
        return html`Invalid field type: ${fieldSpec.type}`
    }
  }

  displaySubmitButton() {
    return html`
      <vaadin-button
        class="submit-btn"
        theme="primary"
        ?disabled=${!this.valid}
        @click="${this.submitForm}">
        ${this.spec.submitButtonLabel || "Submit"}
      </vaadin-button>`
  }

  displayCancelButton(canClose = true) {
    if (!canClose) return html``;
    return html`
      <vaadin-button
        class="cancel-btn"
        @click="${() => this.dispatchEvent(new CustomEvent('mist-form-cancel'))}">
        ${this.spec.cancelButtonLabel || "Cancel"}
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
    const eventName = (this.subform ? 'sub' : '') + 'form-data-changed';
    let formDataChangedEvent = new CustomEvent(eventName, {
      detail: {
        id: this.spec.id
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(formDataChangedEvent);
  }

  responsiveSteps = [
    // Use one column by default
    { minWidth: 0, columns: 1 },
    // Use two columns, if the layout's width exceeds 320px
    { minWidth: '320px', columns: 2 },
    // Use three columns, if the layout's width exceeds 500px
    { minWidth: '500px', columns: 3 },
  ];

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
    let ret = {};
    this.shadowRoot.querySelectorAll('.mist-form-field').forEach(el => {
      ret[el.id] = el.domValue;
    })
    return ret;
  }

}
