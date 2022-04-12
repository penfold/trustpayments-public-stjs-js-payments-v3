import './demo.scss';

window.addEventListener('load', () => {
  const paramsList = new URLSearchParams(window.location.search);
  const headerTextElement = document.querySelector('#header')
  const unorderedListElement = document.querySelector('#params-list')

  if(paramsList.get('formId')) {
    headerTextElement.textContent = 'Tokenized Card Submit Result'
  } else {
    headerTextElement.textContent = 'New Card Submit Result'
  }

  paramsList.forEach((value, key) => {
    if(value) {
      const listElement = document.createElement('li')
      listElement.textContent = `${key}: ${value}`
      unorderedListElement.appendChild(listElement)
    }
  })
})
