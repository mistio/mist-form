import { html, css, LitElement } from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {fieldMixin} from './mixin.js';

export class MistFormIntegerField extends fieldMixin(LitElement) {
    static get properties() {
        return {
            value: { type: Number }
        }
    }

    connectedCallback() {
        super.connectedCallback()
        import('@vaadin/integer-field').then(
            console.debug('imported vaadin integer field')
        );
    }

    cast(value) {
        return parseInt(value);
    }

    render() {
        if (!this.spec) return html``;
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
            >
            </vaadin-integer-field>`
    }
}
customElements.define('mist-form-integer-field', MistFormIntegerField)