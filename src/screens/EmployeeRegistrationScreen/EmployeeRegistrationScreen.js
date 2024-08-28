import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Alert, Platform } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { UserContext } from '../../../App'; // Adjust the import path as necessary

const EmployeeRegistrationScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Access context values
  const { setUserType, setIsAuthenticated } = useContext(UserContext);

  const handleRegistration = async () => {
    setLoading(true);
    setErrorMessage('');

    if (email && password && fullName) {
      try {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user);

        // Save user details in Firestore
        await setDoc(doc(db, 'employees', user.uid), {
          fullName,
          email,
          skills,
          createdAt: new Date(),
        });

        // Set userType and authentication status
        setUserType('employee');
        setIsAuthenticated(true);

        // Inform the user to verify their email
        Alert.alert('Registration successful!', 'Please check your email to verify your account.');

        // Navigate to a screen to handle email verification
        navigation.navigate('VerifyEmail');
        
      } catch (err) {
        setErrorMessage(err.message);
        console.log('Error:', err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage('Please fill all required fields.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text h3 style={styles.title}>Employee Registration</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <View style={styles.inputContainer}>
          <Input
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainerStyle}
            leftIcon={{ type: 'ionicon', name: 'person', color: '#007AFF' }}
          />
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
          <Input
            placeholder="Skills (comma separated)"
            value={skills}
            onChangeText={setSkills}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainerStyle}
            leftIcon={{ type: 'ionicon', name: 'star', color: '#007AFF' }}
          />
        </View>
        <Button
          title={loading ? 'Registering...' : 'Register'}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.buttonStyle}
          onPress={handleRegistration}
          disabled={loading}
        />
        <TouchableOpacity onPress={() => navigation.navigate("EmployeeLogin")}>
          <Text style={styles.link}>Already have an account? Login</Text>
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
    width: '100%',
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

export default EmployeeRegistrationScreen;
