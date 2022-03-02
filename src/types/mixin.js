export const debouncer = function (callback, wait) {
  let timeout = 1000;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      callback.apply(this, args);
    }, wait);
  };
};

export const fieldMixin = superClass =>
  class extends superClass {
    static get properties() {
      return {
        spec: {
          type: Object,
        },
      };
    }

    get domValue() {
      const field = this.shadowRoot.querySelector('.mist-form-field');
      if (this.widget === 'select') {
        if (field.querySelector('vaadin-item[selected]')) {
          return this.cast(field.querySelector('vaadin-item[selected]').value);
        }
        field._menuElement.querySelectorAll('vaadin-item').forEach((i, j) => {
          if (i.getAttribute('value') === field.value)
            field._menuElement.selected = j;
        });
      }
      return this.cast(
        field.value !== undefined ? field.value : field.getAttribute('value')
      );
    }

    get widget() {
      if (
        this.spec.uiSchema &&
        this.spec.uiSchema['ui:widget'] &&
        this.spec.uiSchema['ui:widget']
      ) {
        return this.spec.uiSchema['ui:widget'];
      }
      return '';
    }

    get step() {
      return this.spec.jsonSchema.multipleOf
        ? Number(this.spec.jsonSchema.multipleOf)
        : undefined;
    }

    get parent() {
      let el = this;
      while (el.parentElement) {
        el = el.parentElement;
      }
      while (el.parentNode) {
        el = el.parentNode;
      }
      while (el.host) {
        el = el.host;
      }
      const { parent } = el;
      return parent || el;
    }

    get isHidden() {
      return Boolean(this.spec.uiSchema && this.spec.uiSchema['ui:hidden']);
    }

    get isReadOnly() {
      return Boolean(
        (this.spec.uiSchema && this.spec.uiSchema['ui:readonly']) ||
          this.spec.jsonSchema.readOnly
      );
    }

    get isDisabled() {
      return Boolean(this.spec.uiSchema && this.spec.uiSchema['ui:disabled']);
    }

    get hasAutoFocus() {
      return Boolean(this.spec.uiSchema && this.spec.uiSchema['ui:autofocus']);
    }

    get placeholder() {
      return this.spec.uiSchema && this.spec.uiSchema['ui:placeholder'];
    }

    get items() {
      const ret = [];
      if (this.spec.jsonSchema.enum) {
        this.spec.jsonSchema.enum.forEach(element => {
          ret.push({
            label: String(element),
            value: String(element),
          });
        });
      } else if (this.spec.jsonSchema.examples) {
        this.spec.jsonSchema.examples.forEach(element => {
          ret.push({
            label: element,
            value: element,
          });
        });
      }
      return ret;
    }

    connectedCallback() {
      super.connectedCallback();
      this.debouncedEventChange = debouncer(e => this.valueChanged(e), 300);
    }

    valueChanged(e) {
      console.debug(this, 'Updating form field', e);
      const valueChangedEvent = new CustomEvent('field-value-changed', {
        detail: {
          id: this.spec.id,
        },
        bubbles: false,
        composed: true,
      });
      this.dispatchEvent(valueChangedEvent);
    }

    validate() {
      // if (this.spec.jsonSchema.enum && this.spec.jsonSchema.enum.indexOf(this.spec.formData) == -1) {
      //   return false;
      // }
      if (this.shadowRoot.children[0] && this.shadowRoot.children[0].validate) {
        return this.shadowRoot.children[0].validate();
      }
      return true;
    }

    cast(value) {
      if (value === undefined) {
        return this.cast(this.value);
      }
      return value;
    }

    updated(changedProperties) {
      const spec = changedProperties.get('spec');
      if (!spec) return;
      this.importWidgets();

      if (this.spec.jsonSchema.enum) {
        const val = this.domValue;
        if (this.spec.jsonSchema.enum.indexOf(val) === -1) {
          this.requestUpdate();
        }
      }
    }

    importWidgets() {
      switch (this.widget) {
        case 'textarea':
          if (customElements.get('vaadin-text-area') === undefined) {
            import('@vaadin/text-area').then(() => {
              console.debug('imported vaadin textarea');
            });
          }
          break;
        case 'checkboxes':
          if (customElements.get('vaadin-checkbox') === undefined) {
            import('@vaadin/checkbox').then(() => {
              console.debug('imported vaadin checkbox');
            });
          }
          break;
        case 'select':
          if (customElements.get('vaadin-select') === undefined) {
            import('@vaadin/select').then(() => {
              console.debug('imported vaadin select');
            });
            import('@vaadin/item').then(() => {
              console.debug('imported vaadin item');
            });
            import('@vaadin/list-box').then(() => {
              console.debug('imported vaadin list-box');
            });
          }
          break;
        case 'combo-box':
          if (customElements.get('vaadin-combo-box') === undefined) {
            import('@vaadin/combo-box').then(() => {
              console.debug('imported vaadin combo box');
            });
          }
          break;
        case 'text-field':
          if (customElements.get('vaadin-text-field') === undefined) {
            import('@vaadin/text-field').then(() => {
              console.debug('imported vaadin text-field');
            });
          }
          break;
        case 'password':
          if (customElements.get('vaadin-password-field') === undefined) {
            import('@vaadin/password-field').then(() => {
              console.debug('imported vaadin password-field');
            });
          }
          break;
        case 'email':
          if (customElements.get('vaadin-email-field') === undefined) {
            import('@vaadin/email-field').then(() => {
              console.debug('imported vaadin email-field');
            });
          }
          break;
        case 'radio':
          if (customElements.get('vaadin-radio-group') === undefined) {
            import(
              '@vaadin/radio-group/theme/material/vaadin-radio-group.js'
            ).then(console.debug('imported vaadin radio group'));
          }
          break;
        case 'number':
          if (customElements.get('vaadin-number-field') === undefined) {
            import('@vaadin/number-field').then(
              console.debug('imported vaadin number field')
            );
          }
          break;
        case 'integer':
          if (customElements.get('vaadin-integer-field') === undefined) {
            import('@vaadin/integer-field').then(
              console.debug('imported vaadin integer field')
            );
          }
          break;
        case 'range':
          break;
        default:
          break;
      }
    }
  };
