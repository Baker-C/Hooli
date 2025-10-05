import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import ConfigScreen from './src/screens/ConfigScreen';
import CallScreen from './src/screens/CallScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SummarizeScreen from './src/screens/SummarizeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Config" component={ConfigScreen} />
          <Stack.Screen name="Call" component={CallScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Summarize" component={SummarizeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
