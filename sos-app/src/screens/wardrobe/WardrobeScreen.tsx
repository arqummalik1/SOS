import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { GradientBackground } from '../../components/layout/GradientBackground';
import { GlassView } from '../../components/ui/GlassView';
import { useOutfits } from '../../store/OutfitContext';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { StaggeredItem } from '../../components/animations/StaggeredItem';

interface WardrobeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const { width } = Dimensions.get('window');

const categories = ['All', 'Casual', 'Formal', 'Party', 'Summer', 'Winter'];

export const WardrobeScreen: React.FC<WardrobeScreenProps> = ({ navigation }) => {
  const { outfits, savedOutfits, unsaveOutfit } = useOutfits();
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const savedOutfitObjects = outfits.filter(outfit => savedOutfits.includes(outfit.id));

  const filteredOutfits = selectedCategory === 'All'
    ? savedOutfitObjects
    : savedOutfitObjects.filter(outfit => outfit.category === selectedCategory);

  const renderOutfitCard = (outfit: any, index: number) => (
    <StaggeredItem key={outfit.id} index={index}>
      <TouchableOpacity
        style={styles.outfitCard}
        onPress={() => navigation.navigate('OutfitDetail', { outfit })}
      >
        <Image source={{ uri: outfit.imageUrl }} style={styles.outfitImage} />
        <View style={styles.outfitOverlay}>
          <Text style={styles.outfitTitle} numberOfLines={1}>{outfit.title}</Text>
          <View style={styles.outfitMeta}>
            <Text style={styles.outfitCategory}>{outfit.category}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => unsaveOutfit(outfit.id)}
        >
          <GlassView intensity="thick" borderRadius={16} style={styles.removeButtonInner}>
            <Ionicons name="heart" size={16} color="#FF375F" />
          </GlassView>
        </TouchableOpacity>
      </TouchableOpacity>
    </StaggeredItem>
  );

  return (
    <GradientBackground>
      <SafeContainer>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <GlassView intensity="thin" borderRadius={12} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </GlassView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wardrobe</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
            >
              <GlassView
                intensity={selectedCategory === category ? 'thick' : 'thin'}
                borderRadius={100}
                style={[
                  styles.categoryPill,
                  ...(selectedCategory === category ? [styles.categoryPillActive] : []),
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    ...(selectedCategory === category ? [styles.categoryTextActive] : []),
                  ]}
                >
                  {category}
                </Text>
              </GlassView>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {filteredOutfits.length > 0 ? (
            <View style={styles.grid}>
              {filteredOutfits.map((outfit, index) => renderOutfitCard(outfit, index))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <GlassView intensity="thin" borderRadius={24} style={styles.emptyCard}>
                <Ionicons name="shirt-outline" size={48} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyTitle}>No outfits yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start saving outfits you love from the home screen
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => navigation.navigate('Home')}
                >
                  <GlassView intensity="thick" borderRadius={16} style={styles.exploreButtonInner}>
                    <Text style={styles.exploreText}>Explore Styles</Text>
                  </GlassView>
                </TouchableOpacity>
              </GlassView>
            </View>
          )}
        </ScrollView>
      </SafeContainer>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.title2.fontSize,
    fontWeight: typography.title2.fontWeight,
    color: '#FFFFFF',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  categoryPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  outfitCard: {
    width: (width - 48) / 2,
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  outfitImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  outfitOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  outfitTitle: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  outfitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outfitCategory: {
    fontSize: typography.caption1.fontSize,
    color: 'rgba(255,255,255,0.8)',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  removeButtonInner: {
    width: 32,
    height: 32,
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
    maxWidth: 300,
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
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  exploreButton: {
    marginTop: spacing.md,
  },
  exploreButtonInner: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  exploreText: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
