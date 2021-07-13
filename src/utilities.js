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
