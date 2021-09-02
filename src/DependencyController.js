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

  async updatePropertiesFromConditions(fieldPath) {
    // Debounce this function
    const formValues = this.mistForm.getValuesfromDOM(this.mistForm.shadowRoot);
    const conditions = this.conditionMap.filter(
      dep => dep.dependsOn === fieldPath
    );

    //this.mistForm.updateComplete.then(() => {
      if (conditions.length) {
        debugger;
conditions.forEach(condition => {
          const element = this.elementReferencesByFieldPath[condition.target];
          const dependencyValues = this.getDependencyValues(
            condition,
            formValues
          );
          const newValue = this.mistForm.dynamicDataNamespace.conditionals[
            condition.func
          ].func(dependencyValues, fieldPath); // also pass old value here
        const propUnchanged = JSON.stringify(element.props[condition.prop]) === JSON.stringify(newValue);
          if (!element || propUnchanged) {
            return;
          } else {
            debugger;
            this.updateProp(element, condition.prop, newValue);
          }
        });
      }
  //  });
  }

  getDependencyValues = (dependency, formValues) => {
    const source = dependency.dependsOn;
    return util.getNestedValueFromPath(source, formValues);
  };

   updateProp(element, prop, value) {

      element.updateComplete.then(() => {
          element.props = { ...element.props, [prop]: value };
      console.log("element ", element.props)
      debugger; });


  }
}
