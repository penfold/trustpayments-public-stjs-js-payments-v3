import {StyleSheet} from 'react-native';
  
export const styles = StyleSheet.create({
    scrollView: {
      backgroundColor: 'white',
      paddingHorizontal: 10
    },
    webView: {
      backgroundColor: 'white',
      width: '100%'
    },
    footer: {
      textAlign: 'center',
      marginVertical: 15
    },
    header: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 75
    },
    imageContainer: {
      width: '50%',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    headerLabel: {
      fontSize: 20
    },
    loadingLabel: {
      textAlign: 'center',
      marginTop: 30,
      marginBottom: 15
    }
  });
  