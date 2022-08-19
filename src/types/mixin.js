import { html, css, unsafeCSS } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { debouncer } from '../utils.js';

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
      if (!field) {
        return undefined;
      }
      if (this.widget === 'select') {
        if (field.querySelector('vaadin-item[selected]')) {
          return this.cast(field.querySelector('vaadin-item[selected]').value);
        }
        if (field._menuElement) {
          field._menuElement.querySelectorAll('vaadin-item').forEach((i, j) => {
            if (i.getAttribute('value') === field.value)
              field._menuElement.selected = j;
          });
        }
      } else if (this.widget === 'toggle') {
        return field.checked;
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
      if (this.spec.jsonSchema && this.spec.jsonSchema['ui:widget']) {
        return this.spec.jsonSchema['ui:widget'];
      }
      return '';
    }

    get step() {
      return this.spec.jsonSchema.multipleOf
        ? Number(this.spec.jsonSchema.multipleOf)
        : undefined;
    }

    get prefix() {
      return this.spec && this.spec.uiSchema && this.spec.uiSchema['ui:prefix'];
    }

    get suffix() {
      return this.spec && this.spec.uiSchema && this.spec.uiSchema['ui:suffix'];
    }

    get transform() {
      return (
        (this.spec &&
          this.spec.uiSchema &&
          this.spec.uiSchema['ui:transform']) ||
        (x => x)
      );
    }

    get autocomplete() {
      return (
        this.spec && this.spec.uiSchema && this.spec.uiSchema['ui:autocomplete']
      );
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
      // if (el.__lookupGetter__('parent')){
      //   return el;
      // }
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

    get hasToggle() {
      return Boolean(this.spec.uiSchema && this.spec.uiSchema['ui:toggles']);
    }

    get hasControls() {
      return Boolean(this.spec.uiSchema && this.spec.uiSchema['ui:controls']);
    }

    get hasClear() {
      return Boolean(this.spec.uiSchema && this.spec.uiSchema['ui:clear']);
    }

    get placeholder() {
      return this.spec.uiSchema && this.spec.uiSchema['ui:placeholder'];
    }

    get enabled() {
      if (this.spec.uiSchema && this.spec.uiSchema['ui:enabled'] === false) {
        return false;
      }
      return true;
    }

    get hasUpload() {
      return this.spec.uiSchema && this.spec.uiSchema['ui:upload'];
    }

    get items() {
      const ret = [];
      let options;
      if (this.spec.jsonSchema.enum) {
        if (typeof this.spec.jsonSchema.enum === 'function') {
          options = this.spec.jsonSchema.enum(this);
        } else {
          options = this.spec.jsonSchema.enum;
        }
        options.forEach((element, index) => {
          if (this.spec.jsonSchema.enumNames) {
            // Non-compliant hack
            ret.push({
              label: this.spec.jsonSchema.enumNames[index],
              value: String(element),
            });
          } else if (this.spec.jsonSchema['x-enumNames']) {
            // Compliant hack
            ret.push({
              label: this.spec.jsonSchema['x-enumNames'][index],
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
        if (typeof this.spec.jsonSchema.examples === 'function') {
          options = this.spec.jsonSchema.examples(this);
        } else {
          options = this.spec.jsonSchema.examples;
        }
        options.forEach(element => {
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
      let extra = css``;
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
        if (this.spec.uiSchema['ui:options'].style) {
          extra = unsafeCSS(this.spec.uiSchema['ui:options'].style);
        }
      }
      if (this.widget === 'hidden') {
        hidden = unsafeCSS('display: none;');
      }
      return css`
        ${bgColor}
        ${color}
        ${hidden}
        ${extra}
      `;
    }

    get classes() {
      return (
        (this.spec.uiSchema &&
          this.spec.uiSchema['ui:options'] &&
          this.spec.uiSchema['ui:options'].class) ||
        ''
      );
    }

    get pattern() {
      let ret;
      if (this.spec.jsonSchema.format === 'email') {
        ret = '^([a-zA-Z0-9_\\.\\-+])+@[a-zA-Z0-9-.]+\\.[a-zA-Z0-9-]{2,}$';
      } else if (this.spec.jsonSchema.format === 'uri') {
        ret =
          '^(([a-zA-Z0-9_\\.\\-+])+://)?[a-zA-Z0-9-.]+\\.[a-zA-Z0-9-]{2,}([:0-9]|[/.]).*$';
      }
      return this.spec.jsonSchema.pattern || ret;
    }

    get errors() {
      const ret = [];
      if (
        this.spec.jsonSchema.required &&
        (this.spec.formData === undefined ||
          this.spec.formData === this.cast(null))
      ) {
        ret.push([this.spec.id, 'is a required property']);
      }
      return ret;
    }

    get payload() {
      return this.spec.formData;
    }

    get renderers() {
      const description =
        this.spec && this.spec.jsonSchema && this.spec.jsonSchema.description
          ? html`<div class="helper">${this.spec.jsonSchema.description}</div>`
          : html``;
      return {
        'text-field': html` <vaadin-text-field
          ?has-controls="${this.hasControls}"
          ?clear-button-visible="${this.hasClear}"
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          minlength=${ifDefined(this.spec.jsonSchema.minLength)}
          maxlength=${ifDefined(this.spec.jsonSchema.maxLength)}
          pattern=${ifDefined(this.spec.jsonSchema.pattern)}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.autocomplete}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .pattern=${this.pattern}
          .style=${this.css}
        >
          ${this.prefix && html`<div slot="prefix">${this.prefix}</div>`}
          ${this.suffix && html`<div slot="suffix">${this.suffix}</div>`}
        </vaadin-text-field>`,
        textarea: html` <vaadin-text-area
            ?has-controls="${this.hasControls}"
            ?clear-button-visible="${this.hasClear}"
            ?required="${this.spec.jsonSchema.required}"
            value="${ifDefined(this.spec.formData)}"
            label="${this.spec.jsonSchema.title ||
            (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
            ''}"
            helper-text="${ifDefined(this.spec.jsonSchema.description)}"
            class="${this.classes || ''} mist-form-field"
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
            ${this.prefix && html`<div slot="prefix">${this.prefix}</div>`}
            ${this.suffix && html`<div slot="suffix">${this.suffix}</div>`} </vaadin-text-area
          >${this.hasUpload
            ? html`<input type="file" @change=${this._uploadFile} />`
            : ``}`,
        checkboxes: this.spec.jsonSchema.enum
          ? html`
              <vaadin-checkbox-group
                label="${this.spec.jsonSchema.title}"
                @value-changed="${e => {
                  this.value = e.detail.value;
                }}"
                class="${this.classes || ''} mist-form-field"
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
            `
          : html` <vaadin-checkbox
              ?has-controls="${this.hasControls}"
              ?clear-button-visible="${this.hasClear}"
              ?required="${this.spec.jsonSchema.required}"
              .checked="${this.spec.formData}"
              label="${ifDefined(this.spec.jsonSchema.title)}"
              class="${this.classes || ''} mist-form-field"
              @change=${e => {
                e.detail = { id: this.spec.id, value: e.target.checked };
                this.debouncedEventChange(e);
              }}
              ?autofocus=${this.hasAutoFocus}
              ?disabled=${this.isDisabled}
              ?readonly=${this.isReadOnly}
              ?hidden=${this.isHidden}
              .style=${this.css}
            ></vaadin-checkbox>`,
        radio: html` <vaadin-radio-group
          ?required="${this.spec.jsonSchema.required}"
          label="${this.spec.jsonSchema.title}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          ?autofocus=${this.hasAutoFocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          value=${this.cast(this.spec.formData)}
          .style=${this.css}
        >
          ${this.items.map(
            item => html`
              <vaadin-radio-button
                value="${item.value}"
                label="${item.label}"
                ?checked=${String(Boolean(this.formData)) ===
                String(item.value)}
                @change=${e => {
                  e.detail = { id: this.spec.id, value: e.target.checked };
                  setTimeout(() => {
                    this.debouncedEventChange(e);
                  }, 300);
                }}
              >
              </vaadin-radio-button>
            `
          )}
        </vaadin-radio-group>`,
        select: html` <vaadin-select
          .items="${this.items}"
          .renderer="${this.renderer}"
          ?required="${this.spec.jsonSchema.required}"
          .value="${String(this.spec.formData)}"
          label="${this.spec.jsonSchema.title}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .pattern=${this.pattern}
          .style=${this.css}
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
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .pattern=${this.pattern}
          .style=${this.css}
        ></vaadin-combo-box>`,
        password: html`<vaadin-password-field
          ?has-controls="${this.hasControls}"
          ?clear-button-visible="${this.hasClear}"
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          minlength=${ifDefined(this.spec.jsonSchema.minLength)}
          maxlength=${ifDefined(this.spec.jsonSchema.maxLength)}
          pattern=${ifDefined(this.spec.jsonSchema.pattern)}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.autocomplete}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .pattern=${this.pattern}
          .style=${this.css}
        >
        </vaadin-password-field>`,
        email: html` <vaadin-email-field
          ?has-controls="${this.hasControls}"
          ?clear-button-visible="${this.hasClear}"
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          minlength=${ifDefined(this.spec.jsonSchema.minLength)}
          maxlength=${ifDefined(this.spec.jsonSchema.maxLength)}
          pattern=${ifDefined(this.spec.jsonSchema.pattern)}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.autocomplete}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .pattern=${this.pattern}
          .style=${this.css}
        >
        </vaadin-email-field>`,
        datetime: html` <vaadin-date-time-picker
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.autocomplete}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .style=${this.css}
        ></vaadin-date-time-picker>`,
        date: html` <vaadin-date-picker
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.autocomplete}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .style=${this.css}
        ></vaadin-date-picker>`,
        time: html` <vaadin-time-picker
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${this.spec.jsonSchema.title ||
          (Number.isNaN(Number(this.spec.id)) && this.spec.id) ||
          ''}"
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          colspan=${ifDefined(this.spec.jsonSchema.colspan)}
          autocomplete=${this.autocomplete}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?autoselect=${this.hasAutoSelect}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .style=${this.css}
        ></vaadin-time-picker>`,
        'alt-datetime': html`
          <label class="field">${this.spec.jsonSchema.title}</label>
          <input
            type="datetime-local"
            ?required="${this.spec.jsonSchema.required}"
            class="${this.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
            .style=${this.css}
          />
          ${description}
        `,
        'alt-date': html`
          <label class="field">${this.spec.jsonSchema.title}</label>
          <input
            type="date"
            ?required="${this.spec.jsonSchema.required}"
            class="${this.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
            .style=${this.css}
          />
          ${description}
        `,
        'alt-time': html`
          <label> class="field"${this.spec.jsonSchema.title}</label>
          <input
            type="time"
            ?required="${this.spec.jsonSchema.required}"
            class="${this.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
            .style=${this.css}
          />
          ${description}
        `,
        color: html` <label class="field">${this.spec.jsonSchema.title}</label>
          <div .style=${this.css}>
            <input
              type="color"
              ?required="${this.spec.jsonSchema.required}"
              class="${this.classes || ''} mist-form-field"
              .value=${this.cast(this.spec.formData)}
              @change=${this.debouncedEventChange}
              ?autofocus=${this.hasAutoFocus}
              ?disabled=${this.isDisabled}
              ?readonly=${this.isReadOnly}
              ?hidden=${this.isHidden}
              .style=${this.css}
            />
            ${description}
          </div>`,
        file: html` <label class="field" .style=${`display: block; ${this.css}`}
            >${this.spec.jsonSchema.title}</label
          >
          <input
            type="file"
            ?required="${this.spec.jsonSchema.required}"
            class="${this.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
            .style=${this.css}
          />
          ${description}`,
        hidden: html`
          <input
            type="hidden"
            class="${this.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
          />
        `,
        range: html`
          <p>${this.spec.jsonSchema.title}</p>
          <input
            type="range"
            ?required="${this.spec.jsonSchema.required}"
            class="${this.classes || ''} mist-form-field"
            .value=${this.cast(this.spec.formData)}
            @change=${this.debouncedEventChange}
            ?autofocus=${this.hasAutoFocus}
            ?disabled=${this.isDisabled}
            ?readonly=${this.isReadOnly}
            ?hidden=${this.isHidden}
            max="${ifDefined(this.spec.jsonSchema.maximum)}"
            min="${ifDefined(this.spec.jsonSchema.minimum)}"
            step="${ifDefined(this.step)}"
            .style=${this.css}
          />
          <span>${this.spec.jsonSchema.description}</span>
        `,
        integer: html` <vaadin-integer-field
          ?has-controls="${this.hasControls}"
          ?clear-button-visible="${this.hasClear}"
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.value)}"
          label="${ifDefined(this.spec.jsonSchema.title)}"
          max="${ifDefined(this.spec.jsonSchema.maximum)}"
          min="${ifDefined(this.spec.jsonSchema.minimum)}"
          step=${ifDefined(this.step)}
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .style=${this.css}
        >
          ${this.prefix && html`<div slot="prefix">${this.prefix}</div>`}
          ${this.suffix && html`<div slot="suffix">${this.suffix}</div>`}
        </vaadin-integer-field>`,
        number: html` <vaadin-number-field
          ?has-controls="${this.hasControls}"
          ?clear-button-visible="${this.hasClear}"
          ?required="${this.spec.jsonSchema.required}"
          value="${ifDefined(this.spec.formData)}"
          label="${ifDefined(this.spec.jsonSchema.title)}"
          max="${ifDefined(this.spec.jsonSchema.maximum)}"
          min="${ifDefined(this.spec.jsonSchema.minimum)}"
          step=${ifDefined(this.step)}
          helper-text="${ifDefined(this.spec.jsonSchema.description)}"
          class="${this.classes || ''} mist-form-field"
          @value-changed=${this.debouncedEventChange}
          placeholder="${ifDefined(this.placeholder)}"
          ?autofocus=${this.hasAutoFocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.isReadOnly}
          ?hidden=${this.isHidden}
          .style=${this.css}
        >
          ${this.prefix && html`<div slot="prefix">${this.prefix}</div>`}
          ${this.suffix && html`<div slot="suffix">${this.suffix}</div>`}
        </vaadin-number-field>`,
        toggle: html`
          <div .style="${this.css}">
            <span class="field">${this.spec.jsonSchema.title}</span>
            <paper-toggle-button
              class="${this.classes || ''} mist-form-field"
              ?checked=${this.spec.formData}
              .style=${this.css}
              @checked-changed=${this.debouncedEventChange}
            ></paper-toggle-button>
            <span class="field">${this.spec.jsonSchema.description}</span>
          </div>
        `,
      };
    }

    render() {
      if (!this.spec) return html``;
      if (typeof this.widget === 'function') {
        return this.widget(this);
      }
      const rendered = this.renderers[this.widget];
      // if (!rendered) debugger;
      // if (this.prefix || this.suffix) {
      //   rendered = html`<span class="prefix">${this.prefix}</span>${rendered}<span class="suffix">${this.suffix}</span>`
      // }
      return rendered;
    }

    connectedCallback() {
      super.connectedCallback();
      this.debouncedEventChange = debouncer(e => this.valueChanged(e), 100);
    }

    valueChanged(e) {
      if (e) {
        // eslint-disable-next-line no-console
        console.debug(this.id, 'Updating form field', e.detail);
      }
      const valueChangedEvent = new CustomEvent('field-value-changed', {
        detail: {
          id: this.spec.id,
        },
        bubbles: false,
        composed: true,
      });
      this.dispatchEvent(valueChangedEvent);
      e.stopPropagation();
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
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'textarea',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/text-area').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin textarea');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'textarea',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'checkboxes':
          if (customElements.get('vaadin-checkbox') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'checkbox',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/checkbox').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin checkbox');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'checkbox',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'select':
          if (customElements.get('vaadin-select') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'select',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/select').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin select');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'select',
                  composed: true,
                  bubbles: true,
                })
              );
            });
            import('@vaadin/item').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin item');
            });
            import('@vaadin/list-box').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin list-box');
            });
          }
          break;
        case 'combo-box':
          if (customElements.get('vaadin-combo-box') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'combo',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/combo-box').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin combo box');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'combo',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'text-field':
          if (customElements.get('vaadin-text-field') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'text',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/text-field').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin text-field');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'text',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'password':
          if (customElements.get('vaadin-password-field') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'password',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/password-field').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin password-field');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'password',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'email':
          if (customElements.get('vaadin-email-field') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'email',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/email-field').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin email-field');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'email',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'radio':
          if (customElements.get('vaadin-radio-group') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'radio',
                composed: true,
                bubbles: true,
              })
            );
            import(
              '@vaadin/radio-group/theme/material/vaadin-radio-group.js'
            ).then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin radio group');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'radio',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'number':
          if (customElements.get('vaadin-number-field') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'number',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/number-field').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin number field');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'number',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'integer':
          if (customElements.get('vaadin-integer-field') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'integer',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/integer-field').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin integer field');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'integer',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'datetime':
          if (customElements.get('vaadin-date-time-picker') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'datetime',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/date-time-picker').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin datetime picker');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'datetime',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'date':
          if (customElements.get('vaadin-date-picker') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'date',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/date-picker').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin date picker');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'date',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'time':
          if (customElements.get('vaadin-time-picker') === undefined) {
            this.parent.dispatchEvent(
              new CustomEvent('loading', {
                detail: 'time',
                composed: true,
                bubbles: true,
              })
            );
            import('@vaadin/time-picker').then(() => {
              // eslint-disable-next-line no-console
              console.debug('imported vaadin time picker');
              this.parent.dispatchEvent(
                new CustomEvent('loaded', {
                  detail: 'time',
                  composed: true,
                  bubbles: true,
                })
              );
            });
          }
          break;
        case 'range':
          break;
        default:
          break;
      }
    }

    _uploadFile(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        // eslint-disable-next-line
        reader.onload = function (ev) {
          this.shadowRoot.querySelector('.mist-form-field').value =
            ev.target.result;
          this.valueChanged();
        }.bind(this);
        reader.readAsText(file);
      }
    }
  };
