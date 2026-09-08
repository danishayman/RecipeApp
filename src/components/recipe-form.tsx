import { useCallback } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { DynamicListField } from '@/components/dynamic-list-field';
import { PhotoField } from '@/components/photo-field';
import { RecipeTypePicker } from '@/components/recipe-type-picker';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import type { RecipeFormValues } from '@/data/recipe-form';
import { useRecipeForm } from '@/hooks/use-recipe-form';
import { useTheme } from '@/hooks/use-theme';
import type { RecipeDraft } from '@/types/recipe';

interface RecipeFormProps {
  /** Starting values. Blank for add, pre-filled for edit. */
  initialValues: RecipeFormValues;
  submitLabel: string;
  title?: string;
  onSubmit: (draft: RecipeDraft) => Promise<void>;
  onCancel: () => void;
}

/**
 * The recipe editor, shared by the add screen and the detail screen's edit
 * mode so both offer exactly the same fields and rules.
 *
 * Purely presentational: every piece of state, the validation timing and the
 * save lifecycle live in `useRecipeForm`.
 */
export function RecipeForm({
  initialValues,
  submitLabel,
  title = 'New recipe',
  onSubmit,
  onCancel,
}: RecipeFormProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const handleSaveError = useCallback((error: Error) => {
    Alert.alert('Could not save this recipe', error.message);
  }, []);

  const { values, errors, isSaving, setField, submit } = useRecipeForm({
    initialValues,
    onSubmit,
    onError: handleSaveError,
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.toolbar, { borderBottomColor: theme.border, paddingTop: insets.top }]}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          hitSlop={Spacing.two}>
          <ThemedText type="label" themeColor="textSecondary">
            Cancel
          </ThemedText>
        </Pressable>
        <ThemedText type="heading">{title}</ThemedText>
        <Pressable
          onPress={submit}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel={submitLabel}
          hitSlop={Spacing.two}
          style={{ opacity: isSaving ? 0.5 : 1 }}>
          <ThemedText type="label" style={{ color: theme.accentStrong }}>
            Save
          </ThemedText>
        </Pressable>
      </View>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          // Keep the action row clear of the home indicator or navigation bar.
          { paddingBottom: insets.bottom + Spacing.four },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <TextField
          label="Recipe name"
          value={values.title}
          onChangeText={(next) => setField('title', next)}
          placeholder="Spaghetti alla Carbonara"
          error={errors.title}
          autoCapitalize="sentences"
          returnKeyType="next"
        />

        <RecipeTypePicker
          label="Type"
          value={values.typeId}
          onChange={(next) => setField('typeId', next)}
          accessibilityHint="Sets which category this recipe is filed under"
        />

        <PhotoField
          label="Photo"
          value={values.imageUri}
          typeId={values.typeId}
          onChange={(next) => setField('imageUri', next)}
        />

        <TextField
          label="Description"
          value={values.description}
          onChangeText={(next) => setField('description', next)}
          placeholder="A short note about the dish"
          multiline
        />

        <View style={styles.row}>
          <RecipeNumberField
            label="Serves"
            value={values.servings}
            onChange={(next) => setField('servings', next)}
            error={errors.servings}
          />
          <RecipeNumberField
            label="Minutes"
            value={values.prepMinutes}
            onChange={(next) => setField('prepMinutes', next)}
            error={errors.prepMinutes}
          />
        </View>

        <DynamicListField
          label="Ingredients"
          values={values.ingredients}
          onChange={(next) => setField('ingredients', next)}
          placeholder={(index) => (index === 0 ? '400 g spaghetti' : 'Another ingredient')}
          addLabel="Add ingredient"
          error={errors.ingredients}
        />

        <DynamicListField
          label="Method"
          values={values.steps}
          onChange={(next) => setField('steps', next)}
          placeholder={(index) => (index === 0 ? 'Bring a pot of water to the boil' : 'Next step')}
          addLabel="Add step"
          ordered
          error={errors.steps}
        />

        <View style={styles.actions}>
          <AppButton label={submitLabel} onPress={submit} busy={isSaving} style={styles.flex} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RecipeNumberField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string | null;
}) {
  const theme = useTheme();
  const amount = Math.max(1, Number.parseInt(value, 10) || 1);

  const update = (difference: number) => onChange(String(Math.max(1, amount + difference)));

  return (
    <View style={styles.numberField}>
      <ThemedText type="label" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => update(-1)}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          style={({ pressed }) => [
            styles.stepButton,
            {
              borderColor: theme.border,
              backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
            },
          ]}>
          <ThemedText type="smallBold">−</ThemedText>
        </Pressable>
        <ThemedText type="heading" style={styles.numberValue}>
          {amount}
        </ThemedText>
        <Pressable
          onPress={() => update(1)}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          style={({ pressed }) => [
            styles.stepButton,
            {
              borderColor: theme.border,
              backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
            },
          ]}>
          <ThemedText type="smallBold">+</ThemedText>
        </Pressable>
      </View>
      {error === null || error === undefined ? null : (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  toolbar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  numberField: {
    flex: 1,
    gap: Spacing.two,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  numberValue: {
    minWidth: 28,
    textAlign: 'center',
  },
  actions: {
    paddingTop: Spacing.one,
  },
});
