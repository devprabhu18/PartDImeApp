import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import ProfileModal from "../../components/EmployerModal";
import { UserContext } from "../../../App"; // Import UserContext
import { db } from "../../firebase/config"; // Import Firestore configuration
import { collection, getDocs, query, where, updateDoc, doc, getDoc } from "firebase/firestore";

const HomeScreen = ({ navigation }) => {
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [notifications, setNotifications] = useState([]);
  const { setUserType, setIsAuthenticated } = useContext(UserContext); // Access context

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching jobs
        const jobsRef = collection(db, "jobs");
        const jobsSnap = await getDocs(jobsRef);
        const jobsList = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsList);
  
        // Fetching applicants for each job
        const applicantsPromises = jobsList.map(async (job) => {
          const applicationsRef = collection(db, "applications");
          const applicationsQuery = query(applicationsRef, where("jobId", "==", job.id));
          const applicationsSnap = await getDocs(applicationsQuery);
          const applicantsList = applicationsSnap.docs.map(doc => ({
            ...doc.data(),
            id: doc.id, // Include document ID
            jobName: job.jobName // Attach job name to applicant
          }));
          return { job, applicants: applicantsList };
        });
  
        const applicantsResults = await Promise.all(applicantsPromises);
        setApplicants(applicantsResults);
  
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleSignOut = () => {
    setUserType(null); // Clear user type
    setIsAuthenticated(false); // Set authentication to false
    console.log("User signed out");
    setIsProfileModalVisible(false);
    navigation.popToTop();
    // Reset navigation stack and navigate to SliderScreen
  };

  const handleSelectApplicant = (applicant) => {
    // Update the state to remove the selected applicant
    setApplicants(prevApplicants =>
      prevApplicants.map(jobApplicants => ({
        ...jobApplicants,
        applicants: jobApplicants.applicants.filter(a => a.id !== applicant.id),
      }))
    );
    setSelectedApplicant(applicant);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback || !selectedApplicant || !selectedApplicant.id) {
      alert("Please provide feedback and select an applicant.");
      return;
    }

    try {
      const applicationsRef = collection(db, "applications");
      const applicantRef = doc(applicationsRef, selectedApplicant.id);

      await updateDoc(applicantRef, {
        feedback: feedback,
        status: "Reviewed"
      });

      // Notify the employer
      const jobRef = doc(db, "jobs", selectedApplicant.jobId);
      const jobSnap = await getDoc(jobRef);
      const jobData = jobSnap.data();
      
      setNotifications(prevNotifications => [
        ...prevNotifications,
        {
          jobId: selectedApplicant.jobId,
          jobName: jobData.jobName,
          applicantName: selectedApplicant.applicantName,
          feedback: feedback
        }
      ]);

      alert("Feedback submitted successfully.");
      setSelectedApplicant(null);
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
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
          <Button
            title="Post a Job"
            onPress={() => navigation.navigate('JobPostingScreen')}
            color="#007AFF"
            style={styles.postJobButton}
          />

          <Section title="Jobs">
            <View style={styles.jobsGrid}>
              {jobs.map((job, index) => (
                <JobCard key={index} job={job} />
              ))}
            </View>
          </Section>

          <Section title="Applicants">
            <View style={styles.applicantsContainer}>
              {applicants.flatMap((jobApplicants) =>
                jobApplicants.applicants.map((applicant, index) => (
                  <ApplicantCard
                    key={index}
                    applicant={applicant}
                    onSelect={() => handleSelectApplicant(applicant)}
                  />
                ))
              )}
            </View>
          </Section>

          <Section title="Notifications">
            <View style={styles.notificationsContainer}>
              {notifications.map((notification, index) => (
                <View key={index} style={styles.notificationCard}>
                  <Text style={styles.notificationTitle}>Job: {notification.jobName}</Text>
                  <Text style={styles.notificationText}>
                    Applicant: {notification.applicantName}
                  </Text>
                  <Text style={styles.notificationText}>Feedback: {notification.feedback}</Text>
                </View>
              ))}
            </View>
          </Section>
        </ScrollView>

        {selectedApplicant && (
          <Modal
            visible={true}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setSelectedApplicant(null)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Feedback for {selectedApplicant.applicantName}</Text>
                <Text style={styles.modalSubtitle}>Applied for Job: {selectedApplicant.jobName}</Text>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Enter feedback here..."
                  value={feedback}
                  onChangeText={setFeedback}
                  multiline
                />
                <View style={styles.modalButtons}>
                  <Button title="Submit Feedback" onPress={handleFeedbackSubmit} color="#007AFF" />
                  <Button title="Close" onPress={() => setSelectedApplicant(null)} color="#FF6F61" />
                </View>
              </View>
            </View>
          </Modal>
        )}

        <ProfileModal
          visible={isProfileModalVisible}
          onClose={() => setIsProfileModalVisible(false)}
          navigation={navigation}
          onSignOut={handleSignOut}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

// Reusable Section component
const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// Reusable JobCard component
const JobCard = ({ job }) => (
  <View style={styles.jobCard}>
    {job.photo ? (
      <Image source={{ uri: job.photo }} style={styles.jobImage} />
    ) : (
      <View style={styles.jobImagePlaceholder}>
        <Text style={styles.jobImageText}>No Image</Text>
      </View>
    )}
    <View style={styles.jobDetails}>
      <Text style={styles.jobTitle}>{job.jobName}</Text>
      <Text style={styles.jobCompany}>{job.location}</Text>
    </View>
  </View>
);

// Reusable ApplicantCard component
const ApplicantCard = ({ applicant, onSelect }) => (
  <View style={styles.applicantCard}>
    <Text style={styles.applicantName}>{applicant.applicantName}</Text>
    <Text style={styles.applicantEmail}>{applicant.applicantEmail}</Text>
    <Text style={styles.applicantMessage}>{applicant.applicantMessage}</Text>
    <Text style={styles.jobTitle}>Applied for Job: {applicant.jobName}</Text>
    <Button title="Select" onPress={onSelect} color="#007AFF" />
  </View>
);

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
  scrollContent: {
    paddingBottom: 20,
  },
  jobsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 15,
  },
  jobCard: {
    width: "48%",
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    elevation: 3,
    overflow: "hidden",
  },
  jobImage: {
    width: "100%",
    height: 120,
  },
  jobImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  jobImageText: {
    color: "#666",
    fontSize: 16,
  },
  jobDetails: {
    padding: 10,
  },
  jobTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
  },
  jobCompany: {
    color: "#666",
    marginTop: 5,
  },
  applicantsContainer: {
    padding: 15,
  },
  applicantCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "600",
  },
  applicantEmail: {
    color: "#007AFF",
  },
  applicantMessage: {
    color: "#666",
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  feedbackInput: {
    width: '100%',
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  postJobButton: {
    margin: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationsContainer: {
    padding: 15,
  },
  notificationCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  notificationText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});

export default HomeScreen;
