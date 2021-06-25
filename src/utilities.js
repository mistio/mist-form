export const getFieldValue = input => {
  let value;
  if (
    input.getAttribute('role') === 'checkbox' ||
    input.getAttribute('role') === 'button'
  ) {
    value = input.checked;
  } else if (input.tagName === 'IRON-SELECTOR') {
    value = input.selectedValues;
  } else if (input.tagName === 'PAPER-DROPDOWN-MENU') {
    value = input.querySelector('paper-listbox').selected;
  } else if (input.type === 'multiRow') {
    value = input.getValue();
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

export const getSubformFromRef = (subforms, ref) => {
  const subformName = ref.split('/').slice(-1)[0];
  const subForm = subforms.find(el => el[0] === subformName)[1];
  return subForm;
};

export function getValueProperty(props) {
  if (props.format === 'checkboxGroup') {
    return 'selectedValues';
  }
  if (props.type === 'boolean') {
    return 'checked';
  }
  return 'value';
}
