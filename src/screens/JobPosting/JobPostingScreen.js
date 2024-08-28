import React, { useState } from 'react';
import { View, Text, TextInput, Image, Button, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import useAuth from '../../hooks/employerAuth'; // Update the import path as needed
import { db, storage } from '../../firebase/config';
const categories = ['IT', 'Non-Tech', 'Finance', 'HR', 'Events'];

const JobPostingScreen = ({ navigation }) => {
  const [jobName, setJobName] = useState('');
  const [location, setLocation] = useState('');
  const [timings, setTimings] = useState('');
  const [requirements, setRequirements] = useState('');
  const [salary, setSalary] = useState('');
  const [photo, setPhoto] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { userData } = useAuth(); // Use custom hook to get user data

  const uploadImageToStorage = async (path, imageName) => {
    try {
      console.log('Uploading image...');
      const storageRef = ref(storage, `jobs/${imageName}`);
      console.log(`Storage reference: ${storageRef.toString()}`);

      const response = await fetch(path);
      const blob = await response.blob();
      console.log('Image blob created');

      await uploadBytes(storageRef, blob);
      console.log('Image uploaded successfully');

      const photoURL = await getDownloadURL(storageRef);
      console.log('Download URL retrieved:', photoURL);
      return photoURL;
    } catch (error) {
      console.error('Uploading image error:', error);
      return '';
    }
  };

  const handlePostJob = async () => {
    if (!jobName || !location || !timings || !requirements || !salary || !selectedCategory) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      let photoURL = '';

      if (photo) {
        const fileName = photo.substring(photo.lastIndexOf('/') + 1);
        photoURL = await uploadImageToStorage(photo, fileName);
      }

      const jobsCollection = collection(db, 'jobs');
      await addDoc(jobsCollection, {
        jobName,
        location,
        timings,
        requirements,
        salary,
        category: selectedCategory,
        photo: photoURL,
        companyName: userData?.companyName || 'No company name available',
        contactPerson: userData?.contactPerson || 'No contact person available'
      });
      Alert.alert('Success', 'Job posted successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error posting job:', error);
      Alert.alert('Error', 'Failed to post job. Please try again.');
    }
  };

  const pickImage = async () => {
    console.log('Picking image...');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Image picker result:', result);

    if (!result.canceled && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      console.log('Image selected:', imageUri);
      setPhoto(imageUri);
    } else {
      Alert.alert('No Image Selected', 'You need to select an image to proceed.');
    }
  };

  return (
    <LinearGradient colors={['#E0F2F1', '#B9FBC0']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Post a New Job</Text>

        <TextInput
          style={styles.input}
          placeholder="Job Name"
          value={jobName}
          onChangeText={setJobName}
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Timings"
          value={timings}
          onChangeText={setTimings}
        />
        <TextInput
          style={styles.input}
          placeholder="Requirements"
          value={requirements}
          onChangeText={setRequirements}
        />
        <TextInput
          style={styles.input}
          placeholder="Salary"
          value={salary}
          onChangeText={setSalary}
        />

        {/* Read-only fields for company details */}
        <TextInput
          style={styles.readOnlyInput}
          value={userData?.companyName || ''}
          editable={false} // Make it read-only
        />
        <TextInput
          style={styles.readOnlyInput}
          value={userData?.contactPerson || ''}
          editable={false} // Make it read-only
        />
        
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Category</Text>
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            <Picker.Item label="Select a category" value="" />
            {categories.map((category, index) => (
              <Picker.Item key={index} label={category} value={category} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity onPress={pickImage}>
          <View style={styles.photoContainer}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <Text style={styles.photoText}>Add Job Photo</Text>
            )}
          </View>
        </TouchableOpacity>
        
        <Button title="Post Job" onPress={handlePostJob} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  readOnlyInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0', // Optional: to visually distinguish read-only fields
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
  },
  photoContainer: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  photoText: {
    color: '#aaa',
  },
});

export default JobPostingScreen;
