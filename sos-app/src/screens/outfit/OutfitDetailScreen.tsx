import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientBackground } from '../../components/layout/GradientBackground';
import { GlassView } from '../../components/ui/GlassView';
import { GlassButton } from '../../components/ui/GlassButton';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Outfit } from '../../models/Outfit.model';

const { width, height } = Dimensions.get('window');

interface OutfitDetailScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: {
    params: {
      outfit: Outfit;
    };
  };
}

export const OutfitDetailScreen: React.FC<OutfitDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { outfit } = route.params;

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <GlassView intensity="thin" borderRadius={20} style={styles.iconButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </GlassView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Outfit Details</Text>
          <TouchableOpacity>
            <GlassView intensity="thin" borderRadius={20} style={styles.iconButton}>
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </GlassView>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: outfit.imageUrl }} style={styles.image} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{outfit.category}</Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title}>{outfit.title}</Text>
            
            <View style={styles.tagsContainer}>
              {outfit.tags.map((tag) => (
                <GlassView
                  key={tag}
                  intensity="thin"
                  borderRadius={100}
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </GlassView>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Style Notes</Text>
              <Text style={styles.description}>
                This elegant outfit combines premium fabrics with modern tailoring. 
                Perfect for special occasions with its sophisticated design and attention to detail.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Colors</Text>
              <View style={styles.colorsRow}>
                {['#1a1a1a', '#f5f5f5', '#8B4513', '#2F4F4F'].map((color, index) => (
                  <View
                    key={index}
                    style={[styles.colorDot, { backgroundColor: color }]}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => {}}
          >
            <GlassView intensity="thin" borderRadius={20} style={styles.saveButtonInner}>
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </GlassView>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tryOnButton}
            onPress={() => navigation.navigate('VirtualTryOn', { outfit })}
          >
            <GlassView intensity="thin" borderRadius={20} style={styles.tryOnButtonInner}>
              <Ionicons name="camera" size={22} color="#FFFFFF" />
            </GlassView>
          </TouchableOpacity>

          <View style={styles.bookButtonContainer}>
            <GlassButton
              title="Book Stylist"
              onPress={() => navigation.navigate('Stylist')}
              variant="solid"
            />
          </View>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
    color: '#FFFFFF',
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  imageContainer: {
    width: width - 32,
    height: height * 0.5,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: typography.caption1.fontSize,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoContainer: {
    paddingHorizontal: spacing.sm,
  },
  title: {
    fontSize: typography.title1.fontSize,
    fontWeight: typography.title1.fontWeight,
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontSize: typography.caption1.fontSize,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.title3.fontSize,
    fontWeight: typography.title3.fontWeight,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.body.fontSize,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  saveButton: {},
  saveButtonInner: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tryOnButton: {},
  tryOnButtonInner: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  bookButtonContainer: {
    flex: 1,
  },
});
