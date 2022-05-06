import { html, css, LitElement } from 'lit';
import '@vaadin/form-layout';
import '@vaadin/button';
import '@polymer/paper-toggle-button';
import { debouncer } from './utils.js';
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
      ${!this.subform &&
      css`
        vaadin-form-layout {
          margin-bottom: 16px !important;
        }
      `}
      paper-toggle-button {
        float: left;
      }
      .formError {
        color: #d60020;
        display: inline;
        margin-left: 16px;
      }
      .lds-ripple {
        display: inline-block;
        position: relative;
        width: 80px;
        height: 80px;
      }
      .lds-ripple div {
        position: absolute;
        border: 4px solid #555;
        opacity: 1;
        border-radius: 50%;
        animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
      }
      .lds-ripple div:nth-child(2) {
        animation-delay: -0.5s;
      }
      @keyframes lds-ripple {
        0% {
          top: 36px;
          left: 36px;
          width: 0;
          height: 0;
          opacity: 1;
        }
        100% {
          top: 0px;
          left: 0px;
          width: 72px;
          height: 72px;
          opacity: 0;
        }
      }
    `;
  }

  static get properties() {
    return {
      url: { type: String, reflect: true }, // Spec URL
      jsonSchema: { type: Object }, // JSONSchema spec
      uiSchema: { type: Object }, // UISchema spec
      action: { type: String, reflect: true }, // Where to submit data?
      method: { type: String, reflect: true }, // Request method
      subform: { type: Boolean, reflect: true }, // Are we a subform?
      toggles: { type: Boolean, reflect: true }, // Do we have a toggle button?
      enabled: { type: Boolean, reflect: true },
      valid: { type: Boolean, reflect: true }, // All fields validated?
      dialog: { type: Boolean, reflect: true }, // Inside a dialog?
      submitting: { type: Boolean, reflect: true }, // Form currently submitting
      loading: { type: Object }, // Mapping of widgets currently loading
      specError: { type: Object },
      formError: { type: String },
      formData: { type: Object }, // Payload to be submitted
      responsiveSteps: { type: Array }, // Form layout configuration
      errors: { type: Array },
    };
  }

  get payload() {
    const ret = {};
    const properties = this.computeProperties(this.jsonSchema);
    Object.keys(properties).forEach(k => {
      if (properties[k] !== undefined && !properties[k].omit) {
        ret[k] = this.shadowRoot.querySelector(`.mist-form-field#${k}`).payload;
      }
    });
    return ret;
  }

  constructor() {
    super();
    this.valid = true;
    this.enabled = true;
    this.subform = false;
    this.dialog = false;
    this.toggles = false;
    this.submitting = false;
    this.loading = {};
    this.method = 'POST';
    this.errors = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'field-value-changed',
      debouncer(this._handleValueChanged, 200)
    );
    this.addEventListener(
      'validation-changed',
      debouncer(this._validationChanged, 200)
    );
    this.addEventListener('loading', this._loadingStarted);
    this.addEventListener('loaded', this._loadingFinished);
    if (!this.responsiveSteps) {
      this.responsiveSteps = [
        // Use one column by default
        { minWidth: '0', columns: 1, labelsPosition: 'top' },
        // Use two columns, if the layout's width exceeds 320px
        { minWidth: '320px', columns: 2, labelsPosition: 'top' },
        // Use three columns, if the layout's width exceeds 500px
        { minWidth: '500px', columns: 3, labelsPosition: 'top' },
      ];
    }
  }

  disconnectedCallback() {
    this.removeEventListener('field-value-changed', this._handleValueChanged);
    this.removeEventListener('validation-changed', this._validationChanged);
    this.removeEventListener('loading', this._loadingStarted);
    this.removeEventListener('loaded', this._loadingFinished);
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
      this.submitting = false;
      this.validate();
      this.shadowRoot.querySelectorAll('.mist-form-field').forEach(el => {
        el.importWidgets();
      });
    }

    if (changedProperties.has('formData') && this.formData !== undefined) {
      if (
        JSON.stringify(this.formData) !==
        JSON.stringify(changedProperties.get('formData'))
      ) {
        this.shadowRoot.querySelectorAll('.mist-form-field').forEach(el => {
          if (
            this.formData &&
            typeof this.formData === 'object' &&
            el.enabled
          ) {
            // eslint-disable-next-line no-param-reassign
            el.formData = this.formData[el.id];
          }
        });
        this.validate();
      }
    }
  }

  render() {
    let loader = '';
    if (Object.keys(this.loading).length > 0) {
      loader = html`
        <div class="loading">
          <div class="lds-ripple">
            <div></div>
            <div></div>
          </div>
        </div>
      `;
    }
    if (this.uiSchema && this.uiSchema['ui:enabled'] === false) {
      this.enabled = false;
    }
    if (this.specError) {
      return html`Failed to load the form spec: ${this.specError}`;
    }
    if (this.jsonSchema) {
      let formFields;
      if (this.jsonSchema.type === 'object') {
        formFields = this.renderObject(
          this.jsonSchema,
          this.uiSchema,
          this.formData
        );
      } else {
        formFields = this.renderField({
          jsonSchema: this.jsonSchema,
          uiSchema: this.uiSchema,
          formData: this.formData,
        });
      }

      const footer = this.subform
        ? html``
        : html`
            <vaadin-horizontal-layout theme="spacing">
              ${(this.dialog && this.displayCancelButton()) || ''}
              ${this.displaySubmitButton(this)}
              ${(!this.dialog && this.displayCancelButton()) || ''}
            </vaadin-horizontal-layout>
            <div class="formError">${this.formError}</div>
          `;
      const toggler = this.toggles
        ? html`<paper-toggle-button
            ?checked=${this.enabled}
            @checked-changed=${this._toggleChanged}
          ></paper-toggle-button>`
        : html``;
      const title = this.jsonSchema.title
        ? html`<h1>${toggler}${this.jsonSchema.title}</h1>`
        : html`${toggler}`;
      const description = this.jsonSchema.description
        ? html`<p>${this.jsonSchema.description}</p>`
        : html``;
      return html`
        <div class="form">
          ${title} ${description} ${loader}
          <vaadin-form-layout
            .responsiveSteps="${this.responsiveSteps}"
            ?hidden=${!this.enabled}
          >
            <div id="mist-form-fields">${formFields}</div>
          </vaadin-form-layout>
          ${footer}
        </div>
      `;
    }
    return html`<paper-spinner active></paper-spinner>`;
  }

  renderObject(obj, uiSchema, formData) {
    const properties = this.computeProperties(obj);
    Object.keys(formData || {}).forEach(k => {
      if (typeof formData === 'object') {
        if (properties[k] === undefined && formData[k]) {
          // eslint-disable-next-line no-param-reassign
          delete formData[k];
        }
        if (
          properties[k] &&
          properties[k].enum &&
          properties[k].enum.indexOf(formData[k]) === -1
        ) {
          // eslint-disable-next-line no-param-reassign
          formData[k] = '';
        }
      }
    });
    return this.renderFields(properties, uiSchema, formData, obj.required);
  }

  computeProperties(obj) {
    let properties = { ...obj.properties };
    if (obj.allOf) {
      obj.allOf.forEach(i => {
        properties = { ...properties, ...this.computeProperties(i) };
      });
    }
    if (obj.if) {
      let satisfied = true;
      Object.keys(obj.if.properties).forEach(k => {
        if (
          obj.if.properties[k].const &&
          obj.if.properties[k].const !== this.domValue[k]
        ) {
          satisfied = false;
        }
      });
      if (satisfied) {
        properties = {
          ...properties,
          ...this.jsonSchema.properties,
          ...obj.then.properties,
        };
      } else {
        properties = { ...properties, ...this.jsonSchema.properties };
      }
    }
    return properties;
  }

  renderFields(properties, uiSchema, formData, required) {
    return Object.keys(properties).map(propertyId => {
      const defaultValue =
        properties[propertyId].value || properties[propertyId].default;
      const fieldSpec = {
        jsonSchema: this.resolveDefinitions(properties[propertyId]) || {},
        uiSchema: (uiSchema && uiSchema[propertyId]) || {},
        formData:
          (formData && typeof formData === 'object' && formData[propertyId]) ||
          defaultValue,
      };
      fieldSpec.id = propertyId;
      if (required && required.findIndex(x => x === propertyId) > -1) {
        fieldSpec.jsonSchema.required = true;
      }
      if (
        formData &&
        typeof formData === 'object' &&
        formData[propertyId] !== undefined
      ) {
        fieldSpec.formData = formData[propertyId];
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
      const ret = this.jsonSchema[section]
        ? {
            ...propertySchema,
            ...this.jsonSchema[section][ref],
          }
        : propertySchema;
      ret[section] = {};
      ret[section][ref] = this.jsonSchema[section][ref];
      return ret;
    }
    return propertySchema;
  }

  renderField(fieldSpec) {
    console.debug('mist-form', this.id, 'rendering field', fieldSpec.id);
    if (!fieldSpec.jsonSchema) {
      return '';
    }
    switch (fieldSpec.jsonSchema.type) {
      case 'string':
        return html`<mist-form-string-field
          id="${fieldSpec.id}"
          class="mist-form-field"
          .spec=${fieldSpec}
        ></mist-form-string-field>`;
      case 'number':
        return html`<mist-form-number-field
          id="${fieldSpec.id}"
          class="mist-form-field"
          .spec=${fieldSpec}
        ></mist-form-number-field>`;
      case 'integer':
        return html`<mist-form-integer-field
          id="${fieldSpec.id}"
          class="mist-form-field"
          .spec=${fieldSpec}
        ></mist-form-integer-field>`;
      case 'object':
        return html`<mist-form-object-field
          id="${fieldSpec.id}"
          class="mist-form-field"
          .spec=${fieldSpec}
        ></mist-form-object-field>`;
      case 'array':
        return html`<mist-form-array-field
          id="${fieldSpec.id}"
          class="mist-form-field"
          .spec=${fieldSpec}
        ></mist-form-array-field>`;
      case 'boolean':
        return html`<mist-form-boolean-field
          id="${fieldSpec.id}"
          class="mist-form-field"
          .spec=${fieldSpec}
        ></mist-form-boolean-field>`;
      case 'null':
        return html`<mist-form-null-field
          id="${fieldSpec.id}"
          class="mist-form-field"
          .spec=${fieldSpec}
        ></mist-form-null-field>`;
      default:
        if (fieldSpec.jsonSchema.length)
          return html`<mist-form-array-field
            id="${fieldSpec.id}"
            class="mist-form-field"
            .spec=${fieldSpec}
          ></mist-form-array-field>`;
        return html`<mist-form-string-field
          id="${fieldSpec.id}"
          class="mist-form-field"
          .spec=${fieldSpec}
        ></mist-form-string-field>`;
    }
  }

  displaySubmitButton() {
    if (this.uiSchema && this.uiSchema['ui:submit'] === false) return html``;
    return html` <vaadin-button
      class="submit-btn"
      theme="primary"
      ?disabled=${!this.valid || this.submitting}
      @click="${this.submitForm}"
    >
      ${typeof this.uiSchema['ui:submit'] === 'string'
        ? this.uiSchema['ui:submit']
        : 'Submit'}
    </vaadin-button>`;
  }

  displayCancelButton() {
    if (!this.uiSchema || !this.uiSchema['ui:cancel']) return html``;
    return html` <vaadin-button
      class="cancel-btn"
      @click="${() => this.dispatchEvent(new CustomEvent('mist-form-cancel'))}"
    >
      ${typeof this.uiSchema['ui:cancel'] === 'string'
        ? this.uiSchema['ui:cancel']
        : 'Cancel'}
    </vaadin-button>`;
  }

  loadSpec(url) {
    this.loading.spec = true;
    fetch(url)
      .then(response => response.json())
      .then(async spec => {
        this.jsonSchema = spec.jsonSchema || spec;
        this.uiSchema = spec.uiSchema || {};
        this.formData = spec.formData || {};
        delete this.loading.spec;
      })
      .catch(error => {
        this.specError = error;
        delete this.loading.spec;
        console.error('Error loading spec:', error);
      });
  }

  submitForm() {
    const { payload } = this;
    this.dispatchEvent(
      new CustomEvent('submit', {
        detail: {
          action: this.action,
          method: this.method,
          payload,
        },
      })
    );
    this.submitting = true;
    if (this.action) {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('load', e => {
        console.log(e.currentTarget.responseText);
        this.submitting = false;
        this.dispatchEvent(
          new CustomEvent('response', {
            detail: {
              status: e.currentTarget.status,
              statusText: e.currentTarget.statusText,
              target: e.currentTarget,
            },
          })
        );
        if (e.currentTarget.status > 299) {
          this.formError = e.currentTarget.response;
        }
      });
      xhr.open(this.method, this.action);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.send(JSON.stringify(payload));
    }
  }

  _handleValueChanged(e) {
    console.debug(this, '_handleValueChanged', e);
    e.stopPropagation();
    e.target.formData = { ...e.target.formData, ...e.target.domValue };
    const eventName = `${e.target.subform ? 'sub' : ''}form-data-changed`;
    const formDataChangedEvent = new CustomEvent(eventName, {
      detail: {
        id: e.target.jsonSchema.id,
      },
      bubbles: true,
      composed: true,
    });
    e.target.dispatchEvent(formDataChangedEvent);
    e.target.validate();
  }

  _toggleChanged(e) {
    if (this.enabled !== e.detail.value) {
      this.enabled = e.detail.value;
      if (this.uiSchema && this.uiSchema['ui:enabled'] !== undefined) {
        this.uiSchema['ui:enabled'] = this.enabled;
      }
    }
  }

  validate() {
    const valid = this._validate();
    if (this.valid !== valid) {
      this.dispatchEvent(
        new CustomEvent('validation-changed', { detail: { valid } })
      );
    }
    return valid;
  }

  _validate() {
    let valid = true;
    const errors = [];
    this.shadowRoot.querySelectorAll('#mist-form-fields > *').forEach(field => {
      const result = field.validate();
      valid = valid && result;
      if (!result) {
        field.errors.forEach(err => {
          errors.push(err);
        });
      }
    });
    console.debug('form validation', valid, errors);
    this.errors = errors;
    return valid;
  }

  _validationChanged(e) {
    if (e.target) {
      console.debug('validation-changed', e, this);
      e.target.valid = e.detail.valid;
    }
  }

  _loadingStarted(e) {
    this.loading[e.detail] = true;
  }

  _loadingFinished(e) {
    delete this.loading[e.detail];
  }

  get domValue() {
    let ret;
    switch (this.jsonSchema.type) {
      case 'object':
        ret = {};
        this.shadowRoot.querySelectorAll('.mist-form-field').forEach(el => {
          ret[el.id] = el.domValue;
        });
        return ret;
      case 'array':
        this.shadowRoot.querySelectorAll('.mist-form-field').forEach(el => {
          ret = el.domValue;
        });
        return ret;
      default:
        return this.shadowRoot.querySelector('.mist-form-field').domValue;
    }
  }
}
