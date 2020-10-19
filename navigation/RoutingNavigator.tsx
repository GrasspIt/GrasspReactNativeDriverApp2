import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerStackParamsList } from '../navigation/DrawerNavigator';

import OrderDetails from '../screens/OrderDetails';
import ManageNotes from '../screens/ManageNotesScreen';
import RoutingScreen from '../screens/RoutingScreen';

type RoutingNavigationProp = StackNavigationProp<DrawerStackParamsList, 'Routing'>;
type Props = {
  navigation: RoutingNavigationProp;
  route;
};

export type RoutingStackParamsList = {
  Details: { orderId: number };
  Notes: any;
  Routing: any;
};

const RoutingStack = createStackNavigator<RoutingStackParamsList>();

const RoutingNavigator = ({ route, navigation }: Props) => {
  return (
    <RoutingStack.Navigator initialRouteName='Routing' screenOptions={{ gestureEnabled: false }}>
      <RoutingStack.Screen
        name='Routing'
        component={RoutingScreen}
        options={{
          headerTitle: 'Routing',
          headerShown: false,
        }}
      />
      <RoutingStack.Screen
        name='Details'
        component={OrderDetails}
        options={{
          headerShown: true,
        }}
      />
      <RoutingStack.Screen
        name='Notes'
        component={ManageNotes}
        options={{
          headerShown: true,
        }}
      />
    </RoutingStack.Navigator>
  );
};

export default RoutingNavigator;