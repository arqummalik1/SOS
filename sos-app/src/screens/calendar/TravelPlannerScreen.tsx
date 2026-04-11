import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontNames } from '../../theme';
import { typography } from '../../theme/typography';

type TravelPlannerScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const INITIAL_TAGS = ['France', 'London'];
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
];

export const FirstScreen: React.FC<TravelPlannerScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState('City / State / Country');
  const [selectedTags, setSelectedTags] = useState<string[]>(INITIAL_TAGS);
  const [selectedTripType, setSelectedTripType] = useState<string>('Leisure');
  const [startDate, setStartDate] = useState<string>('01-03-2026');
  const [endDate, setEndDate] = useState<string>('07-03-2026');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingDate, setEditingDate] = useState<'start' | 'end'>('start');
  const [tempDate, setTempDate] = useState<string>('');

  const onRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((item) => item !== tag));
  };

  const onGenerate = () => {
    navigation.navigate('MultipleOutfits');
  };

  const onSkip = () => {
    Alert.alert('Skip travel & generate', 'Travel skipped');
  };

  const onOpenDatePicker = (type: 'start' | 'end') => {
    setEditingDate(type);
    setTempDate(type === 'start' ? startDate : endDate);
    setShowDatePicker(true);
  };

  const onConfirmDate = () => {
    if (editingDate === 'start') {
      setStartDate(tempDate);
    } else {
      setEndDate(tempDate);
    }
    setShowDatePicker(false);
  };

  const onCancelDate = () => {
    setShowDatePicker(false);
  };

  const remainingTag = useMemo(() => selectedTags[0], [selectedTags]);

  const searchInputRef = React.useRef<TextInput>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[100]} />

      <View style={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Where are you going?</Text>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => searchInputRef.current?.focus()}
          activeOpacity={0.85}
        >
          <Ionicons name="search" size={24} color="#575757" />
          <TextInput
            ref={searchInputRef}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholder="City / State / Country"
            placeholderTextColor="#6A6A6A"
            pointerEvents="none"
          />
        </TouchableOpacity>

        <View style={styles.tagsRow}>
          {selectedTags.map((tag) => (
            <TouchableOpacity key={tag} style={styles.tagPill} onPress={() => onRemoveTag(tag)} activeOpacity={0.85}>
              <Text style={styles.tagPillText}>× {tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Dates:</Text>

        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.datePill} activeOpacity={0.85} onPress={() => onOpenDatePicker('start')}>
            <Ionicons name="calendar-outline" size={18} color="#232323" />
            <Text style={styles.dateText}>{startDate}</Text>
          </TouchableOpacity>
          <Text style={styles.toText}>to</Text>
          <TouchableOpacity style={styles.datePill} activeOpacity={0.85} onPress={() => onOpenDatePicker('end')}>
            <Ionicons name="calendar-outline" size={18} color="#232323" />
            <Text style={styles.dateText}>{endDate}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Trip type:</Text>

        <View style={styles.tripGrid}>
          {TRIP_TYPES.map((type) => {
            const selected = selectedTripType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.tripPill, selected && styles.tripPillSelected]}
                onPress={() => setSelectedTripType(type)}
                activeOpacity={0.85}
              >
                <Text style={styles.tripPillText}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.otherInputWrap}>
          <Text style={styles.otherInputText}>{remainingTag ?? 'Other'}</Text>
          <TouchableOpacity onPress={() => setSelectedTags([])} activeOpacity={0.8}>
            <Ionicons name="close" size={30} color="#101010" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.generateBtn} onPress={onGenerate} activeOpacity={0.9}>
          <Text style={styles.generateBtnText}>Generate Outfit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.85}>
          <Text style={styles.skipBtnText}>Skip travel & generate</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={showDatePicker}
        onRequestClose={onCancelDate}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select {editingDate === 'start' ? 'Start' : 'End'} Date
            </Text>

            <View style={styles.dateInputWrap}>
              <Ionicons name="calendar" size={24} color="#575757" />
              <TextInput
                value={tempDate}
                onChangeText={setTempDate}
                style={styles.dateInput}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#8A8A8A"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={onCancelDate} activeOpacity={0.85}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={onConfirmDate} activeOpacity={0.85}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export const TravelPlannerScreen = FirstScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
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
    marginTop: 24,
    textAlign: 'center',
    ...typography.title1,
    color: '#111111',
  },
  searchBar: {
    marginTop: 24,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#CEB7BF',
    backgroundColor: '#F7F7F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...typography.body,
    color: '#606060',
    paddingVertical: 0,
  },
  tagsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  tagPill: {
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CEB7BF',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  tagPillText: {
    ...typography.body,
    color: '#2A2A2A',
  },
  sectionLabel: {
    marginTop: 16,
    ...typography.callout,
    color: '#202020',
  },
  dateRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePill: {
    width: 158,
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
    paddingHorizontal: 14,
    gap: 10,
  },
  dateText: {
    ...typography.subheadline,
    color: '#8A8A8A',
  },
  toText: {
    ...typography.title2,
    color: '#1E1E1E',
  },
  tripGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 10,
  },
  tripPill: {
    width: '31.4%',
    height: 33,
    borderRadius: 16.5,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripPillSelected: {
    backgroundColor: '#B79CBC',
    borderColor: '#B79CBC',
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
  otherInputText: {
    ...typography.body,
    color: '#737373',
  },
  generateBtn: {
    marginTop: 40,
    alignSelf: 'center',
    width: 258,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#030303',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateBtnText: {
    ...typography.body,
    color: '#FFFFFF',
  },
  skipBtn: {
    marginTop: 12,
    alignSelf: 'center',
    width: 258,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    ...typography.body,
    color: '#171717',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    ...typography.title3,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#CEB7BF',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 10,
  },
  dateInput: {
    flex: 1,
    ...typography.body,
    color: '#606060',
    paddingVertical: 0,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    ...typography.subheadline,
    color: '#555555',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#030303',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    ...typography.subheadline,
    color: '#FFFFFF',
  },
});
