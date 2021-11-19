from enum import Enum


class ExamplePageParam(Enum):
    MINIMAL_HTML = 'minimal.html'
    IN_IFRAME = 'iframe.html'
    WITHOUT_SUBMIT_BUTTON = 'noSubmitButton=true&'
    WITH_ADDITIONAL_BUTTON = 'additionalButton=true&'
    WITH_UPDATE_JWT = 'updatedJwt=%s&'
    WITH_SPECIFIC_FORM_ID = 'formId=test'
    WITH_CALLBACK = 'todo'
    WITH_CHANGED_FORM_ID = 'formId=testForm&'
    WITH_BROWSER_INFO = 'browserInfo=true'
    WITH_SPECIFIC_IFRAME = 'iframe.html?iframeName=testFrame'
    WITH_CSP = 'minimal-content-security-header.html'
    WITH_SEON_OBJECT = 'fraudControl=true'
