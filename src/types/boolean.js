import { html, css, LitElement, render } from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {fieldMixin} from './mixin.js';

export class MistFormBooleanField extends fieldMixin(LitElement) {
    static get properties() {
        return {
            value: { type: Boolean }
        }
    }

    connectedCallback() {
        super.connectedCallback()
        import('@vaadin/checkbox').then(
            console.debug('imported vaadin checkbox')
        );
    }

    cast(value) {
        return Boolean(value);
    }

    render() {
        if (!this.spec) return html``;
        if (this.spec.uiSchema && this.spec.uiSchema["ui:widget"] && this.spec.uiSchema["ui:widget"] === 'select') {
            return html`
            <vaadin-select
                .items="${this.items}"
                .renderer="${this.renderer}"
                ?required="${this.spec.jsonSchema.required}"
                .value="${String(this.spec.formData)}"
                label="${this.spec.jsonSchema.title}"
                helper-text="${ifDefined(this.spec.jsonSchema.description)}"
                class="${this.spec.classes || ''} mist-form-field"
                @value-changed=${this.debouncedEventChange}
                >
            </vaadin-select>
            `
        }
        return html`
            <vaadin-checkbox
                has-controls clear-button-visible
                ?required="${this.spec.jsonSchema.required}"
                .checked="${this.spec.formData}"
                label="${ifDefined(this.spec.jsonSchema.title)}"
                class="${this.spec.classes || ''} mist-form-field"
                @change=${e => {
                    e.detail = {id: this.spec.id, value:e.target.checked}
                    this.debouncedEventChange(e);
                }}
            >
            </vaadin-checkbox><span>${this.spec.jsonSchema.description}</span>
        `
    }
    get domValue() {
        const field = this.shadowRoot.querySelector('.mist-form-field');
        //if (field.value !== undefined) return Boolean(field.value);
        if (this.spec.uiSchema && this.spec.uiSchema["ui:widget"] && this.spec.uiSchema["ui:widget"] === 'select') {
            if (field.value == 'false' || !field.value) return false;
            return true;
        }
        return Boolean(field.checked);
    }

    renderer(root) {
        render(
            html`
                <vaadin-list-box>
                    ${this.items.map((item) => html`<vaadin-item value="${item.value}">${item.label}</vaadin-item>`)}
                </vaadin-list-box>
          `,
          root
        )
    }

    get items() {
        return [{
            value: true,
            label: "Yes"
        }, {
            value: false,
            label: "No"
        }]
    }
}
customElements.define('mist-form-boolean-field', MistFormBooleanField)