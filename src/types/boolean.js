import { html, LitElement, render } from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {fieldMixin} from './mixin.js';

export class MistFormBooleanField extends fieldMixin(LitElement) {
    static get properties() {
        return {
            value: { type: Boolean }
        }
    }

    get domValue() {
        const field = this.shadowRoot.querySelector('.mist-form-field');
        // if (field.value !== undefined) return Boolean(field.value);
        if (this.widget === 'select') {
            if (field.value === 'false' || !field.value) return false;
            return true;
        } if (this.widget === 'radio') {
            if (field.value === 'false' || !field.value) return false;
            return true;
        }
        return Boolean(field.checked);
    }

    get widget() {
        return super.widget || 'checkboxes';
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

    cast(value) {
        if (value === undefined) {
            return this.cast(this.value);
        }
        return Boolean(value);
    }

    render() {
        if (!this.spec) return html``;
        if (this.widget === 'select') {
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
                placeholder="${ifDefined(this.placeholder)}"
                ?autofocus=${this.hasAutoFocus}
                ?disabled=${this.isDisabled}
                ?readonly=${this.isReadOnly}
                ?hidden=${this.isHidden}
                >
            </vaadin-select>
            `
        } if (this.widget === 'radio') {
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
        return html`
            <span>${this.spec.jsonSchema.description}</span>
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
                ?autofocus=${this.hasAutoFocus}
                ?disabled=${this.isDisabled}
                ?readonly=${this.isReadOnly}
                ?hidden=${this.isHidden}
            >
            </vaadin-checkbox>
        `
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
}
customElements.define('mist-form-boolean-field', MistFormBooleanField)