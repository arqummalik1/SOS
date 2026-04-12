import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
  StatusBar,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

interface BodyMeasurementsScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'BodyMeasurements'>;
  route: RouteProp<AuthStackParamList, 'BodyMeasurements'>;
}

interface BodyType {
  id: string;
  name: string;
  // Fallback placeholder images from assets/images/mosaic
  image: any;
}

const bodyTypes: BodyType[] = [
  { id: 'apple', name: 'Apple', image: require('../../../assets/BodyShape/Apple.png') },
  { id: 'rectangle', name: 'Rectangle', image: require('../../../assets/BodyShape/Rectangle.png') },
  { id: 'triangle', name: 'Triangle', image: require('../../../assets/BodyShape/Triangle.png') },
  { id: 'hourglass', name: 'Hourglass', image: require('../../../assets/BodyShape/Hourglass.png') },
  { id: 'inverted_triangle', name: 'Inverted Triangle', image: require('../../../assets/BodyShape/invertedTrinagle.png') },
  { id: 'pear', name: 'Pear', image: require('../../../assets/BodyShape/pear.png') },
];

/**
 * BodyMeasurementsScreen — Pixel-perfect replication of "Profile setup 2.png".
 * 
 * Flow: FullBodyPhotoPreview -> BodyMeasurements -> StylePreferences
 * 
 * Features:
 *   - 3-segment progress indicator (Middle active)
 *   - 2-column grid of bodyshape selection cards with greyed-out silhouettes
 *   - Custom bodyshape text input
 *   - Square back button with chevron
 *   - Black continue button (borderRadius: 15)
 *   - Skip link
 */
export const BodyMeasurementsScreen: React.FC<BodyMeasurementsScreenProps> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const profileData = route.params?.profileData;

  const [selectedType, setSelectedType] = useState<string>('pear');
  const [customValue, setCustomValue] = useState('Pear');

  const handleContinue = () => {
    navigation.navigate('StylePreferences', {
      profileData: {
        ...profileData,
        bodyshape: customValue.trim() !== '' ? customValue : selectedType,
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Card size calculation for 2 columns with 12px gap
  const SIDE_PADDING = 24;
  const GAP = 12;
  const CARD_WIDTH = (width - (SIDE_PADDING * 2) - GAP) / 2;

  return (
    <SafeContainer style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* ── Progress Bar (3 segments, 2nd active per Figma 2.0) ── */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressSegment, styles.segmentInactive]} />
            <View style={[styles.progressSegment, styles.segmentActive]} />
            <View style={[styles.progressSegment, styles.segmentInactive]} />
          </View>

          {/* ── Heading ── */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Bodyshape</Text>
            <Text style={styles.subtitle}>
              Personalize body measurements for accurate recommendations
            </Text>
          </View>

          {/* ── Bodyshape Grid (2x3) ── */}
          <View style={styles.grid}>
            {bodyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.card,
                  { width: CARD_WIDTH },
                  selectedType === type.id && styles.cardSelected
                ]}
                onPress={() => setSelectedType(type.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardInternal}>
                  <Text style={[
                    styles.cardLabel,
                    selectedType === type.id && styles.cardLabelActive
                  ]}>
                    {type.name}
                  </Text>

                  {/* Silhouette Graphics (styled to match Figma's grey placeholders) */}
                  <View style={styles.silhouetteWrapper}>
                    <Image
                      source={type.image}
                      style={styles.silhouetteImage}
                      resizeMode="cover"
                    />
                    <View style={styles.silhouetteOverlay} />
                  </View>

                  {/* Info Icon 'i' */}
                  <View style={styles.infoBadge}>
                    <Ionicons name="information-circle-outline" size={14} color="#C7C7CC" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Custom Input Section ── */}
          <View style={styles.customSection}>
            <Text style={styles.customHeading}>Custom:</Text>
            <View style={styles.inputPill}>
              <TextInput
                style={styles.textInput}
                value={customValue}
                onChangeText={setCustomValue}
                placeholder="Pear"
                placeholderTextColor="#A0A0A0"
                selectionColor="#000000"
              />
            </View>
          </View>

          {/* ── Footer Navigation ── */}
          <View style={styles.footer}>
            <View style={styles.actionRow}>
              {/* Square Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#000000" />
              </TouchableOpacity>

              {/* Black Continue Button */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.9}
              >
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </View>

            {/* Skip link */}
            <TouchableOpacity style={styles.skipLink} activeOpacity={0.6}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* ── Progress Indicator ── */
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  progressSegment: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  segmentActive: {
    backgroundColor: '#000000',
  },
  segmentInactive: {
    backgroundColor: '#E5E5EA',
  },

  /* ── Heading ── */
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: fontNames.bold,
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  /* ── Card Grid ── */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 28,
  },
  card: {
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    paddingLeft: 16,
    paddingRight: 0,
    justifyContent: 'center',
    // Top-oriented shadow as requested for all items
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: '#F9F9FB', // Subtle professional tint
    borderColor: '#E5E5EA',
    shadowOpacity: 0.12, // More prominent shadow to show "lift"
    shadowRadius: 16,
    elevation: 6,
  },
  cardInternal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    zIndex: 2,
  },
  cardLabelActive: {
    color: '#000000',
  },

  /* ── Silhouettes ── */
  silhouetteWrapper: {
    width: '50%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  silhouetteImage: {
    width: '100%',
    height: '100%',
  },
  silhouetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent', // The new assets are already silhouettes/styled
  },
  infoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 3,
  },

  /* ── Custom Input ── */
  customSection: {
    marginBottom: 36,
  },
  customHeading: {
    fontFamily: fontNames.bold,
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  inputPill: {
    backgroundColor: '#FFFFFF',
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
    paddingHorizontal: 20,
    justifyContent: 'center',
    // Top shadow as per audio feedback
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
  },
  textInput: {
    fontFamily: fontNames.regular,
    fontSize: 15,
    color: '#000000',
    // No default outlines
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },

  /* ── Footer ── */
  footer: {
    paddingTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    // Top shadow as per user request
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  continueButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#000000',
    borderRadius: 15, // Mentioned as 15px by user previously
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  continueText: {
    fontFamily: fontNames.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontFamily: fontNames.medium,
    fontSize: 14,
    color: '#666666',
  },
});
