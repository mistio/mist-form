import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { until } from 'lit-html/directives/until.js';
import * as util from '../utilities.js';
import { elementBoilerplateMixin } from '../ElementBoilerplateMixin.js';

class MistFormDropdown extends elementBoilerplateMixin(LitElement) {
  static get styles() {
    return css``;
  }

  // valueChanged(e) {
  //   // I might have a problem here when trying to initialize values. I should check what I did with the item-id property
  //   this.value = e.detail.value;
  //   this.props.valueChangedEvent({
  //     fieldPath: this.fieldPath,
  //     value: this.value,
  //   });
  // }

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
      this.props.enum.find(prop => prop.id === this.props.value);
    if (value) {
      this.props.value = value.title;
    }

    return html`<paper-dropdown-menu
        ...="${spreadProps(this.props)}"
        .label="${util.getLabel(this.props)}"
        class="${this.props.classes || ''} mist-form-input"
        ?excludeFromPayload="${this.props.excludeFromPayload}"
        no-animations=""
        value="${this.props.value || ''}"
        fieldPath="${this.props.fieldPath}"
      >
        <paper-listbox
          selected="${this.props.value || ''}"
          @selected-changed=${this.valueChanged}
          attr-for-selected="item-id"
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
