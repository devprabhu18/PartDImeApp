import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Alert, Platform } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { UserContext } from '../../../App'; // Adjust the import path as necessary
import cheerio from 'cheerio';

const EmployerRegistrationScreen = ({ navigation }) => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Access context values
  const { setUserType, setIsAuthenticated } = useContext(UserContext);

  const verifyGST = async () => {
    try {
      const response = await fetch(`https://razorpay.com/gst-number-search/${gstNumber}/`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      const html = await response.text();
      const $ = cheerio.load(html);
      const companyNameFromApi = $('h5.StyledBaseText-dUVvOG.lplbiD').first().text();
      if (companyNameFromApi) {
        setCompanyName(companyNameFromApi);
      } else {
        throw new Error('Company name not found in response');
      }
    } catch (error) {
      setErrorMessage(error.message);
      Alert.alert('Error', error.message);
    }
  };

  const handleRegistration = async () => {
    setLoading(true);
    setErrorMessage('');

    if (email && password && companyName && contactPerson) {
      try {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user);

        // Store employer data in Firestore
        const employerRef = doc(db, 'employers', user.uid);
        await setDoc(employerRef, {
          companyName,
          email,
          contactPerson,
          createdAt: new Date(),
        });

        // Set userType and authentication status
        setUserType('employer');
        setIsAuthenticated(true);

        // Show a message to inform the user to verify their email
        Alert.alert('Registration successful!', 'Please check your email to verify your account.');

        // Navigate to a screen where you can show a message and handle email verification
        navigation.navigate('VerifyEmployerEmail');
        
      } catch (err) {
        setErrorMessage(err.message);
        console.log('Error:', err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage('Please fill all the fields.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text h3 style={styles.title}>Employer Registration</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <View style={styles.inputContainer}>
          <Input
            placeholder="GST Number"
            value={gstNumber}
            onChangeText={setGstNumber}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainerStyle}
            leftIcon={{ type: 'ionicon', name: 'code', color: '#007AFF' }}
          />
          <Button
            title="Verify GST Number"
            onPress={verifyGST}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainer}
          />
          <Input
            placeholder="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            disabled={true}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainerStyle}
            leftIcon={{ type: 'ionicon', name: 'business', color: '#007AFF' }}
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
            placeholder="Contact Person"
            value={contactPerson}
            onChangeText={setContactPerson}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainerStyle}
            leftIcon={{ type: 'ionicon', name: 'person', color: '#007AFF' }}
          />
        </View>
        <Button
          title={loading ? 'Registering...' : 'Register'}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.buttonStyle}
          onPress={handleRegistration}
          disabled={loading}
        />
        <TouchableOpacity onPress={() => navigation.navigate("EmployerLogin")}>
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

export default EmployerRegistrationScreen;
