import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import cheerio from 'cheerio';

const GSTVerifier = () => {
  const [gstNumber, setGstNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  const verifyGST = async () => {
    try {
      const response = await fetch(`https://razorpay.com/gst-number-search/${gstNumber}/`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const html = await response.text();

      const $ = cheerio.load(html);

      // Selecting the first h5 element with the specific class
      const companyNameFromApi = $('h5.StyledBaseText-dUVvOG.lplbiD').first().text();
      
      if (companyNameFromApi) {
        setCompanyName(companyNameFromApi);
      } else {
        throw new Error('Company name not found in response');
      }
    } catch (error) {
      console.error('Verification Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 10, marginBottom: 10, width: 300 }}
        placeholder="Enter GST Number"
        value={gstNumber}
        onChangeText={(text) => setGstNumber(text)}
      />
      <Button title="Verify GST Number" onPress={verifyGST} />
      {companyName ? (
        <Text style={{ marginTop: 20 }}>Company Name: {companyName}</Text>
      ) : null}
    </View>
  );
};

export default GSTVerifier;
