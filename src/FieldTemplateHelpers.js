export class FieldTemplateHelpers {
  getFieldType(val) {
    if (this.defaultFieldTypes.includes(val.format)) {
      return val.format;
    }
    if (val.type === 'string') {
      if (!val.format || val.format === 'number') {
        return 'input';
      }
      return 'custom';
    }
    if (!val.format) {
      return val.type;
    }
    return 'custom';
  }

  // Traverse all fields in DOM and validate them
  formFieldsValid(root) {
    // Only get visible first children
    const nodeList = this.getFirstLevelChildren(root);
    const formValid = !nodeList.some(node => {
      const notExcluded = !node.hasAttribute('excludeFromPayload');
      return notExcluded ? !node.validate() : false;
    });
    return formValid;
  }

  // Get first level input children
  getFirstLevelChildren = root => {
    return root
      ? [...root.children].filter(
          child => !child.hidden && child.matches(this.inputFields)
        )
      : [];
  };
}
