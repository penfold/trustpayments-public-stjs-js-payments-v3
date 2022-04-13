import './newcard.scss';

window.addEventListener('load', () => {
  const paramsList = new URLSearchParams(window.location.search);
  const headerElement = document.querySelector('header')
  const unorderedListElement = document.querySelector('#params-list')

  paramsList.forEach((value, key) => {
    if(value) {
      const listElement = document.createElement('li')
      listElement.textContent = `${key}: ${value}`
      if(key === 'errorcode' && value !== '0') {
        headerElement.style.backgroundColor = '#CD5C5C'
      }
      if(key === 'formId') {
        listElement.classList.add('bold')
        unorderedListElement.prepend(listElement)
      } else {
        unorderedListElement.appendChild(listElement)
      }
    }
  })
})
