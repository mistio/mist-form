export const getNestedValueFromPath = (path, object, defaultValue) =>
  path
    .split(/[\.\[\]\'\"]/)
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
  const subForm = subforms.find(el =>  el[0] === subformName);

  return subForm[1];
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

  return removeFileNamesFromRefs(inputs);
};
const removeFileNamesFromRefs = data => {
return data.map(item=> {
 if (item[1].format === "subformContainer") {
   const ref = item[1].properties.subform && item[1].properties.subform.$ref;
   if (ref) {
    item[1].properties.subform.$ref = `#${ref.split('#')[1]}`;
   }

 }
 return item;
});
}
export const getDefinitions = async data => {

  let newDefinitions = {};
  const fields = {
      ...data.properties,
      ...data.definitions
  };

  for (const [key, val] of Object.entries(fields)) {
      if (val.format === 'subformContainer') {
          const ref = val.properties && val.properties.subform && val.properties.subform.$ref;
          if (ref && !ref.startsWith('#')) {
              const src = ref.split('#')[0];
              const response = await fetch(src);
              const jsonData = await response.json();
              const defs = await getDefinitions(jsonData);
              newDefinitions = {
                  ...newDefinitions,
                  ...defs
              }
          }
      } else {
          for (const [propKey, propVal] of Object.entries(val.properties)) {
              const ref = propVal.properties && propVal.properties.subform && propVal.properties.subform.$ref;
              if (ref && !ref.startsWith('#')) {
                  const src = ref.split('#')[0];
                  const response = await fetch(src);
                  const jsonData = await response.json();
                  const defs = await getDefinitions(jsonData);

                  newDefinitions = {
                      ...newDefinitions,
                      ...defs
                  }
              }
          }
      }

  }
  return {...data.definitions, ...newDefinitions};
}
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
    if (typeof value === 'string') {
      value = value && value.split(',').map(val => val.trim());
    }
  }

  if (node.props && node.props.fieldType === 'boolean') {
    // Convert an undefined boolean to false
    value = !!value;
  }
  return value;
};

export const getFieldPath = (input, path) => {
  const [key, properties] = input;
  //const fieldName = properties.name || key;
  const fieldName = key;
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

export const getValueByFieldPath = (fieldPath, root) => {
  const fieldPathArray = fieldPath.split('.');
  let lastEl = root;
  fieldPathArray.forEach((item, index) => {
    const path = fieldPath.split(".").slice(0,index + 1).join(".");
    lastEl = lastEl.shadowRoot.querySelector(`[fieldPath='${path}']`) || lastEl.shadowRoot.querySelector(`[fieldPath='${path.slice(0,-3)}']`).shadowRoot.querySelector(`[fieldPath='${path}']`);
     if (!lastEl) { // Is row. TODO: Make this better
      lastEl = lastEl.shadowRoot.querySelector(`[fieldPath='${path.slice(0,-3)}']`).shadowRoot.querySelector(`[fieldPath='${path}']`) ;
     }
  });
  return lastEl.value;
}
