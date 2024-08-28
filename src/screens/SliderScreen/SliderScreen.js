import React, { useContext, useEffect } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import Swiper from 'react-native-swiper';
import LottieView from 'lottie-react-native';
import { UserContext } from '../../../App';

const EmployerSelectionScreen = ({ navigation }) => {
  const { setUserType, userType } = useContext(UserContext);

  const handleNavigation = (type) => {
    setUserType(type);
  };

  useEffect(() => {
    if (userType === 'employer') {
      navigation.navigate('EmployerRegistration');
    } else if (userType === 'employee') {
      navigation.navigate('EmployeeRegistration');
    }
  }, [userType, navigation]);

  return (
    <View style={styles.slide}>
      <LottieView 
        source={require('../../../assets/employer.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
      <Text style={styles.title}>Are you an Employer?</Text>
      <Button
        title="Yes, I'm an Employer"
        onPress={() => handleNavigation('employer')}
      />
    </View>
  );
};

const EmployeeSelectionScreen = ({ navigation }) => {
  const { setUserType, userType } = useContext(UserContext);

  const handleNavigation = (type) => {
    setUserType(type);
  };

  useEffect(() => {
    if (userType === 'employer') {
      navigation.navigate('EmployerRegistration');
    } else if (userType === 'employee') {
      navigation.navigate('EmployeeRegistration');
    }
  }, [userType, navigation]);

  return (
    <View style={styles.slide}>
      <LottieView 
        source={require('../../../assets/employee.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
      <Text style={styles.title}>Are you an Employee?</Text>
      <Button
        title="Yes, I'm an Employee"
        onPress={() => handleNavigation('employee')}
      />
    </View>
  );
};

const SliderScreen = ({ navigation }) => {
  return (
    <Swiper
      showsPagination
      loop={false}
      dotColor="#C1C1C1"
      activeDotColor="#3f51b5"
      paginationStyle={styles.pagination}
    >
      <EmployerSelectionScreen navigation={navigation} />
      <EmployeeSelectionScreen navigation={navigation} />
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
  },
  lottieAnimation: {
    width: 300,
    height: 300,
  },
  pagination: {
    bottom: 50,
  },
});

export default SliderScreen;
