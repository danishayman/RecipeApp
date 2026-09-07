import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { DynamicListField } from '@/components/dynamic-list-field';
import { PhotoField } from '@/components/photo-field';
import { RecipeTypePicker } from '@/components/recipe-type-picker';
import { TextField } from '@/components/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  isValid,
  toRecipeDraft,
  validateFormValues,
  type RecipeFormErrors,
  type RecipeFormValues,
} from '@/data/recipe-form';
import type { RecipeDraft } from '@/types/recipe';

interface RecipeFormProps {
  /** Starting values. Blank for add, pre-filled for edit. */
  initialValues: RecipeFormValues;
  submitLabel: string;
  onSubmit: (draft: RecipeDraft) => Promise<void>;
  onCancel: () => void;
}

/**
 * The recipe editor, shared by the add screen and the detail screen's edit
 * mode so both offer exactly the same fields and rules.
 *
 * Validation runs on submit and then live, so the user is not scolded about
 * fields they have not reached yet but does see errors clear as they fix them.
 */
export function RecipeForm({ initialValues, submitLabel, onSubmit, onCancel }: RecipeFormProps) {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<RecipeFormValues>(initialValues);
  const [errors, setErrors] = useState<RecipeFormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const update = useCallback(
    <Field extends keyof RecipeFormValues>(field: Field, value: RecipeFormValues[Field]) => {
      setValues((current) => {
        const next = { ...current, [field]: value };

        // Only re-validate once the user has tried to submit at least once.
        if (hasSubmitted) {
          setErrors(validateFormValues(next));
        }

        return next;
      });
    },
    [hasSubmitted]
  );

  const submit = async () => {
    const found = validateFormValues(values);
    setErrors(found);
    setHasSubmitted(true);

    if (!isValid(found)) {
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit(toRecipeDraft(values));
    } catch (cause) {
      Alert.alert(
        'Could not save this recipe',
        cause instanceof Error ? cause.message : 'Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
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
          onChangeText={(next) => update('title', next)}
          placeholder="Spaghetti alla Carbonara"
          error={errors.title}
          autoCapitalize="sentences"
          returnKeyType="next"
        />

        <RecipeTypePicker
          label="Type"
          value={values.typeId}
          onChange={(next) => update('typeId', next)}
          accessibilityHint="Sets which category this recipe is filed under"
        />

        <PhotoField
          label="Photo"
          value={values.imageUri}
          typeId={values.typeId}
          onChange={(next) => update('imageUri', next)}
        />

        <TextField
          label="Description"
          value={values.description}
          onChangeText={(next) => update('description', next)}
          placeholder="A short note about the dish"
          multiline
        />

        <View style={styles.row}>
          <View style={styles.flex}>
            <TextField
              label="Serves"
              value={values.servings}
              onChangeText={(next) => update('servings', next)}
              keyboardType="number-pad"
              error={errors.servings}
            />
          </View>
          <View style={styles.flex}>
            <TextField
              label="Minutes"
              value={values.prepMinutes}
              onChangeText={(next) => update('prepMinutes', next)}
              keyboardType="number-pad"
              error={errors.prepMinutes}
            />
          </View>
        </View>

        <DynamicListField
          label="Ingredients"
          values={values.ingredients}
          onChange={(next) => update('ingredients', next)}
          placeholder={(index) => (index === 0 ? '400 g spaghetti' : 'Another ingredient')}
          addLabel="Add ingredient"
          error={errors.ingredients}
        />

        <DynamicListField
          label="Method"
          values={values.steps}
          onChange={(next) => update('steps', next)}
          placeholder={(index) => (index === 0 ? 'Bring a pot of water to the boil' : 'Next step')}
          addLabel="Add step"
          ordered
          error={errors.steps}
        />

        <View style={styles.actions}>
          <AppButton label="Cancel" variant="secondary" onPress={onCancel} style={styles.flex} />
          <AppButton
            label={submitLabel}
            onPress={() => void submit()}
            busy={isSaving}
            style={styles.flex}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
});
