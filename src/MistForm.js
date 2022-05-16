import { html, css, LitElement } from 'lit';
import '@vaadin/form-layout';
import '@vaadin/button';
import '@polymer/paper-toggle-button';
import { debouncer, mergeDeep } from './utils.js';
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
      // resolvedSchema: { type: Object }, // JSONSchema spec after importing remote referenced schemas
      // dereferencedSchema: { type: Object }, // JSONSchema spec after resolving local references
      // evaluatedSchema: { type: Object }, // JSONSchema spec after evaluating oneOf/allOf/ifthen/etc
      action: { type: String, reflect: true }, // Where to submit data?
      method: { type: String, reflect: true }, // Request method
      subform: { type: Boolean, reflect: true }, // Are we a subform?
      toggles: { type: Boolean, reflect: true }, // Do we have a toggle button?
      enabled: { type: Boolean, reflect: true },
      valid: { type: Boolean, reflect: true }, // All fields validated?
      dialog: { type: Boolean, reflect: true }, // Inside a dialog?
      submitting: { type: Boolean, reflect: true }, // Form currently submitting
      loading: { type: Object }, // Mapping of widgets currently loading
      specError: { type: Object }, // Spec loading error
      formError: { type: String }, // Form submission error
      formData: { type: Object }, // Payload to be submitted
      responsiveSteps: { type: Array }, // Form layout configuration
      errors: { type: Array }, // Field validation errors
    };
  }

  get payload() {
    const ret = {};
    const { properties } = this.evaluatedSchema;
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

  willUpdate(changedProperties) {
    // Reset & resolve new schema
    if (changedProperties.has('jsonSchema')) {
      // eslint-disable-next-line func-names
      this.resolvedSchema = undefined;
      this.dereferencedSchema = undefined;
      this.evaluatedSchema = undefined;
      this.formError = '';
      this.resolveSchema();
    }
  }

  updated(changedProperties) {
    // eslint-disable-next-line no-console
    console.log(`updated(). changedProperties: `, changedProperties);
    // Load new spec if url has been updated
    if (changedProperties.has('url')) {
      if (this.url) {
        this.loadSpec(this.url);
      }
    }

    // Validate fields after jsonSchema spec updated
    if (changedProperties.has('jsonSchema')) {
      this.submitting = false;
      this.validate();
    }

    // Update field values after formData updates
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

  loadSpec(url) {
    this.loading.spec = true;
    fetch(url)
      .then(response => response.json())
      .then(async spec => {
        const [, path] = this.url.split('#');
        if (path) {
          if (spec.jsonSchema) {
            // eslint-disable-next-line no-param-reassign
            spec.jsonSchema.$ref = `#${path}`;
          } else {
            // eslint-disable-next-line no-param-reassign
            spec.$ref = `#${path}`;
          }
        }
        this.jsonSchema = spec.jsonSchema || spec;
        this.uiSchema = spec.uiSchema || {};
        this.formData = spec.formData || {};
        delete this.loading.spec;
      })
      .catch(error => {
        this.specError = error;
        delete this.loading.spec;
        // eslint-disable-next-line no-console
        console.error('Error loading spec:', error);
      });
  }

  // Import remote referenced schemas
  resolveSchema(deepcopy = true) {
    if (!this.jsonSchema) return;
    // Deep copy incoming jsonSchema
    if (deepcopy) {
      this.resolvedSchema = JSON.parse(JSON.stringify(this.jsonSchema));
    }
    // Find references to remote URLs
    const remoteRefs = this.findRemoteRefs(this.resolvedSchema, true);
    if (remoteRefs.length) {
      // Import all remote URLs
      this.prefetchRefs(remoteRefs);
    } else {
      this.dereferencedSchema = this.resolveLocalRefs(this.resolvedSchema);
      this.evaluatedSchema = this.evalSchema(this.dereferencedSchema);
    }
  }

  findRemoteRefs(obj, replace = false) {
    let ret = [];
    if (!obj || typeof obj !== 'object') return ret;
    if (typeof obj.$ref === 'string') {
      const [addr, path] = obj.$ref.split('#');
      if (addr) {
        ret.push(addr);
        if (replace === true) {
          // eslint-disable-next-line no-param-reassign
          obj.$ref = `#${path}`;
        }
      }
    }

    // eslint-disable-next-line
    Object.keys(obj).forEach(k => {
      if (typeof obj[k] === 'object') {
        ret = ret.concat(this.findRemoteRefs(obj[k], replace));
      }
    });
    return ret;
  }

  prefetchRefs(refs) {
    Promise.all(refs.map(url => fetch(url).then(resp => resp.json())))
      .then(results => {
        results.forEach(result => {
          Object.keys(result).forEach(k => {
            // Merge or copy remote keys
            if (
              typeof this.resolvedSchema[k] === 'object' &&
              typeof result[k] === 'object'
            ) {
              this.resolvedSchema[k] = {
                ...this.resolvedSchema[k],
                ...result[k],
              };
            } else {
              this.resolvedSchema[k] = result[k];
            }
          });
        });
      })
      .then(() => {
        this.resolveSchema(false);
        this.requestUpdate();
      });
  }

  resolveLocalRefs(obj, refs) {
    // eslint-disable-next-line no-param-reassign
    if (refs === undefined) refs = [];
    const ret = JSON.parse(JSON.stringify(obj));
    return this.replaceLocalRefs(ret, refs);
  }

  replaceLocalRefs(obj, refs, root) {
    // eslint-disable-next-line no-param-reassign
    if (root === undefined) root = obj;
    if (!obj || typeof obj !== 'object') return obj;
    if (typeof obj.$ref === 'string') {
      refs.push(obj.$ref);
      const target = this.resolveLocalRef(obj.$ref, root);
      // eslint-disable-next-line
      Object.keys(target).forEach(k => {
        if (k !== '$ref') {
          this.replaceLocalRefs(target[k], refs, root);
          if (typeof obj[k] === 'object' && obj[k].length === undefined) {
            // eslint-disable-next-line no-param-reassign
            obj[k] = { ...obj[k], ...target[k] };
          } else if (
            typeof target[k] === 'object' &&
            target[k].length === undefined
          ) {
            // eslint-disable-next-line no-param-reassign
            obj[k] = { ...target[k] };
          } else {
            // eslint-disable-next-line no-param-reassign
            obj[k] = target[k];
          }
        }
      });
      // eslint-disable-next-line no-param-reassign
      delete obj.$ref;
    }

    // eslint-disable-next-line
    Object.keys(obj).forEach(k => {
      // if (k === 'numberEnum') debugger;
      // eslint-disable-next-line no-param-reassign
      obj[k] = this.replaceLocalRefs(obj[k], refs, root);
    });
    return obj;
  }

  resolveLocalRef(ref) {
    const [, path] = ref.split('#');
    let target = this.resolvedSchema;
    const pathArray = path.split('/');
    for (let i = 0; i < pathArray.length; i += 1) {
      if (pathArray[i] && target[pathArray[i]]) {
        target = target[pathArray[i]];
      }
    }
    return target;
  }

  evalSchema(obj) {
    if (
      !obj ||
      typeof obj !== 'object' ||
      obj.length ||
      Object.keys(obj).length === 0
    )
      return obj;
    const ret = {};
    mergeDeep(ret, obj);
    if (ret.allOf) {
      ret.allOf.forEach(i => {
        mergeDeep(ret, this.evalSchema(i));
      });
      delete ret.allOf;
    }
    if (ret.oneOf) {
      let discriminator = {};
      let discriminatorValue;
      if (ret.discriminator) {
        if (this.domValue && this.domValue[ret.discriminator.propertyName]) {
          discriminatorValue = this.domValue[ret.discriminator.propertyName];
        }
      } else {
        discriminator = {
          id: '_discriminator',
          type: 'number',
          enum: ret.oneOf.map((el, i) => i),
          enumNames: ret.oneOf.map((el, i) => el.title || `Option ${i}`),
        };
        if (ret.properties === undefined) ret.properties = {};
        ret.properties._discriminator = discriminator;
        discriminatorValue = this.domValue && this.domValue._discriminator;
        if (typeof discriminatorValue === 'string') {
          discriminatorValue = ret.oneOf.findIndex(
            i => i.title === discriminatorValue
          );
        }
      }
      if (discriminatorValue !== null) {
        if (
          ret.discriminator &&
          ret.discriminator.mapping &&
          ret.discriminator.mapping[discriminatorValue]
        ) {
          mergeDeep(
            ret,
            this.resolveLocalRef(
              ret.discriminator.mapping[discriminatorValue],
              obj
            )
          );
        }
        if (ret.oneOf[discriminatorValue]) {
          mergeDeep(ret, this.evalSchema(ret.oneOf[discriminatorValue]));
        }
      }
      delete ret.oneOf;
    }
    if (ret.anyOf) {
      let discriminator = {};
      let discriminatorValue;
      if (ret.discriminator) {
        if (this.domValue && this.domValue[ret.discriminator.propertyName]) {
          discriminatorValue = this.domValue[ret.discriminator.propertyName];
        }
      } else {
        discriminator = {
          id: '_discriminator',
          type: 'array',
          uniqueItems: true,
          'ui:widget': 'checkboxes',
          items: {
            type: 'string',
            'ui:widget': 'checkboxes',
            enum: ret.anyOf.map((el, i) => el.title || i),
          },
        };
        if (ret.properties === undefined) ret.properties = {};
        ret.properties._discriminator = discriminator;
        discriminatorValue = this.domValue && this.domValue._discriminator;
        if (typeof discriminatorValue === 'string') {
          discriminatorValue = ret.anyOf.findIndex(
            i => i.title === discriminatorValue
          );
        }
      }
      if (discriminatorValue !== null && discriminator !== undefined) {
        if (discriminatorValue && discriminatorValue.length) {
          discriminatorValue.forEach(dv => {
            let index = ret.anyOf.findIndex(el => el.title === dv);
            if (index === -1) index = dv;
            if (ret.anyOf[index]) {
              const schema = this.evalSchema(ret.anyOf[index]);
              if (schema.title) delete schema.title;
              mergeDeep(ret, schema);
            } else if (
              ret.discriminator &&
              ret.discriminator.mapping &&
              ret.discriminator.mapping[index]
            ) {
              mergeDeep(
                ret,
                this.resolveLocalRef(ret.discriminator.mapping[index], obj)
              );
            }
          });
        }
      }
      delete ret.anyOf;
    }
    if (ret.if) {
      let satisfied = true;
      Object.keys(ret.if.properties).forEach(k => {
        if (
          ret.if.properties[k].const &&
          this.domValue &&
          ret.if.properties[k].const !== this.domValue[k]
        ) {
          satisfied = false;
        }
      });
      if (satisfied) {
        mergeDeep(ret, this.evalSchema(ret.then));
      } else if (ret.else) {
        mergeDeep(ret, this.evalSchema(ret.else));
        delete ret.else;
      }
      delete ret.if;
      delete ret.then;
    }
    // eslint-disable-next-line
    Object.keys(ret).forEach(
      // eslint-disable-next-line func-names
      k => {
        // eslint-disable-next-line no-param-reassign
        ret[k] = this.evalSchema(ret[k]);
      }
    );
    return ret;
  }

  render() {
    let loader = '';
    let formFields;
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
    if (this.jsonSchema && this.evaluatedSchema) {
      if (
        this.evaluatedSchema.type === undefined ||
        this.evaluatedSchema.type === 'object'
      ) {
        formFields = this.renderObject(
          this.evaluatedSchema,
          this.uiSchema,
          this.formData
        );
      } else {
        formFields = this.renderField({
          jsonSchema: this.evaluatedSchema,
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
      const title = this.evaluatedSchema.title
        ? html`<h1>${toggler} ${this.evaluatedSchema.title}</h1>`
        : html`${toggler}`;
      const description = this.evaluatedSchema.description
        ? html`<p>${this.evaluatedSchema.description}</p>`
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
    const properties = obj.properties || {};
    const { required } = obj;
    return Object.keys(properties).map(propertyId => {
      const defaultValue =
        properties[propertyId].value || properties[propertyId].default;
      const fieldSpec = {
        jsonSchema: properties[propertyId] || {},
        uiSchema: (uiSchema && uiSchema[propertyId]) || {},
        formData:
          (formData && typeof formData === 'object' && formData[propertyId]) ||
          defaultValue,
      };
      fieldSpec.id = propertyId;
      if (typeof required === 'boolean') {
        fieldSpec.jsonSchema.required = required;
      } else if (required && required.findIndex(x => x === propertyId) > -1) {
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

  renderField(fieldSpec) {
    // eslint-disable-next-line no-console
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
      ${this.uiSchema && typeof this.uiSchema['ui:submit'] === 'string'
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
        // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.debug('_handleValueChanged', e, this);
    e.stopPropagation();
    if (!e.target || !e.target.jsonSchema) return;
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
    e.target.evaluatedSchema = e.target.evalSchema(e.target.dereferencedSchema);
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
    // eslint-disable-next-line no-console
    console.debug('form validation', valid, errors);
    this.errors = errors;
    return valid;
  }

  _validationChanged(e) {
    if (e.target) {
      // eslint-disable-next-line no-console
      console.debug('validation-changed', e, this);
      e.target.valid = e.detail.valid;
    }
  }

  _loadingStarted(e) {
    this.loading[e.detail] = true;
  }

  _loadingFinished(e) {
    delete this.loading[e.detail];
    this.requestUpdate();
  }

  get domValue() {
    let ret;
    if (!this.evaluatedSchema) return ret;
    switch (this.evaluatedSchema.type) {
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
        return (
          this.shadowRoot.querySelector('.mist-form-field') &&
          this.shadowRoot.querySelector('.mist-form-field').domValue
        );
    }
  }
}
