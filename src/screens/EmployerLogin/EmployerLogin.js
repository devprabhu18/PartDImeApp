import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Alert, Platform } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebase/config';
import { UserContext } from '../../../App'; // Adjust the import path as necessary

const EmployerLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Access context values
  const { setUserType, setIsAuthenticated } = useContext(UserContext);

  const handleLogin = async () => {
    if (email && password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          Alert.alert('Email not verified', 'Please verify your email address. A verification email has been sent to your inbox.');
          return;
        }

        const db = getFirestore();
        const userDocRef = doc(db, 'employers', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Set userType and authentication status, then navigate to Home screen
          setUserType('employer');
          setIsAuthenticated(true);
          navigation.reset({
            index: 0,
            routes: [{ name: 'EmployerHome' }],
          });
        } else {
          Alert.alert('Access Denied', 'Your account is not recognized as an employer. Please contact support.');
          await signOut(auth);
        }
      } catch (err) {
        setError(err.message);
        console.log('Error:', err.message);
      }
    } else {
      setError('Please fill in both email and password fields.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text h3 style={styles.title}>Employer Login</Text>
        <View style={styles.inputContainer}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainerStyle}
            leftIcon={{ type: 'ionicon', name: 'mail', color: '#007AFF' }}
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainerStyle}
            leftIcon={{ type: 'ionicon', name: 'lock-closed', color: '#007AFF' }}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button
          title="Login"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.buttonStyle}
          onPress={handleLogin}
        />
        <TouchableOpacity onPress={() => navigation.navigate("EmployerRegistration")}>
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
  buttonContainer: {
    width: '100%',
  },
  buttonStyle: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default EmployerLogin;
