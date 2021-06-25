// Get first level input children
export class FieldTemplateHelpers {
  // Traverse all fields in DOM and validate them
  formFieldsValid(root, isValid) {
    const nodeList = this.getFirstLevelChildren(root);
    let formValid = isValid;
    nodeList.forEach(node => {
      const notExcluded = !node.hasAttribute('excludeFromPayload');
      if (node.classList.contains('subform-container') && notExcluded) {
        formValid = this.formFieldsValid(node, formValid);
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

  getFirstLevelChildren(root) {
    const customComponentTagNames = this.getUniqueTagNames();
    const inputFields = [...this.inputFields, ...customComponentTagNames];

    return [...root.children].filter(child => child.matches(inputFields));
  }

  getUniqueEventNames() {
    const eventNames = this.customInputFields.map(input => {
      // If no event was set return the default 'value-change' event
      if (input.valueChangedEvent) {
        return input.valueChangedEvent.toLowerCase();
      }
      return 'value-change';
    });
    return [...new Set(eventNames)];
  }

  getUniqueTagNames() {
    const tagNames = this.customInputFields.map(input => {
      // If no event was set return the default 'value-change' event
      if (input.tagName) {
        return input.tagName.toLowerCase();
      }
      return null;
    });
    return [...new Set(tagNames)];
  }

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
