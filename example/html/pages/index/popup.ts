function buildPopup(id, text, bgColor): HTMLElement {
  const popupStyling =
    'display: flex; justify-content: center; position: fixed; height: 50px;right:0;color: white;padding: 0 25px;align-items: center;border-radius: 10px;font-family: Verdana;font-size: 15px;z-index:2';
  const div = document.createElement('div');
  div.innerText = text;
  div.setAttribute('id', id);
  div.setAttribute('style', popupStyling);
  div.style.backgroundColor = bgColor;
  switch(bgColor) {
    case 'green':
      div.style.top = '0';
      break;
    case 'blue':
      div.style.top = '120px';
      break;
    default:
      div.style.bottom = '0';
  }
  if(id === 'data-popup-threedresponse') {
    div.style.top = '60px';
  }
  return div;
}

function displayPopup(id, text, bgColor): void {
  const popup = document.getElementById('st-popup');
  const content = buildPopup(id, text, bgColor);
  popup.appendChild(content);
  setTimeout(function() {
    popup.removeChild(content);
  }, 15000);
}

export { displayPopup };
