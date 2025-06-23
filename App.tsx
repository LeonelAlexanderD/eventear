import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AuthScreen } from './app/screens/AuthScreen';
import { CreateEventScreen } from './app/screens/CreateEventScreen';
import { EditProfileScreen } from './app/screens/EditProfileScreen';
import { EventDetailScreen } from './app/screens/EventDetailScreen';
import { EventInfoScreen } from './app/screens/EventInfoScreen';
import FavoritesScreen from './app/screens/FavoritesScreen';
import { HomeScreen } from './app/screens/HomeScreen';
import MyEventsScreen from './app/screens/MyEventsScreen';
import { ProfileScreen } from './app/screens/ProfileScreen';
import SearchScreen from './app/screens/SearchScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import { Event } from './types/event';

export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Auth: undefined;
  EditProfile: undefined;
  CreateEvent: undefined;
  Search: undefined;
  MyEvents: undefined;
  Favorites:undefined;
  EventDetail: { event: Event };
  EventInfo: { event: Event };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  // const { theme } = useTheme();

  return (
    <>
      {/* <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#1a1a1a' : '#ffffff'}
      /> */}
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="CreateEvent"
            component={CreateEventScreen}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="EventInfo"
            component={EventInfoScreen}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{
              title: 'Buscar Eventos',
              headerShown: true
            }}
          />
           <Stack.Screen
            name="MyEvents"
            component={MyEventsScreen}
            options={{
              title: 'Mis Eventos',
              headerShown: false
            }}
          />
              <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
              title: 'Mis Favoritos',
              headerShown: false
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
} 