from configuration import CONFIGURATION


def set_proper_browser_name():
    browser_name = CONFIGURATION.REMOTE_BROWSER
    if 'IE' in CONFIGURATION.REMOTE_BROWSER:
        browser_name = 'Internet Explorer'
    return browser_name


def set_proper_os_name():
    os_name = 'Android'
    if 'iP' in CONFIGURATION.REMOTE_DEVICE:
        os_name = 'iOS'
    return os_name
