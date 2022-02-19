import { html, css, LitElement, render } from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {repeat} from 'lit/directives/repeat.js';
import {fieldMixin} from './mixin.js';
import '@vaadin/text-area';
import '@vaadin/text-field';
import '@vaadin/select';
import '@vaadin/item';
import '@vaadin/list-box';

export class MistFormStringField extends fieldMixin(LitElement) {
    static get properties() {
        return {
            value: { type: String }
        }
    }

    static get styles() {
        return [
            css``,
        ];
    }
    
    render() {
        if (!this.spec) return html``
        if (this.spec.uiSchema && this.spec.uiSchema["ui:widget"] === 'textarea') {
            return html`
            <vaadin-text-area
                has-controls clear-button-visible
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
                ?autofocus=${Boolean(this.spec.uiSchema['ui:autofocus'])}
            >
                ${this.icon}
            </vaadin-text-area>`;    
        } else if (this.spec.jsonSchema.enum) {
            if (this.spec.uiSchema["ui:widget"] === 'checkboxes') {
                return html`
                    <vaadin-checkbox-group
                        label="${this.spec.jsonSchema.title}"
                        @value-changed="${(e) => (this.value = e.detail.value)}"
                        class="${this.spec.classes || ''} mist-form-field"
                        theme="vertical">
                    ${repeat(this.spec.jsonSchema.enum || [], (item) => {item}, (item, index) => html`
                        <vaadin-checkbox
                            id="${item}"
                            label="${item}"
                            ?checked=${this.spec.formData && this.spec.formData.indexOf(item) != -1}
                            @change=${e => {
                                e.detail = {id: item, value:e.target.checked}
                                this.debouncedEventChange(e);
                            }}
                        >
                        </vaadin-checkbox>
                    `)}
                    </vaadin-checkbox-group>
                `
            }
            return html`
                <vaadin-select
                    .renderer="${this.renderer}"
                    ?required="${this.spec.jsonSchema.required}"
                    .items="${this.items}"
                    .value="${this.spec.formData}"
                    label="${this.spec.jsonSchema.title}"
                    helper-text="${ifDefined(this.spec.jsonSchema.description)}"
                    class="${this.spec.classes || ''} mist-form-field"
                ></vaadin-select>`
        }
        return html`
            <vaadin-text-field
                has-controls clear-button-visible
                ?required="${this.spec.jsonSchema.required}"
                value="${ifDefined(this.spec.formData)}"
                label="${this.spec.jsonSchema.title || (isNaN(Number(this.spec.id)) && this.spec.id) || ''}"
                helper-text="${ifDefined(this.spec.jsonSchema.description)}"
                class="${this.spec.classes || ''} mist-form-field"
                @value-changed=${this.debouncedEventChange}
                minlength=${ifDefined(this.spec.jsonSchema.minLength)}
                maxlength=${ifDefined(this.spec.jsonSchema.maxLength)}
                pattern=${ifDefined(this.spec.jsonSchema.pattern)}
                colspan=${ifDefined(this.spec.jsonSchema.colspan)}
                ?autofocus=${Boolean(this.spec.uiSchema["ui:autofocus"])}
                autocomplete=${this.spec.uiSchema["ui:autocomplete"]}
            >
            </vaadin-text-field>`;
    }

    cast(value) {
        return String(value || '');
    }

    get items() {
        let ret = [];
        this.spec.jsonSchema.enum.forEach(element => {
            ret.push({
                label: element,
                value: element
            })
        });
        return ret;
    }

    updated(changedProperties) {
        const spec = changedProperties.get('spec');
        if (!spec) return;
        if (spec.uiSchema && spec.uiSchema["ui:widget"] === 'textarea') {
            import('@vaadin/text-area').then(() => {console.debug('imported vaadin textarea')});
        } else if (spec.jsonSchema.enum) {
            if (spec.uiSchema["ui:widget"] === 'checkboxes') {
                import('@vaadin/checkbox').then(() => {console.debug('imported vaadin checkbox')})
            } else {
                import('@vaadin/select').then(function() {
                    console.debug('imported vaadin select');
                }.bind(this));
                import('@vaadin/item').then(() => {console.debug('imported vaadin item')});
                import('@vaadin/list-box').then(() => {console.debug('imported vaadin list-box')});
            }
        }
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

customElements.define('mist-form-string-field', MistFormStringField)