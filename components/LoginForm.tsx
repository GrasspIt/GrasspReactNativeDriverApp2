import React from 'react';
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  View,
  Image,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HelperText, useTheme, ActivityIndicator } from 'react-native-paper';
import { Card, Button, TextInput } from 'react-native-paper';

type Props = {
  isLoading;
  email;
  emailInvalid;
  password;
  passwordInvalid;
  handleEmailChange;
  handlePasswordChange;
  handleSubmit;
};

const LoginForm = ({
  isLoading,
  email,
  emailInvalid,
  password,
  passwordInvalid,
  handleEmailChange,
  handlePasswordChange,
  handleSubmit,
}: Props) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {isLoading ? (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
              <ActivityIndicator size='large' color={colors.primary} />
            </View>
          ) : (
            <View style={styles.screen}>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={{ alignItems: 'center', paddingLeft: 14, paddingBottom: 10 }}>
                    <Image
                      source={require('../assets/grassp_health.png')}
                      style={{
                        height: 60,
                        width: 230,
                      }}
                    />
                  </View>
                  <TextInput
                    mode='outlined'
                    label='Email'
                    value={email}
                    error={emailInvalid}
                    autoCapitalize='none'
                    onChangeText={(text) => handleEmailChange(text)}
                  />
                  <HelperText type='error' visible={emailInvalid}>
                    Enter an email address.
                  </HelperText>
                  <TextInput
                    mode='outlined'
                    label='Password'
                    secureTextEntry={true}
                    value={password}
                    onChangeText={(text) => handlePasswordChange(text)}
                    error={passwordInvalid}
                    autoCapitalize='none'
                  />
                  <HelperText type='error' visible={passwordInvalid}>
                    Enter a password.
                  </HelperText>
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode='contained'
                    loading={isLoading}
                    onPress={handleSubmit}
                    labelStyle={{ color: colors.surface }}
                    style={{ width: '100%' }}
                  >
                    Login
                  </Button>
                </Card.Actions>
              </Card>
            </View>
          )}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <StatusBar style='dark' />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  card: {
    width: '80%',
    padding: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginForm;
