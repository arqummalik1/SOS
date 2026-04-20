import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { ApiError } from '../../api/errors';
import { userService } from '../../services/userService';
import { notify } from '../../utils/notify';

interface BodyMeasurementsScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'BodyMeasurements'>;
  route: RouteProp<AuthStackParamList, 'BodyMeasurements'>;
}

interface BodyType {
  id: string;
  name: string;
  // API icon URL or local fallback image.
  image: any;
}

const DEFAULT_BODY_TYPES: BodyType[] = [
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

  const [bodyTypes, setBodyTypes] = useState<BodyType[]>(DEFAULT_BODY_TYPES);
  const [selectedType, setSelectedType] = useState<string>(DEFAULT_BODY_TYPES[0]?.id ?? '');
  const [customValue, setCustomValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    const fallbackByKey = new Map(DEFAULT_BODY_TYPES.map((shape) => [shape.id, shape]));

    const loadBodyShapeOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const options = await userService.getOnboardingOptions();
        if (!mounted || options.bodyShapes.length === 0) {
          return;
        }
        const nextBodyTypes = options.bodyShapes.map((shape) => ({
          id: shape.key,
          name: shape.label,
          image:
            (shape.imageUrl ? { uri: shape.imageUrl } : null) ??
            fallbackByKey.get(shape.key)?.image ??
            require('../../../assets/BodyShape/pear.png'),
        }));
        setBodyTypes(nextBodyTypes);
        setSelectedType((prev) =>
          nextBodyTypes.some((shape) => shape.id === prev) ? prev : nextBodyTypes[0].id
        );
      } catch (error) {
        console.warn('[SOS_ONBOARDING] Could not load body shape options, using defaults', error);
        notify({
          type: 'error',
          message: 'Could not load body shape options from the server. Using default options.',
        });
      } finally {
        if (mounted) {
          setIsLoadingOptions(false);
        }
      }
    };

    loadBodyShapeOptions();
    return () => {
      mounted = false;
    };
  }, []);

  const resolveBodyShapePayload = useCallback(() => {
    const selectedCard = bodyTypes.find((b) => b.id === selectedType);
    const cardName = selectedCard?.name ?? '';
    const customTrim = customValue.trim();
    const customForApi =
      customTrim.length > 0 && customTrim.toLowerCase() !== cardName.toLowerCase() ? customTrim : '';
    const displayBodyshape = customTrim.length > 0 ? customTrim : selectedType;
    return {
      bodyShape: selectedType,
      customBodyShape: customForApi,
      displayBodyshape,
    };
  }, [selectedType, customValue]);

  const handleContinue = useCallback(async () => {
    if (isSubmittingRef.current) {
      return;
    }
    if (!selectedType) {
      notify({ type: 'error', message: 'Please select a body shape.' });
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const { bodyShape, customBodyShape, displayBodyshape } = resolveBodyShapePayload();
    try {
      const result = await userService.saveOnboardingBodyShape({
        bodyShape,
        customBodyShape,
      });
      if (!result.success) {
        throw new Error(result.message || 'Could not save body shape.');
      }
      notify({ type: 'success', message: result.message });
      navigation.navigate('StylePreferences', {
        profileData: {
          ...profileData,
          bodyshape: displayBodyshape,
          bodyShapeApi: bodyShape,
          customBodyShapeApi: customBodyShape,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('[SOS_ONBOARDING] BodyMeasurements save failed', {
          code: error.code,
          status: error.status,
          details: error.details,
        });
      } else {
        console.error('[SOS_ONBOARDING] BodyMeasurements save failed', error);
      }
      const message =
        error instanceof Error ? error.message : 'Could not save body shape. Please try again.';
      notify({ type: 'error', message });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [navigation, profileData, resolveBodyShapePayload]);

  const handleSkip = useCallback(() => {
    const { displayBodyshape } = resolveBodyShapePayload();
    navigation.navigate('StylePreferences', {
      profileData: {
        ...profileData,
        bodyshape: displayBodyshape,
      },
    });
  }, [navigation, profileData, resolveBodyShapePayload]);

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
                placeholder={bodyTypes.find((shape) => shape.id === selectedType)?.name ?? 'Body shape'}
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
                disabled={isSubmitting || isLoadingOptions}
              >
                <Ionicons name="chevron-back" size={24} color="#000000" />
              </TouchableOpacity>

              {/* Black Continue Button */}
              <TouchableOpacity
                style={[styles.continueButton, isSubmitting && styles.continueButtonDisabled]}
                onPress={handleContinue}
                activeOpacity={0.9}
                disabled={isSubmitting || isLoadingOptions}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.continueText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Skip link */}
            <TouchableOpacity
              style={styles.skipLink}
              activeOpacity={0.6}
              onPress={handleSkip}
              disabled={isSubmitting}
            >
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
    minHeight: 60,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
    opacity: 0.75,
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
