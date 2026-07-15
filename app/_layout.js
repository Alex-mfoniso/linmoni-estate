// import { Stack } from "expo-router";
// import { PaperProvider } from "react-native-paper";

// export default function RootLayout() {
//   return (
//     <PaperProvider>
//       <Stack screenOptions={{ headerShown: false }} />
//     </PaperProvider>
//   );
// }
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
