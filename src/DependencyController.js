import * as util from './utilities.js';
// TODO: I should be able to pass an event listener that listens for external changes and updates fields
// This is useful for updating dropdown options dynamically when they change

// When setting dependency paths, you should use the key of a field and not it's name
// If the name is different from the key it's used for the final value property

// TODO: Remove duplicate code from the updateProperties functions

// TODO: replace with real function that compares stuff
const propsUnchanged = (props, element, values) =>
  props.every(
    key => JSON.stringify(element.props[key]) === JSON.stringify(values[key])
  );
// This can probably be done in a better way
const getLevel = dependsOn => {
  let level;
  dependsOn.split('').every((el, index) => {
    const isDot = el === '.';
    if (!isDot) {
      level = index;
    }
    return isDot;
  });
  return level;
};

const getNewValue = async (func, condition, formValues) => {
  const { dependsOn } = condition;
  const dependencyValues = util.getNestedValueFromPath(dependsOn, formValues);
  if (dependencyValues === undefined) {
    return undefined;
  }
  const newValue = await func.func(dependencyValues, dependsOn, formValues);
  return newValue;
};

const getAbsolutePath = (level, dependsOn, fieldPath) =>
  level > 0
    ? `${fieldPath
        .split('.')
        .slice(0, -1 * level)
        .join('.')}.${dependsOn.slice(level)}`
    : dependsOn;

const getValues = (condition, newValue) =>
  condition.prop ? { [condition.prop]: newValue } : newValue;
export class DependencyController {
  constructor(mistForm) {
    this.conditionMap = [];
    this.elementReferencesByFieldPath = {};
    this.mistForm = mistForm;
  }

  addElementReference(element) {
    this.updateConditionMap(element);
  }

  removeElementReference(target) {
    delete this.elementReferencesByFieldPath[target];
  }

  // Differentiate if dependsOn is string or array
  updateConditionMap(element) {
    const { props } = element;
    if (!props) {
      return;
    }
    const hasConditionals =
      props.deps &&
      this.mistForm.dynamicDataNamespace &&
      this.mistForm.dynamicDataNamespace.conditionals;

    if (hasConditionals) {
      props.deps.forEach(dep => {
        this.elementReferencesByFieldPath[element.fieldPath] = element;
        const { prop, func } = dep;
        const dependsOnArray =
          typeof dep.dependsOn === 'object' ? dep.dependsOn : [dep.dependsOn];
        // Check for relative path
        // Not sure if this working 100%
        // I need to check
        dependsOnArray.forEach(dependsOn => {
          const condition = {
            dependsOn: getAbsolutePath(
              getLevel(dependsOn),
              dependsOn,
              props.fieldPath
            ),
            target: props.fieldPath,
            prop,
            func,
          };
          // TODO: Replace stringify with real function that compares objects
          const conditionNotInMap = !this.conditionMap.find(
            x => JSON.stringify(x) === JSON.stringify(condition)
          );
          if (conditionNotInMap) {
            this.conditionMap.push(condition);
          }
        });
      });
    }
  }

  async updatePropertiesFromConditions(fieldPath) {
    // Debounce this function
    const formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
    const conditions = this.conditionMap.filter(
      dep => dep.dependsOn === fieldPath
    );

    for (const condition of conditions) {
      const element = this.elementReferencesByFieldPath[condition.target];
      if (!element.hidden) {
        const dependencyFunction = this.getDependencyFunction(condition);
        if (dependencyFunction) {
          const newValue = await getNewValue(
            dependencyFunction,
            condition,
            formValues
          );
          // Don't do any updates if function returns undefine
          this.updateProp(condition.target, condition.prop, newValue);
        } else {
          console.error('Dependency function not found for: ', condition);
        }
      }
    }
  }

  async updatePropertiesByTarget(fieldPath) {
    if (!this.mistForm.shadowRoot) {
      return;
    }
    const element = this.elementReferencesByFieldPath[fieldPath];
    const formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
    const conditions = this.conditionMap.filter(
      dep => dep.target === fieldPath
    );
    for (const condition of conditions) {
      const dependencyFunction = this.getDependencyFunction(condition);
      if (dependencyFunction) {
        const newValue = await getNewValue(
          dependencyFunction,
          condition,
          formValues
        );
        const values = getValues(condition, newValue);
        const props = Object.keys(values);

        // Undefined gets returned from func when you don't want to update
        if (propsUnchanged(props, element, values) || newValue === undefined) {
          return;
        }
        props.forEach(prop => {
          element.props[prop] = values[prop];
        });
        await element.updateComplete;
      } else {
        console.error('Dependency function not found for: ', condition);
      }
    }
  }

  async updateProp(fieldPath, prop, value) {
    const element = this.elementReferencesByFieldPath[fieldPath];
    const values = prop ? { [prop]: value } : value;
    if (!element || value === undefined) {
      return;
    }

    element.props = { ...element.props, ...values };
    if (prop === 'value') {
      element.value = value;
    }

    // Since I wait for the element to complete update, maybe I could set priorities.
    // Parent elements should have bigger priority than their children to avoid losing data on re rendering
    await element.updateComplete;
  }

  getDependencyFunction = condition =>
    this.mistForm.dynamicDataNamespace.conditionals[condition.func];
}
