import { html, css, unsafeCSS } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';

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
      // if (!field) {
      //   // debugger;
      //   return;
      // }
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

    get hasAutoSelect() {
      return Boolean(this.spec.uiSchema && this.spec.uiSchema['ui:autoselect']);
    }

    get placeholder() {
      return this.spec.uiSchema && this.spec.uiSchema['ui:placeholder'];
    }

    get items() {
      const ret = [];
      if (this.spec.jsonSchema.enum) {
        this.spec.jsonSchema.enum.forEach((element, index) => {
          if (this.spec.jsonSchema.enumNames) {
            ret.push({
              label: this.spec.jsonSchema.enumNames[index],
              value: String(element),
            });
          } else {
            ret.push({
              label: String(element),
              value: String(element),
            });
          }
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

    get css() {
      let bgColor = css``;
      let color = css``;
      let hidden = css``;
      if (this.spec && this.spec.uiSchema && this.spec.uiSchema['ui:options']) {
        if (this.spec.uiSchema['ui:options'].backgroundColor) {
          bgColor = unsafeCSS(
            `--lumo-contrast-10pct: ${this.spec.uiSchema['ui:options'].backgroundColor};`
          );
        }
        if (this.spec.uiSchema['ui:options'].color) {
          color = unsafeCSS(
            `--lumo-body-text-color: ${this.spec.uiSchema['ui:options'].color};`
          );
        }
      }
      if (this.widget === 'hidden') {
        hidden = unsafeCSS('display: none;');
      }
      return css`
        ${bgColor}
        ${color}
        ${hidden}
      `;
    }

    get renderers() {
      const description =
        this.spec && this.spec.jsonSchema && this.spec.jsonSchema.description
          ? html`<div class="helper">${this.spec.jsonSchema.description}</div>`
          : html``;
      return {
        'text-field': html` <vaadin-text-field
          has-controls
          clear-button-visible
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.spec.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          minlength=${ifDefined(this.spec.jsonSchema.minLength)}
          maxlength=${ifDefined(this.spec.jsonSchema.maxLength)}
          pattern=${ifDefined(this.spec.jsonSchema.pattern)}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.spec.uiSchema['ui:autocomplete']}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .pattern=${this.pattern}
          .style=${this.css}
        >
        </vaadin-text-field>`,
        textarea: html` <vaadin-text-area
          has-controls
          clear-button-visible
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.spec.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          minlength=${ifDefined(this.spec.jsonSchema.minLength)}
          maxlength=${ifDefined(this.spec.jsonSchema.maxLength)}
          pattern=${ifDefined(this.spec.jsonSchema.pattern)}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          ?autoselect=${this.hasAutoSelect}
          .pattern=${this.pattern}
          .style=${this.css}
        >
          ${this.icon || ''}
        </vaadin-text-area>`,
        checkboxes: html`
          <vaadin-checkbox-group
            label="${this.spec.jsonSchema.title}"
            @value-changed="${e => {
              this.value = e.detail.value;
            }}"
            class="${this.spec.classes || ''} mist-form-field"
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
            theme="vertical"
          >
            ${repeat(
              this.spec.jsonSchema.enum || [],
              item => item,
              item => html`
                <vaadin-checkbox
                  id="${item}"
                  label="${item}"
                  ?checked=${this.spec.formData &&
                  this.spec.formData.indexOf(item) !== -1}
                  @change=${e => {
                    e.detail = { id: item, value: e.target.checked };
                    this.debouncedEventChange(e);
                  }}
                >
                </vaadin-checkbox>
              `
            )}
          </vaadin-checkbox-group>
        `,
        radio: html` <vaadin-radio-group
          ?required="${this.spec.jsonSchema.required}"
          label="${this.spec.jsonSchema.title}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.spec.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          ?autofocus=${this.hasAutoFocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          value=${this.cast(this.spec.formData)}
        >
          ${this.items.map(
            item => html`
              <vaadin-radio-button
                value="${item.value}"
                label="${item.label}"
                ?checked=${String(Boolean(this.formData)) ===
                String(item.value)}
              >
              </vaadin-radio-button>
            `
          )}
        </vaadin-radio-group>`,
        select: html` <vaadin-select
          .renderer="${this.renderer}"
          ?required="${this.spec.jsonSchema.required}"
          .items="${this.items}"
          .value="${this.spec.formData}"
          label="${this.spec.jsonSchema.title}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.spec.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .pattern=${this.pattern}
        ></vaadin-select>`,
        'combo-box': html` <vaadin-combo-box
          allow-custom-value
          item-label-path="label"
          item-value-path="value"
          ?required="${this.spec.jsonSchema.required}"
          .items="${this.items}"
          .value="${this.spec.formData || ''}"
          label="${this.spec.jsonSchema.title}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.spec.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .pattern=${this.pattern}
        ></vaadin-combo-box>`,
        password: html` <vaadin-password-field
          has-controls
          clear-button-visible
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.spec.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          minlength=${ifDefined(this.spec.jsonSchema.minLength)}
          maxlength=${ifDefined(this.spec.jsonSchema.maxLength)}
          pattern=${ifDefined(this.spec.jsonSchema.pattern)}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.spec.uiSchema['ui:autocomplete']}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .pattern=${this.pattern}
        >
        </vaadin-password-field>`,
        email: html` <vaadin-email-field
          has-controls
          clear-button-visible
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.spec.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          minlength=${ifDefined(this.spec.jsonSchema.minLength)}
          maxlength=${ifDefined(this.spec.jsonSchema.maxLength)}
          pattern=${ifDefined(this.spec.jsonSchema.pattern)}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.spec.uiSchema['ui:autocomplete']}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .pattern=${this.pattern}
        >
        </vaadin-email-field>`,
        datetime: html` <vaadin-date-time-picker
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.spec.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.spec.uiSchema['ui:autocomplete']}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
        ></vaadin-date-time-picker>`,
        date: html` <vaadin-date-picker
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.spec.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.spec.uiSchema['ui:autocomplete']}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
        ></vaadin-date-picker>`,
        time: html` <vaadin-time-picker
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.spec.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.spec.uiSchema['ui:autocomplete']}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
        ></vaadin-time-picker>`,
        'alt-datetime': html`
          <label class="field">${this.spec.jsonSchema.title}</label>
          <input
            type="datetime-local"
            ?required="${this.spec.jsonSchema.required}"
            class="${this.spec.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
          />
          ${description}
        `,
        'alt-date': html`
          <label class="field">${this.spec.jsonSchema.title}</label>
          <input
            type="date"
            ?required="${this.spec.jsonSchema.required}"
            class="${this.spec.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
          />
          ${description}
        `,
        'alt-time': html`
          <label> class="field"${this.spec.jsonSchema.title}</label>
          <input
            type="time"
            ?required="${this.spec.jsonSchema.required}"
            class="${this.spec.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
          />
          ${description}
        `,
        color: html` <label class="field">${this.spec.jsonSchema.title}</label>
          <input
            type="color"
            ?required="${this.spec.jsonSchema.required}"
            class="${this.spec.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
          />
          ${description}`,
        file: html` <label class="field">${this.spec.jsonSchema.title}</label>
          <input
            type="file"
            ?required="${this.spec.jsonSchema.required}"
            class="${this.spec.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
          />
          ${description}`,
        hidden: html`
          <input
            type="hidden"
            class="${this.spec.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
          />
        `,
      };
    }

    get pattern() {
      let ret;
      if (this.spec.jsonSchema.format === 'email') {
        ret = '^([a-zA-Z0-9_\\.\\-+])+@[a-zA-Z0-9-.]+\\.[a-zA-Z0-9-]{2,}$';
      } else if (this.spec.jsonSchema.format === 'uri') {
        ret =
          '^(([a-zA-Z0-9_\\.\\-+])+://)?[a-zA-Z0-9-.]+\\.[a-zA-Z0-9-]{2,}[:0-9]|[/.])*$';
      }
      return this.spec.jsonSchema.pattern || ret;
    }

    render() {
      if (!this.spec) return html``;
      const rendered = this.renderers[this.widget];
      // if (!rendered) debugger;
      return rendered;
    }

    connectedCallback() {
      super.connectedCallback();
      this.debouncedEventChange = debouncer(e => this.valueChanged(e), 300);
    }

    valueChanged(e) {
      console.debug(this.id, 'Updating form field', e.detail);
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
        case 'datetime':
          if (customElements.get('vaadin-date-time-picker') === undefined) {
            import('@vaadin/date-time-picker').then(
              console.debug('imported vaadin datetime picker')
            );
          }
          break;
        case 'date':
          if (customElements.get('vaadin-date-picker') === undefined) {
            import('@vaadin/date-picker').then(
              console.debug('imported vaadin date picker')
            );
          }
          break;
        case 'time':
          if (customElements.get('vaadin-time-picker') === undefined) {
            import('@vaadin/time-picker').then(
              console.debug('imported vaadin time picker')
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
