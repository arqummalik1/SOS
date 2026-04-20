import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Platform,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { fontNames } from '../../theme/fonts';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { userService } from '../../services/userService';
import { notify } from '../../utils/notify';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width - 48;
const IMAGE_HEIGHT = IMAGE_WIDTH * 1.1;

// ────────────────────────────────────────────────────────
// Data generators — no magic strings, centralised ranges
// ────────────────────────────────────────────────────────
const HEIGHTS = Array.from({ length: 201 }, (_, i) => `${100 + i}cm`);   // 100cm → 300cm
const WEIGHTS = Array.from({ length: 171 }, (_, i) => `${30 + i}kg`);    // 30kg  → 200kg
const DAYS    = Array.from({ length: 31 },  (_, i) => `${i + 1}`);       // 1 → 31
const MONTHS  = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const YEARS   = Array.from({ length: 76 },  (_, i) => `${2024 - i}`);    // 2024 → 1949

interface ProfileSetupScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ProfileSetup'>;
  route: RouteProp<AuthStackParamList, 'ProfileSetup'>;
}

/**
 * Reusable bottom-sheet dropdown modal.
 * Renders a scrollable list of string options.
 */
interface DropdownModalProps {
  visible: boolean;
  title: string;
  data: string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const DropdownModal: React.FC<DropdownModalProps> = ({
  visible, title, data, selected, onSelect, onClose,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose}>
      <View style={modalStyles.sheet}>
        {/* Handle bar */}
        <View style={modalStyles.handleBar} />

        <Text style={modalStyles.sheetTitle}>{title}</Text>

        <FlatList
          data={data}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          style={modalStyles.list}
          initialScrollIndex={Math.max(0, data.indexOf(selected))}
          getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
          renderItem={({ item }) => {
            const isSelected = item === selected;
            return (
              <TouchableOpacity
                style={[modalStyles.option, isSelected && modalStyles.optionSelected]}
                onPress={() => { onSelect(item); onClose(); }}
                activeOpacity={0.7}
              >
                <Text style={[modalStyles.optionText, isSelected && modalStyles.optionTextSelected]}>
                  {item}
                </Text>
                {isSelected && <Ionicons name="checkmark" size={20} color="#000" />}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </TouchableOpacity>
  </Modal>
);

// ────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────
export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ navigation, route }) => {
  const profileImage = route.params?.profileImage;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName]       = useState('');
  const [height, setHeight]   = useState('160cm');
  const [weight, setWeight]   = useState('60kg');
  const [day, setDay]         = useState('28');
  const [month, setMonth]     = useState('February');
  const [year, setYear]       = useState('2002');

  // Modal state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const openDropdown  = useCallback((key: string) => setActiveDropdown(key), []);
  const closeDropdown = useCallback(() => setActiveDropdown(null), []);

  const formatDateOfBirth = () => {
    const monthIndex = MONTHS.indexOf(month) + 1;
    const safeMonth = monthIndex > 0 ? monthIndex : 1;
    const safeDay = Math.max(1, Math.min(31, Number(day)));
    return `${year}-${String(safeMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
  };

  const normalizeMetricValue = (value: string) => value.replace(/[^\d]/g, '');

  const handleNext = async () => {
    if (isSubmitting) return;

    const sanitizedName = name.trim();
    const normalizedHeight = normalizeMetricValue(height);
    const normalizedWeight = normalizeMetricValue(weight);
    const dateOfBirth = formatDateOfBirth();

    if (!sanitizedName) {
      notify({ type: 'error', message: 'Name is required.' });
      return;
    }
    if (!normalizedHeight || !normalizedWeight) {
      notify({ type: 'error', message: 'Please provide valid height and weight.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await userService.saveOnboardingBasicDetails({
        name: sanitizedName,
        height: normalizedHeight,
        weight: normalizedWeight,
        date_of_birth: dateOfBirth,
      });

      notify({ type: 'success', message: result.message });
      navigation.navigate('FullBodyPhoto', {
        profileImage,
        profileData: {
          name: sanitizedName,
          height: normalizedHeight,
          weight: normalizedWeight,
          dob: dateOfBirth,
        },
      });
    } catch (error) {
      notify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save basic details.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeContainer style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* ── Progress Bar ── */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.segmentActive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
        </View>

        {/* ── Header ── */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Profile setup</Text>
          <Text style={styles.subtitle}>
            This information helps us deliver a better,{'\n'}more personalized experience for you.
          </Text>
        </View>

        {/* ── Profile Image ── */}
        <View style={styles.photoSection}>
          <View style={styles.photoWrapper}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('../../../assets/images/mosaic/fashion1.jpg')
              }
              style={styles.profileImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.editBadge}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProfilePicture')}
            >
              <View style={styles.editBadgeCircle}>
                <Ionicons name="pencil-outline" size={16} color="#000000" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Form Fields ── */}
        <View style={styles.formSection}>

          {/* ─ Name ─ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your name:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Jane Doe"
                placeholderTextColor="#999999"
                autoCorrect={false}
                autoCapitalize="words"
                // Remove the default TextInput outline on web/iOS
                underlineColorAndroid="transparent"
              />
            </View>
          </View>

          {/* ─ Height & Weight ─ */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Height:</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => openDropdown('height')}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{height}</Text>
                <Ionicons name="chevron-down" size={18} color="#000000" />
              </TouchableOpacity>
            </View>
            <View style={{ width: 16 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Weight:</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => openDropdown('weight')}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{weight}</Text>
                <Ionicons name="chevron-down" size={18} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─ Date of Birth ─ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth:</Text>
            <View style={styles.dobRow}>
              <TouchableOpacity
                style={[styles.dropdownTrigger, styles.dobSegment]}
                onPress={() => openDropdown('day')}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{day}</Text>
                <Ionicons name="chevron-down" size={16} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownTrigger, styles.dobSegmentMedium]}
                onPress={() => openDropdown('month')}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{month}</Text>
                <Ionicons name="chevron-down" size={16} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownTrigger, styles.dobSegment]}
                onPress={() => openDropdown('year')}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{year}</Text>
                <Ionicons name="chevron-down" size={16} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Next Button ── */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={isSubmitting}
            activeOpacity={0.9}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Dropdown Modals ── */}
      <DropdownModal
        visible={activeDropdown === 'height'}
        title="Select Height"
        data={HEIGHTS}
        selected={height}
        onSelect={setHeight}
        onClose={closeDropdown}
      />
      <DropdownModal
        visible={activeDropdown === 'weight'}
        title="Select Weight"
        data={WEIGHTS}
        selected={weight}
        onSelect={setWeight}
        onClose={closeDropdown}
      />
      <DropdownModal
        visible={activeDropdown === 'day'}
        title="Select Day"
        data={DAYS}
        selected={day}
        onSelect={setDay}
        onClose={closeDropdown}
      />
      <DropdownModal
        visible={activeDropdown === 'month'}
        title="Select Month"
        data={MONTHS}
        selected={month}
        onSelect={setMonth}
        onClose={closeDropdown}
      />
      <DropdownModal
        visible={activeDropdown === 'year'}
        title="Select Year"
        data={YEARS}
        selected={year}
        onSelect={setYear}
        onClose={closeDropdown}
      />
    </SafeContainer>
  );
};

// ────────────────────────────────────────────────────────
// Dropdown Modal styles
// ────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '50%',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: fontNames.bold,
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  optionSelected: {
    backgroundColor: '#F5F5F5',
  },
  optionText: {
    fontFamily: fontNames.regular,
    fontSize: 16,
    color: '#333333',
  },
  optionTextSelected: {
    fontFamily: fontNames.medium,
    fontWeight: '600',
    color: '#000000',
  },
});

// ────────────────────────────────────────────────────────
// Screen styles
// ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },

  /* ── Progress bar ── */
  progressContainer: {
    flexDirection: 'row',
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

  /* ── Header ── */
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fontNames.bold,
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#666666',
    textAlign: 'center',
  },

  /* ── Photo section ── */
  photoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  photoWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 24,
    overflow: 'visible',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
  },
  editBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  editBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  /* ── Form ── */
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: fontNames.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 20,
    // Remove any default border — clean pill look
    borderWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  textInput: {
    fontFamily: fontNames.regular,
    fontSize: 15,
    color: '#000000',
    flex: 1,
    height: '100%',
    // Kill the default TextInput border/outline
    borderWidth: 0,
    outlineStyle: 'none', // Web
    padding: 0,
  } as any,
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    height: 52,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dropdownText: {
    fontFamily: fontNames.regular,
    fontSize: 15,
    color: '#000000',
  },
  dobRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dobSegment: {
    flex: 1,
  },
  dobSegmentMedium: {
    flex: 1.5,
  },

  /* ── Next button ── */
  buttonContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#0A0A0A',
    width: '75%',
    height: 58,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
