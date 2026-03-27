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
import { SafeContainer } from '../../components/layout/SafeContainer';
import { GradientBackground } from '../../components/layout/GradientBackground';
import { GlassView } from '../../components/ui/GlassView';
import { useHomeViewModel } from '../../viewmodels/useHomeViewModel';
import { useUser } from '../../store/UserContext';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaggeredItem } from '../../components/animations/StaggeredItem';
import { ScaleButton } from '../../components/animations/ScaleButton';
import { Outfit } from '../../models/Outfit.model';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { featured, trending, handleSave, isSaved } = useHomeViewModel();
  const { user } = useUser();

  const renderFeaturedCard = (outfit: Outfit) => (
    <ScaleButton key={outfit.id} scale={0.97}>
      <TouchableOpacity 
        style={styles.featuredCard}
        onPress={() => navigation.navigate('OutfitDetail', { outfit })}
      >
        <Image source={{ uri: outfit.imageUrl }} style={styles.featuredImage} />
        <View style={styles.featuredOverlay}>
          <Text style={styles.featuredTitle}>{outfit.title}</Text>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>{outfit.category}</Text>
          </View>
        </View>
        <ScaleButton scale={0.85} style={styles.saveButton}>
          <GlassView intensity="thin" borderRadius={20} style={styles.saveButtonInner}>
            <Ionicons
              name={isSaved(outfit.id) ? 'heart' : 'heart-outline'}
              size={20}
              color={isSaved(outfit.id) ? '#FF375F' : '#FFFFFF'}
            />
          </GlassView>
        </ScaleButton>
      </TouchableOpacity>
    </ScaleButton>
  );

  const renderTrendingCard = (outfit: Outfit, index: number) => (
    <TouchableOpacity
      key={outfit.id}
      style={[
        styles.trendingCard,
        index % 2 === 0 ? styles.trendingCardTall : styles.trendingCardShort,
      ]}
    >
      <Image source={{ uri: outfit.imageUrl }} style={styles.trendingImage} />
      <View style={styles.trendingOverlay}>
        <View style={styles.trendingBadge}>
          <Text style={styles.trendingBadgeText}>{outfit.category}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.trendingSaveButton}
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
        <View style={styles.header}>
          <GlassView intensity="thin" borderRadius={20} style={styles.headerPill}>
            <Text style={styles.logo}>SOS</Text>
            <Text style={styles.greeting}>Hi, {user?.name || 'Guest'} </Text>
          </GlassView>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <GlassView intensity="thin" borderRadius={20} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            </GlassView>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Featured</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {featured.map(renderFeaturedCard)}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.masonryGrid}>
            {trending.map((outfit, index) => (
              <StaggeredItem key={outfit.id} index={index}>
                {renderTrendingCard(outfit, index)}
              </StaggeredItem>
            ))}
          </View>
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
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  logo: {
    fontSize: typography.headline.fontSize,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: typography.subheadline.fontSize,
    color: 'rgba(255,255,255,0.8)',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.title2.fontSize,
    fontWeight: typography.title2.fontWeight,
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  featuredContainer: {
    gap: spacing.lg,
    paddingRight: spacing.lg,
    marginBottom: spacing.xxl,
  },
  featuredCard: {
    width: 280,
    height: 380,
    borderRadius: 24,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredTitle: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  featuredBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  featuredBadgeText: {
    fontSize: typography.caption1.fontSize,
    color: '#FFFFFF',
  },
  saveButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  saveButtonInner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  seeAll: {
    fontSize: typography.subheadline.fontSize,
    color: 'rgba(255,255,255,0.7)',
  },
  masonryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  trendingCard: {
    width: (width - 48) / 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  trendingCardTall: {
    height: 280,
  },
  trendingCardShort: {
    height: 220,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  trendingBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  trendingBadgeText: {
    fontSize: typography.caption2.fontSize,
    color: '#FFFFFF',
  },
  trendingSaveButton: {
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
});
