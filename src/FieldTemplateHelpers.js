export class FieldTemplateHelpers {
  // Traverse all fields in DOM and validate them
  formFieldsValid(root) {
    // Only get visible first children
    const nodeList = this.getFirstLevelChildren(root).filter(
      node => !node.hidden
    );
    let formValid = true;
    nodeList.forEach(node => {
      const notExcluded = !node.hasAttribute('excludeFromPayload');
      if (node.tagName === 'MIST-FORM-SUBFORM' && notExcluded) {
        // formValid = this.formFieldsValid(node, formValid);
        formValid = node.getFieldsValid();
      } else if (notExcluded) {
        const isInvalid =
          node.validate && node.validate ? !node.validate() : false;
        if (isInvalid) {
          formValid = false;
        }
      }
    });
    return formValid;
  }

  // Get first level input children
  getFirstLevelChildren = root => {
    return [...root.children].filter(child => child.matches(this.inputFields));
  };

  displaySubmitButton() {
    return this.button(
      this.mistForm.data.submitButtonLabel || 'Submit',
      () => {
        this.mistForm.submitForm();
      },
      !this.mistForm.allFieldsValid,
      'submit-btn'
    );
  }

  displayCancelButton(canClose = true) {
    // TODO: Add functionality to cancel button
    return canClose
      ? this.button(
          'Cancel',
          () => {
            this.mistForm.dispatchEvent(new CustomEvent('mist-form-cancel'));
          },
          null,
          'cancel-btn'
        )
      : '';
  }
}
