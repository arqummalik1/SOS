import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useUser } from '../../store/UserContext';
import { useAuth } from '../../store/AuthContext';
import { ApiError } from '../../api/errors';
import { userService } from '../../services/userService';
import { notify } from '../../utils/notify';
import { typography } from '../../theme/typography';
import ColorPicker from 'react-native-wheel-color-picker';

interface StylePreferencesScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'StylePreferences'>;
  route: RouteProp<AuthStackParamList, 'StylePreferences'>;
}

const skinTones = [
  '#FEE3C5', '#FDE7AD', '#F9D998', '#F9D3A0',
  '#EDC091', '#F2C281', '#D49E7A', '#BB6436',
  '#CF9660', '#AE8A60', '#935F37', '#733F17',
  '#B36644', '#7F4422', '#5F3310', '#291709',
 ] as const;

const styleCards = [
  { id: 'sporty', label: 'Sporty', image: require('../../../assets/images/mosaic/fashion1.jpg') },
  { id: 'casual', label: 'Casual', image: require('../../../assets/images/mosaic/fashion2.jpg') },
  { id: 'formal', label: 'Formal', image: require('../../../assets/images/mosaic/fashion3.jpg') },
  { id: 'boho', label: 'Boho', image: require('../../../assets/images/mosaic/fashion4.jpg') },
];

const hydrateDob = (value: string | undefined): string => value ?? '';

/**
 * Profile setup step 3: Skin tone + style preferences.
 * Uses route profile data and persists onboarding data before completion.
 */
export const StylePreferencesScreen: React.FC<StylePreferencesScreenProps> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { updateProfile } = useUser();
  const { completeOnboarding } = useAuth();
  const profileData = route.params?.profileData;
  const [selectedTone, setSelectedTone] = useState<string>(skinTones[0]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(styleCards[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [pickerColor, setPickerColor] = useState<string>(skinTones[0]);
  const scrollX = useRef(new Animated.Value(0)).current;

  const selectedStyleLabel = useMemo(
    () => styleCards.find((card) => card.id === selectedStyleId)?.label ?? styleCards[0].label,
    [selectedStyleId]
  );
  const isPickerBackgroundDark = useMemo(() => {
    const hex = selectedTone.replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.52;
  }, [selectedTone]);
  const contentWidth = Math.min(404, width - 40);
  const toneGap = 20;
  const toneWidth = (contentWidth - toneGap * 3) / 4;
  const toneHeight = Math.max(34, (36 / 86) * toneWidth);
  const styleCardWidthSelected = Math.min(247, width * 0.58);
  const styleCardHeightSelected = styleCardWidthSelected * (343 / 247);
  const styleCardWidthCollapsed = Math.round(styleCardWidthSelected * (222 / 247));
  const styleCardHeightCollapsed = Math.round(styleCardHeightSelected * (308 / 343));
  const carouselGap = 14;
  const styleSlotWidth = styleCardWidthCollapsed + carouselGap;
  const carouselSnap = styleSlotWidth;

  const handleContinue = useCallback(async () => {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const apiResult = await userService.saveOnboardingSkinToneStyle({
        skinTone: selectedTone,
        stylePreferences: [selectedStyleId],
      });
      notify({ type: 'success', message: apiResult.message });

      await updateProfile({
        name: profileData?.name ?? '',
        height: profileData?.height ?? '',
        weight: profileData?.weight ?? '',
        dob: hydrateDob(profileData?.dob),
        profileImage: profileData?.profileImage ?? null,
        stylePreferences: [selectedStyleLabel],
        colorPreferences: [apiResult.skinTone ?? selectedTone],
      });
      await completeOnboarding();
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('[SOS_ONBOARDING] StylePreferences save failed', {
          code: error.code,
          status: error.status,
          details: error.details,
        });
      } else {
        console.error('[SOS_ONBOARDING] StylePreferences save failed', error);
      }
      const message =
        error instanceof Error ? error.message : 'Could not save preferences. Please try again.';
      notify({ type: 'error', message });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [
    completeOnboarding,
    profileData?.dob,
    profileData?.height,
    profileData?.name,
    profileData?.profileImage,
    profileData?.weight,
    selectedStyleId,
    selectedStyleLabel,
    selectedTone,
    updateProfile,
  ]);

  const handleSkip = useCallback(async () => {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await updateProfile({
        name: profileData?.name ?? '',
        height: profileData?.height ?? '',
        weight: profileData?.weight ?? '',
        dob: hydrateDob(profileData?.dob),
        profileImage: profileData?.profileImage ?? null,
      });
      await completeOnboarding();
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('[SOS_ONBOARDING] StylePreferences skip failed', {
          code: error.code,
          status: error.status,
        });
      } else {
        console.error('[SOS_ONBOARDING] StylePreferences skip failed', error);
      }
      const message =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      notify({ type: 'error', message });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [
    completeOnboarding,
    profileData?.dob,
    profileData?.height,
    profileData?.name,
    profileData?.profileImage,
    profileData?.weight,
    updateProfile,
  ]);

  return (
    <SafeContainer style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: Math.max(20, (width - contentWidth) / 2) }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={16} color="#1A1A1A" />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar (3 segments, 3rd active) */}
        <View style={[styles.progressContainer, { width: contentWidth }]}>
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentActive]} />
        </View>

        {/* Title Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Skin tone & Style{'\n'}Preferences</Text>
          <Text style={styles.subtitle}>
            Personalize color and style recommendations
          </Text>
        </View>

        {/* Skin Tone Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select your skin tone:</Text>
          <View style={[styles.toneGrid, { width: contentWidth, gap: toneGap }]}>
            {skinTones.map((tone, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.toneSquare,
                  { width: toneWidth, height: toneHeight },
                  { backgroundColor: tone },
                  selectedTone === tone && styles.toneSquareSelected
                ]}
                onPress={() => setSelectedTone(tone)}
                activeOpacity={0.8}
              />
            ))}
          </View>
        </View>

        {/* Custom Skin Tone Section */}
        <View style={styles.customToneRow}>
          <Text style={styles.sectionTitle}>Custom skin tone:</Text>
          <TouchableOpacity
            style={[styles.colorPickerButton, { backgroundColor: selectedTone }]}
            activeOpacity={0.7}
            onPress={() => {
              setPickerColor(selectedTone);
              setIsColorPickerVisible(true);
            }}
          >
            <Ionicons name="eyedrop-outline" size={13} color={isPickerBackgroundDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>

        {/* Style Preference Section */}
        <View style={styles.styleSection}>
          <Text style={styles.sectionTitle}>Style preference:</Text>
          <Animated.FlatList
            data={styleCards}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.styleListContent}
            snapToInterval={carouselSnap}
            decelerationRate="fast"
            bounces={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const stride = carouselSnap;
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / stride);
              const bounded = Math.max(0, Math.min(styleCards.length - 1, nextIndex));
              setSelectedStyleId(styleCards[bounded].id);
            }}
            renderItem={({ item, index }) => {
              const inputRange = [(index - 1) * carouselSnap, index * carouselSnap, (index + 1) * carouselSnap];
              const centerScale = styleCardWidthSelected / styleCardWidthCollapsed;
              const cardScale = scrollX.interpolate({
                inputRange,
                outputRange: [1, centerScale, 1],
                extrapolate: 'clamp',
              });
              const cardOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.95, 1, 0.95],
                extrapolate: 'clamp',
              });

              return (
              <TouchableOpacity 
                style={[
                  styles.styleCard,
                  { width: styleSlotWidth, height: styleCardHeightSelected },
                  selectedStyleId === item.id && styles.styleCardSelected
                ]}
                onPress={() => setSelectedStyleId(item.id)}
                activeOpacity={0.9}
              >
                <Animated.View
                  style={[
                    styles.styleCardVisualWrap,
                    {
                      width: styleCardWidthCollapsed,
                      height: styleCardHeightCollapsed,
                      transform: [{ scale: cardScale }],
                      opacity: cardOpacity,
                    },
                  ]}
                >
                  <ImageBackground source={item.image} style={styles.styleImage} imageStyle={styles.styleImageMask}>
                    <View style={styles.imageOverlay} />
                  </ImageBackground>
                </Animated.View>
                {selectedStyleId === item.id ? (
                  <View style={styles.stylePill}>
                    <Text style={styles.stylePillText}>{item.label}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#000000" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.9}
              disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueText}>Continue</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.skipLink} 
            activeOpacity={0.7}
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal transparent visible={isColorPickerVisible} animationType="fade" onRequestClose={() => setIsColorPickerVisible(false)}>
        <Pressable style={styles.colorPickerOverlay} onPress={() => setIsColorPickerVisible(false)}>
          <Pressable style={styles.colorPickerSheet} onPress={() => undefined}>
            <Text style={styles.colorPickerTitle}>Pick custom skin tone</Text>
            <View style={styles.colorPickerWrap}>
              <ColorPicker
                color={pickerColor}
                onColorChange={setPickerColor}
                onColorChangeComplete={setPickerColor}
                thumbSize={24}
                sliderSize={24}
                noSnap={true}
                row={false}
              />
            </View>
            <TouchableOpacity
              style={styles.colorPickerDone}
              activeOpacity={0.9}
              onPress={() => {
                setSelectedTone(pickerColor);
                setIsColorPickerVisible(false);
              }}
            >
              <Text style={styles.colorPickerDoneText}>Apply color</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerRow: {
    marginBottom: 10,
    minHeight: 18,
    justifyContent: 'center',
  },
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  headerBackText: {
    ...typography.footnote,
    color: '#1F1F1F',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
    alignSelf: 'center',
  },
  progressSegment: {
    flex: 1,
    height: 18,
    borderRadius: 50,
  },
  segmentActive: {
    backgroundColor: '#000000',
  },
  segmentInactive: {
    backgroundColor: '#E5E5EA',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontFamily: typography.title2.fontFamily,
    fontWeight: '500',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 0,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: typography.callout.fontFamily,
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 22,
    color: '#000000',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: typography.title1.fontFamily,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 24,
    color: '#000000',
    marginBottom: 14,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
  },
  toneSquare: {
    borderRadius: 6,
  },
  toneSquareSelected: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  customToneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  colorPickerButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
    elevation: 2,
  },
  styleSection: {
    marginBottom: 36,
  },
  styleListContent: {
    gap: 14,
    paddingTop: 8,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 14,
  },
  styleCard: {
    borderRadius: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleCardSelected: {
    transform: [{ scale: 1.0 }],
  },
  styleCardVisualWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  styleImage: {
    width: '100%',
    height: '100%',
  },
  styleImageMask: {
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  stylePill: {
    position: 'absolute',
    bottom: 18,
    left: '50%',
    marginLeft: -52.5,
    width: 105,
    backgroundColor: 'rgba(165, 128, 166, 0.3)',
    height: 35,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
    elevation: 2,
  },
  stylePillText: {
    fontFamily: typography.callout.fontFamily,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
    color: '#000000',
  },
  footer: {
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
    elevation: 2,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#000000',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
    elevation: 5,
  },
  continueText: {
    fontFamily: typography.callout.fontFamily,
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  skipText: {
    ...typography.caption1,
    color: '#000000',
  },
  colorPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  colorPickerSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    maxHeight: '82%',
  },
  colorPickerTitle: {
    ...typography.headline,
    color: '#111111',
    marginBottom: 12,
  },
  colorPickerWrap: {
    minHeight: 320,
  },
  colorPickerDone: {
    marginTop: 12,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPickerDoneText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
