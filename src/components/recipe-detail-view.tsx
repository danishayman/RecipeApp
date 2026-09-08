import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { RecipeImage } from '@/components/recipe-image';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useRecipeTypes } from '@/hooks/use-recipe-types';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';

interface RecipeDetailViewProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

/**
 * Read-only presentation of a recipe.
 *
 * Purely presentational: the route above it owns the recipe, the edit toggle
 * and the delete confirmation.
 *
 * The image leads the page, with the ingredients and method on a paper panel
 * that rises over it like a physical recipe card.
 */
export function RecipeDetailView({ recipe, onEdit, onDelete, onBack }: RecipeDetailViewProps) {
  const theme = useTheme();
  const { labelFor } = useRecipeTypes();
  const insets = useSafeAreaInsets();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(() => new Set());

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((current) => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 88 }}>
        <View style={styles.heroWrap}>
          <RecipeImage
            uri={recipe.imageUri}
            typeId={recipe.typeId}
            emojiSize={72}
            style={styles.hero}
            accessibilityLabel={`Photo of ${recipe.title}`}
          />
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to recipes"
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: pressed ? 'rgba(31, 27, 22, 0.72)' : 'rgba(31, 27, 22, 0.56)' },
            ]}>
            <ThemedText style={styles.backArrow}>←</ThemedText>
          </Pressable>
        </View>

        <View
          style={[
            styles.detailPanel,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}>
          <View style={styles.headingBlock}>
            <ThemedText type="label" style={{ color: theme.accentStrong }}>
              {labelFor(recipe.typeId)}
            </ThemedText>
            <ThemedText type="subtitle">{recipe.title}</ThemedText>

            {recipe.description.length > 0 ? (
              <ThemedText themeColor="textSecondary">{recipe.description}</ThemedText>
            ) : null}
            <View style={[styles.recipeFacts, { borderColor: theme.border }]}>
              <Fact value={recipe.prepMinutes} label="Minutes" />
              <Fact value={recipe.servings} label="Serves" />
              <Fact value={recipe.steps.length} label="Steps" />
            </View>
          </View>

          <DetailSection title="Ingredients">
            {recipe.ingredients.map((ingredient, index) => {
              const isChecked = checkedIngredients.has(index);

              return (
                <Pressable
                  key={`${index}-${ingredient}`}
                  onPress={() => toggleIngredient(index)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={ingredient}
                  accessibilityState={{ checked: isChecked }}
                  style={({ pressed }) => [
                    styles.listRow,
                    { borderBottomColor: theme.border, opacity: pressed ? 0.62 : 1 },
                  ]}>
                  <View
                    style={[
                      styles.checkBox,
                      {
                        backgroundColor: isChecked ? theme.accent : 'transparent',
                        borderColor: isChecked ? theme.accent : theme.border,
                      },
                    ]}>
                    {isChecked ? (
                      <ThemedText style={[styles.checkMark, { color: theme.onAccent }]}>
                        ✓
                      </ThemedText>
                    ) : null}
                  </View>
                  <ThemedText
                    style={[styles.growingText, isChecked && styles.completedIngredient]}
                    themeColor={isChecked ? 'textSecondary' : 'text'}>
                    {ingredient}
                  </ThemedText>
                </Pressable>
              );
            })}
          </DetailSection>

          <DetailSection title="Method">
            {recipe.steps.map((step, index) => (
              <View
                key={`${index}-${step}`}
                style={[styles.listRow, { borderBottomColor: theme.border }]}>
                <View style={styles.ordinal}>
                  <ThemedText type="heading" style={{ color: theme.accentStrong }}>
                    {index + 1}
                  </ThemedText>
                </View>
                <ThemedText style={styles.growingText}>{step}</ThemedText>
              </View>
            ))}
          </DetailSection>
        </View>
      </ScrollView>
      <View
        style={[
          styles.actionBar,
          { backgroundColor: theme.background, borderTopColor: theme.border },
        ]}>
        <View style={styles.actions}>
          <AppButton
            label="Edit recipe"
            onPress={onEdit}
            style={styles.growingText}
            accessibilityHint="Makes every field editable"
          />
          <AppButton
            label="Delete"
            variant="secondary"
            labelCase="caps"
            onPress={onDelete}
            accessibilityHint="Removes this recipe permanently"
          />
        </View>
      </View>
    </View>
  );
}

function Fact({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.fact}>
      <ThemedText type="heading">{value}</ThemedText>
      <ThemedText type="meta" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

interface DetailSectionProps {
  title: string;
  children: ReactNode;
}

/** A titled block of detail content. */
function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText type="label" themeColor="textSecondary">
        {title}
      </ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  heroWrap: {
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: 292,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.four,
    left: Spacing.three,
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 21,
    lineHeight: 24,
  },
  detailPanel: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    marginTop: -28,
    padding: Spacing.three,
    gap: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: Radii.large,
    borderTopRightRadius: Radii.large,
  },
  headingBlock: {
    gap: Spacing.two,
  },
  recipeFacts: {
    flexDirection: 'row',
    marginTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fact: {
    flex: 1,
    gap: Spacing.half,
    paddingVertical: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  sectionBody: {
    gap: Spacing.two,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
  },
  completedIngredient: {
    textDecorationLine: 'line-through',
  },
  ordinal: {
    width: 24,
    alignItems: 'center',
  },
  growingText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionBar: {
    padding: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
