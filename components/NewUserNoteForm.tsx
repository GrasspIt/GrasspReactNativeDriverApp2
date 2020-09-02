import React from 'react';

import { Field, reduxForm, InjectedFormProps } from 'redux-form';
import { Button, TextInput, Dialog } from 'react-native-paper';
import Colors from '../constants/Colors';

const validate = (values) => {
  const errors: any = {};
  if (!values.note) {
    errors.note = 'Required';
  }
  return errors;
};

const renderField = ({
  input,
  label,
  type,
  meta: { asyncValidating, touched, error },
  ...custom
}) => (
  <TextInput
    label={label}
    type={type}
    {...input}
    {...custom}
    error={!!(touched && error)}
    helperText={touched && error ? error : ''}
  />
);

interface NewUserNoteFormProps {
  closeDialog: () => void;
}

const NewUserNoteForm = (
  props: NewUserNoteFormProps & InjectedFormProps<{}, NewUserNoteFormProps>
) => {
  const {
    closeDialog,
    handleSubmit,
    // submitting
  } = props;
  return (
    <>
      <Field
        name="note"
        component={renderField}
        multiline
        rows={3}
        mode="outlined"
        label="Note"
        className="field"
      />
      <Dialog.Actions>
        <Button mode="contained" color={Colors.primary} onPress={handleSubmit}>
          Create Note
        </Button>
        <Button color={Colors.primary} labelStyle={{ color: Colors.light }} onPress={closeDialog}>
          Cancel
        </Button>
      </Dialog.Actions>
    </>
  );
};

export default reduxForm<any, NewUserNoteFormProps>({
  form: 'NewUserNoteForm', // a unique identifier for this form
  validate,
})(NewUserNoteForm);