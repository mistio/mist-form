import { html, css, LitElement } from 'lit-element';
import './TextInput.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-styles/default-theme.js';
import '@polymer/paper-styles/shadow.js';
import '@polymer/paper-styles/demo-pages.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';

export class MistForm extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        color: var(--mist-form-text-color, #000);
      }
    `;
  }

  static get properties() {
    return {
      src: { type: String },
      data: { type: Object },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    // TODO: Check if this is the right place to load the JSON file?
    this.__getJSON(this.src);
  }

  __getJSON(url) {
    // TODO: Validate data, add nicer loader, do something if data isn't valid
    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.data = data;
      });
  }

  render() {
    // Map the inputs to the appropriate web component
    // For now we only have text inputs
    // TODO: Check why form validation isn't working
    if (this.data) {
      // The data here will come validated so no checks required
      const jsonData = this.data.properties;
      const inputs = Object.keys(jsonData).map(key => [key, jsonData[key]]);
      const sections = [{ inputs }];
      const portalName = 'Mist';
      // return html`
      //   <form action="">
      //     <h3>${this.title}</h3>
      //     ${inputs.map(input => {
      //       const { id, title, required } = input[1];
      //       return html`<text-input
      //         .id=${id}
      //         .title=${title}
      //         .required=${required}
      //       >
      //       </text-input>`;
      //     })}
      //     <input type="submit" />
      //   </form>
      // `;
      console.log('sections ', sections);
      return html`
        <div>
          <div class="toolbar">
            <span class="icon">
              <iron-icon icon="cloud"></iron-icon>
            </span>
            <div class="primary">Add Cloud</div>
            <div class="secondary">
              ${portalName} supports public &amp; private cloud platforms,
              hypervisors, containers and bare metal servers.
            </div>
          </div>
          ${sections.map(
            section =>
              html`<div class="item">
                ${section.inputs.map(
                  input =>
                    html`<paper-input
                      always-float-label
                      label=${input[1].title}
                    ></paper-input> `
                )}
              </div>`
          )}
          <paper-button class="submit-btn btn-block" raised @tap="_submitForm"
            >Submit</paper-button
          >
        </div>

        <custom-style>
          <style is="custom-style">
            .toolbar {
              height: 14px;
              padding: 16px;
              background: var(--default-primary-color);
              color: var(--text-primary-color);
              @apply --paper-font-display2;
            }

            .item,
            .disabled-item {
              position: relative;
              padding: 8px;
              border: 1px solid;
              border-color: var(--divider-color);
              border-top: 0;
            }

            .item .primary {
              color: var(--primary-text-color);
              @apply --paper-font-body2;
            }

            .item .secondary {
              color: var(--secondary-text-color);
              @apply --paper-font-body1;
            }

            .disabled-item {
              color: var(--disabled-text-color);
              @apply --paper-font-body2;
            }
          </style>
        </custom-style>
      `;
    }
    return 'Loading data...';
  }
}
