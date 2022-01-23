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
        grid-template-columns: 2fr 4fr 4fr 30px 4fr 30px;
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

      .fields-container > * {
        flex-grow: 1;
        flex-basis: calc((var(--threshold) - 100%) * 999);
      }
    `;
  }

  constructor() {
    super();
    this.value = {};
    this.valueByName = {};
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
    this.valueByName = this.parent.mistForm.getValuesfromDOM(
      this.shadowRoot,
      true
    );
    this.parent.valueChanged(e);
  }

  updateIndexAndFieldPath(index) {
    this.index = index;
    this.fieldPath = `${this.parent.fieldPath}[${this.index}]`;
    const children = this.parent.props.inline
      ? this.shadowRoot.children
      : this.shadowRoot.querySelector('.fields-container').children;
    for (const child of children) {
      if (child.props) {
        child.props = {
          ...child.props,
          fieldPath: `${this.fieldpath}.${child.name}`,
        };
        child.fieldPath = `${this.fieldPath}.${child.name}`;
      }
    }
    this.updateComplete.then(() => {
      for (const child of children) {
        this.parent.mistForm.dependencyController.removeElementReference(
          child.fieldPath
        );
        this.parent.mistForm.dependencyController.addElementReference(child);
      }
    });
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    this.fieldPath = `${this.parent.fieldPath}[${this.index}]`;
  }

  update(changedProperties) {
    this.fieldPath = `${this.parent.fieldPath}[${this.index}]`;
    super.update(changedProperties);
  }

  render() {
    // TODO: Inital values of subforms in row should be attached
    // Possible issue: Path not being set properly
    const isNumbered = this.parent.props.numbered;
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

      return prop.hidden
        ? html`<span></span>
            <div></div>`
        : html`${this.parent.fieldTemplates.getTemplate(prop)}`;
    });
    return html`
      ${isNumbered ? html`<span>${this.index}.</span>` : ''}
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
