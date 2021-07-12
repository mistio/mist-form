import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { until } from 'lit-html/directives/until.js';
import * as util from '../utilities.js';
// TODO: Set required property that gives error if element has empty value
class MistFormDropdown extends LitElement {
  static get properties() {
    return {
      value: { type: String },
      props: {type: Object},
      fieldPath: {type: String, reflect: true}
    };
  }

  constructor() {
    super();
  }

  static get styles() {
    return css`
    `;
  }

  valueChanged(e) {
    this.valueChangedEvent(e);
  }

  loadDynamicData() {
    if (
      this.mistForm.dynamicDataNamespace &&
      this.mistForm.dynamicDataNamespace.dynamicData &&
      this.mistForm.dynamicDataNamespace.dynamicData[this.props['x-mist-enum']]
    ) {
        const dyna = this.mistForm.dynamicDataNamespace.dynamicData[this.props['x-mist-enum']];
        const { dependencies } = dyna;
      return (
        dyna.func
          // func is a promise
          // getEnumData is the function returned by the promise. We pass the values of the form there
          .then(getEnumData => {
            const formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
            const dependencyValues = dependencies
              ? util.getDependencyValues(formValues, dependencies)
              : {};

            const enumData = getEnumData(dependencyValues);
          //  dyna.target = fieldPath;
           // this.dynamicFieldData[fieldPath] = enumData;
           // this.requestUpdate();
        //    console.log('this.shadowRoot.querySelector(`[fieldpath="${fieldPath}"]`) ', this.shadowRoot.querySelector(`[fieldpath="${fieldPath}"]`))
        //    const props = this.shadowRoot.querySelector(`[fieldpath="${fieldPath}"]`).props;
           this.props = {...this.props, enum: enumData};
          // this.shadowRoot.querySelector(`[fieldpath="${fieldPath}"]`).requestUpdate();

           // return enumData;
          })
          .catch(error => {
            console.error('Error loading dynamic data: ', error);
          })
      );
    }
    return false;
  }


  getDynamicDropdown() {
    const dynamicEnumData = this.loadDynamicData();
    return html` ${until(
        dynamicEnumData &&
          dynamicEnumData.then(enumData => {
            const enumDataIncludesValue = enumData.some(
              item => item === this.props.value || item.id === this.props.value
            );
            if (!enumDataIncludesValue) {
              // Clear selected value if it's not included in the new available values
              this.props.value = null;
            }
            this.props.enum = enumData;
            return enumData
              ? html`${this.dropdown(this.props)}`
              : html`Not found`;
          }),
        this.spinner
      )}`
  }
  getDropdown() {
    const value = this.props.enum.find(prop => prop.id === this.props.value);
    if (value) {
      this.props.value = value.title;
    }
    return html`<paper-dropdown-menu
    ...="${spreadProps(this.props)}"
    .label="${util.getLabel(props)}"
    class="${this.props.classes || ''} mist-form-input"
    ?excludeFromPayload="${this.props.excludeFromPayload}"
    no-animations=""
    value="${this.props.value || ''}"
    fieldPath="${this.props.fieldPath}"
  >
    <paper-listbox
      selected="${this.props.value || ''}"
      @selected-changed=${this.valueChanged}
      attr-for-selected="value"
      class="${this.props.classes || ''} dropdown-content"
      slot="dropdown-content"
    >
      ${this.props.enum.map(
        item =>
          html`<paper-item
            value="${item.title || item}"
            item-id="${item.id || item}"
          >
            ${item.title || item}
          </paper-item>`
      )}
    </paper-listbox>
  </paper-dropdown-menu>`
  }

  firstUpdated() {
    this.fieldPath = this.props.fieldPath;
  }

  render() {
      console.log("render ")

    const isDynamic = Object.prototype.hasOwnProperty.call(
        this.props,
        'x-mist-enum'
      );
    const hasEnum = Object.prototype.hasOwnProperty.call(this.props, 'enum');

    if (hasEnum) {
        return this.getDropdown();
    } else if (isDynamic) {
        return this.getDynamicDropdown();
    }
  }
}

customElements.define('mist-form-dropdown', MistFormDropdown);
