import { html, css, LitElement } from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {fieldMixin} from './mixin.js';

export class MistFormIntegerField extends fieldMixin(LitElement) {
    static get properties() {
        return {
            value: { type: Number }
        }
    }

    static get styles() {
        return [
            css`
            vaadin-integer-field {
                width: 100%;
            }
            `,
        ];
    }

    get widget() {
        const w = super.widget;
        return w && w !== 'updown' ? w : this.spec.jsonSchema.enum && 'radio' || 'integer';
    }

    cast(value) {
        if (value === undefined) {
            return parseInt(this.value, 10);
        }
        return parseInt(value, 10);
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
            <vaadin-integer-field
                has-controls clear-button-visible
                ?required="${this.spec.jsonSchema.required}"
                value="${ifDefined(this.value)}"
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
            </vaadin-integer-field>`
    }
}
customElements.define('mist-form-integer-field', MistFormIntegerField)