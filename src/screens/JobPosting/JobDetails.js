import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image, Alert, SafeAreaView } from 'react-native';
import { db } from '../../firebase/config'; // Import Firestore configuration
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';

const JobDetailsScreen = ({ route, navigation }) => {
  const { jobId } = route.params || {}; // Handle undefined case
  const [job, setJob] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantMessage, setApplicantMessage] = useState('');

  useEffect(() => {
    if (!jobId) {
      Alert.alert('Error', 'No job ID provided.');
      return;
    }

    const fetchJobDetails = async () => {
      try {
        const jobRef = doc(db, 'jobs', jobId);
        const jobDoc = await getDoc(jobRef);
        if (jobDoc.exists()) {
          setJob(jobDoc.data());
        } else {
          Alert.alert('Error', 'Job not found.');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        Alert.alert('Error', 'Failed to fetch job details.');
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleApply = async () => {
    if (!applicantName || !applicantEmail || !applicantMessage) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      if (!jobId) {
        Alert.alert('Error', 'No job ID available to apply.');
        return;
      }

      // Add a new document to the 'applications' collection
      const applicationsRef = collection(db, 'applications');
      await addDoc(applicationsRef, {
        applicantName,
        applicantEmail,
        applicantMessage,
        jobId,
        timestamp: new Date() // Optional: to record when the application was submitted
      });

      Alert.alert('Success', 'Your application has been submitted.');
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading job details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Job Details</Text>
          {job.photo ? (
            <Image source={{ uri: job.photo }} style={styles.jobImage} />
          ) : (
            <Text style={styles.noImageText}>No image available</Text>
          )}
          <Text style={styles.label}>Job Name:</Text>
          <Text style={styles.value}>{job.jobName || 'Not provided'}</Text>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{job.location || 'Not provided'}</Text>
          <Text style={styles.label}>Timings:</Text>
          <Text style={styles.value}>{job.timings || 'Not provided'}</Text>
          <Text style={styles.label}>Requirements:</Text>
          <Text style={styles.value}>{job.requirements || 'Not provided'}</Text>
          <Text style={styles.label}>Salary:</Text>
          <Text style={styles.value}>{job.salary || 'Not provided'}</Text>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{job.category || 'Not provided'}</Text>
          <Text style={styles.label}>Company Name:</Text>
          <Text style={styles.value}>{job.companyName || 'Not provided'}</Text>
          <Text style={styles.label}>Contact Person:</Text>
          <Text style={styles.value}>{job.contactPerson || 'Not provided'}</Text>
        </View>

        <View style={styles.applyContainer}>
          <Text style={styles.title}>Apply for Job</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={applicantName}
            onChangeText={setApplicantName}
          />
          <TextInput
            style={styles.input}
            placeholder="Your Email"
            value={applicantEmail}
            onChangeText={setApplicantEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, styles.messageInput]} // Use messageInput style for better layout
            placeholder="Why do you want this job?"
            value={applicantMessage}
            onChangeText={setApplicantMessage}
            multiline
          />

          <Button title="Submit Application" onPress={handleApply} color="#007BFF" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20, // Added horizontal padding to prevent content from touching the edges
    paddingBottom: 20, // Added padding to ensure content isn't cut off
  },
  detailsContainer: {
    marginBottom: 30, // Increased margin for better spacing
  },
  applyContainer: {
    paddingTop: 20, // Added top padding for better spacing from the job details
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, // Increased margin for better separation
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12, // Increased margin for better spacing
    color: '#555',
  },
  value: {
    fontSize: 16,
    marginBottom: 18, // Increased margin for better spacing
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8, // Adjusted border radius for a softer look
    marginBottom: 16, // Increased margin for better spacing
    paddingHorizontal: 12, // Adjusted padding for better text placement
    backgroundColor: '#f9f9f9',
  },
  messageInput: {
    height: 120, // Increased height for better readability of the message input
  },
  jobImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  noImageText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
});

export default JobDetailsScreen;
