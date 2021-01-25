import React, { useState } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import {
  ScrollView,
  View,
  Text,
  Platform,
  Image
} from 'react-native';
import { styles } from './style';

const librarySource = Platform.OS === 'ios' ? require('./library/template.html') : { uri: 'file:///android_asset/library/template.html' };

const App = () => {
  const [webViewHeight, setWebViewHeight] = useState<number>(0);
  const [isScrollEnabled, setIsScrollEnabled] = useState<boolean>(true); 

  const onWebViewMessage = (event: WebViewMessageEvent) => {
    const { data } = event.nativeEvent;

    if (data === 'acs-on') {
      setIsScrollEnabled(false);
    } else if (data === 'acs-off') {
      setIsScrollEnabled(true);
    } else {
      setWebViewHeight(Number(data));
    }
  }
  
  return (
    <ScrollView style={styles.scrollView} scrollEnabled={isScrollEnabled}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={require('./assets/trustpayments.png')} />
        </View>
        <Text style={styles.headerLabel}>Example Form</Text>
      </View>
      {webViewHeight == 0 && <Text style={styles.loadingLabel}>Loading data...</Text>}
      <WebView
        mixedContentMode="always"
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        onMessage={onWebViewMessage}
        originWhitelist={['*']}
        style={{...styles.webView, height: webViewHeight}}
        source={librarySource}
      />
      <View>
        <Text style={styles.footer}>© Trust Payments 2020</Text>
      </View>
    </ScrollView>
  );
};

export default App;
