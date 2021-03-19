import {LitElement, html, css} from 'lit-element';

class FieldRow extends LitElement {
  static get properties() {
    return {
      value: {type: Object},
      index: {type: Number}
    };
  }

  constructor() {
    super();
    this.value = {name:"", show: false};
    this.valueChanged();
  }

  static get styles() {
    return css`
      :host {
        display: block;
        color: var(--mist-form-field-row-text-color, black);
        background: var(--mist-form-field-row-background-color, white);
        font-family: var(--mist-form-field-row-font-family, Roboto);
      }

      paper-input {
        width: 50%;
        display: inline-block;
        margin-right:20px;
      }
      paper-dropdown-menu {
        width: 20%;
        display: inline-block;
      }
    `;
  }

  updateNameValue(e) {
    this.value.name = e.detail.value;
    this.valueChanged();
  }
  updateShowValue(e) {
      console.log("update show ", e)
    this.value.show = e.detail.value || false;
    this.valueChanged();
  }

  removeRow(){
    const event = new CustomEvent('remove-row', {
        detail: {
          index: this.index
        }
      });
      this.dispatchEvent(event);
  }

  valueChanged(){
      console.log("this.value ", this.value)
    const event = new CustomEvent('value-changed', {
        detail: {
          index: this.index,
          value: this.value
        }
      });
      this.dispatchEvent(event);
  }

  render() {
    return html`
    <td>
    <paper-input   .value=${this.value.name}      @value-changed=${this.updateNameValue}></paper-input><paper-checkbox .checked=${this.value.show}  @checked-changed=${this.updateShowValue}></paper-checkbox></td>
     <paper-icon-button
    icon="icons:close"
    alt="open docs"
    title="open docs"
    class="docs"
    @tap=${this.removeRow}
  >
  </paper-icon-button></td>
    `
  }
}

customElements.define('field-row', FieldRow);
