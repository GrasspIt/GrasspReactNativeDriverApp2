import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDsprDriverId } from '../actions/driverActions';
import { State } from '../store/reduxStoreState';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerStackParamsList } from '../navigation/DrawerNavigator';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import Colors from '../constants/Colors';
import DsprCard from '../components/DsprCard';

type DSPRScreenNavigationProp = StackNavigationProp<DrawerStackParamsList, 'DSPRs'>;
type Props = { navigation: DSPRScreenNavigationProp };

const DSPRScreen = ({ navigation }: Props) => {
  const dispatch = useDispatch();

  const dsprs = useSelector<State, Object>((state) => state.api.entities.DSPRs);
  const dsprDataList = Object.values(dsprs);

  const dsprDrivers = useSelector<State, Object>((state) => state.api.entities.dsprDrivers);
  const dsprDriverDataList = dsprDrivers && Object.values(dsprDrivers);

  const handleSelectDspr = (dsprId: number) => {
    // find the dsprDriver that matches the dsprId
    const selectedDriver = dsprDriverDataList.find((driver: any) => driver.dspr === dsprId);
    dispatch(setDsprDriverId(selectedDriver.id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Choose a Dispensary</Text>
      </View>
      <FlatList
        data={dsprDataList}
        renderItem={(item) => <DsprCard handleSelect={handleSelectDspr} dspr={item.item} />}
        keyExtractor={(item: any) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    justifyContent: 'center',
  },
});

export default DSPRScreen;
