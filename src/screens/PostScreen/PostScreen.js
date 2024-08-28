import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import cheerio from "cheerio";

const PostScreen = () => {
  const [gstNumber, setGstNumber] = useState("");
  const [companyName, setCompanyName] = useState("");

  const verifyGST = async () => {
    try {
      const response = await fetch(
        `https://razorpay.com/gst-number-search/${gstNumber}/`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Selecting the first h5 element with the specific class
      const companyNameFromApi = $("h5.StyledBaseText-dUVvOG.lplbiD")
        .first()
        .text();

      if (companyNameFromApi) {
        setCompanyName(companyNameFromApi);
      } else {
        throw new Error("Enter a Valid GST Number");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Post Job</Text>
      </View>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Enter GST Number"
          value={gstNumber}
          onChangeText={(text) => setGstNumber(text)}
        />
        <Button title="Verify GST Number" onPress={verifyGST} />
        <TextInput
          style={styles.resultInput}
          placeholder="Company Name"
          value={companyName}
          editable={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  resultInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
});

export default PostScreen;
