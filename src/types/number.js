import { html, css, LitElement } from 'lit';
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
    connectedCallback() {
        super.connectedCallback()
        import('@vaadin/number-field').then(
            console.debug('imported vaadin number field')
        );
    }

    cast(value) {
        return Number(value);
    }

    render() {
        if (!this.spec) return html``;
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
            >
            </vaadin-number-field>`
    }

    get domValue() {
        const field = this.shadowRoot.querySelector('.mist-form-field');
        return field.value !== undefined ? this.cast(field.value) : this.cast(field.getAttribute('value'));
    }

}
customElements.define('mist-form-number-field', MistFormNumberField)