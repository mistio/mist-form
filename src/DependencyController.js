import * as util from './utilities.js';

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
    const isRelative = dep.dependsOn.split('').some((el, index)=>{
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
        if (
          !this.conditionMap.find(
            x => JSON.stringify(x) === JSON.stringify(condition)
          )
        )
          this.conditionMap.push(condition);
      });
    }
  }

  updatePropertiesFromConditions(fieldPath) {
    // Debounce this function
    const formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
    const conditions = this.conditionMap.filter(
      dep => dep.dependsOn === fieldPath
    );
console.log("this.conditionMap ", this.conditionMap)
      if (conditions.length) {
          conditions.forEach(condition => {
          const element = this.elementReferencesByFieldPath[condition.target];
          const dependencyValues = this.getDependencyValues(
            condition,
            formValues
          );
          const newValue = this.mistForm.dynamicDataNamespace.conditionals[
            condition.func
          ].func(dependencyValues, fieldPath); // also pass old value here
            this.updateProp(element, condition.prop, newValue);
        });
      }
  }

  updatePropertiesByTarget(element)  {
    console.log("this.mistForm.shadowRoot ", this.mistForm.shadowRoot)
    if (!this.mistForm.shadowRoot) { return; }
    const formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
    const conditions = this.conditionMap.filter(
      dep => dep.target === element.fieldPath
    );

    if (conditions.length) {
        conditions.forEach(condition => {
        const dependencyValues = this.getDependencyValues(
          condition,
          formValues
        );
        if (dependencyValues === undefined) { return ;}
        const prop = condition.prop;
        const newValue = this.mistForm.dynamicDataNamespace.conditionals[
          condition.func
        ].func(dependencyValues); // also pass old value here
        const propUnchanged = JSON.stringify(element.props[prop]) === JSON.stringify(newValue);
        if (propUnchanged) { return; }
        console.log("change element prpo")
          element.props[prop] = newValue;
      });
    }

  }
  getDependencyValues = (dependency, formValues) => {
    const source = dependency.dependsOn;
    return util.getNestedValueFromPath(source, formValues);
  };

   updateProp(element, prop, value) {
    const propUnchanged = JSON.stringify(element.props[prop]) === JSON.stringify(value);
    if (!element || propUnchanged) { return; }
      element.props = { ...element.props, [prop]: value };
  }
}
