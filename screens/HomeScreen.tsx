import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, FlatList, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useIsFocused } from '@react-navigation/native';

import { useDispatch, connect } from 'react-redux';
import {
  getDSPRDriver,
  setDsprDriverId,
  setDriverLocation,
  GET_DSPR_DRIVER_FAILURE,
} from '../actions/driverActions';
import { store } from '../store/store';

import { DashboardStackParamsList } from '../navigation/DashboardNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import OnCallSwitch from '../components/OnCallSwitch';
import TopNavBar from '../components/TopNavBar';
import { useInterval } from '../hooks/useInterval';
import OrderItem from '../components/OrderItem';
import { getOrders } from '../selectors/orderSelectors';
import { getDSPRs } from '../selectors/dsprSelectors';

type HomeScreenNavigationProp = StackNavigationProp<DashboardStackParamsList, 'Home'>;
type Props = {
  navigation: HomeScreenNavigationProp;
  route;
};

const HomeScreen = ({ route, navigation, userId, dsprDrivers, orders, dsprs }) => {
  const { driverId } = route.params;

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  let dsprDriver = Object.values(dsprDrivers).find((driver: any) => driver.id === driverId);

  const orderList = Object.values(orders);
  const dspr = dsprDriver
    ? Object.values(dsprs).filter((item) => item.id === dsprDriver.dspr)
    : null;

  const getDriverInfo = () => {
    dispatch(setDsprDriverId(driverId));
    dispatch<any>(getDSPRDriver(driverId)).then((response) => {
      if (response.type === GET_DSPR_DRIVER_FAILURE) {
        setError(response.error);
      } else {
        dsprDriver = response.response.entities.dsprDrivers[driverId];
        dsprDriver
          ? setError('')
          : setError('An unexpected error occurred when fetching driver info. Please try again.');
      }
      setIsLoading(false);
    });
  };

  // polling data from API while logged in
  const refreshData = () => {
    if (userId) dispatch(getDSPRDriver(driverId));
  };
  useInterval(refreshData, 60000);

  useEffect(() => {
    // refresh data when screen is focused
    // if (isFocused) {
    //check if there is more than one dsprDriver
    // if (dsprDrivers.length > 1 && !dsprDriver) {
    //   setModalVisible(true);
    // }
    // if (dsprDrivers.length === 1 && !dsprDriver) {
    setIsLoading(true);
    getDriverInfo();
    // }
    // }
  }, []);

  useEffect(() => {
    (async () => {
      //permissions for location tracking
      if (dsprDriver !== undefined) {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied.');
        }
        //start location updates if driver is on call
        if (status === 'granted' && dsprDriver !== undefined && dsprDriver.onCall) {
          console.log('start location updates');
          setIsTracking(true);
          await Location.startLocationUpdatesAsync('location-tracking', {
            timeInterval: 30000,
            distanceInterval: 0,
            foregroundService: {
              notificationTitle: 'Location Updates',
              notificationBody: 'Grassp Health Driver App is tracking your current location.',
            },
            pausesUpdatesAutomatically: false,
          });
        }
      }
      //stop location updates if driver is not on call
      if (isTracking && dsprDriver && !dsprDriver.onCall) {
        console.log('stop location updates');
        setIsTracking(false);
        await Location.stopLocationUpdatesAsync('location-tracking');
      }
    })();
  }, [dsprDriver, isTracking]);

  return userId && dsprDriver ? (
    <>
      <TopNavBar dsprDrivers={dsprDrivers} dsprName={dspr[0].name} navigation={navigation} />
      {isLoading ? (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.container}>
          <Text>{error}</Text>
        </View>
      ) : (
        <View style={styles.body}>
          <OnCallSwitch dsprDriver={dsprDriver} />
          <FlatList
            data={orderList}
            renderItem={(item) => <OrderItem orderInfo={item.item} navigation={navigation} />}
            keyExtractor={(item: any) => item.id.toString()}
            style={styles.orders}
          />
        </View>
      )}
    </>
  ) : null;
};

// define the task that will be called with startLocationTrackingUpdates
TaskManager.defineTask('location-tracking', ({ data, error }) => {
  const movingDriverId = store.getState().api.dsprDriverId;
  const movingDsprDriver = store.getState().api.entities.dsprDrivers[movingDriverId];
  if (error) {
    console.log('Error: ', error.message);
    return;
  }
  if (data) {
    console.log('location update');
    const { locations } = data;
    let lat = locations[0].coords.latitude;
    let long = locations[0].coords.longitude;
    //dispatch location to api
    store.dispatch(setDriverLocation(movingDsprDriver.dspr, lat, long));
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  orders: {
    paddingHorizontal: 10,
  },
});

const mapStateToProps = (state) => {
  // const dsprDriverId = state.api.dsprDriverId;
  const userId = state.api.loggedInUserId;
  const dsprDrivers = state.api.entities.dsprDrivers;
  const orders = getOrders(state);
  const dsprs = getDSPRs(state);

  // const dsprDriver = getDSPRDriverWithUserAndOrdersFromProps(state, { dsprDriverId: dsprDriverId });

  return { userId, dsprDrivers, orders, dsprs };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
