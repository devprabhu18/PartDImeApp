import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.headline}>Your one-stop solution for job management</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SliderScreen')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      <LottieView 
        source={require('../../../assets/growth.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  logo: {
    width: 300,
    height: 300,
    borderRadius: 20,
    marginBottom: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: "center"
  },
  headline: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    width: '80%',
    borderRadius: 25,
    height: 50,
    backgroundColor: '#3f51b5',
    justifyContent: 'center',  // Center content horizontally
    alignItems: 'center',      // Center content vertically
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',  // Center text horizontally
  },
  lottieAnimation: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
});

export default WelcomeScreen;
