import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { useAuth } from '../../store/AuthContext';
import { userService } from '../../services/userService';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { notify } from '../../utils/notify';

const WheelColorPicker = require('react-native-wheel-color-picker').default;
const LOG = '[SOS_STYLE_PREF]';

type StylePreferencesScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'StylePreferences'>;
  route: RouteProp<AuthStackParamList, 'StylePreferences'>;
};

type StyleOption = {
  key: string;
  label: string;
  imageUrl: string | null;
  description: string;
};

type SkinToneOption = {
  key: string;
  label: string;
  hex: string;
  row: number;
};

const FALLBACK_STYLE_IMAGES: Record<string, any> = {
  casual: require('../../../assets/images/mosaic/fashion2.jpg'),
  formal: require('../../../assets/images/mosaic/fashion3.jpg'),
  sporty: require('../../../assets/images/mosaic/fashion1.jpg'),
  bohemian: require('../../../assets/images/mosaic/fashion4.jpg'),
  minimal: require('../../../assets/images/mosaic/fashion2.jpg'),
  bold: require('../../../assets/images/mosaic/fashion1.jpg'),
  streetwear: require('../../../assets/images/mosaic/fashion4.jpg'),
};


const normalizeHex = (value: string): string | null => {
  const trimmed = value.trim().replace(/^#/, '');
  if (!trimmed) {
    return null;
  }
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }
  return null;
};

export const StylePreferencesScreen: React.FC<StylePreferencesScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useAuth();
  const [skinToneOptions, setSkinToneOptions] = useState<SkinToneOption[]>([]);
  const [styleOptions, setStyleOptions] = useState<StyleOption[]>([]);
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [selectedStyleKeys, setSelectedStyleKeys] = useState<string[]>([]);
  const [customColorModalVisible, setCustomColorModalVisible] = useState(false);
  const [customColorDraft, setCustomColorDraft] = useState('#F5D0A9');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const skinToneValues = useMemo(() => skinToneOptions.map((option) => option.hex), [skinToneOptions]);
  const isCustomToneSelected = !skinToneValues.includes(selectedTone);

  const groupedSkinTones = useMemo(() => {
    const rows = new Map<number, SkinToneOption[]>();
    skinToneOptions.forEach((tone) => {
      const row = tone.row || 0;
      const existing = rows.get(row) ?? [];
      existing.push(tone);
      rows.set(row, existing);
    });
    return [...rows.entries()]
      .sort((a, b) => a[0] - b[0])
      .map((entry) => entry[1]);
  }, [skinToneOptions]);

  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    setOptionsError(null);
    console.log(`${LOG} GET onboarding/options started`);
    try {
      const response = await userService.getOnboardingOptions();
      const apiSkinTones = response.skinTones
        .filter((tone) => tone.hex)
        .map((tone) => ({
          key: tone.key,
          label: tone.label,
          hex: tone.hex as string,
          row: tone.row,
        }));
      const apiStyles = response.stylePreferences.map((style) => ({
        key: style.key,
        label: style.label,
        imageUrl: style.imageUrl,
        description: style.description,
      }));

      if (apiSkinTones.length === 0 || apiStyles.length === 0) {
        setSkinToneOptions([]);
        setStyleOptions([]);
        setOptionsError('Onboarding options are unavailable right now. Please retry.');
        return;
      }

      setSkinToneOptions(apiSkinTones);
      setStyleOptions(apiStyles);
      setSelectedTone((prev) =>
        apiSkinTones.some((tone) => tone.hex === prev) ? prev : apiSkinTones[0].hex
      );
      setSelectedStyleKeys((prev) => {
        const valid = prev.filter((key) => apiStyles.some((style) => style.key === key));
        if (valid.length > 0) {
          return valid;
        }
        return [apiStyles[0].key];
      });
      console.log(`${LOG} GET onboarding/options success`, {
        skinToneCount: apiSkinTones.length,
        styleCount: apiStyles.length,
      });
    } catch (error) {
      console.error(`${LOG} GET onboarding/options failed`, error);
      setOptionsError('Could not load onboarding options. Please check your connection and retry.');
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const toggleStyle = useCallback((styleKey: string) => {
    setSelectedStyleKeys((prev) => {
      if (prev.includes(styleKey)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((key) => key !== styleKey);
      }
      return [...prev, styleKey];
    });
  }, []);

  const applyCustomColor = useCallback(() => {
    const normalized = normalizeHex(customColorDraft);
    if (!normalized) {
      notify({ type: 'error', message: 'Please enter a valid hex color, e.g. #F5D0A9.' });
      return;
    }
    setSelectedTone(normalized);
    setCustomColorDraft(normalized);
    setCustomColorModalVisible(false);
  }, [customColorDraft]);

  const handleContinue = useCallback(async () => {
    if (isLoading || isLoadingOptions) {
      return;
    }
    if (!selectedTone) {
      notify({ type: 'error', message: 'Please select your skin tone.' });
      return;
    }
    if (selectedStyleKeys.length === 0) {
      notify({ type: 'error', message: 'Please select at least one style preference.' });
      return;
    }

    setIsLoading(true);
    try {
      console.log(`${LOG} PATCH onboarding/skin-tone-style started`, {
        skinTone: selectedTone,
        stylePreferences: selectedStyleKeys,
      });
      const saveResult = await userService.saveOnboardingSkinToneStyle({
        skinTone: selectedTone,
        stylePreferences: selectedStyleKeys,
      });
      console.log(`${LOG} PATCH onboarding/skin-tone-style success`, saveResult);
      if (!saveResult.success) {
        throw new Error(saveResult.message || 'Could not save skin tone and style preferences.');
      }
    } catch (error) {
      console.error(`${LOG} Failed to save skin tone/style`, error);
      const message =
        error instanceof Error ? error.message : 'Failed to save preferences. Please try again.';
      notify({ type: 'error', message });
      setIsLoading(false);
      return;
    }

    try {
      console.log(`${LOG} POST onboarding/complete started`);
      await completeOnboarding();
      console.log(`${LOG} POST onboarding/complete + status sync success`);
      notify({ type: 'success', message: 'Preferences saved successfully. Welcome to Style On Spot!' });
      const rootNavigation = navigation.getParent();
      if (rootNavigation) {
        rootNavigation.reset({
          index: 0,
          routes: [{ name: 'Main' as never }],
        });
      }
    } catch (error) {
      console.error(`${LOG} Preferences saved but onboarding complete failed`, error);
      const message =
        error instanceof Error
          ? error.message
          : 'Preferences were saved, but onboarding could not be completed. Please try again.';
      notify({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [completeOnboarding, isLoading, isLoadingOptions, navigation, selectedStyleKeys, selectedTone]);

  const handleSkip = useCallback(async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      console.log(`${LOG} Skip tapped -> POST onboarding/complete started`);
      await completeOnboarding();
      console.log(`${LOG} Skip tapped -> onboarding complete success`);
      notify({ type: 'success', message: 'Onboarding completed.' });
      const rootNavigation = navigation.getParent();
      if (rootNavigation) {
        rootNavigation.reset({
          index: 0,
          routes: [{ name: 'Main' as never }],
        });
      }
    } catch (error) {
      console.error(`${LOG} Skip tapped -> onboarding complete failed`, error);
      const message = error instanceof Error ? error.message : 'Could not complete onboarding. Please try again.';
      notify({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [completeOnboarding, isLoading, navigation]);

  const toneCardWidth = (width - 48 - 36) / 4;

  return (
    <SafeContainer style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentActive]} />
        </View>

        <View style={styles.headerSection}>
          <Text style={styles.title}>Skin tone & Style Preferences</Text>
          <Text style={styles.subtitle}>Personalize color and style recommendations</Text>
        </View>

        {isLoadingOptions ? (
          <View style={styles.optionsLoader}>
            <ActivityIndicator color="#000000" size="small" />
            <Text style={styles.optionsLoaderText}>Loading options...</Text>
          </View>
        ) : null}

        {!isLoadingOptions && optionsError ? (
          <View style={styles.optionsErrorBox}>
            <Text style={styles.optionsErrorText}>{optionsError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadOptions} activeOpacity={0.85}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!optionsError && !isLoadingOptions ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select your skin tone</Text>
              {groupedSkinTones.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.toneGridRow}>
                  {row.map((tone) => (
                    <TouchableOpacity
                      key={tone.key}
                      style={[
                        styles.toneSquare,
                        { width: toneCardWidth, height: toneCardWidth * 0.7, backgroundColor: tone.hex },
                        selectedTone === tone.hex && styles.toneSquareSelected,
                      ]}
                      onPress={() => setSelectedTone(tone.hex)}
                      activeOpacity={0.8}
                    />
                  ))}
                </View>
              ))}
            </View>

            <View style={styles.customToneRow}>
              <Text style={styles.sectionTitle}>Custom skin tone</Text>
              <TouchableOpacity
                style={[
                  styles.colorPickerButton,
                  isCustomToneSelected && styles.colorPickerButtonActive,
                  isCustomToneSelected && { backgroundColor: selectedTone },
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setCustomColorDraft(selectedTone);
                  setCustomColorModalVisible(true);
                }}
              >
                {isCustomToneSelected ? (
                  <View style={styles.customColorBadge}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                ) : (
                  <Ionicons name="color-palette-outline" size={20} color="#000000" />
                )}
              </TouchableOpacity>
            </View>

            <Modal
              animationType="slide"
              transparent
              visible={customColorModalVisible}
              onRequestClose={() => setCustomColorModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Pick custom skin tone</Text>
                  <Text style={styles.modalSubtitle}>Choose any color and we will save the hex value.</Text>
                  <View style={styles.colorPickerWrapper}>
                    <WheelColorPicker
                      color={customColorDraft}
                      onColorChange={(color: string) => {
                        const normalized = normalizeHex(color);
                        if (normalized) {
                          setCustomColorDraft(normalized);
                        }
                      }}
                      thumbSize={24}
                      sliderSize={20}
                      noSnap
                      row={false}
                    />
                  </View>
                  <TextInput
                    style={styles.colorInput}
                    value={customColorDraft}
                    onChangeText={(value) => setCustomColorDraft(value.toUpperCase())}
                    placeholder="#F5D0A9"
                    placeholderTextColor="#999999"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={7}
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelButton}
                      onPress={() => setCustomColorModalVisible(false)}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalConfirmButton} onPress={applyCustomColor}>
                      <Text style={styles.modalConfirmText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <View style={styles.styleSection}>
              <Text style={styles.sectionTitle}>Style preferences</Text>
              <Text style={styles.helperText}>You can select multiple styles.</Text>
              <FlatList
                data={styleOptions}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.styleListContent}
                renderItem={({ item }) => {
                  const isSelected = selectedStyleKeys.includes(item.key);
                  const fallbackImage = FALLBACK_STYLE_IMAGES[item.key] ?? FALLBACK_STYLE_IMAGES.casual;
                  return (
                    <TouchableOpacity
                      style={[styles.styleCard, isSelected && styles.styleCardSelected]}
                      onPress={() => toggleStyle(item.key)}
                      activeOpacity={0.92}
                    >
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.styleImage} />
                      ) : (
                        <Image source={fallbackImage} style={styles.styleImage} />
                      )}
                      <View style={styles.styleOverlay} />
                      <View style={[styles.stylePill, isSelected && styles.stylePillSelected]}>
                        <Text style={styles.stylePillText}>{item.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={isLoading}>
              <Ionicons name="chevron-back" size={24} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
              onPress={handleContinue}
              activeOpacity={0.9}
              disabled={isLoading || isLoadingOptions || Boolean(optionsError)}
            >
              {isLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.continueText}>Continue</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.skipLink} activeOpacity={0.7} onPress={handleSkip} disabled={isLoading}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  progressSegment: {
    flex: 1,
    height: 12,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: '#000000',
  },
  segmentInactive: {
    backgroundColor: '#E5E5EA',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fontNames.bold,
    fontSize: 46,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
    lineHeight: 52,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    ...typography.heading5,
    fontFamily: fontNames.bold,
    color: '#000000',
    marginBottom: 12,
  },
  optionsLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  optionsLoaderText: {
    ...typography.bodyMedium,
    color: '#666666',
  },
  optionsErrorBox: {
    backgroundColor: '#FFF1F1',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    gap: 10,
  },
  optionsErrorText: {
    ...typography.bodyMedium,
    color: '#8A1F1F',
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#000000',
  },
  retryButtonText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontFamily: fontNames.medium,
  },
  toneGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  toneSquare: {
    borderRadius: 6,
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  toneSquareSelected: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 7,
    transform: [{ scale: 1.05 }],
  },
  customToneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 22,
  },
  colorPickerButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  colorPickerButtonActive: {
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 9,
  },
  customColorBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: fontNames.bold,
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  colorPickerWrapper: {
    height: 200,
    marginBottom: 16,
  },
  colorInput: {
    ...typography.bodyLarge,
    fontFamily: fontNames.medium,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    textAlign: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  styleSection: {
    marginBottom: 28,
  },
  helperText: {
    ...typography.bodySmall,
    color: '#666666',
    marginBottom: 10,
  },
  styleListContent: {
    gap: 14,
    paddingRight: 24,
  },
  styleCard: {
    width: 205,
    height: 312,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  styleCardSelected: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    transform: [{ scale: 1.02 }],
  },
  styleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  styleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  stylePill: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(228, 220, 229, 0.95)',
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stylePillSelected: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  stylePillText: {
    ...typography.bodyMedium,
    fontFamily: fontNames.bold,
    color: '#000000',
  },
  footer: {
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#666666',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    fontFamily: fontNames.medium,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    color: '#666666',
  },
});
