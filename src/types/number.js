import { html, css, LitElement, render } from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {fieldMixin} from './mixin.js';

export class MistFormNumberField extends fieldMixin(LitElement) {
    static get properties() {
        return {
            value: { type: Number }
        }
    }

    static get styles() {
        return [
            css`
            vaadin-number-field {
                width: 100%;
            }
            `,
        ];
    }

    get widget() {
        const w = super.widget;
        return w && w !== 'updown' ? w : this.spec.jsonSchema.enum && 'select' || 'number';
    }

    get domValue() {
        const field = this.shadowRoot.querySelector('.mist-form-field');
        return field.value !== undefined ? this.cast(field.value) : this.cast(field.getAttribute('value'));
    }

    cast(value) {
        if (value === undefined) {
            return Number(this.value);
        }
        return Number(value);
    }

    render() {
        if (!this.spec) return html``;
        if (this.widget === 'select') {
            return html`
                <vaadin-select
                    .renderer="${this.renderer}"
                    ?required="${this.spec.jsonSchema.required}"
                    .items="${this.items}"
                    label="${this.spec.jsonSchema.title}"
                    helper-text="${ifDefined(this.spec.jsonSchema.description)}"
                    class="${this.spec.classes || ''} mist-form-field"
                    value="${ifDefined(this.spec.formData)}"
                    @value-changed=${this.debouncedEventChange}
                    placeholder="${ifDefined(this.placeholder)}"
                    ?autofocus=${this.hasAutoFocus}
                    ?disabled=${this.isDisabled}
                    ?readonly=${this.isReadOnly}
                    ?hidden=${this.isHidden}
                ></vaadin-select>
            `
        }
        if (this.widget === 'radio') {
            return html`
                <vaadin-radio-group
                    ?required="${this.spec.jsonSchema.required}"
                    label="${this.spec.jsonSchema.title}"
                    helper-text="${ifDefined(this.spec.jsonSchema.description)}"
                    class="${this.spec.classes || ''} mist-form-field"
                    value="${ifDefined(this.spec.formData)}"
                    @value-changed=${this.debouncedEventChange}
                    ?autofocus=${this.hasAutoFocus}
                    ?disabled=${this.isDisabled}
                    ?readonly=${this.isReadOnly}
                    ?hidden=${this.isHidden}
                >
                    ${this.items.map(
                        (item) => html`
                            <vaadin-radio-button value="${item.value}" label="${item.label}" ?checked=${String(Boolean(this.formData)) === String(item.value)}>
                            </vaadin-radio-button>
                        `
                    )}
                </vaadin-radio-group>
            `
        }
        if (this.widget === 'range') {
            return html`
                <p>${this.spec.jsonSchema.title}</p>
                <input
                    type="range"
                    ?required="${this.spec.jsonSchema.required}"
                    class="${this.spec.classes || ''} mist-form-field"
                    .value=${this.cast(this.spec.formData)}
                    @change=${this.debouncedEventChange}
                    ?autofocus=${this.hasAutoFocus}
                    ?disabled=${this.isDisabled}
                    ?readonly=${this.isReadOnly}
                    ?hidden=${this.isHidden}
                    max="${ifDefined(this.spec.jsonSchema.maximum)}"
                    min="${ifDefined(this.spec.jsonSchema.minimum)}"
                    step="${ifDefined(this.step)}" />
                <span>${this.spec.jsonSchema.description}</span>
            `
        }
        return html`
            <vaadin-number-field
                has-controls clear-button-visible
                ?required="${this.spec.jsonSchema.required}"
                value="${ifDefined(this.spec.formData)}"
                label="${ifDefined(this.spec.jsonSchema.title)}"
                max="${ifDefined(this.spec.jsonSchema.maximum)}"
                min="${ifDefined(this.spec.jsonSchema.minimum)}"
                step=${ifDefined(this.step)}
                helper-text="${ifDefined(this.spec.jsonSchema.description)}"
                class="${this.spec.classes || ''} mist-form-field"
                @value-changed=${this.debouncedEventChange}
                placeholder="${ifDefined(this.placeholder)}"
                ?autofocus=${this.hasAutoFocus}
                ?disabled=${this.isDisabled}
                ?readonly=${this.isReadOnly}
                ?hidden=${this.isHidden}
            >
            </vaadin-number-field>`
    }

    renderer(root) {
        render(
            html`
                <vaadin-list-box>
                ${this.items ? this.items.map((item) => html`<vaadin-item value="${item.value}">${item.label}</vaadin-item>`) : ''}
                </vaadin-list-box>
          `,
          root
        )
    }
}
customElements.define('mist-form-number-field', MistFormNumberField)