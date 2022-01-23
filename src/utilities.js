export const getNestedValueFromPath = (path, object, defaultValue) =>
  path
    .split(/[.[\]'"]/)
    .filter(p => p)
    .reduce((o, p) => (o ? o[p] : defaultValue), object);

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
  const subForm = subforms.find(el => el[0] === subformName);

  return subForm[1];
};

export const getLabel = props => {
  let label = props.label || props.title || props.fieldPath;
  return props.required ? `${label} *` : label;
}

export const getFieldPath = (input, path) => {
  const [key, properties] = input;
  const fieldName = properties.name || key;
  return path ? [path, fieldName].join('.') : fieldName;
};

export const debouncer = function (callback, wait) {
  let timeout = 1000;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      callback.apply(this, args);
    }, wait);
  };
};
