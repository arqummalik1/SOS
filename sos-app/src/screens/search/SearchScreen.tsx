import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { GradientBackground } from '../../components/layout/GradientBackground';
import { GlassView } from '../../components/ui/GlassView';
import { useSearchViewModel } from '../../viewmodels/useSearchViewModel';
import { useOutfits } from '../../store/OutfitContext';
import { categories } from '../../data/outfits.mock';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { StaggeredItem } from '../../components/animations/StaggeredItem';

const { width } = Dimensions.get('window');

export const SearchScreen: React.FC = () => {
  const { query, results, selectedCategory, setQuery, clearQuery, selectCategory } = useSearchViewModel();
  const { isSaved, saveOutfit, unsaveOutfit } = useOutfits();

  const handleSave = async (id: string) => {
    if (isSaved(id)) {
      await unsaveOutfit(id);
    } else {
      await saveOutfit(id);
    }
  };

  const renderResultCard = (outfit: any, index: number) => (
    <TouchableOpacity
      key={outfit.id}
      style={[
        styles.resultCard,
        index % 2 === 0 ? styles.resultCardTall : styles.resultCardShort,
      ]}
    >
      <Image source={{ uri: outfit.imageUrl }} style={styles.resultImage} />
      <View style={styles.resultOverlay}>
        <Text style={styles.resultTitle} numberOfLines={1}>{outfit.title}</Text>
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>{outfit.category}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => handleSave(outfit.id)}
      >
        <Ionicons
          name={isSaved(outfit.id) ? 'heart' : 'heart-outline'}
          size={18}
          color={isSaved(outfit.id) ? '#FF375F' : '#FFFFFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <SafeContainer>
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <GlassView intensity="thin" borderRadius={16} style={styles.searchBar}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search styles..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={query}
                onChangeText={setQuery}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={clearQuery}>
                  <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              )}
            </GlassView>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => selectCategory(category)}
              >
                <GlassView
                  intensity={selectedCategory === category ? 'regular' : 'thin'}
                  borderRadius={100}
                  style={styles.categoryPill}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </GlassView>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            style={styles.resultsContainer}
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
          >
            {results.length > 0 ? (
              <View style={styles.masonryGrid}>
                {results.map((outfit, index) => (
                  <StaggeredItem key={outfit.id} index={index}>
                    {renderResultCard(outfit, index)}
                  </StaggeredItem>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <GlassView intensity="thin" borderRadius={24} style={styles.emptyCard}>
                  <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.emptyTitle}>No styles found</Text>
                  <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
                </GlassView>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeContainer>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 50,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: '#FFFFFF',
    padding: 0,
  },
  categoriesContainer: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  categoryPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  categoryPillActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  categoryText: {
    fontSize: typography.subheadline.fontSize,
    color: 'rgba(255,255,255,0.8)',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: spacing.xxl,
  },
  masonryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  resultCard: {
    width: (width - 48) / 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  resultCardTall: {
    height: 260,
  },
  resultCardShort: {
    height: 200,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  resultOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  resultTitle: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: typography.subheadline.fontWeight,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  resultBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  resultBadgeText: {
    fontSize: typography.caption2.fontSize,
    color: '#FFFFFF',
  },
  saveButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyCard: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
    color: '#FFFFFF',
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.subheadline.fontSize,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.sm,
  },
});
