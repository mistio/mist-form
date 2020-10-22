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

describe('MistForm', () => {
  it("Displays error message when you don't pass a json url", async () => {
    const el = await fixture(html` <mist-form></mist-form> `);
    await waitUntil(() => el.dataError);
    expect(el).shadowDom.to.equal(
      "We couldn't load the form. Please try again"
    );
  });

  it('Displays a single input field when you pass inputField.json', async () => {
    const el = await fixture(
      html`<mist-form
        id=${'test-mist-form'}
        .src=${'/base/test/inputField.json'}
      ></mist-form> `
    );
    await waitUntil(() => el.data);
    // expect(el).shadowDom.to.equal(
    //   "We couldn't load the form. Please try again"
    // );
    expect(el).lightDom.to.equal(
      "<mist-form>We couldn't load the form. Please try again</mist-form>"
    );
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html` <mist-form></mist-form> `);

    await expect(el).shadowDom.to.be.accessible();
  });
});
