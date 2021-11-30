import * as util from './utilities.js';
// When setting dependency paths, you should use the key of a field and not it's name
// If the name is different from the key it's used for the final value property

async function updateProp(element, prop, value) {
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
  //
  await element.updateComplete;
}

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
          let level;
          // This is weird, I need to refactor
          const isRelative = dependsOn.split('').some((el, index) => {
            const isNotDot = el !== '.';
            level = isNotDot ? index : level;
            return isNotDot;
          });

          const absoluteDependsOn =
            level > 0
              ? `${props.fieldPath
                  .split('.')
                  .slice(0, -1 * level)
                  .join('.')}.${dependsOn.slice(level)}`
              : dependsOn;
          const condition = {
            dependsOn: absoluteDependsOn,
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
    let formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
    const conditions = this.conditionMap.filter(
      dep => dep.dependsOn === fieldPath
    );
    // if (conditions.length) {
    for (const condition of conditions) {
      const element = this.elementReferencesByFieldPath[condition.target];
      if (element.hidden) {
        break;
      }
      const dependencyValues = this.getDependencyValues(condition, formValues);
      const func = this.mistForm.dynamicDataNamespace.conditionals[
        condition.func
      ];
      if (func) {
        const isPromise = func && func.type === 'promise';
        const newValue = isPromise
          ? await func.func(dependencyValues, condition.dependsOn, formValues)
          : func.func(dependencyValues, condition.dependsOn, formValues);
        // Don't do any updates if function returns undefined
        //  formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
        updateProp(
          element,
          condition.prop,
          newValue,
          util.getNestedValueFromPath(condition.target, formValues)
        );
        // this.mistForm.updateMistFormValue();
      } else {
        console.error('Dependency function not found for: ', condition);
      }
    }
    //  }
  }

  async updatePropertiesByTarget(element) {
    if (!this.mistForm.shadowRoot) {
      return;
    }
    const formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
    const conditions = this.conditionMap.filter(
      dep => dep.target === element.fieldPath
    );
    for (const condition of conditions) {
      const dependencyValues = this.getDependencyValues(condition, formValues);
      if (dependencyValues === undefined) {
        return;
      }

      const func = this.mistForm.dynamicDataNamespace.conditionals[
        condition.func
      ];
      if (func) {
        const isPromise = func && func.type === 'promise';
        const newValue = isPromise
          ? await func.func(dependencyValues, condition.dependsOn, formValues)
          : func.func(dependencyValues, condition.dependsOn, formValues); // also pass old value here
        const values = condition.prop
          ? { [condition.prop]: newValue }
          : newValue;
        const props = Object.keys(values);
        // TODO: replace with real function that compares stuff
        const propsUnchanged = props.every(
          key =>
            JSON.stringify(element.props[key]) === JSON.stringify(values[key])
        );
        // Undefined gets returned from func when you don't want to update
        if (propsUnchanged || newValue === undefined) {
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

  getDependencyValues = (dependency, formValues) => {
    const source = dependency.dependsOn;
    return util.getNestedValueFromPath(source, formValues);
  };
}