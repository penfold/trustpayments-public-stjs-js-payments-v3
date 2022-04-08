import React, {useState, useCallback, useEffect} from 'react';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {WebViewSource} from 'react-native-webview/lib/WebViewTypes';
import {
  ScrollView,
  View,
  Text,
  Platform,
  Image,
  LayoutRectangle,
  StatusBarStyle,
} from 'react-native';
// @ts-ignore
import {REACT_APP_MACHINE_IP} from 'react-native-dotenv';
import {openLink} from './utils/ios-support';
import {styles} from './style';

const librarySource =
  Platform.OS === 'ios'
    ? `https://${REACT_APP_MACHINE_IP}:8444`
    : {uri: 'file:///android_asset/library/template.html'};

const App = () => {
  const [webViewHeight, setWebViewHeight] = useState<number>(0);
  const [isScrollEnabled, setIsScrollEnabled] = useState<boolean>(true);
  const [webViewRef, setWebViewRef] = useState<any>(null);
  const [webViewLayout, setWebViewLayout] = useState<LayoutRectangle>();
  const [statusBarStyle] = useState<StatusBarStyle>('dark-content');

  const onOpenLink = useCallback(async () => {
    await openLink(librarySource as string, statusBarStyle);
  }, [statusBarStyle]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      onOpenLink();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onWebViewMessage = (event: WebViewMessageEvent) => {
    const {data} = event.nativeEvent;

    switch (data) {
      case 'acs-on':
        const {y, height} = webViewLayout as LayoutRectangle;
        webViewRef.scrollTo({y: y + height / 2, animated: true});
        setIsScrollEnabled(false);
        break;
      case 'acs-off':
        setIsScrollEnabled(true);
        break;
      default:
        setWebViewHeight(Number(data));
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      scrollEnabled={isScrollEnabled}
      ref={setWebViewRef}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require('./assets/trustpayments.png')}
          />
        </View>
        <Text style={styles.headerLabel}>Example Form</Text>
      </View>
      {webViewHeight == 0 && (
        <Text style={styles.loadingLabel}>Loading data...</Text>
      )}
      {Platform.OS !== 'ios' && (
        <WebView
          onLayout={(event) => setWebViewLayout(event.nativeEvent.layout)}
          mixedContentMode="always"
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          onMessage={onWebViewMessage}
          originWhitelist={['*']}
          style={{...styles.webView, height: webViewHeight}}
          source={librarySource as WebViewSource}
        />
      )}
      <View>
        <Text onPress={replace}> open window</Text>
        <Text style={styles.footer}>© Trust Payments 2020</Text>
      </View>
    </ScrollView>
  );
};

export default App;
