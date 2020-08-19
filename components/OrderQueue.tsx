import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { State, Order, DsprDriver } from '../store/reduxStoreState';
import { getOrders } from '../selectors/orderSelectors';
import OrderItem from './OrderItem';

type OrderProps = { dsprDriver: DsprDriver };

const OrderQueue = ({ dsprDriver }: OrderProps) => {
  const dispatch = useDispatch();

  const orders = useSelector<State, Order>(getOrders);
  const orderList = Object.values(orders);

  return (
    <FlatList
      data={orderList}
      renderItem={(item) => <OrderItem orderInfo={item.item} />}
      keyExtractor={(item: any) => item.id.toString()}
      style={{ paddingHorizontal: 20, marginVertical: 20 }}
    />
  );
};

export default OrderQueue;