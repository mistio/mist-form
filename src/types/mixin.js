import { deepEqual } from 'fast-equals';


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
          type: Object
        }
      }
    }

    connectedCallback() {
      super.connectedCallback();
      this.debouncedEventChange = debouncer(e => this.valueChanged(e), 300);
    }

    valueChanged(e) {
      console.debug(this, 'Updating form field',e);
      let valueChangedEvent = new CustomEvent('field-value-changed', {
        detail: {
          id: this.spec.id
        },
        bubbles: false,
        composed: true
      });
      this.dispatchEvent(valueChangedEvent);
    }

    // updated(changedProperties) {
      // if (changedProperties.has('spec') && changedProperties.get('spec') !== undefined) {
        // console.debug(this, 'Updating', changedProperties);
        // this.requestUpdate();
        // if (this.spec && this.spec.formData && !deepEqual(this.value, this.spec.formData)) {
        //   let newValue = this.spec.formData;
        //   console.debug(this, 'Updating value', this.value,' to', newValue);
        //   this.value = newValue;
        // }
      // }
    // }

    validate() {
      if (this.shadowRoot.children[0] && this.shadowRoot.children[0].validate) {
        return this.shadowRoot.children[0].validate();
      }
      return true;
    }

    cast(value) {
      return value;
    }

    get step() {
      return this.spec.jsonSchema.multipleOf ? Number(this.spec.jsonSchema.multipleOf) : undefined;
    }

    get icon() {
      return '';
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
        el = el.host
      }
      let parent = el.parent;
      return parent ? parent : el;
    }

    get domValue() {
      const field = this.shadowRoot.querySelector('.mist-form-field');
      if (!field) {
        debugger;
      }
      return field.value != undefined ? field.value : field.getAttribute('value');
    }
  }