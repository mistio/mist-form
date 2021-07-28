import { css } from 'lit-element';

export const mistFormStyles = css`
  :host {
    display: block;
    margin: 0px 10px 20px;
    padding-bottom: 20px;
    color: var(--mist-form-text-color, #424242);
    background-color: var(--mist-form-background-color, white);
    font-family: var(--mist-form-font-family, Roboto);
  }

  .paper-toggle-button {
    font-weight: bold;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    padding-right: 10px;
  }
  paper-checkbox {
    padding-top: 13px;
    margin-right: 10px;
    --paper-checkbox-checked-color: #2196f3;
    --paper-checkbox-checked-ink-color: #2196f3;
    --paper-checkbox-unchecked-color: #424242;
  }
  .helpText {
    font-size: 14px;
    align-self: center;
    color: rgba(0, 0, 0, 0.54);
    margin-left: 10px;
  }

  .submit-btn:not([disabled])::part(mist-form-button-inner) {
    color: white;
    background-color: #2196f3;
  }

  :host *([hidden]) {
    display: none;
  }
  .mist-form-input {
    margin-top: 10px;
    margin-left: 10px;
  }
  btn-block {
    margin-top: 10px;
  }
`;
