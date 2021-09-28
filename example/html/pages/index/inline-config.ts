window.addEventListener('load', () => {
  const submitButtonId = '#merchant-submit-button';
  const formId = 'st-form';
  const params = new URLSearchParams(window.location.search.substring(1));
  const formIdValue = params.get('formId');
  const noSubmitButton = params.get('noSubmitButton');
  const additionalButtonValue = params.get('additionalButton');
  if (noSubmitButton === 'true') {
    const button = document.querySelector(submitButtonId);
    button.parentNode.removeChild(button);
  }

  if (formIdValue) {
    document.getElementById(formId).setAttribute('id', formIdValue);
  }

  if (additionalButtonValue === 'true') {
    const id = formIdValue ? formIdValue : formId;
    const additionalButton = document.createElement('button');
    additionalButton.setAttribute('id', 'additional-button');
    additionalButton.setAttribute('class', 'st-form__button');
    additionalButton.textContent = 'Additional Button'
    document.getElementById(id).appendChild(additionalButton);
  }
});
