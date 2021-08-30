import { LitElement, html, css } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map.js';
import * as util from '../utilities.js';

class MistFormRow extends LitElement {
  static get properties() {
    return {
      value: { type: Object },
      props: { type: Object },
      fieldPath: { type: String, reflect: true },
    };
  }

  static get styles() {
    return css`
      paper-dropdown-menu {
        width: 100%;
        display: inline-block;
      }

      paper-icon-button {
        color: #adadad;
        margin-top: 5px;
        flex-basis: 4rem;
        flex-grow: 1;
      }

      mist-form-dropdown {
        margin-top: -10px;
      }

      mist-form-text-field {
        margin-left: -10px;
        margin-top: -10px;
      }

      mist-form-checkbox {
        margin-top: -1px;
      }

      :host {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      :host(.inline) {
        display: grid;
        grid-template-columns: 2fr 4fr 4fr 30px 30px;
        align-items: center;
      }

      .fields-container {
        display: flex;
        flex-wrap: wrap;
        --threshold: 40rem;
        flex-basis: 0;
        flex-grow: 999;
        min-width: 50%;
      }

      .fields-container > span {
        flex-grow: 1;
        flex-basis: calc((var(--threshold) - 100%) * 999);
      }
    `;
  }

  constructor() {
    super();
    this.value = {};
  }

  validate() {
    // All fields should be valid
    return this.shadowRoot.children.every(element => element.validate());
  }

  valueChanged(e, name) {
    if (util.valueNotEmpty(e.value)) {
      this.value[name] = e.value;
    } else {
      delete this.value[name];
    }

    this.parent.valueChanged(e);
  }

  updateIndexAndFieldPath(index) {
    this.index = index;
    this.fieldPath = `${this.parent.fieldPath}[${this.index}]`;
    for (const child of this.shadowRoot.children) {
      if (child.props) {
        child.props = {
          ...child.props,
          fieldPath: `${this.fieldpath}.${child.name}`,
        };
        child.fieldPath = `${this.fieldPath}.${child.name}`;
      }
    }
    this.updateComplete.then(() => {
      for (const child of this.shadowRoot.children) {
        if (child.props) {
          this.parent.mistForm.dependencyController.addElementReference(child);
        }
      }
    });
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    this.fieldPath = `${this.parent.fieldPath}[${this.index}]`;
  }

  render() {
    this.fieldPath = `${this.parent.fieldPath}[${this.index}]`;
    const row = Object.keys(this.rowProps).map(key => {
      const prop = { ...this.rowProps[key] };

      prop.valueChangedEvent = e => {
        this.valueChanged(e, prop.name, this.index);
      };

      if (Object.keys(this.value).length) {
        prop.value = this.value[prop.name];
      }

      prop.fieldPath = `${this.fieldPath}.${prop.name}`;
      prop.noLabelFloat = true;

      prop.styles = { outer: { padding: '10px', margin: 0 }, ...prop.styles };
      return html`<span style=${styleMap(prop.styles && prop.styles.outerSpan)}
        >${this.parent.fieldTemplates.getTemplate(prop)}</span
      >`;
    });
    return html`
      ${this.parent.props.inline
        ? html`${row}`
        : html`<span class="fields-container"> ${row} </span>`}

      <paper-icon-button
        icon="icons:delete"
        alt="Remove row"
        title="Remove row"
        class="remove"
        @tap=${() => {
          this.remove();
          this.parent.updateRowIndexes(this.index);
        }}
      >
      </paper-icon-button>
    `;
  }
}

customElements.define('mist-form-row', MistFormRow);
