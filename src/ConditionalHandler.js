import { LitElement } from 'lit-element';

export class ConditionalHandler extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      data: { type: Object },
    };
  }

  static handleConditional() {
    console.log('condition handled ');
  }

  render() {}
}
