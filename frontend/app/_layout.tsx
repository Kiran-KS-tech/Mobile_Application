import "./global.css";
import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <Slot />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}


