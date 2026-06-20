import { Alert } from 'react-native';

const defaultErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  if (isFatal) {
    Alert.alert(
      "Fatal JS Error (Please Screenshot!)",
      `${error.name}: ${error.message}`
    );
  }
  if (defaultErrorHandler) {
    defaultErrorHandler(error, isFatal);
  }
});

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
