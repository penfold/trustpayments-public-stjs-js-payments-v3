(function($) {
  $(document).ready(function() {
    var $body = $('body');
    var $loader = $('#debit-loader');

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

    var errorHandler = function(response, status) {
      $loader.hide();
    };
    $('#st-form-js').submit(function(event) {
      event.preventDefault();
      var $form = $(this);
      if (stIsValid($form)) {
        $loader.show();
        $.post({
          url: $form.attr('action'),
          data: $form.serialize(),
          cache: false,
          success: function(response) {
            completeHandler(response, status);
            if (response.result) {
              var st = SecureTrading({
                jwt: response.jwt,
                livestatus: parseInt(response.livestatus),
                submitOnError: false,
                submitOnSuccess: false,
                submitCallback: (function() {
                  var $form = $('#st-form-js');
                  var formData = $('#st-form-js, #st-form').serializeArray();
                  formData.push({ name: 'transaction_id', value: response.transaction_id });
                  $.post({
                    url: $form.attr('action'),
                    data: $.param(formData),
                    cache: false,
                    success: function(response, status) {
                      $('.popup:visible').hide();
                      completeHandler(response, status);
                      $loader.hide();
                      st.destroy();
                      $('#st-control-frame-iframe').remove();
                    },
                    error: function(response, status) {
                      completeHandler(response, status);
                      errorHandler(response, status);
                      st.destroy();
                      $('#st-control-frame-iframe').remove();
                    }
                  });
                })
              });
              st.Components({
                startOnLoad: true
              });
            } else {
              errorHandler(response, status);
            }
          },
          error: function(response, status) {
            completeHandler(response, status);
            errorHandler(response, status);
          }
        });
      }
    });

    function stIsValid($form) {
      var isValid = true;
      var $pan = $('input[name="pan"]', $form);
      var $panError = $('#reg_stpan_div');
      var $expiryMonth = $('select[name="expirymonth"]', $form);
      var $expiryYear = $('select[name="expiryyear"]', $form);
      var $expiryError = $('#reg_stexpiry_div');
      var $cvv = $('input[name="cvv"]', $form);
      var $cvvError = $('#reg_stcvv_div');

      if ($pan.length > 0 && '' === $pan.val()) {
        isValid = false;
        $panError.addClass('active');
      } else {
        $panError.removeClass('active');
      }

      if (
        $expiryMonth.length > 0 && '' === $expiryMonth.val() &&
        $expiryYear.length > 0 && '' === $expiryYear.val()
      ) {
        isValid = false;
        $expiryError.addClass('active');
      } else {
        $expiryError.removeClass('active');
      }

      if ($cvv.length > 0 && '' === $cvv.val()) {
        isValid = false;
        $cvvError.addClass('active');
      } else {
        $cvvError.removeClass('active');
      }

      return isValid;
    };
  });
})(jQuery);
