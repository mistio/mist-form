import { debouncer } from './utilities.js';

export const elementBoilerplateMixin = superClass =>
  class extends superClass {
    // Check correct property types
    static get properties() {
      return {
        value: { type: String },
        props: { type: Object },
        fieldPath: { type: String, reflect: true },
        excludeFromPayload: { type: Boolean, reflect: true },
      };
    }

    connectedCallback() {
      super.connectedCallback();
      this.name = this.props.name;
      this.fieldPath = this.props.fieldPath;
      this.excludeFromPayload = this.props.excludeFromPayload;
      this.mistForm.dependencyController.addElementReference(this);
      this.debouncedEventChange = debouncer(e => this.valueChanged(e), 400);
    }

    valueChanged(e) {
      this.value = e.detail.value;
      this.props.valueChangedEvent({
        fieldPath: this.fieldPath,
        value: this.value,
      });
    }

    validate() {
      if (this.shadowRoot.children[0] && this.shadowRoot.children[0].validate) {
        return this.shadowRoot.children[0].validate();
      }
      return true;
    }

    getFieldPath() {
      return this.fieldPath;
    }
  };