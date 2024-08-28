// src/screens/BrowseScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { db } from '../../firebase/config'; // Import your Firestore instance
import { collection, getDocs } from 'firebase/firestore';

const BrowseScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');

    try {
      const jobsRef = collection(db, 'jobs');
      const querySnapshot = await getDocs(jobsRef);
      
      // Filter jobs based on the search term, handling undefined values
      const foundJobs = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() })) // Include document ID
        .filter(job => {
          const jobName = job.jobName || '';
          const location = job.location || '';
          const companyName = job.companyName || '';
          return (
            jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            companyName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });

      setJobs(foundJobs);

      if (foundJobs.length === 0) {
        setError('No jobs found.');
      }
    } catch (error) {
      setError('Error fetching jobs.');
      console.error("Error fetching jobs: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for jobs..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <Button title="Search" onPress={handleSearch} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
            >
              <Text style={styles.jobTitle}>{item.jobName || 'No Title'}</Text>
              <Text>Company: {item.companyName || 'Unknown'}</Text>
              <Text>Location: {item.location || 'Unknown'}</Text>
              <Text>Description: {item.description || 'No Description'}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No jobs found</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 10,
    elevation: 2, // Adds shadow for iOS
    shadowColor: '#000', // Adds shadow for Android
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  jobTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default BrowseScreen;
