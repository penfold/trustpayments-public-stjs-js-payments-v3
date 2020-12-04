"""Separate module to handle framework test data"""
from attrdict import AttrDict


def load_test_data():
    # pylint: disable=line-too-long
    test_data_dict = {
        'STEP_PAYMENT': AttrDict({
          'UPDATE_JWT': 'xxx' },
        )
    }

    return AttrDict(test_data_dict)


TEST_DATA = load_test_data()


class TestData:
    # pylint: disable=too-many-instance-attributes

    def __init__(self, configuration):
        self._base_page = configuration.URL.BASE_URL

        ''' User section '''
        self.update_jwt = TEST_DATA.STEP_PAYMENT.UPDATE_JWT
