import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  ActivityIndicator,
  Platform,
  Button,
} from 'react-native';
import Colors from '../constants/Colors';

import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

import { DashboardStackParamsList } from '../navigation/DashboardNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { sendPushToken } from '../actions/userActions';
import { refreshDSPRDriver, getDSPRDriver, setDriverLocation } from '../actions/driverActions';
import { useDispatch, connect } from 'react-redux';
import { store } from '../store/store';
import { useInterval } from '../hooks/useInterval';

import OnCallSwitch from '../components/OnCallSwitch';
import TopNavBar from '../components/TopNavBar';
import OrderItem from '../components/OrderItem';

import { getDSPRFromProps } from '../selectors/dsprSelectors';
import { getDSPRDriverWithUserAndOrdersFromProps } from '../selectors/dsprDriverSelector';
import { getLoggedInUser } from '../selectors/userSelectors';
import { Divider } from 'react-native-elements';
import InProcessOrderItem from '../components/InProcessOrderItem';

// handler for push notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type HomeScreenNavigationProp = StackNavigationProp<DashboardStackParamsList, 'Home'>;
type Props = {
  navigation: HomeScreenNavigationProp;
  loggedInUser;
  dspr;
  driverId;
  dsprDriver;
  isLoading;
  pushToken;
};

const HomeScreen = ({
  navigation,
  driverId,
  loggedInUser,
  dspr,
  dsprDriver,
  isLoading,
  pushToken,
}: Props) => {
  const dispatch = useDispatch();
  const notificationListener = useRef();
  const responseListener = useRef();

  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');

  // polling data from API while logged in
  const getDriverData = () => {
    if (loggedInUser) dispatch(refreshDSPRDriver(driverId));
  };
  useInterval(getDriverData, 60000);

  useEffect(() => {
    dispatch(getDSPRDriver(driverId));
  }, [driverId]);

  // push notifications
  useEffect(() => {
    // get push token if none is stored
    if (!pushToken || !pushToken.isCurrent) {
      registerForPushNotificationsAsync().then((token) => {
        setExpoPushToken(token);
        dispatch(sendPushToken(token));
      });
    }
    // listen for when a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });
    // listen for when a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
      navigation.navigate('Details', {
        orderId: response.notification.request.content.data.body.orderId,
      });
    });
    // listener cleanup
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [notification, notificationListener, responseListener]);

  // location tracking
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

  return loggedInUser && dsprDriver ? (
    <>
      <TopNavBar dsprName={dspr.name} navigation={navigation} />
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
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            <Text>Your expo push token: {expoPushToken}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text>Title: {notification && notification.request.content.title} </Text>
              <Text>Body: {notification && notification.request.content.body}</Text>
              <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View>
            <Button
              title="Press to Send Notification"
              onPress={async () => {
                await sendPushNotification(expoPushToken);
              }}
            />
          </View>
          <Text style={styles.dsprTitle}>{dspr.name}</Text>
          <OnCallSwitch dsprDriver={dsprDriver} />

          <Divider style={{ height: 2 }} />
          <Text style={styles.listTitle}>In Process Order</Text>
          <Divider style={{ height: 1, marginHorizontal: 10 }} />

          {dsprDriver.currentInProcessOrder ? (
            <InProcessOrderItem
              orderInfo={dsprDriver.currentInProcessOrder}
              navigation={navigation}
            />
          ) : (
            <View style={styles.empty}>
              <Text>No order in process.</Text>
            </View>
          )}

          <Divider style={{ height: 2 }} />
          <Text style={styles.listTitle}>Queued Orders</Text>
          <Divider style={{ height: 1, marginHorizontal: 10 }} />

          <FlatList
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text>No orders.</Text>
              </View>
            }
            onRefresh={() => getDriverData()}
            refreshing={isLoading}
            data={dsprDriver.queuedOrders}
            renderItem={(item) => <OrderItem orderInfo={item.item} navigation={navigation} />}
            keyExtractor={(item: any) => item.id.toString()}
            style={styles.orders}
          />
        </View>
      )}
    </>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  orders: {
    paddingHorizontal: 10,
  },
  dsprTitle: {
    fontSize: 22,
    textAlign: 'center',
    paddingTop: 20,
  },
  listTitle: {
    fontSize: 16,
    paddingLeft: 10,
    paddingVertical: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { orderId: 77571 },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

// get permission for push notifications and set token
async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    // set token in Redux state
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}

// define the task that will be called with startLocationTrackingUpdates
TaskManager.defineTask('location-tracking', ({ data, error }) => {
  console.log('call location update');
  const movingDriverId = store.getState().api.dsprDriverId;
  const movingDsprDriver = store.getState().api.entities.dsprDrivers[movingDriverId];
  if (error) {
    console.log('Error: ', error.message);
    return;
  }
  if (data) {
    console.log('data', data);
    const { locations } = data as any;
    let lat = locations[0].coords.latitude;
    let long = locations[0].coords.longitude;
    //dispatch location to api
    store.dispatch(setDriverLocation(movingDsprDriver.dspr, lat, long));
  }
});

const mapStateToProps = (state) => {
  const driverId = state.api.dsprDriverId;
  const dsprDriver = getDSPRDriverWithUserAndOrdersFromProps(state, { dsprDriverId: driverId });
  const dspr = dsprDriver ? getDSPRFromProps(state, { dsprId: dsprDriver.dspr }) : undefined;
  const isLoading = state.api.isLoading;
  const pushToken = state.api.entities.pushToken;
  return {
    loggedInUser: getLoggedInUser(state),
    driverId,
    dspr,
    dsprDriver,
    isLoading,
    pushToken,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
