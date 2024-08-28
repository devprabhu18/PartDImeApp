import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Button, Alert } from 'react-native';
import { auth } from '../../firebase/config';
import { UserContext } from '../../../App'; // Adjust the import path

const VerifyEmployerEmailScreen = ({ navigation }) => {
  const { setUserType, isAuthenticated, setIsAuthenticated } = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [timerExpired, setTimerExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const verificationTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds

  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          await user.reload(); // Refresh user data
          if (user.emailVerified) {
            console.log('Email is verified, navigating to EmployerHome');
            setIsAuthenticated(true); // Set authenticated state
            if (setUserType) {
              setUserType('employer'); // Set user type to 'employer'
            }
            navigation.navigate('EmployerHome'); // Navigate to home screen if email is verified
          } else {
            console.log('Email is not verified, starting timer');
            setLoading(false); // Stop loading indicator
            startVerificationTimer(); // Start timer for verification check
          }
        } else {
          console.log('No user found, navigating to EmployerLogin');
          navigation.navigate('EmployerLogin'); // Redirect to login if user not found
        }
      } catch (error) {
        console.error('Error checking email verification:', error.message);
        Alert.alert('Error', error.message);
      }
    };

    const startVerificationTimer = () => {
      const startTime = Date.now();
      const intervalId = setInterval(async () => {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, Math.floor((verificationTimeout - elapsed) / 1000));
        setTimeLeft(remainingTime);

        if (remainingTime === 0) {
          clearInterval(intervalId);
          setTimerExpired(true);
          await auth.signOut(); // Log out the user if timeout expires
          navigation.navigate('EmployeeLogin'); // Navigate to login screen
        } else {
          const user = auth.currentUser;
          if (user) {
            await user.reload(); // Refresh user data
            if (user.emailVerified) {
              clearInterval(intervalId);
              setIsAuthenticated(true); // Set authenticated state
              if (setUserType) {
                setUserType('employer'); // Set user type to 'employer'
              }
              navigation.navigate('EmployerHome'); // Navigate to home screen if email is verified
            }
          }
        }
      }, 1000); // Update every second

      // Cleanup on component unmount
      return () => clearInterval(intervalId);
    };

    checkEmailVerification();

    // Cleanup on component unmount
    return () => setTimerExpired(true); // Ensure timer stops if component unmounts
  }, [navigation, setUserType, setIsAuthenticated]);

  const handleManualRefresh = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await user.reload(); // Refresh user data
        if (user.emailVerified) {
          setIsAuthenticated(true); // Set authenticated state
          if (setUserType) {
            setUserType('employer'); // Set user type to 'employer'
          }
          navigation.navigate('EmployerHome'); // Navigate to home screen if email is verified
        } else {
          Alert.alert('Email Not Verified', 'Your email is still not verified.');
        }
      } else {
        Alert.alert('Error', 'No user found. Please log in again.');
        navigation.navigate('EmployerLogin'); // Navigate to login screen if no user found
      }
    } catch (error) {
      console.error('Error refreshing email verification:', error.message);
      Alert.alert('Error', error.message);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={styles.message}>
            {timerExpired
              ? 'Verification time expired. Please log in again to request a new verification email.'
              : `Please check your email and follow the instructions to verify your account. You have ${formatTime(timeLeft)} left.`}
          </Text>
          {!timerExpired && !isAuthenticated && (
            <Button
              title="Refresh Verification Status"
              onPress={handleManualRefresh}
              color="#007AFF"
            />
          )}
          {timerExpired && (
            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('EmployerLogin')}
              color="#007AFF"
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default VerifyEmployerEmailScreen;

