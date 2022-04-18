import { html, css, LitElement } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { fieldMixin } from './mixin.js';
import '@vaadin/icon';
import '@vaadin/icons';

/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
export class MistFormArrayField extends fieldMixin(LitElement) {
  static get styles() {
    return css`
      :host {
        display: block;
      }
      ul {
        padding-inline-start: 24px;
        list-style: auto;
      }
      .mist-form-field {
        width: 192px;
        display: block;
      }
    `;
  }

  static get properties() {
    return {
      value: {
        type: Array,
      },
    };
  }

  get domValue() {
    const ret = [];
    if (this.spec.jsonSchema.uniqueItems) {
      this.shadowRoot
        .querySelector(`#${this.id}-items`)
        .shadowRoot.querySelectorAll('vaadin-checkbox[checked]')
        .forEach(i => {
          ret.push(i.id);
        });
      return ret;
    }
    this.shadowRoot.querySelectorAll('.mist-form-field').forEach(f => {
      ret.push(f.domValue);
    });
    return ret;
  }

  get payload() {
    const ret = [];
    this.shadowRoot.querySelectorAll('.mist-form-field').forEach(f => {
      ret.push(f.payload);
    });
    return ret;
  }

  cast(value) {
    if (value === undefined) {
      return this.cast(this.value);
    }
    return Array(value);
  }

  render() {
    if (!this.spec) return html``;
    const title = this.spec.jsonSchema.title
      ? html`<h2>${this.spec.jsonSchema.title}</h2>`
      : html``;
    const description = this.spec.jsonSchema.description
      ? html`<p>${this.spec.jsonSchema.description}</p>`
      : html``;
    // Borrowed from https://gist.github.com/iperelivskiy/4110988
    let body;
    if (this.spec.jsonSchema.uniqueItems) {
      body = this.parent
        ? this.parent.renderField({
            id: `${this.spec.id}-items`,
            jsonSchema: this.parent.resolveDefinitions(
              this.spec.jsonSchema.items
            ),
            uiSchema:
              { ...this.spec.uiSchema.items, ...this.spec.uiSchema } || {},
            formData: this.spec.formData,
          })
        : ``;
    } else {
      body = html`
        <ul>
          ${repeat(
            this.spec.formData || [],
            item => `item-${this.hash(JSON.stringify(item))}`,
            (item, index) => html`
              <li>
                <div style="display: flex; align-items: baseline;">
                  <div style="flex: 1;">
                    ${this.parent
                      ? this.parent.renderField({
                          id: this.hash(JSON.stringify(item)),
                          jsonSchema: this.itemSchema(item, index),
                          uiSchema: this.itemUiSchema(item, index),
                          formData: item,
                        })
                      : ''}
                  </div>
                  <div style="flex: 1; min-width: 135px; padding-left: 32px;">
                    ${this.orderable(item, index)
                      ? html`
                          <vaadin-button
                            theme="icon"
                            aria-label="Up"
                            ?disabled=${!index}
                            @click=${e => this._up(e, item, index)}
                          >
                            <vaadin-icon icon="vaadin:arrow-up"></vaadin-icon>
                          </vaadin-button>
                          <vaadin-button
                            theme="icon"
                            aria-label="Down"
                            ?disabled=${index === this.spec.formData.length - 1}
                            @click=${e => this._down(e, item, index)}
                          >
                            <vaadin-icon icon="vaadin:arrow-down"></vaadin-icon>
                          </vaadin-button>
                        `
                      : ''}
                    ${this.removable(item, index)
                      ? html`
                          <vaadin-button
                            theme="icon error"
                            aria-label="Close"
                            @click=${e => this._remove(e, item, index)}
                          >
                            <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                          </vaadin-button>
                        `
                      : ''}
                  </div>
                </div>
              </li>
            `
          )}
        </ul>
        ${!this.spec.uiSchema ||
        this.spec.uiSchema['ui:options'] === undefined ||
        this.spec.uiSchema['ui:options'].addable !== false
          ? html`
              <vaadin-form-layout
                .responsiveSteps=${this.parent.responsiveSteps}
              >
                <div style="display: flex">
                  <div style="flex: 1; min-width: 248px;"></div>
                  <div style="flex: 1;">
                    <vaadin-button
                      theme="icon"
                      aria-label="Add"
                      style="width: 134px"
                      @click=${this._add}
                    >
                      <vaadin-icon icon="vaadin:plus"></vaadin-icon>
                    </vaadin-button>
                  </div>
                </div>
              </vaadin-form-layout>
            `
          : ''}
      `;
    }
    return html` ${title} ${description} ${body} `;
  }

  hash(s) {
    if (!this.jsonSchema) return '';
    /* Simple hash function. */
    let a = 1;
    let c = 0;
    let h;
    let o;
    if (s) {
      a = 0;
      /* jshint plusplus:false bitwise:false */
      for (h = s.length - 1; h >= 0; h--) {
        o = s.charCodeAt(h);
        a = ((a << 6) & 268435455) + o + (o << 14);
        c = a & 266338304;
        a = c !== 0 ? a ^ (c >> 21) : a;
      }
    }
    return String(a);
  }

  itemSchema(item, index) {
    return this.parent.resolveDefinitions(
      (this.spec.jsonSchema.length && this.spec.jsonSchema[index]) ||
        (this.spec.jsonSchema.items.length
          ? this.spec.jsonSchema.items[index] ||
            this.spec.jsonSchema.additionalItems
          : this.spec.jsonSchema.items)
    );
  }

  itemUiSchema(item, index) {
    if (
      this.spec.uiSchema.items &&
      this.spec.uiSchema.items.length &&
      index <= this.spec.uiSchema.items.length
    )
      return this.spec.uiSchema.items[index];
    return { ...this.spec.uiSchema.items, ...this.spec.uiSchema } || {};
  }

  orderable(item, index) {
    if (
      this.spec &&
      this.spec.jsonSchema &&
      this.spec.jsonSchema.items &&
      this.spec.jsonSchema.items.length &&
      index < this.spec.jsonSchema.items.length
    )
      return false;
    return (
      !this.spec.uiSchema ||
      this.spec.uiSchema['ui:options'] === undefined ||
      this.spec.uiSchema['ui:options'].orderable !== false
    );
  }

  removable(item, index) {
    if (
      this.spec &&
      this.spec.jsonSchema &&
      this.spec.jsonSchema.items &&
      this.spec.jsonSchema.items.length &&
      index < this.spec.jsonSchema.items.length
    )
      return false;
    return (
      !this.spec.uiSchema ||
      this.spec.uiSchema['ui:options'] === undefined ||
      this.spec.uiSchema['ui:options'].removable !== false
    );
  }

  _add() {
    const newItem =
      this.spec.jsonSchema.type === 'array'
        ? this.spec.jsonSchema.items.default
        : {};
    this.spec.formData = [...(this.spec.formData || []), newItem];
    this.requestUpdate();
  }

  _remove(e, item, index) {
    const value = this.domValue;
    value.splice(index, 1);
    this.spec = { ...this.spec, formData: value };
    // let element = this.shadowRoot.querySelector(`#item-${  this.hash(JSON.stringify(item))}`);
    // if (element && element.remove) element.remove();
    this.requestUpdate();
    this.valueChanged(e);
  }

  _up(e, item, index) {
    const array = this.spec.formData;
    const tmp = array[index - 1];
    array[index - 1] = array[index];
    array[index] = tmp;
    this.requestUpdate();
    this.valueChanged(e);
  }

  _down(e, item, index) {
    const array = this.spec.formData;
    const tmp = array[index + 1];
    array[index + 1] = array[index];
    array[index] = tmp;
    this.requestUpdate();
    this.valueChanged(e);
  }

  parentWidth() {
    const l = this.shadowRoot.querySelector('vaadin-form-layout');
    return (l && l.clientWidth) || '100px';
  }

  validate() {
    let valid = true;
    this.shadowRoot.querySelectorAll('.mist-form-field').forEach(f => {
      valid = valid && f.validate();
    });
    return valid;
  }
}
customElements.define('mist-form-array-field', MistFormArrayField);
