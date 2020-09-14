import os
from time import sleep

from PIL import Image, ImageDraw

import ioc_config
from utils.date_util import convert_to_string, get_current_time, date_formats


def screenshot_manager():
    return ioc_config.VISUAL_REGRESSION.resolve('screenshot_manager')


class ScreenshotManager:
    SENSITIVITY_DEFAULT: int = 5000
    COMPARISON_AREA_PX_DEFAULT: int = 20

    def __init__(self, driver__browser, config__executor):
        self._browser = driver__browser.get_browser()
        self._screenshots_path = config__executor.screenshots_path
        self._mobile_device = config__executor.mobile_device
        self._create_screenshot_dir()

    def _create_screenshot_dir(self):
        os.makedirs(self._screenshots_path, exist_ok=True)
        os.makedirs(os.path.join(self._screenshots_path, "actual"), exist_ok=True)
        os.makedirs(os.path.join(self._screenshots_path, "results"), exist_ok=True)

    def _proper_name(self, name: str, date_postfix: bool = False):
        name = f'{name}.png'.replace("png.png", "png")
        if date_postfix:
            name = name.replace(".png", convert_to_string(get_current_time(), date_formats.date_postfix) + ".png")
        return name

    def make_screenshot(self, filename: str, date_postfix: bool = False):
        filename = self._proper_name(filename, date_postfix)

        if self._mobile_device:
            return self.make_double_screenshot(filename)

        filepath: str = os.path.join(self._screenshots_path, "actual", filename)
        self._browser.save_screenshot(filepath)
        return filename

    def make_double_screenshot(self, filename):
        self._browser.execute_script("window.scrollTo(0, document.body.scrollHeight)")
        sleep(2)
        filepath_1: str = os.path.join(self._screenshots_path, "actual", filename.replace(".png", "_1.png"))
        self._browser.save_screenshot(filepath_1)
        self._browser.execute_script("window.scrollTo(0, -document.body.scrollHeight)")
        sleep(2)
        filepath_2: str = os.path.join(self._screenshots_path, "actual", filename.replace(".png", "_2.png"))
        self._browser.save_screenshot(filepath_2)

        image_bottom = Image.open(filepath_1)
        image_top = Image.open(filepath_2)

        width = image_bottom.size[0]
        height = image_bottom.size[1]

        new_image = Image.new('RGB', (2 * width, height), (250, 250, 250))
        new_image.paste(image_top, (0, 0))
        new_image.paste(image_bottom, (width, 0))

        filepath: str = os.path.join(self._screenshots_path, "actual", filename)
        new_image.save(filepath)

        return filename

    def compare_screenshots(self, filename_expected: str, filename_actual: str,
                            comparison_area_px: int = COMPARISON_AREA_PX_DEFAULT):

        filepath_expected = os.path.join(self._screenshots_path, "expected", self._proper_name(filename_expected))
        filepath_actual = os.path.join(self._screenshots_path, "actual", self._proper_name(filename_actual))

        screenshot_expected = self._crop_image_if_iphone(Image.open(filepath_expected))
        screenshot_actual = self._crop_image_if_iphone(Image.open(filepath_actual))

        screen_width, screen_height = screenshot_expected.size

        if comparison_area_px < 1 or comparison_area_px > screen_width or comparison_area_px > screen_height:
            comparison_area_px = self.COMPARISON_AREA_PX_DEFAULT
        block_width: int = comparison_area_px - 1
        block_height: int = comparison_area_px - 1

        screenshot_are_the_same: bool = True
        for y in range(0, screen_height, block_height + 1):
            for x in range(0, screen_width, block_width + 1):
                region_staging = self._process_region(screenshot_expected, x, y, block_width, block_height)
                region_production = self._process_region(screenshot_actual, x, y, block_width, block_height)

                if region_production != region_staging and region_staging is not None and region_production is not None:
                    screenshot_are_the_same = False
                    draw = ImageDraw.Draw(screenshot_expected)
                    draw.rectangle((x, y, x + block_width, y + block_height), outline="red")

        if not screenshot_are_the_same:
            filepath_result = os.path.join(self._screenshots_path, "results", filename_actual)
            screenshot_expected.save(filepath_result)
        return screenshot_are_the_same

    def _crop_image_if_iphone(self, image):
        if "iphone" not in self._mobile_device.lower():
            return image
        width = image.size[0]
        height = image.size[1]
        return image.crop((0, 250, width, height - 250))

    def _process_region(self, image, x, y, width, height):
        region_total: int = 0
        factor: int = self.SENSITIVITY_DEFAULT

        for coordinateY in range(y, y + height):
            for coordinateX in range(x, x + width):
                try:
                    pixel = image.getpixel((coordinateX, coordinateY))
                    region_total += sum(pixel) / 4
                except:
                    return

        return int(region_total / factor)
