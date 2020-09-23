import { html, fixture, expect } from '@open-wc/testing';

import '../mist-form.js';

describe('MistForm', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture(html`
      <mist-form></mist-form>
    `);

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture(html`
      <mist-form></mist-form>
    `);
    el.shadowRoot.querySelector('button').click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el = await fixture(html`
      <mist-form title="attribute title"></mist-form>
    `);

    expect(el.title).to.equal('attribute title');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`
      <mist-form></mist-form>
    `);

    await expect(el).shadowDom.to.be.accessible();
  });
});
