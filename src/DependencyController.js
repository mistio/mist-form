import * as util from './utilities.js';

export class DependencyController {
  constructor(mistForm) {
    this.conditionMap = [];
    this.mistForm = mistForm;
  }
  // Differentiate if dependsOn is string or array
  updateConditionMap(props) {
    if (
      props.deps &&
      this.mistForm.dynamicDataNamespace &&
      this.mistForm.dynamicDataNamespace.conditionals
    ) {
      props.deps.forEach(dep => {
        const { prop, func } = dep;
        const level = dep.dependsOn.search(/[^.]+$/);
        const dependsOn =
          level > 0
            ? `${props.fieldPath
                .split('.')
                .slice(0, -1 * level)
                .join('.')}.${dep.dependsOn.slice(level)}`
            : dep.dependsOn;
        this.conditionMap.push({
          dependsOn,
          target: props.fieldPath,
          prop,
          func,
        });
      });
    }
  }

  updatePropertiesFromConditions(fieldPath) {
    const conditions = this.conditionMap.filter(
      dep => dep.dependsOn === fieldPath
    );

    if (conditions.length) {
      conditions.forEach(condition => {
        const element = this.mistForm.shadowRoot.querySelector(
          `[fieldpath="${condition.target}"]`
        );
        const dependencyValues = this.getDependencyValues(condition);
        const val = this.mistForm.dynamicDataNamespace.conditionals[
          condition.func
        ].func(dependencyValues);
        element.props = { ...element.props, [condition.prop]: val };
      });
    }
  }

  getDependencyValues = dependency => {
    const source = dependency.dependsOn;
    const formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);

    return util.getNestedValueFromPath(source, formValues);
  };
}
