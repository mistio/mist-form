import { html, css, LitElement, render } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { fieldMixin } from './mixin.js';
import '@vaadin/icons';
import '@vaadin/icon';

export class MistFormStringField extends fieldMixin(LitElement) {
  static get properties() {
    return {
      value: { type: String },
    };
  }

  static get styles() {
    return [css``];
  }

  get widget() {
    return (
      super.widget ||
      (this.spec.jsonSchema.examples
        ? 'combo-box'
        : (this.spec.jsonSchema.enum && 'select') ||
          (this.spec.jsonSchema.format === 'email' && 'email') ||
          'text-field')
    );
  }

  get pattern() {
    let ret;
    if (this.spec.jsonSchema.format === 'email') {
      ret = '^([a-zA-Z0-9_\\.\\-+])+@[a-zA-Z0-9-.]+\\.[a-zA-Z0-9-]{2,}$';
    } else if (this.spec.jsonSchema.format === 'uri') {
      ret = '^(([a-zA-Z0-9_\\.\\-+])+://)?[a-zA-Z0-9-.]+\\.[a-zA-Z0-9-]{2,}$';
    }
    return this.spec.jsonSchema.pattern || ret;
  }

  render() {
    if (!this.spec) return html``;
    if (this.widget === 'textarea') {
      return html` <vaadin-text-area
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
        .pattern=${this.pattern}
      >
        ${this.icon || ''}
      </vaadin-text-area>`;
    }
    if (this.spec.jsonSchema.enum) {
      if (this.widget === 'checkboxes') {
        return html`
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
        `;
      }
      if (this.widget === 'radio') {
        return html`
          <vaadin-radio-group
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
          </vaadin-radio-group>
        `;
      }
      return html` <vaadin-select
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
      ></vaadin-select>`;
    }
    if (this.spec.jsonSchema.examples) {
      return html` <vaadin-combo-box
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
        ?disabled=${this.isDisabled}
        ?readonly=${this.isReadOnly}
        ?hidden=${this.isHidden}
        .pattern=${this.pattern}
      ></vaadin-combo-box>`;
    }
    if (this.widget === 'password') {
      return html` <vaadin-password-field
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
      </vaadin-password-field>`;
    }
    if (this.widget === 'email') {
      return html` <vaadin-email-field
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
      </vaadin-email-field>`;
    }
    return html` <vaadin-text-field
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
    </vaadin-text-field>`;
  }

  cast(value) {
    if (value === undefined && this.value !== undefined) {
      return this.cast(this.value);
    }
    return String(value || '');
  }

  renderer(root) {
    render(
      html`
        <vaadin-list-box>
          ${this.items
            ? this.items.map(
                item =>
                  html`<vaadin-item value="${item.value}"
                    >${item.label}</vaadin-item
                  >`
              )
            : ''}
        </vaadin-list-box>
      `,
      root
    );
  }
}

customElements.define('mist-form-string-field', MistFormStringField);
