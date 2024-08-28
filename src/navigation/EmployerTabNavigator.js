import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Keyboard } from 'react-native';
import HomeScreen from '../screens/HomeScreen/EmployerHome';
import BrowseScreen from '../screens/BrowseScreen/BrowseScreen';
import PostScreen from '../screens/PostScreen/PostScreen';
// import ListScreen from '../screens/ListScreen/ListScreen';
// import SavedScreen from '../screens/SavedScreen/SavedScreen';

const Tab = createBottomTabNavigator();

const EmployerTabNavigator = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Browse') {
            iconName = 'search';
          } else if (route.name === 'Post') {
            iconName = 'add-circle';
          } else if (route.name === 'Saved') {
            iconName = 'bookmark';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          display: keyboardVisible ? 'none' : 'flex',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Browse" component={BrowseScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Post" component={PostScreen} options={{ headerShown: false }} />
      {/* 
      <Tab.Screen name="Saved" component={SavedScreen} /> */}
    </Tab.Navigator>
  );
};

export default EmployerTabNavigator;

