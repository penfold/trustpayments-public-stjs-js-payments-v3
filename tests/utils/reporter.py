""" This module consist all methods related with reporting
"""
import os
import time


class Reporter:

    def __init__(self, driver, configuration):
        self._browser = driver.get_browser()
        self._reports_path = configuration.REPORTS_PATH

    def _create_reports_dir(self):
        os.makedirs(self._reports_path, exist_ok=True)

    def save_screenshot_and_page_source(self, filename):
        screenshot_filename = f'{filename}.png'
        screenshot_filepath = os.path.join(self._reports_path, screenshot_filename)
        source_filename = f'{filename}.html'
        source_filepath = os.path.join(self._reports_path, source_filename)

        self._create_reports_dir()
        self.save_screenshot(screenshot_filepath)
        self.save_page_source(source_filepath)

    def save_screenshot(self, filepath):
        self._browser.save_screenshot(filepath)

    def save_instant_screenshot(self):
        filename = time.strftime('%Y%m%d-%H%M%S.png')
        filepath = os.path.join(self._reports_path, filename)
        self._browser.save_screenshot(filepath)

    def save_page_source(self, filepath):
        source = self._browser.page_source
        with open(filepath, 'a', encoding='utf-8') as path:
            path.write(source)
