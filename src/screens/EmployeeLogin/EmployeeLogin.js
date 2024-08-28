import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Alert, Platform } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { UserContext } from '../../../App'; // Adjust the import path as necessary

const EmployeeLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Access context values
  const { setUserType, setIsAuthenticated } = useContext(UserContext);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');

    if (email && password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          // Log out the user if their email is not verified
          await auth.signOut();
          Alert.alert('Email not verified', 'Please verify your email before logging in.');
          navigation.navigate('VerifyEmail');
        } else {
          // Set userType and authentication status, then navigate to Home screen
          setUserType('employee'); // Assuming employee is the user type here
          setIsAuthenticated(true);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }

      } catch (err) {
        setErrorMessage(err.message); // Display Firebase error message
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage('Please enter both email and password.');
      setLoading(false); // Stop loading spinner if validation fails
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text h3 style={styles.title}>Employee Login</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <View style={styles.inputContainer}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainerStyle}
            leftIcon={{ type: 'ionicon', name: 'mail', color: '#007AFF' }}
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainerStyle}
            leftIcon={{ type: 'ionicon', name: 'lock-closed', color: '#007AFF' }}
          />
        </View>
        <Button
          title={loading ? 'Logging in...' : 'Login'}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.buttonStyle}
          onPress={handleLogin}
          disabled={loading}
        />
        <TouchableOpacity onPress={() => navigation.navigate("EmployeeRegistration")}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  innerContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  inputContainerStyle: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  buttonStyle: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  buttonContainer: {
    width: '100%',
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default EmployeeLogin;
