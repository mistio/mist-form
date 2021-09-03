import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { styleMap } from 'lit-html/directives/style-map.js';
import { fieldStyles } from '../styles/fieldStyles.js';
import { until } from 'lit-html/directives/until.js';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormDropdown extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return [fieldStyles];
  }

  loadDynamicData() {
    if (
      this.mistForm.dynamicDataNamespace &&
      this.mistForm.dynamicDataNamespace.dynamicData &&
      this.mistForm.dynamicDataNamespace.dynamicData[this.props['x-mist-enum']]
    ) {
      const dyna = this.mistForm.dynamicDataNamespace.dynamicData[
        this.props['x-mist-enum']
      ];
      const { dependencies } = dyna;
      return (
        dyna.func
          // func is a promise
          // getEnumData is the function returned by the promise. We pass the values of the form there
          .then(getEnumData => {
            const formValues = this.mistForm.getValuesfromDOM(
              this.mistForm.shadowRoot
            );
            const dependencyValues = dependencies
              ? util.getDependencyValues(formValues, dependencies)
              : {};

            const enumData = getEnumData(dependencyValues);
            this.props = { ...this.props, enum: enumData };
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
          if (!enumData) {
            return;
          }
          const enumDataIncludesValue = enumData.some(
            item => item === this.props.value || item.id === this.props.value
          );
          if (!enumDataIncludesValue) {
            // Clear selected value if it's not included in the new available values
            this.props.value = null;
          }
          this.props.enum = enumData;
          return html`${enumData ? this.getDropdown() : 'Not found'}`;
        }),
      html`<paper-spinner active></paper-spinner>`
    )}`;
  }

  getDropdown() {
    const value =
      this.props &&
      this.props.enum &&
      this.props.enum.find(prop => prop.id === this.props.value) || [];
    this.props.enum = this.props.enum || [];

    if (value) {
      this.props.value = value.id;
    }
    return html`<paper-dropdown-menu
        ...="${spreadProps(this.props)}"
        .label="${util.getLabel(this.props)}"
        class="${this.props.classes || ''} mist-form-input"
        ?excludeFromPayload="${this.props.excludeFromPayload}"
        no-animations=""
        value="${this.props.value || ''}"
        fieldPath="${this.props.fieldPath}"
        style=${styleMap(this.props.styles && this.props.styles.dropdown)}
      >
        <paper-listbox
          selected="${this.props.value || ''}"
          @selected-changed=${this.valueChanged}
          attr-for-selected="item-id"
          class="${this.props.classes || ''} dropdown-content"
          slot="dropdown-content"
          style=${styleMap(this.props.styles && this.props.styles.listbox)}
        >
          ${this.props.enum.length ? this.props.enum.map(
            item =>
              html`<paper-item
                value="${item.title || item}"
                item-id="${item.id || item}"
                style=${styleMap(this.props.styles && this.props.styles.item)}
              >
                ${item.title || item}
              </paper-item>`
          ) : html`<paper-item
                disabled
                style=${styleMap(this.props.styles && this.props.styles.item)}
              >
                No ${this.props.label.toLowerCase()} found
              </paper-item>`
          }
        </paper-listbox> </paper-dropdown-menu
      >${this.helpText(this.props)}`;
  }

  render() {
    super.render();
    const isDynamic = Object.prototype.hasOwnProperty.call(
      this.props,
      'x-mist-enum'
    );
    let hasEnum = Object.prototype.hasOwnProperty.call(this.props, 'enum');

    if (!isDynamic && !hasEnum) {
      this.props.enum = [];
      hasEnum = true;
    }

    if (hasEnum) {
      return this.getDropdown();
    }
    if (isDynamic) {
      return this.getDynamicDropdown();
    }
    return '';
  }
}

customElements.define('mist-form-dropdown', MistFormDropdown);
