import 'url-polyfill';
import '../../styles/style.scss';

import { jwtgenerator } from '@trustpayments/jwt-generator';

const popupStyles =
  'display: flex; justify-content: center; position: fixed; left: 0; height: 70px; width: 280px;right:0;color: white;padding: 0 40px;align-items: center;border-radius: 10px;font-family: Verdana;font-size: 20px;z-index:2';
const popup = document.getElementById('st-popup');
let callbackCounter = 0;
let submitCallbackCounter = 0;
let successCallbackCounter = 0;
let errorCallbackCounter = 0;
let cancelCallbackCounter = 0;

window.displayCallbackCounter = (id, text, tp) => {
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
      div.style.top = '150px';
      break;
    default:
      div.style.top = '250px';
  }
  popup.appendChild(div);
  setTimeout(() => {
    popup.removeChild(div);
  }, 8000);
};

window.configJWT = (url, additionalData) =>
  fetch(url)
    .then(response => response.json())
    .then(out => jwtgenerator({ ...out.payload, ...additionalData }, out.secret, out.iss));

const getResponse = () => {
  const response = {};
  const selectedResponseOptions = Array.from($('#additional-effects input:checkbox:checked').map((_, i) => $(i).val()));

  if (selectedResponseOptions.includes('pay-html')) {
    response.html = [
      '<div>Appended element</div>',
      '<button>Appended button</button>'
    ];
  }

  if (selectedResponseOptions.includes('pay-eval')) {
    response.js = response.js || [];
    response.js.push(
      '(function() { for (let i = 0; i < 5; i++) { console.log(i); }}())',
      '(function() { setTimeout(() => console.log("test"), 1000) }())',
    );
  }

  if (selectedResponseOptions.includes('pay-eval-err')) {
    response.js = response.js || [];
    response.js.push(
      '(function() { "use strict"; _nonExistingVar = 7; }())',
    );
  }

  return response;
}

(function($){
  $(document).ready(function(){
    var $body = $('body');

    var completeHandler = function(response, status) {
      if (response.popup) {
        $('body').append(response.popup);
      }
      $.each(response.html, function(i, html) {
        $body.append(html);
      });
      $.each(response.js, function(i, js) {
        eval(js);
      });
    };

    $('#st-form').submit(function(event) {
      event.preventDefault();
      window.getJwt().then((jwt) => new Promise(resolve => {
        setTimeout(() => resolve(jwt), 1000);
      })).then((jwt) => {
        console.log('NEW JWT '+jwt);
        var st = SecureTrading({
          jwt,
          livestatus: 0,
          submitOnError: false,
          submitOnSuccess: false,
          submitCallback: (function(data){
            displayPopup('data-popup', 'Error code: ' + (!data || data.errorcode != '0' ? 'Error' : 'OK'), 'blue');
            displayPopup('data-popup-jwt', 'JWT: ' + data.jwt, 'blue');
            displayPopup('data-popup-threedresponse', 'THREEDRESPONSE: ' + data.threedresponse, 'blue');

            window.displayCallbackCounter('submit-callback-counter', 'submit', 'blue');
            console.error('This is what we have got after submit');
            console.error(JSON.stringify(data, null, 2));

            setTimeout(() => {
              completeHandler(getResponse());
              st.destroy();
              $('#st-control-frame-iframe').remove();
            }, 1000);
          }),
          successCallback: function() {
            displayPopup('success-popup', 'This is success message', 'green');
            window.displayCallbackCounter('success-callback-counter', 'success', 'green');
          },
          errorCallback: function() {
            displayPopup('error-popup', 'This is error message', 'red');
            window.displayCallbackCounter('error-callback-counter', 'error', 'red');
          },
          cancelCallback: function() {
            displayPopup('cancel-popup', 'This is cancel message', '#ffc23a');
            window.displayCallbackCounter('cancel-callback-counter', 'cancel', '#ffc23a');
          },
        });
        st.Components({
          startOnLoad: true,
        });
      })
    });
  });
})(jQuery);
