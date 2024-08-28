import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const MenuItem = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Icon name={icon} size={24} color="black" />
    <Text style={styles.menuItemText}>{title}</Text>
  </TouchableOpacity>
);

const SideMenu = ({ isVisible, onClose, navigation }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>PartDime</Text>
          
          <Text style={styles.sectionTitle}>Discover</Text>
          <MenuItem icon="home-outline" title="Option1" onPress={() => { onClose(); navigation.navigate('Home'); }} />
          <MenuItem icon="search-outline" title="GSTVerifier" onPress={() => { onClose(); navigation.navigate('GSTVerifier'); }} />
          
          <Text style={styles.sectionTitle}>Library</Text>
          <MenuItem icon="list-outline" title="Option3" onPress={() => { onClose(); navigation.navigate('Option3'); }} />
          <MenuItem icon="musical-notes-outline" title="Option4" onPress={() => { onClose(); navigation.navigate('Option4'); }} />
          <MenuItem icon="happy-outline" title="Option5" onPress={() => { onClose(); navigation.navigate('Option5'); }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '80%',
    height: '100%',
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 20,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 20,
  },
});

export default SideMenu;
