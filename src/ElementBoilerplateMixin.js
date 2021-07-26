import { debouncer } from './utilities.js';

export const elementBoilerplateMixin = superClass =>
  class extends superClass {
    static get properties() {
      return {
        value: { type: String },
        props: { type: Object },
        fieldPath: { type: String, reflect: true },
      };
    }

    connectedCallback() {
      super.connectedCallback();
      this.name = this.props.name;
      this.fieldPath = this.props.fieldPath;
      this.mistForm.dependencyController.addElementReference(this);
      this.debouncedEventChange = debouncer(e => this.valueChanged(e), 400);
    }

    render() {
      this.style.display = this.props.hidden ? 'none' : 'inherit';
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
      return (
        this.shadowRoot.children[0] && this.shadowRoot.children[0].validate()
      );
    }

    getFieldPath() {
      return this.fieldPath;
    }
  };
