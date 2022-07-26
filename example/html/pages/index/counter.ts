const popupStyles =
  'display: flex; justify-content: center; position: fixed; left: 0; height: 50px; width: 220px;right:0;color: white;padding: 0 10px;align-items: center;border-radius: 10px;font-family: Verdana;font-size: 15px;z-index:2';
const popup = document.getElementById('st-popup');
let callbackCounter = 0;
let submitCallbackCounter = 0;
let successCallbackCounter = 0;
let errorCallbackCounter = 0;
let cancelCallbackCounter = 0;

// @ts-ignore
window.displayCallbackCounter = (id: string, text: string, tp: string) => {
  const div = document.createElement('div');
  callbackCounter += 1;
  if (id === 'submit-callback-counter') {
    submitCallbackCounter += 1;
    div.innerText = `${text} Callback counter: ${submitCallbackCounter}`;
  } else if (id === 'success-callback-counter') {
    successCallbackCounter += 1;
    div.innerText = `${text} Callback counter: ${successCallbackCounter}`;
  } else if (id === 'error-callback-counter') {
    errorCallbackCounter += 1;
    div.innerText = `${text} Callback counter: ${errorCallbackCounter}`;
  } else if (id === 'cancel-callback-counter') {
    cancelCallbackCounter += 1;
    div.innerText = `${text} Callback counter: ${cancelCallbackCounter}`;
  } else {
    div.innerText = `${text} Callback counter: ${callbackCounter}`;
  }
  div.setAttribute('id', id);
  div.setAttribute('style', popupStyles);
  div.style.backgroundColor = tp;
  switch (tp) {
    case 'blue':
      div.style.top = '200px';
      break;
    default:
      div.style.top = '260px';
  }
  popup.appendChild(div);
  setTimeout(() => {
    popup.removeChild(div);
  }, 15000);
};
// @ts-ignore
window.resetCallbackCounter = () => {
  callbackCounter = submitCallbackCounter = successCallbackCounter = errorCallbackCounter = cancelCallbackCounter = 0;
}
