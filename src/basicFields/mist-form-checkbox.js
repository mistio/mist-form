import { LitElement, html, css } from 'lit-element';
import { spreadProps } from '@open-wc/lit-helpers';
import { until } from 'lit-html/directives/until.js';
import * as util from '../utilities.js';
// TODO: Set required property that gives error if element has empty value
class MistDropdown extends LitElement {
  static get properties() {
    return {
      value: { type: String },
      props: {type: Object},
      fieldPath: {type: String, reflect: true}
    };
  }

  constructor() {
    super();
  }

  static get styles() {
    return css`
    `;
  }

  valueChanged(e) {
    this.valueChangedEvent(e);
  }

  firstUpdated() {
    this.fieldPath = this.props.fieldPath;
  }
  render() {
      console.log("render ")
return html`<paper-checkbox
class="${props.classes || ''} mist-form-input"
...="${spreadProps(props)}"
@checked-changed=${this.valueChanged}
?excludeFromPayload="${props.excludeFromPayload}"
value=""
fieldPath="${props.fieldPath}"
>${props.label}</paper-checkbox
>`

  }
}

customElements.define('mist-form-dropdown', MistDropdown);
