import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

type Props = {
  isLoading;
  orderId;
  orderStatus;
  orderIdsInRoute;
  activeRoute;
  completeOrder;
  cancelOrder;
  markOrderInProcess;
  removeOrderAndRefreshRoute;
  deactivateDriverRoute;
};

const OrderButtons = ({
  isLoading,
  orderId,
  orderStatus,
  orderIdsInRoute,
  activeRoute,
  completeOrder,
  cancelOrder,
  markOrderInProcess,
  removeOrderAndRefreshRoute,
  deactivateDriverRoute,
}: Props) => {
  const { colors } = useTheme();

  const handleCancelOrder = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', onPress: () => cancelOrder(orderId) },
    ]);
  };

  const removeFromRoute = (routeId, driverId, orderIds, finalOrderId, boolean) => {
    if (finalOrderId === null) {
      deactivateDriverRoute(routeId);
      Alert.alert('Success!', 'Order removed from route.');
      return;
    }
    removeOrderAndRefreshRoute(routeId, driverId, orderIds, finalOrderId, boolean);
  };

  const handleRemoveFromRoute = () => {
    let orderIdsInNewRoute = orderIdsInRoute
      .filter((id) => id !== orderId)
      .map((orderId) => ({
        id: orderId,
      }));
    let finalOrderInNewRouteId = orderIdsInNewRoute.length
      ? orderIdsInNewRoute.length > 1
        ? orderIdsInNewRoute[orderIdsInNewRoute.length - 1]
        : orderIdsInNewRoute[0]
      : null;
    Alert.alert(
      'Remove From Route',
      'Are you sure you want to remove this order from the current route?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () =>
            removeFromRoute(
              activeRoute.id,
              activeRoute.dsprDriver,
              orderIdsInNewRoute,
              finalOrderInNewRouteId,
              false
            ),
        },
      ]
    );
  };

  const handleCompleteOrder = () => {
    Alert.alert('Complete Order', 'Are you ready to complete this order?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', onPress: () => completeOrder(orderId) },
    ]);
  };

  const handleProcessOrder = () => {
    Alert.alert('Process Order', 'Mark this order as in-process?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', onPress: () => markOrderInProcess(orderId) },
    ]);
  };

  return (
    <View>
      <Button
        disabled={isLoading ? true : false}
        icon='cancel'
        mode='contained'
        color={colors.error}
        style={styles.buttons}
        labelStyle={{ paddingVertical: 4, color: colors.surface }}
        onPress={handleCancelOrder}
      >
        Cancel Order
      </Button>

      {orderIdsInRoute && orderIdsInRoute.includes(orderId) && (
        <Button
          disabled={isLoading ? true : false}
          icon='map-minus'
          mode='contained'
          color={colors.error}
          style={styles.buttons}
          labelStyle={{ paddingVertical: 4, color: colors.surface }}
          onPress={handleRemoveFromRoute}
        >
          Remove from Route
        </Button>
      )}

      {orderStatus == 'in_process' ? (
        <Button
          disabled={isLoading ? true : false}
          icon='check'
          mode='contained'
          color={colors.primary}
          style={styles.buttons}
          labelStyle={{ paddingVertical: 4, color: colors.surface }}
          onPress={handleCompleteOrder}
        >
          Complete Order
        </Button>
      ) : (
        <Button
          disabled={isLoading ? true : false}
          mode='contained'
          icon='autorenew'
          color={colors.primary}
          style={styles.buttons}
          labelStyle={{ paddingVertical: 4, color: colors.surface }}
          onPress={handleProcessOrder}
        >
          Set In Process
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttons: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 50,
    elevation: 2,
  },
});

export default OrderButtons;
