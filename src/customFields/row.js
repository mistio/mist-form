import { LitElement, html, css } from 'lit-element';
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
      }

      paper-input,
      paper-dropdown-menu {
        width: 90%;
        display: inline-block;
        margin-right: 20px;
        margin-top: -20px;
      }

      paper-checkbox {
        --paper-checkbox-checked-color: #2196f3;
        --paper-checkbox-checked-ink-color: #2196f3;
        --paper-checkbox-unchecked-color: #424242;
      }

      :host {
        display: grid;
        grid-auto-columns: 1fr;
        grid-column-gap: 5px;
        grid-auto-flow: column;
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
      if (this.value) {
        prop.value = this.value[prop.name];
      }
      prop.fieldPath = `${this.fieldPath}.${prop.name}`;

      return prop.hidden
        ? html`<span></span>
            <div></div>`
        : html`${this.parent.fieldTemplates.getTemplate(prop)}`;
    });
    return html`
      ${row}
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
