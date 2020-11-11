import { html, fixture, expect, waitUntil } from '@open-wc/testing';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-styles/default-theme.js';
import '@polymer/paper-styles/shadow.js';
import '@polymer/paper-styles/demo-pages.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '../mist-form.js';

describe('MistForm component', () => {
  it("Displays error message when you don't pass a json url", async () => {
    const el = await fixture(html` <mist-form></mist-form> `);
    await waitUntil(() => el.dataError);
    expect(el).shadowDom.to.equal(
      "We couldn't load the form. Please try again"
    );
  });

  it('Displays two input fields when you pass inputFields.json', async () => {
    const el = await fixture(
      html`<mist-form
        id=${'test-mist-form'}
        .src=${'/base/test/inputFields.json'}
      ></mist-form> `
    );
    await waitUntil(() => el.data);
    expect(el.shadowRoot.querySelectorAll('paper-input')).to.have.length(2);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`
      <mist-form
        id=${'test-mist-form'}
        .src=${'/base/test/test.json'}
      ></mist-form>
    `);

    await expect(el).shadowDom.to.be.accessible();
  });
});
