""" This module consist all methods related with reporting
"""
import os

from utils.visual_regression.screenshot_manager import ScreenshotManager


class Reporter:

    def __init__(self, driver_factory, configuration):
        self._driver = driver_factory.get_driver()
        self._reports_path = configuration.REPORTS_PATH
        self._screenshot_manager = ScreenshotManager(driver_factory, configuration)

    def _create_reports_dir(self):
        os.makedirs(self._reports_path, exist_ok=True)

    def save_screenshot_and_page_source(self, filename):
        screenshot_filename = f'{filename}.png'
        screenshot_filepath = os.path.join(self._reports_path, screenshot_filename)
        source_filename = f'{filename}.html'
        source_filepath = os.path.join(self._reports_path, source_filename)

        self._create_reports_dir()
        self._screenshot_manager.make_screenshot(screenshot_filepath)
        self.save_page_source(source_filepath)

    def save_page_source(self, filepath):
        source = self._driver.page_source
        with open(filepath, 'a', encoding='utf-8') as path:
            path.write(source)
