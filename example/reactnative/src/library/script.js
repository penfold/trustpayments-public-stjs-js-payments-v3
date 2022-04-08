(function(ST) {
  window.addEventListener('load', function() {
    let acsMessage = 'acs-off';
    function getConfig() {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest;
        xhr.onload = function() {
          resolve(JSON.parse(xhr.responseText));
        }
        xhr.onerror = function() {
          reject(new TypeError('Local request failed'));
        }
        xhr.open('GET', './config.json');
        xhr.send(null);
      });
    }

    function setCallbacks(config) {
      config.submitCallback = function(data) {
        var stringified = JSON.stringify(data);
        alert('This is what we have got after submit: ' + stringified);
      };
      config.successCallback = function() {
        alert('This is success message');
      };
      config.errorCallback = function() {
        alert('This is error message');
      };
      config.cancelCallback = function() {
        alert('This is cancel message');
      };
    }

    function updateJwtListener() {
      document.getElementById('example-form-amount').addEventListener('input', function() {
        var newJwt = document.getElementById('jwt-to-update').value;
        if (newJwt !== '') {
          st.updateJWT(newJwt);
        } else {
          alert('Please update the jwt key before changing the ammount value');
        }
      });
    }

    function handleResize() {
      return new ResizeObserver(function(entries) {
        window.ReactNativeWebView.postMessage(entries[0].target.offsetHeight);
      });
    }

    function handleAcsPopup() {
      return new MutationObserver(function(entries) {

        if (document.getElementById('Cardinal-ElementContainer')) {
          acsMessage = 'acs-on';
          window.ReactNativeWebView.postMessage(acsMessage);
        } else if (acsMessage === 'acs-on') {
          acsMessage = 'acs-off';
          window.ReactNativeWebView.postMessage(acsMessage);
        }
      });
    }

    function init(config) {
      setCallbacks(config);
      handleResize().observe(document.getElementById('st-form'));
      handleAcsPopup().observe(document.body, {attributes: false, childList: true, characterData: false, subtree:true});
      var st = ST(config);
      st.Components(config.components);

      st.VisaCheckout(config.visaCheckout);
      st.ApplePay(config.applePay);
      updateJwtListener(st);

      if (document.getElementById('windowOpen')){
        alert('sd')
        document.getElementById('windowOpen').addEventListener('click', function(){
          st.GooglePay(config.googlePay);

        })
      }

      alert('ssss')
    }


    getConfig()
      .then(function(config) {
        init(config);
      });
  });
})(SecureTrading);
