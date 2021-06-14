import { FieldTemplates } from './FieldTemplates.js';

export const displayCancelButton = (canClose = true, mistForm) =>
  // TODO: Add functionality to cancel button
  canClose
    ? FieldTemplates.button(
        'Cancel',
        () => {
          mistForm.dispatchEvent(new CustomEvent('mist-form-cancel'));
        },
        null,
        'cancel-btn'
      )
    : '';
export const displaySubmitButton = mistForm =>
  FieldTemplates.button(
    mistForm.data.submitButtonLabel || 'Submit',
    () => {
      mistForm.submitForm(mistForm);
    },
    !mistForm.allFieldsValid,
    'submit-btn'
  );
export const getFieldValue = input => {
  let value;
  if (
    input.getAttribute('role') === 'checkbox' ||
    input.getAttribute('role') === 'button'
  ) {
    value = input.checked;
  } else if (input.tagName === 'IRON-SELECTOR') {
    value = input.selectedValues;
  } else {
    value = input.value;
  }
  return {
    [input.name]: value,
  };
};

export const getNestedValueFromPath = (path, obj) =>
  path.split('.').reduce((p, c) => p && p[c], obj);

export const valueNotEmpty = value => {
  if (
    Array.isArray(value) ||
    typeof value === 'string' ||
    typeof value === 'object'
  ) {
    return Object.keys(value).length > 0;
  }
  return value !== undefined;
};

// Get first level input children
export const getFirstLevelChildren = root =>
  [...root.children].filter(child => child.matches(FieldTemplates.inputFields));
export const getSubformFromRef = (subforms, ref) => {
  const subformName = ref.split('/').slice(-1)[0];
  const subForm = subforms.find(el => el[0] === subformName)[1];
  return subForm;
};
// Traverse all fields in DOM and validate them
export function formFieldsValid(root, isValid) {
  const nodeList = getFirstLevelChildren(root);
  let formValid = isValid;
  nodeList.forEach(node => {
    const notExcluded = !node.hasAttribute('excludeFromPayload');
    if (node.classList.contains('subform-container') && notExcluded) {
      formValid = formFieldsValid(node, formValid);
    } else if (notExcluded) {
      const isInvalid =
        node.validate && node.validate ? !node.validate() : false;
      if (isInvalid) {
        formValid = false;
      }
    }
  });
  return formValid;
}

export function getValueProperty(props) {
  if (props.format === 'checkboxGroup') {
    return 'selectedValues';
  }
  if (props.type === 'boolean') {
    return 'checked';
  }
  return 'value';
}

export const getUniqueEventNames = () => {
  const eventNames = FieldTemplates.customInputFields.map(input => {
    // If no event was set return the default 'value-change' event
    if (input.valueChangedEvent) {
      return input.valueChangedEvent.toLowerCase();
    } else {
      return 'value-change';
    }
  });
  return [...new Set(eventNames)];
};
