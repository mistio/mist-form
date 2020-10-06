import { LitElement } from 'lit-element';

export class ConditionalHandler extends LitElement {
  static get properties() {
    return {
      src: { type: String },
      data: { type: Object },
    };
  }

  static handleConditional(e) {
    console.log('condition handled ', e);
  }

  render() {}
}
