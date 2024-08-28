import React, { createContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import screens
import EmployerLogin from './src/screens/EmployerLogin/EmployerLogin';
import UserTypeScreen from "./src/screens/UserTypeScreen/UserTypeScreen";
import EmployerRegistrationScreen from "./src/screens/EmployerRegistrationScreen/EmployerRegistrationScreen";
import EmployeeRegistrationScreen from "./src/screens/EmployeeRegistrationScreen/EmployeeRegistrationScreen";
import EmployeeLogin from "./src/screens/EmployeeLogin/EmployeeLogin";
import GSTVerifier from "./src/components/GSTVerifier";
import TabNavigator from "./src/navigation/TabNavigator";
import EmployerTabNavigator from "./src/navigation/EmployerTabNavigator";
import VerifyEmailScreen from "./src/screens/EmployeeRegistrationScreen/VerifyEmail";
import SliderScreen from "./src/screens/SliderScreen/SliderScreen";
import JobPostingScreen from "./src/screens/JobPosting/JobPostingScreen";
import JobDetailsScreen from "./src/screens/JobPosting/JobDetails";
import VerifyEmployerEmailScreen from "./src/screens/EmployeeRegistrationScreen/VerifyEmployerEmail";

const Stack = createStackNavigator();
export const UserContext = createContext();

const globalScreenOptions = {
  headerStyle: { backgroundColor: "#2C6BED" },
  headerTitleStyle: { color: "white" },
  headerTintColor: "white",
  headerShown: true
};

export default function App() {
  const [userType, setUserType] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const session = await getUserSession();
        if (session) {
          setIsAuthenticated(session.isAuthenticated);
          setUserType(session.userType);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuthentication();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    console.log('Current userType:', userType); // Debugging userType
  }, [userType]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <UserContext.Provider value={{ userType, setUserType, setIsAuthenticated }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={globalScreenOptions}>
            {!isAuthenticated ? (
              <>
                <Stack.Screen name="WelcomeScreen" component={UserTypeScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="SliderScreen" component={SliderScreen} options={{ headerShown: false }}/>
                {userType === 'employer' && (
                  <Stack.Screen name="EmployerRegistration" component={EmployerRegistrationScreen} options={{ headerShown: false }} />
                )}
                {userType === 'employee' && (
                  <Stack.Screen name="EmployeeRegistration" component={EmployeeRegistrationScreen} options={{ headerShown: false }}/>
                )}
                <Stack.Screen name="EmployerLogin" component={EmployerLogin} options={{ headerShown: false }} />
                <Stack.Screen name="EmployeeLogin" component={EmployeeLogin} options={{ headerShown: false }}/>
              </>
            ) : (
              <>
                {userType === 'employer' && (
                  <Stack.Screen name="VerifyEmployerEmail" component={VerifyEmployerEmailScreen} />
                )}
                {userType === 'employer' && (
                  <Stack.Screen name="EmployerHome" options={{ headerShown: false }}>
                    {props => <EmployerTabNavigator {...props} keyboardVisible={keyboardVisible} />}
                  </Stack.Screen>
                )}
                {userType === 'employee' && (
                  <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
                )}
                {userType === 'employee' && (
                  <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ headerShown: false }} />
                )}
                <Stack.Screen name="JobPostingScreen" component={JobPostingScreen} />
                <Stack.Screen name="Home" options={{ headerShown: false }}>
                  {props => <TabNavigator {...props} keyboardVisible={keyboardVisible} />}
                </Stack.Screen>
                {!userType && (
                  <>
                    <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
                    <Stack.Screen name="GSTVerifier" component={GSTVerifier} />
                  </>
                )}
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </UserContext.Provider>
    </KeyboardAvoidingView>
  );
}

const getUserSession = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
    return user && isAuthenticated ? { userType: JSON.parse(user).type, isAuthenticated: JSON.parse(isAuthenticated) } : null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
};

export const saveUserSession = async (user, isAuthenticated) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  } catch (error) {
    console.error('Error saving user session:', error);
  }
};
