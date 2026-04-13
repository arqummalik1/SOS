import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarStackParamList } from '../../navigation/CalendarStackNavigator';
import { typography } from '../../theme/typography';

type OccasionSelectionScreenProps = {
  navigation: NativeStackNavigationProp<CalendarStackParamList, 'OccasionSelection'>;
};

type OccasionOption = {
  key: string;
  label: string;
  icon: (color: string) => React.ReactNode;
};

const OPTIONS: OccasionOption[] = [
  { key: 'casual', label: 'Casual', icon: (color) => <Ionicons name="shirt-outline" size={31} color={color} /> },
  { key: 'formal', label: 'Formal', icon: (color) => <MaterialCommunityIcons name="shoe-formal" size={31} color={color} /> },
  { key: 'party', label: 'Party', icon: (color) => <MaterialCommunityIcons name="party-popper" size={31} color={color} /> },
  { key: 'sport', label: 'Sport', icon: (color) => <Ionicons name="football" size={31} color={color} /> },
  { key: 'work', label: 'Work', icon: (color) => <Ionicons name="briefcase" size={31} color={color} /> },
  { key: 'travel', label: 'Travel', icon: (color) => <Ionicons name="airplane" size={31} color={color} /> },
  { key: 'date-night', label: 'Date Night', icon: (color) => <Ionicons name="moon" size={31} color={color} /> },
  { key: 'lounge', label: 'Lounge', icon: (color) => <MaterialCommunityIcons name="sofa" size={31} color={color} /> },
];

export const FirstScreen: React.FC<OccasionSelectionScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [selectedOccasion, setSelectedOccasion] = useState<string>('casual');
  const [customMode, setCustomMode] = useState(false);
  const [customOccasion, setCustomOccasion] = useState('');
  const [showCustomError, setShowCustomError] = useState(false);
  const customInputRef = useRef<TextInput>(null);

  const horizontalPadding = Math.max(16, Math.min(24, width * 0.06));
  const gridGap = Math.max(10, Math.min(16, width * 0.03));
  const cardWidth = (width - horizontalPadding * 2 - gridGap) / 2;
  const cardHeight = Math.max(82, Math.min(92, cardWidth * 0.52));
  const continueWidth = Math.max(220, Math.min(300, width * 0.59));

  const onSelectOccasion = (key: string) => {
    setSelectedOccasion(key);
    setCustomMode(false);
    setShowCustomError(false);
  };

  const onSelectCustom = () => {
    setCustomMode(true);
    setShowCustomError(false);
  };

  const onContinue = () => {
    const customTrimmed = customOccasion.trim();
    if (customMode && customTrimmed.length === 0) {
      setShowCustomError(true);
      return;
    }
    const selectedOccasionLabel = customMode
      ? customTrimmed
      : OPTIONS.find((option) => option.key === selectedOccasion)?.label ?? 'Leisure';

    navigation.navigate('TravelPlanner', {
      selectedOccasion: selectedOccasionLabel,
      isCustomOccasion: customMode,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F3F3" />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : undefined)}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>What’s the occasion</Text>

        <View style={[styles.grid, { rowGap: gridGap, columnGap: gridGap }]}>
          {OPTIONS.map((option) => {
            const selected = !customMode && selectedOccasion === option.key;
            const iconColor = selected ? '#E7D9EB' : '#C9B7CC';
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.optionCard, { width: cardWidth, height: cardHeight }]}
                onPress={() => onSelectOccasion(option.key)}
                activeOpacity={0.85}
              >
                {selected ? (
                  <LinearGradient
                    colors={['#CDBCD2', '#B496BE']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.optionCardGradient}
                  >
                    <Text style={[styles.optionLabel, styles.optionLabelSelected]}>{option.label}</Text>
                    <View style={styles.iconWrap}>{option.icon(iconColor)}</View>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <View style={styles.iconWrap}>{option.icon(iconColor)}</View>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.customBtn, customMode && styles.customBtnSelected]}
          onPress={onSelectCustom}
          activeOpacity={0.85}
        >
          <FontAwesome5 name="pen" size={14} color="#050505" />
          <Text style={styles.customBtnText}>Custom</Text>
        </TouchableOpacity>

        {customMode && (
          <View style={styles.customInputSection}>
            <TouchableOpacity
              style={styles.customInputWrap}
              activeOpacity={1}
              onPress={() => customInputRef.current?.focus()}
            >
              <TextInput
                ref={customInputRef}
                value={customOccasion}
                onChangeText={(value) => {
                  setCustomOccasion(value);
                  if (showCustomError && value.trim().length > 0) {
                    setShowCustomError(false);
                  }
                }}
                placeholder="Type your occasion"
                placeholderTextColor="#8B8B8B"
                style={styles.customInput}
                returnKeyType="done"
                maxLength={32}
                autoFocus
              />
            </TouchableOpacity>
            {showCustomError ? <Text style={styles.errorText}>Please enter a custom occasion.</Text> : null}
          </View>
        )}

        <TouchableOpacity
          style={[styles.continueBtn, { width: continueWidth }]}
          onPress={onContinue}
          activeOpacity={0.9}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export const OccasionSelectionScreen = FirstScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  content: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 4 : 6,
    paddingBottom: 76,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginLeft: -4,
  },
  backText: {
    marginLeft: 5,
    ...typography.callout,
    color: '#1F1F1F',
  },
  heading: {
    marginTop: 12,
    textAlign: 'center',
    ...typography.title1,
    color: '#111111',
  },
  grid: {
    marginTop: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    borderRadius: 16,
    backgroundColor: '#F6F6F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    ...typography.title3,
    lineHeight: 22,
    color: '#494536',
  },
  optionLabelSelected: {
    color: '#1E1A18',
  },
  iconWrap: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBtn: {
    marginTop: 24,
    alignSelf: 'center',
    height: 40,
    width: 180,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  customBtnSelected: {
    backgroundColor: '#ECE4EF',
  },
  customBtnText: {
    ...typography.title3,
    lineHeight: 24,
    color: '#111111',
  },
  customInputSection: {
    marginTop: 14,
    alignItems: 'center',
  },
  customInputWrap: {
    width: '100%',
    maxWidth: 320,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FCFCFC',
    paddingHorizontal: 16,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  customInput: {
    ...typography.callout,
    flex: 1,
    height: '100%',
    color: '#1A1A1A',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null),
  },
  errorText: {
    ...typography.caption1,
    color: '#B13A3A',
    marginTop: 6,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  continueBtn: {
    marginTop: 34,
    alignSelf: 'center',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#030303',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
});
