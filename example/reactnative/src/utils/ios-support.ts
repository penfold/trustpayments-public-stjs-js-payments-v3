import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import {
  Alert,
  StatusBar,
  Linking,
  StatusBarStyle,
} from 'react-native';

const sleep = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

export const openLink = async (
  url: string,
  statusBarStyle: StatusBarStyle,
): Promise<void> => {
  try {
    if (await InAppBrowser.isAvailable()) {
      setTimeout(() => StatusBar.setBarStyle('light-content'), 400);

      const result = await InAppBrowser.open(url, {
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: '#453AA4',
        preferredControlTintColor: 'white',
        readerMode: true,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'flipHorizontal',
        modalEnabled: true,
        enableBarCollapsing: true,
        showTitle: true,
        toolbarColor: '#6200EE',
        secondaryToolbarColor: 'black',
        navigationBarColor: 'black',
        navigationBarDividerColor: 'white',
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
        headers: {
          'my-custom-header': 'my custom header value',
        },
        hasBackButton: true,
        browserPackage: undefined,
        showInRecents: false,
      });

      await sleep(800);
      Alert.alert('Response', JSON.stringify(result));
    } else {
      Linking.openURL(url);
    }
  } catch (error: unknown) {
    await sleep(50);
    const errorMessage = error instanceof Error ? error.message : String(error);
    Alert.alert(errorMessage);
  } finally {
    StatusBar.setBarStyle(statusBarStyle);
  }
};
