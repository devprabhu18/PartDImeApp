import React ,{useState, useContext} from 'react';
import { Modal, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import useAuth from '../hooks/useAuth';
import { UserContext } from "../../App"; // Import UserContext

const ProfileModal = ({ visible, onClose, navigation }) => {
  const { user, userData, loading, signOut } = useAuth();
  const { setUserType, setIsAuthenticated } = useContext(UserContext); // Access context

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      setUserType(null); // Clear user type
    setIsAuthenticated(false); // Set authentication to false
    console.log("User signed out");
    setIsProfileModalVisible(false);
      // Reset navigation stack and navigate to SliderScreen
      navigation.navigate('SliderScreen');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Loading...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>User Details</Text>
          {userData ? (
            <>
              <Text style={styles.modalText}>Name: {userData.fullName}</Text>
              <Text style={styles.modalText}>Email: {userData.email}</Text>
              <Text style={styles.modalText}>Skills: {userData.skills}</Text>
            </>
          ) : (
            <Text style={styles.modalText}>No user data available</Text>
          )}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ProfileModal;
