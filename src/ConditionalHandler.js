import { LitElement } from 'lit-element';
// I might not need this component after all, I'll probably handle the conditionals
// in the parent component.
// TODO: Delete this component if I don't end up using it
export class ConditionalHandler extends LitElement {
  static get properties() {
    return {
      schema: { type: Object },
    };
  }

  handleConditional(e) {
    console.log('e ', e, this);
  }

  render() {}
}
