import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { State, Order, Address, User } from '../store/reduxStoreState';
import { useSelector, useDispatch } from 'react-redux';
import Colors from '../constants/Colors';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import { markOrderInProcess, MARK_IN_PROCESS_FAILURE } from '../actions/orderActions';
import * as RootNavigation from '../navigation/RootNavigation';

type OrderProps = { orderInfo: Order };

const OrderItem = ({ orderInfo }: OrderProps) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const address = useSelector<State, Address>(
    (state) => state.api.entities.addresses[orderInfo.address]
  );
  const user = useSelector<State, User>((state) => state.api.entities.users[orderInfo.user]);

  const handleProcessOrder = () => {
    setIsLoading(true);
    dispatch<any>(markOrderInProcess(orderInfo.id)).then((response) => {
      if (response.type === MARK_IN_PROCESS_FAILURE) {
        setError(response.error);
        Alert.alert('Failed to set order in process. Try again.');
      }
      setIsLoading(false);
    });
  };

  return (
    <View style={styles.orderContainer}>
      <View>
        <View style={styles.topText}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName},
          </Text>
          <Text style={styles.cash}>${orderInfo.cashTotal}</Text>
        </View>
        <Text style={styles.address}>
          {address.street} {address.zipCode}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={{ marginHorizontal: 30 }}
          onPress={() => RootNavigation.navigate('Details', { orderInfo, user, address })}
        >
          <Entypo name="info-with-circle" size={24} color={Colors.primary} />
        </TouchableOpacity>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <TouchableOpacity
            disabled={orderInfo.orderStatus == 'in_process'}
            onPress={handleProcessOrder}
          >
            <FontAwesome
              name="gear"
              size={26}
              color={orderInfo.orderStatus == 'in_process' ? Colors.medium : Colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 14 },
  cash: {
    color: Colors.dark,
    marginLeft: 4,
    fontSize: 12,
  },
  address: {
    color: Colors.dark,
    marginTop: 2,
    fontSize: 12,
  },
  topText: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.medium,
  },
});

export default OrderItem;
