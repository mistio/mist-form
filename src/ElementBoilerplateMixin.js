import { debouncer } from './utilities.js';

export const elementBoilerplateMixin = superClass =>
  class extends superClass {
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

    render() {
      this.mistForm.dependencyController.updatePropertiesByTarget(this);
      this.style.display = this.props.hidden ? 'none' : '';
      this.fieldPath = this.props.fieldPath;
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
      } else {
        return true;
      }
    }

    getFieldPath() {
      return this.fieldPath;
    }
  };
