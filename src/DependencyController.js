import * as util from './utilities.js';
// When setting dependency paths, you should use the key of a field and not it's name
// If the name is different from the key it's used for the final value property
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
    if (
      props.deps &&
      this.mistForm.dynamicDataNamespace &&
      this.mistForm.dynamicDataNamespace.conditionals
    ) {
      props.deps.forEach(dep => {
        this.elementReferencesByFieldPath[element.fieldPath] = element;
        const { prop, func } = dep;
        // Check for relative path
        // const level = dep.dependsOn.search(/[^.]+$/);
        let level;
        const isRelative = dep.dependsOn.split('').some((el, index) => {
          const isNotDot = el !== '.';
          level = isNotDot ? index : level;
          return isNotDot;
        });
        const dependsOn =
          level > 0
            ? `${props.fieldPath
                .split('.')
                .slice(0, -1 * level)
                .join('.')}.${dep.dependsOn.slice(level)}`
            : dep.dependsOn;
        const condition = {
          dependsOn,
          target: props.fieldPath,
          prop,
          func,
        };
        // TODO: Replace stringify with real function that compares
        const conditionNotInMap = !this.conditionMap.find(
          x => JSON.stringify(x) === JSON.stringify(condition)
        )
        if (conditionNotInMap) {
          this.conditionMap.push(condition);}
      });
    }
  }

  async updatePropertiesFromConditions(fieldPath) {
    // Debounce this function
    const formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
    const conditions = this.conditionMap.filter(
      dep => dep.dependsOn === fieldPath
    );
    // if (conditions.length) {
    for (const condition of conditions) {
      const element = this.elementReferencesByFieldPath[condition.target];
      const dependencyValues = this.getDependencyValues(condition, formValues);
<<<<<<< Updated upstream
      const newValue = this.mistForm.dynamicDataNamespace.conditionals[
        condition.func
      ].type === 'promise' ? await this.mistForm.dynamicDataNamespace.conditionals[
        condition.func
      ].func(dependencyValues, condition.dependsOn) : this.mistForm.dynamicDataNamespace.conditionals[
        condition.func
      ].func(dependencyValues, condition.dependsOn);
     // Promise.resolve(func).then(newValue => {
        this.updateProp(element, condition.prop, newValue);
     // })

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
    // if (conditions.length) {
    for (const condition of conditions) {
      const dependencyValues = this.getDependencyValues(condition, formValues);
      if (dependencyValues === undefined) {
        return;
      }
      const prop = condition.prop;
      const newValue = this.mistForm.dynamicDataNamespace.conditionals[
        condition.func
      ].type === 'promise' ? await this.mistForm.dynamicDataNamespace.conditionals[
        condition.func
      ].func(dependencyValues, condition.dependsOn) : this.mistForm.dynamicDataNamespace.conditionals[
        condition.func
      ].func(dependencyValues, condition.dependsOn);// also pass old value here
    //  Promise.resolve(func).then(async newValue => {
        const values = prop ? { [prop]: newValue } : newValue;
        const props = Object.keys(values);
        // TODO: replace with real function that compares stuff
        const propsUnchanged = props.every(
          key => JSON.stringify(element.props[key]) == JSON.stringify(values[key])
        );

        if (propsUnchanged) {
          return;
        }
        props.forEach(prop => {
          element.props[prop] = values[prop];
        });
        await element.updateComplete;
    //  })


    }
    // }
  }
=======
      const func = this.mistForm.dynamicDataNamespace.conditionals[
        condition.func
      ];
      if (func) {
        const isPromise = func && func.type === 'promise';
        const newValue = isPromise ? await func.func(dependencyValues, condition.dependsOn) : func.func(dependencyValues, condition.dependsOn);
        this.updateProp(element, condition.prop, newValue);
      } else {
        console.error("Dependency function not found for: ", condition)
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
    // if (conditions.length) {
    for (const condition of conditions) {
      const dependencyValues = this.getDependencyValues(condition, formValues);
      if (dependencyValues === undefined) {
        return;
      }
      const prop = condition.prop;
      const func = this.mistForm.dynamicDataNamespace.conditionals[
        condition.func
      ];
      if (func) {
        const isPromise = func && func.type === 'promise';
        const newValue = isPromise ? await func.func(dependencyValues, condition.dependsOn) : func.func(dependencyValues, condition.dependsOn);// also pass old value here
          const values = prop ? { [prop]: newValue } : newValue;
          const props = Object.keys(values);
          // TODO: replace with real function that compares stuff
          const propsUnchanged = props.every(
            key => JSON.stringify(element.props[key]) == JSON.stringify(values[key])
          );

          if (propsUnchanged) {
            return;
          }
          props.forEach(prop => {
            element.props[prop] = values[prop];
          });
          await element.updateComplete;
      } else {
        console.error("Dependency function not found for: ", condition)
      }
    }
    // }
  }
>>>>>>> Stashed changes
  getDependencyValues = (dependency, formValues) => {
    const source = dependency.dependsOn;
    return util.getValueByFieldPath(source, this.mistForm);
  };

  async updateProp(element, prop, value) {
    const values = prop ? { [prop]: value } : value;
    const props = Object.keys(values);
    const propsUnchanged = props.every(key => {
      // TODO: replace with real function that compares stuff
      JSON.stringify(element.props[key]) == JSON.stringify(values[key]);
    });

    if (!element || propsUnchanged) {
      return;
    }

    element.props = { ...element.props, ...values };
    // Since I wait for the element to complete update, maybe I could set priorities.
    // Parent elements should have bigger priority than their children to avoid losing data on re rendering
    await element.updateComplete;
  }
}
