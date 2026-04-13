import React, { useRef, useState } from 'react';
import {
  Modal,
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
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarStackParamList } from '../../navigation/CalendarStackNavigator';
import { typography } from '../../theme/typography';

type TravelPlannerScreenProps = {
  navigation: NativeStackNavigationProp<CalendarStackParamList, 'TravelPlanner'>;
  route: RouteProp<CalendarStackParamList, 'TravelPlanner'>;
};

const TRIP_TYPES = [
  'Leisure',
  'Business',
  'Adventure',
  'Beach',
  'Cultural',
  'Road',
  'Ecotourism',
  'Wellness',
  'Volunteer',
  'Slow',
  'Family',
  'Other',
] as const;

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const formatDate = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = `${date.getFullYear()}`;
  return `${day}-${month}-${year}`;
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export const TravelPlannerScreen: React.FC<TravelPlannerScreenProps> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const initialOccasion = route.params?.selectedOccasion?.trim();
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['France', 'London']);
  const [selectedTripType, setSelectedTripType] = useState<(typeof TRIP_TYPES)[number]>('Leisure');
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 2, 1));
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 2, 7));
  const [editingDate, setEditingDate] = useState<'start' | 'end' | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [pickerDay, setPickerDay] = useState(1);
  const [pickerMonth, setPickerMonth] = useState(0);
  const [pickerYear, setPickerYear] = useState(2026);
  const [otherTripType, setOtherTripType] = useState(initialOccasion && initialOccasion !== 'Other' ? initialOccasion : 'Other');
  const searchInputRef = useRef<TextInput>(null);
  const otherInputRef = useRef<TextInput>(null);

  const horizontalPadding = Math.max(16, Math.min(24, width * 0.06));
  const tripGap = 10;
  const tripPillWidth = (width - horizontalPadding * 2 - tripGap * 2) / 3;
  const actionButtonWidth = Math.max(230, Math.min(300, width * 0.62));
  const datePillWidth = (width - horizontalPadding * 2 - 54) / 2;

  const onRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((item) => item !== tag));
  };

  const addTagFromQuery = () => {
    const normalized = query.trim();
    if (!normalized) return;
    setSelectedTags((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    setQuery('');
  };

  const onGenerate = () => {
    navigation.navigate('MultipleOutfits');
  };

  const onSkip = () => {
    navigation.navigate('MultipleOutfits');
  };

  const onOpenDatePicker = (type: 'start' | 'end') => {
    const sourceDate = type === 'start' ? startDate : endDate;
    setEditingDate(type);
    setPickerDay(sourceDate.getDate());
    setPickerMonth(sourceDate.getMonth());
    setPickerYear(sourceDate.getFullYear());
    setShowDateModal(true);
  };

  const applyPickedDate = (nextDate: Date, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(nextDate);
      if (nextDate > endDate) setEndDate(nextDate);
      return;
    }
    if (nextDate < startDate) {
      setEndDate(startDate);
      return;
    }
    setEndDate(nextDate);
  };

  const stepPickerField = (field: 'day' | 'month' | 'year', direction: 1 | -1) => {
    if (field === 'year') {
      const nextYear = Math.max(2025, Math.min(2040, pickerYear + direction));
      const maxDay = getDaysInMonth(nextYear, pickerMonth);
      setPickerYear(nextYear);
      if (pickerDay > maxDay) setPickerDay(maxDay);
      return;
    }

    if (field === 'month') {
      const nextMonth = Math.max(0, Math.min(11, pickerMonth + direction));
      const maxDay = getDaysInMonth(pickerYear, nextMonth);
      setPickerMonth(nextMonth);
      if (pickerDay > maxDay) setPickerDay(maxDay);
      return;
    }

    const maxDay = getDaysInMonth(pickerYear, pickerMonth);
    const nextDay = Math.max(1, Math.min(maxDay, pickerDay + direction));
    setPickerDay(nextDay);
  };

  const onConfirmDate = () => {
    if (!editingDate) {
      setShowDateModal(false);
      return;
    }

    const nextDate = new Date(pickerYear, pickerMonth, pickerDay);
    applyPickedDate(nextDate, editingDate);
    setShowDateModal(false);
    setEditingDate(null);
  };

  const onCancelDate = () => {
    setShowDateModal(false);
    setEditingDate(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F3F3" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Where are you going?</Text>

        <TouchableOpacity style={styles.searchBar} activeOpacity={1} onPress={() => searchInputRef.current?.focus()}>
          <Ionicons name="search-outline" size={26} color="#575757" />
          <TextInput
            ref={searchInputRef}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={addTagFromQuery}
            style={styles.searchInput}
            placeholder="City / State / Country"
            placeholderTextColor="#6A6A6A"
            returnKeyType="done"
          />
        </TouchableOpacity>

        <View style={styles.tagsRow}>
          {selectedTags.map((tag) => (
            <TouchableOpacity key={tag} style={styles.tagPill} onPress={() => onRemoveTag(tag)} activeOpacity={0.8}>
              <Text style={styles.tagPillText}>× {tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Dates:</Text>

        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[styles.datePill, { width: datePillWidth }]}
            activeOpacity={0.85}
            onPress={() => onOpenDatePicker('start')}
          >
            <Ionicons name="calendar-outline" size={19} color="#232323" />
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          <Text style={styles.toText}>to</Text>
          <TouchableOpacity
            style={[styles.datePill, { width: datePillWidth }]}
            activeOpacity={0.85}
            onPress={() => onOpenDatePicker('end')}
          >
            <Ionicons name="calendar-outline" size={19} color="#232323" />
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Trip type:</Text>

        <View style={styles.tripGrid}>
          {TRIP_TYPES.map((type) => {
            const selected = selectedTripType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.tripPill, { width: tripPillWidth }]}
                onPress={() => {
                  setSelectedTripType(type);
                  if (type === 'Other' && initialOccasion) {
                    setOtherTripType(initialOccasion);
                  }
                }}
                activeOpacity={0.85}
              >
                {selected ? (
                  <LinearGradient
                    colors={['#CDBCD2', '#B496BE']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.tripPillGradient}
                  >
                    <Text style={styles.tripPillText}>{type}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tripPillText}>{type}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.otherInputWrap} activeOpacity={1} onPress={() => otherInputRef.current?.focus()}>
          <TextInput
            ref={otherInputRef}
            value={otherTripType}
            onChangeText={setOtherTripType}
            style={styles.otherInput}
            placeholder="Other"
            placeholderTextColor="#808080"
          />
          <TouchableOpacity onPress={() => setOtherTripType('')} activeOpacity={0.8}>
            <Ionicons name="close" size={28} color="#101010" />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.generateBtn, { width: actionButtonWidth }]} onPress={onGenerate} activeOpacity={0.9}>
          <Text style={styles.generateBtnText}>Generate Outfit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.skipBtn, { width: actionButtonWidth }]} onPress={onSkip} activeOpacity={0.85}>
          <Text style={styles.skipBtnText}>Skip travel & generate</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showDateModal} animationType="slide" transparent onRequestClose={onCancelDate}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {editingDate === 'start' ? 'Start Date' : 'End Date'}</Text>
            <View style={styles.pickerRow}>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Day</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => stepPickerField('day', -1)}>
                    <Text style={styles.stepperText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{`${pickerDay}`.padStart(2, '0')}</Text>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => stepPickerField('day', 1)}>
                    <Text style={styles.stepperText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Month</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => stepPickerField('month', -1)}>
                    <Text style={styles.stepperText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{MONTH_LABELS[pickerMonth]}</Text>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => stepPickerField('month', 1)}>
                    <Text style={styles.stepperText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Year</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => stepPickerField('year', -1)}>
                    <Text style={styles.stepperText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{pickerYear}</Text>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => stepPickerField('year', 1)}>
                    <Text style={styles.stepperText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <Text style={styles.previewDate}>{`${`${pickerDay}`.padStart(2, '0')}-${`${pickerMonth + 1}`.padStart(2, '0')}-${pickerYear}`}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondaryBtn} onPress={onCancelDate} activeOpacity={0.85}>
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryBtn} onPress={onConfirmDate} activeOpacity={0.85}>
                <Text style={styles.modalPrimaryText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  content: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 4 : 8,
    paddingBottom: 44,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginLeft: -2,
  },
  backText: {
    ...typography.callout,
    color: '#1F1F1F',
  },
  heading: {
    marginTop: 18,
    textAlign: 'center',
    ...typography.title1,
    color: '#111111',
  },
  searchBar: {
    marginTop: 22,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#CDAFBA',
    backgroundColor: '#F4F4F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...typography.body,
    color: '#1D1D1D',
    height: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null),
  },
  tagsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  tagPill: {
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CFB4BE',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  tagPillText: {
    ...typography.body,
    color: '#2A2A2A',
  },
  sectionLabel: {
    marginTop: 16,
    ...typography.title3,
    color: '#202020',
  },
  dateRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePill: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dateText: {
    ...typography.title3,
    color: '#8A8A8A',
  },
  toText: {
    ...typography.title2,
    color: '#1E1E1E',
    marginHorizontal: 2,
  },
  tripGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 10,
  },
  tripPill: {
    height: 33,
    borderRadius: 16.5,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tripPillGradient: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16.5,
  },
  tripPillText: {
    ...typography.body,
    color: '#191919',
  },
  otherInputWrap: {
    marginTop: 12,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  otherInput: {
    flex: 1,
    ...typography.body,
    color: '#222222',
    height: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null),
  },
  generateBtn: {
    marginTop: 40,
    alignSelf: 'center',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#030303',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateBtnText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  skipBtn: {
    marginTop: 12,
    alignSelf: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    ...typography.headline,
    color: '#171717',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  modalTitle: {
    ...typography.title3,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  pickerRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickerCol: {
    flex: 1,
  },
  pickerLabel: {
    ...typography.footnote,
    color: '#5D5D5D',
    marginBottom: 6,
    textAlign: 'center',
  },
  stepperRow: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F7F7F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E9E9E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    ...typography.headline,
    color: '#222222',
  },
  stepperValue: {
    ...typography.subheadline,
    color: '#222222',
  },
  previewDate: {
    ...typography.callout,
    color: '#2D2D2D',
    textAlign: 'center',
    marginTop: 10,
  },
  modalActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 12,
  },
  modalSecondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
  },
  modalSecondaryText: {
    ...typography.subheadline,
    color: '#444444',
  },
  modalPrimaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    ...typography.subheadline,
    color: '#FFFFFF',
  },
});
