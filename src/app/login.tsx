import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import {
  emptyAuthValues,
  isAuthFormValid,
  validateAuthValues,
  type AuthFormErrors,
  type AuthFormValues,
  type AuthMode,
} from '@/data/auth-form';
import { useAsyncCallback } from '@/hooks/use-async-callback';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/state/auth-provider';

/**
 * Sign-in screen.
 *
 * The root layout only renders this route while signed out, so it never has to
 * navigate anywhere itself: a successful sign-in updates the session, the
 * guard flips, and the stack swaps to the recipe list.
 */
export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [values, setValues] = useState<AuthFormValues>(emptyAuthValues);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  // Derived rather than stored, so they cannot fall out of step with the
  // fields - the same approach `useRecipeForm` takes.
  const errors = useMemo<AuthFormErrors>(
    () => (hasSubmitted ? validateAuthValues(values, mode) : {}),
    [hasSubmitted, values, mode]
  );

  const setField = useCallback((field: keyof AuthFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFailure(null);
  }, []);

  const authenticate = useCallback(
    async ({ username, password }: AuthFormValues) => {
      if (mode === 'register') {
        await register(username, password);
      } else {
        await signIn(username, password);
      }
    },
    [mode, register, signIn]
  );

  const handleFailure = useCallback((error: Error) => setFailure(error.message), []);

  const { run: submitCredentials, isPending } = useAsyncCallback(authenticate, {
    onError: handleFailure,
  });

  const submit = useCallback(() => {
    setHasSubmitted(true);
    setFailure(null);

    const found = validateAuthValues(values, mode);

    if (!isAuthFormValid(found)) {
      return;
    }

    void submitCredentials(values);
  }, [values, mode, submitCredentials]);

  const switchMode = useCallback(() => {
    setMode((current) => (current === 'sign-in' ? 'register' : 'sign-in'));
    setHasSubmitted(false);
    setFailure(null);
  }, []);

  const isRegistering = mode === 'register';

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + Spacing.six,
              paddingBottom: insets.bottom + Spacing.four,
            },
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.heading}>
            <ThemedText type="label" style={{ color: theme.accentStrong }}>
              Kitchen note
            </ThemedText>
            <ThemedText type="subtitle">YumBook</ThemedText>
            <View style={[styles.accentRule, { backgroundColor: theme.accent }]} />
            <ThemedText themeColor="textSecondary">
              {isRegistering
                ? 'Create an account to keep your recipes on this device.'
                : 'Sign in to return to your recipes. Everything stays on this device.'}
            </ThemedText>
          </View>

          <TextField
            label="Username"
            value={values.username}
            onChangeText={(next) => setField('username', next)}
            placeholder="Your username"
            error={errors.username}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            returnKeyType="next"
            variant="ruled"
          />

          <TextField
            label="Password"
            value={values.password}
            onChangeText={(next) => setField('password', next)}
            placeholder="••••••••"
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            returnKeyType="go"
            onSubmitEditing={submit}
            variant="ruled"
          />

          {failure === null ? null : (
            <View accessibilityRole="alert" style={[styles.failure, { borderColor: theme.danger }]}>
              <ThemedText type="small" themeColor="danger">
                {failure}
              </ThemedText>
            </View>
          )}

          <AppButton
            label={isRegistering ? 'Create account' : 'Sign in'}
            onPress={submit}
            busy={isPending}
          />

          <Pressable
            onPress={switchMode}
            disabled={isPending}
            accessibilityRole="button"
            accessibilityLabel={
              isRegistering ? 'I already have an account' : 'Create an account instead'
            }
            style={({ pressed }) => [
              styles.switchMode,
              { opacity: isPending ? 0.5 : pressed ? 0.65 : 1 },
            ]}>
            <ThemedText type="label" style={{ color: theme.accentStrong }}>
              {isRegistering ? 'I already have an account' : 'Create an account instead'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  heading: {
    alignItems: 'flex-start',
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  accentRule: {
    width: 48,
    height: 1,
    marginVertical: Spacing.one,
  },
  failure: {
    padding: Spacing.three,
    borderRadius: Radii.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  switchMode: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
