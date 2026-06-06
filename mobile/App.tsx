import { StatusBar } from "expo-status-bar";
import { UserProvider } from "./src/context/UserContext";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <UserProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </UserProvider>
  );
}
