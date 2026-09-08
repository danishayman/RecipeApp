import { useCallback } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { DynamicListField } from '@/components/dynamic-list-field';
import { PhotoField } from '@/components/photo-field';
import { RecipeTypePicker } from '@/components/recipe-type-picker';
import { TextField } from '@/components/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import type { RecipeFormValues } from '@/data/recipe-form';
import { useRecipeForm } from '@/hooks/use-recipe-form';
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
 * Purely presentational: every piece of state, the validation timing and the
 * save lifecycle live in `useRecipeForm`.
 */
export function RecipeForm({ initialValues, submitLabel, onSubmit, onCancel }: RecipeFormProps) {
  const insets = useSafeAreaInsets();

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
          <View style={styles.flex}>
            <TextField
              label="Serves"
              value={values.servings}
              onChangeText={(next) => setField('servings', next)}
              keyboardType="number-pad"
              error={errors.servings}
            />
          </View>
          <View style={styles.flex}>
            <TextField
              label="Minutes"
              value={values.prepMinutes}
              onChangeText={(next) => setField('prepMinutes', next)}
              keyboardType="number-pad"
              error={errors.prepMinutes}
            />
          </View>
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
          <AppButton label="Cancel" variant="secondary" onPress={onCancel} style={styles.flex} />
          <AppButton label={submitLabel} onPress={submit} busy={isSaving} style={styles.flex} />
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
