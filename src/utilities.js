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

export const getLabel = props =>
  props.required ? `${props.label} *` : props.label;

export const getConvertedProps = props => {
  const newProps = {
    ...props,
    max: props.maximum,
    min: props.minimum,
    type: props.format,
    multiple: props.multipleOf,
  };
  ['maximum', 'minimum', 'format', 'multipleOf'].forEach(
    e => delete newProps[e]
  );

  return newProps;
};

export const getInputs = data => {
  const jsonProperties = data.properties;
  const inputs = Object.keys(jsonProperties).map(key => [
    key,
    jsonProperties[key],
  ]);

  return inputs;
};

export const getSubforms = data => {
  const jsonDefinitions = data.definitions;
  const subforms =
    jsonDefinitions &&
    Object.keys(jsonDefinitions).map(key => [key, jsonDefinitions[key]]);
  return subforms;
};

export const formatInputValue = node => {
  let { value } = node;
  if (node.props && node.props.format === 'number') {
    value = parseInt(value, 10);
  }
  if (node.props && node.props.saveAsArray) {
    value = value.split(',').map(val => val.trim());
  }

  return value;
};

export const isInvalid = node =>
  node && node.validate ? !node.validate() : false;

export const getFieldPath = (input, path) => {
  const [name, properties] = input;
  const fieldName =
    properties.format === 'subformContainer' ? properties.name : name;
  properties.name = fieldName;
  return path ? [path, name].join('.') : fieldName;
};

export const debounce = function (callback, wait) {
  let timeout = 1000;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      callback.apply(this, args);
    }, wait);
  };
};
