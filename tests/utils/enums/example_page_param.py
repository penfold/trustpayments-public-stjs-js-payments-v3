from enum import Enum


class ExamplePageParam(Enum):
    WITHOUT_SUBMIT_BUTTON = 'noSubmitButton=true&'
    WITH_ADDITIONAL_BUTTON = 'additionalButton=true&'
    WITH_UPDATE_JWT = 'updatedJwt=%s&'
    WITH_SPECIFIC_FORM_ID = 'formId=test'
    WITH_CALLBACK = 'todo'
    WITH_CHANGED_FORM_ID = 'formId=testForm&'
    IN_IFRAME = 'iframe.html?'
    WITH_BROWSER_INFO = 'browserInfo=true'
    WITH_SPECIFIC_IFRAME = 'iframe.html?iframeName=testFrame'
    SUCCESS_CALLBACK = 'extraSuccessFunction=(function callback()' \
                       '{const form=document.getElementById(\'st-form\');' \
                       'form.action=\'https://example.org\';form.submit();})()'
    ERROR_CALLBACK = 'extraErrorFunction=(function callback()' \
                     '{const form=document.getElementById(\'st-form\');' \
                     'form.action=\'https://example.org\';form.submit();})()'
    CANCEL_CALLBACK = 'extraCancelFunction=(function callback()' \
                      '{const form=document.getElementById(\'st-form\');' \
                      'form.action=\'https://example.org\';form.submit();})()'
    SUBMIT_CALLBACK = 'extraSubmitFunction=(function callback()' \
                      '{const form=document.getElementById(\'st-form\');' \
                      'form.action=\'https://example.org\';form.submit();})()'