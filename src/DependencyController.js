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

  // Differentiate if dependsOn is string or array
  updateConditionMap(element) {
    const { props } = element;
    if (
      props.deps &&
      this.mistForm.dynamicDataNamespace &&
      this.mistForm.dynamicDataNamespace.conditionals
    ) {
      props.deps.forEach(dep => {
        const { prop, func } = dep;
        // Check for relative path
        const level = dep.dependsOn.search(/[^.]+$/);
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
          this.elementReferencesByFieldPath[element.fieldPath] = element;
        this.conditionMap.push(condition);
      });
    }
  }

  updatePropertiesFromConditions(fieldPath) {
    const conditions = this.conditionMap.filter(
      dep => dep.dependsOn === fieldPath
    );
    this.mistForm.updateComplete.then(() => {
      if (conditions.length) {
        conditions.forEach(condition => {
          const element = this.elementReferencesByFieldPath[condition.target];
          const currentValue = element.props[condition.prop];
          const dependencyValues = this.getDependencyValues(condition);
          const newValue = this.mistForm.dynamicDataNamespace.conditionals[
            condition.func
          ].func(dependencyValues);
          // What happens if newValue is object or Array?
          if (currentValue !== newValue) {
            element.props = { ...element.props, [condition.prop]: newValue };
          }
        });
      }
    });
  }

  getDependencyValues = dependency => {
    const source = dependency.dependsOn;
    const formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);

    return util.getNestedValueFromPath(source, formValues);
  };
}
