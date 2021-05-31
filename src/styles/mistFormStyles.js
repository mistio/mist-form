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
.subform-container {
  border: var(--mist-subform-border, 1px solid white);
  margin: var(--mist-subform-margin, 10px);
  padding: var(--mist-subform-padding, 10px);
  color: var(--mist-subform-text-color, #424242);
  background-color: var(--mist-subform-background-color, white);
}
.subform-container > .subform-container > mist-form-duration-field {
  padding-left: 0;
}
.subform-container.open.odd {
  background-color: var(--mist-subform-background-color, #ebebeb);
}
.subform-container.open.even {
  background-color: white;
}
.subform-name {
  font-weight: bold;
}
.paper-toggle-button {
  font-weight: bold;
}
.buttons {
  text-align: right;
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
.submit-btn:not([disabled]) {
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
paper-input {
  --paper-input-container-label: {
    color: #4b4b4bl
    font-size: 22px;
  };
}
paper-input > [slot='prefix'] {
  margin-right: 5px;
}
`;