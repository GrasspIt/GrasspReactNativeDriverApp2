import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { Button, Dialog } from 'react-native-paper';
import { ListItem } from 'react-native-elements';
import NewUserNoteForm from '../components/NewUserNoteForm';
import { StackNavigationProp } from '@react-navigation/stack';
import { DashboardStackParamsList } from '../navigation/DashboardNavigator';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { State } from '../store/reduxStoreState';
import { getUserNotesFromProps } from '../selectors/userSelectors';
import { parseDate } from '../hooks/util';

import {
  getSpecificUser,
  createUserNote,
  hideUserNote,
  unhideUserNote,
} from '../actions/userActions';
import Colors from '../constants/Colors';

type ManageNotesScreenNavigationProp = StackNavigationProp<DashboardStackParamsList, 'Notes'>;

type Props = {
  navigation: ManageNotesScreenNavigationProp;
  route;
  userId: number;
  dsprDriverId?: number;
  showTitle?: boolean;
};

const ManageNotes = ({ navigation, route }: Props) => {
  const dispatch = useDispatch();
  const { userId, dsprDriverId } = route.params;
  const [showNotes, setShowNotes] = useState(false);

  const createNote = (userId, note, dsprDriverId) =>
    dispatch(createUserNote(userId, note, dsprDriverId, null));
  const hideNote = (noteId) => dispatch(hideUserNote(noteId));
  const unhideNote = (noteId) => dispatch(unhideUserNote(noteId));
  const refreshUser = () => dispatch(getSpecificUser(userId));

  const handleNewNoteSubmit = (values) => {
    createNote(userId, values.note, dsprDriverId);
    refreshUser();
    setShowNotes(false);
  };

  const userNotes = useSelector<State, any[]>(
    (state) => getUserNotesFromProps(state, { userId }),
    shallowEqual
  );

  return (
    <>
      <View style={{ flex: 1, backgroundColor: Colors.light }}>
        {userNotes && userNotes.length > 0 ? (
          <ScrollView style={{ flex: 1, backgroundColor: Colors.light }}>
            {userNotes.map((userNote) => (
              <ListItem key={userNote.id} bottomDivider>
                <ListItem.Content>
                  <ListItem.CheckBox
                    containerStyle={{ backgroundColor: Colors.light, borderColor: Colors.light }}
                    checkedColor={Colors.primary}
                    title={userNote.isVisible ? 'visible' : 'hidden'}
                    onPress={
                      userNote.isVisible
                        ? () => hideNote(userNote.id)
                        : () => unhideNote(userNote.id)
                    }
                    checked={userNote.isVisible}
                  />
                  <ListItem.Title style={{ margin: 6 }}>{userNote.note}</ListItem.Title>
                  <ListItem.Subtitle style={{ alignSelf: 'flex-end' }}>
                    {parseDate(userNote.createdTimestamp).toLocaleString('en-us', {
                      month: 'long',
                    })}{' '}
                    {parseDate(userNote.createdTimestamp).getDate()},{' '}
                    {parseDate(userNote.createdTimestamp).getFullYear()}, at{' '}
                    {parseDate(userNote.createdTimestamp).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    })}
                  </ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
            ))}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>No User Notes</Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            color={Colors.primary}
            labelStyle={{ color: Colors.light }}
            onPress={() => setShowNotes(true)}
            style={{ width: '100%' }}
          >
            Create Note
          </Button>
        </View>
      </View>
      <Dialog visible={showNotes} onDismiss={() => setShowNotes(false)}>
        <Dialog.Title>New Note</Dialog.Title>
        <Dialog.Content>
          <NewUserNoteForm closeDialog={() => setShowNotes(false)} onSubmit={handleNewNoteSubmit} />
        </Dialog.Content>
      </Dialog>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: Colors.light,
    padding: 10,
    bottom: 0,
  },
});

export default ManageNotes;