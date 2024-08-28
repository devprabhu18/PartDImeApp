import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { db } from '../../firebase/config'; // Import Firestore configuration
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import ProfileModal from "../../components/ProfileModal";
import useAuth from '../../hooks/useAuth'; // Import useAuth

const HomeScreen = ({ navigation }) => {
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData, loading: authLoading } = useAuth(); // Access userData from useAuth

  // Fetch jobs from Firestore and set up real-time listener
  useEffect(() => {
    const jobsCollection = collection(db, 'jobs');
    const unsubscribe = onSnapshot(jobsCollection, (snapshot) => {
      const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsList);
      setLoading(false); // Data has been loaded
    }, (error) => {
      console.error('Error fetching jobs:', error);
      Alert.alert('Error', 'Failed to fetch jobs.');
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // Fetch applied jobs for the user and set up real-time listener
  useEffect(() => {
    if (userData && userData.email) {
      const applicationsCollection = collection(db, 'applications');
      const q = query(applicationsCollection, where('applicantEmail', '==', userData.email));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const appliedJobsList = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const applicationData = doc.data();
            const jobDetails = await fetchJobById(applicationData.jobId);
            return { id: doc.id, ...applicationData, ...jobDetails };
          })
        );
        setAppliedJobs(appliedJobsList);
      }, (error) => {
        console.error('Error fetching applied jobs:', error);
        Alert.alert('Error', 'Failed to fetch applied jobs.');
      });

      // Clean up subscription on unmount
      return () => unsubscribe();
    }
  }, [userData]);

  // Fetch job details by jobId
  const fetchJobById = async (jobId) => {
    try {
      const jobDoc = doc(db, 'jobs', jobId);
      const jobSnap = await getDoc(jobDoc);
      if (jobSnap.exists()) {
        const jobData = jobSnap.data();
        return {
          jobName: jobData.jobName || 'No Job Name',
          jobImage: jobData.photo || 'https://via.placeholder.com/160x120.png?text=No+Image',
        };
      } else {
        console.log("No such job!");
        return {
          jobName: 'No Job Name',
          jobImage: 'https://via.placeholder.com/160x120.png?text=No+Image',
        };
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      return {
        jobName: 'No Job Name',
        jobImage: 'https://via.placeholder.com/160x120.png?text=No+Image',
      };
    }
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#E0F2F1", "#B9FBC0"]} style={styles.background}>
        <View style={styles.header}>
          <Text style={styles.title}>PartDime</Text>
          <TouchableOpacity onPress={() => setIsProfileModalVisible(true)}>
            <Image
              source={require("../../../assets/profile-pic.png")}
              style={styles.profilePic}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Section title="Applied Jobs" subtitle="Check your application status">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.jobsScroll}
            >
              {appliedJobs.length > 0 ? (
                appliedJobs.map((appliedJob) => (
                  <AppliedJobCard key={appliedJob.id} appliedJob={appliedJob} />
                ))
              ) : (
                <Text style={styles.noJobsText}>No jobs applied yet</Text>
              )}
            </ScrollView>
          </Section>

          <Section title="Available Jobs" subtitle="Browse jobs in your area">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.jobsScroll}
            >
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} navigation={navigation} />
              ))}
            </ScrollView>
          </Section>
        </ScrollView>

        <ProfileModal
          visible={isProfileModalVisible}
          onClose={() => setIsProfileModalVisible(false)}
          navigation={navigation}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

// Reusable Section component
const Section = ({ title, subtitle, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    {children}
  </View>
);

// Reusable JobCard component
const JobCard = ({ job, navigation }) => {
  const imageUri = job.photo || 'https://via.placeholder.com/160x120.png?text=No+Image';

  return (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate("JobDetails", { jobId: job.id })}
    >
      <Image source={{ uri: imageUri }} style={styles.jobImage} />
      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle}>{job.jobName || 'No Job Name'}</Text>
        <Text style={styles.jobCompany}>{job.companyName || 'No Company Name'}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Reusable AppliedJobCard component
const AppliedJobCard = ({ appliedJob }) => {
  const imageUri = appliedJob.jobImage || 'https://via.placeholder.com/160x120.png?text=No+Image';

  return (
    <View style={styles.jobCard}>
      <Image source={{ uri: imageUri }} style={styles.jobImage} />
      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle}>{appliedJob.jobName || 'No Job Name'}</Text>
        <Text style={styles.jobCompany}>Status: {appliedJob.status || 'Pending'}</Text>
        <Text style={styles.jobFeedback}>
          Feedback: {appliedJob.feedback || 'No feedback provided'}
        </Text>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
    fontFamily: "Roboto",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 15,
    marginTop: 20,
    color: "#333",
    fontFamily: "Roboto",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#555",
    marginLeft: 15,
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  jobsScroll: {
    paddingLeft: 15,
  },
  jobCard: {
    width: 160,
    marginRight: 15,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    elevation: 3,
    overflow: "hidden",
  },
  jobImage: {
    width: "100%",
    height: 120,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  jobTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginTop: 8,
    marginHorizontal: 10,
    color: "#333",
  },
  jobCompany: {
    color: "#666",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  jobFeedback: {
    color: "#f00",
    marginHorizontal: 10,
    marginBottom: 5,
  },
  applicantMessage: {
    color: "#333",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  noJobsText: {
    fontSize: 16,
    color: "#888",
    marginHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
