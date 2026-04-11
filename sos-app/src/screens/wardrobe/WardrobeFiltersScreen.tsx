import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontNames, typography } from '../../theme';

type WardrobeFiltersScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Dresses', 'Accessories'];
const SEASONS = ['All Season', 'Summer', 'Winter', 'Monsoon', 'Spring', 'Fall'];
const OCCASIONS = ['Casual', 'Formal', 'Party', 'Sport', 'Work', 'Travel', 'Date Night', 'Lounge'];
const BRANDS = ['Allen Solly', 'Puma', "Levi's", 'Zara', 'H&M', 'Calvin Klein', 'Peter England'];
const SIZES = ['XS', 'S', 'M', 'L', '2XL', 'XL'];
const WEAR_FREQUENCY = ['Never', 'Rarely', 'Sometimes', 'Often'];
const COLOR_SWATCHES = ['#EF2528', '#66C8DB', '#D86B1F', '#000000', '#5E73E8', '#E23D9A', '#39A9B4', 'mixed'];

const pinkSelected = '#B79CBC';

const formatDate = (date: Date) => {
  const dd = `${date.getDate()}`.padStart(2, '0');
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const monthLabel = (date: Date) =>
  date.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

export const WardrobeFiltersScreen: React.FC<WardrobeFiltersScreenProps> = ({ navigation }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('All Season');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('Casual');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedWear, setSelectedWear] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 2, 1));

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState<Date>(new Date(2026, 2, 1));

  const daysGrid = useMemo(() => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [pickerMonth]);

  const toggleMulti = (current: string[], value: string, setter: (next: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }
    setter([...current, value]);
  };

  const onClearAll = () => {
    setSelectedCategories([]);
    setSelectedColor('');
    setSelectedSeason('');
    setSelectedOccasion('');
    setSelectedBrands([]);
    setSelectedSize('');
    setSelectedWear([]);
    setSelectedDate(new Date(2026, 2, 1));
  };

  const onApply = () => {
    navigation.goBack();
  };

  const onPickDay = (day: number) => {
    const next = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), day);
    setSelectedDate(next);
    setShowDatePicker(false);
  };

  const shiftMonth = (delta: number) => {
    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + delta, 1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Search Filters</Text>
          <Text style={styles.subtitle}>Advanced filtering options</Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color="#7A7A7A" />
          <Text style={styles.searchPlaceholder}>Search Your Wardrobe</Text>
        </View>

        <Text style={styles.sectionTitle}>Category:</Text>
        <View style={styles.checkboxGrid}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.checkboxItem}
              activeOpacity={0.8}
              onPress={() => toggleMulti(selectedCategories, item, setSelectedCategories)}
            >
              <View style={[styles.checkbox, selectedCategories.includes(item) && styles.checkboxSelected]} />
              <Text style={styles.checkboxText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Color:</Text>
        <View style={styles.colorRow}>
          {COLOR_SWATCHES.map((swatch) => {
            const active = selectedColor === swatch;
            if (swatch === 'mixed') {
              return (
                <TouchableOpacity
                  key={swatch}
                  style={[styles.colorCircle, active && styles.colorCircleActive]}
                  onPress={() => setSelectedColor(swatch)}
                  activeOpacity={0.8}
                >
                  <View style={styles.mixedOuter}>
                    <View style={styles.mixedHalfWhite} />
                    <View style={styles.mixedHalfBlack} />
                    <Text style={styles.mixedDot}>•</Text>
                  </View>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={swatch}
                style={[
                  styles.colorCircle,
                  { backgroundColor: swatch },
                  active && styles.colorCircleActive,
                  swatch === '#000000' && styles.blackCircle,
                ]}
                onPress={() => setSelectedColor(swatch)}
                activeOpacity={0.8}
              />
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Season:</Text>
        <View style={styles.pillGrid}>
          {SEASONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.pill, selectedSeason === item && styles.pillSelected]}
              onPress={() => setSelectedSeason(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, selectedSeason === item && styles.pillTextSelected]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Occasion:</Text>
        <View style={styles.pillGrid}>
          {OCCASIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.pill, selectedOccasion === item && styles.pillSelected]}
              onPress={() => setSelectedOccasion(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, selectedOccasion === item && styles.pillTextSelected]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Brand:</Text>
        <View style={styles.checkboxGrid}>
          {BRANDS.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.checkboxItem}
              activeOpacity={0.8}
              onPress={() => toggleMulti(selectedBrands, item, setSelectedBrands)}
            >
              <View style={[styles.checkbox, selectedBrands.includes(item) && styles.checkboxSelected]} />
              <Text style={styles.checkboxText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Size:</Text>
        <View style={styles.pillGrid}>
          {SIZES.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.pill, selectedSize === item && styles.pillSelected]}
              onPress={() => setSelectedSize(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, selectedSize === item && styles.pillTextSelected]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Wear frequency:</Text>
        <View style={styles.checkboxGrid}>
          {WEAR_FREQUENCY.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.checkboxItem}
              activeOpacity={0.8}
              onPress={() => toggleMulti(selectedWear, item, setSelectedWear)}
            >
              <View style={[styles.checkbox, selectedWear.includes(item) && styles.checkboxSelected]} />
              <Text style={styles.checkboxText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Date added:</Text>
        <TouchableOpacity style={styles.dateInput} activeOpacity={0.8} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={14} color="#1E1E1E" />
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>

        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity style={styles.clearButton} onPress={onClearAll} activeOpacity={0.85}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={onApply} activeOpacity={0.85}>
            <Text style={styles.applyButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
          <Pressable style={styles.datePickerCard}>
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => shiftMonth(-1)}>
                <Ionicons name="chevron-back" size={18} color="#242424" />
              </TouchableOpacity>
              <Text style={styles.monthText}>{monthLabel(pickerMonth)}</Text>
              <TouchableOpacity onPress={() => shiftMonth(1)}>
                <Ionicons name="chevron-forward" size={18} color="#242424" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdaysRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <Text key={day} style={styles.weekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {daysGrid.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const active =
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === pickerMonth.getMonth() &&
                  selectedDate.getFullYear() === pickerMonth.getFullYear();

                return (
                  <TouchableOpacity
                    key={`${day}`}
                    style={[styles.dayCell, active && styles.dayCellActive]}
                    onPress={() => onPickDay(day)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 14 : 24,
    paddingBottom: 110,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    ...typography.largeTitle,
    color: '#181818',
  },
  subtitle: {
    marginTop: 2,
    ...typography.small,
    color: '#3B3B3B',
  },
  searchBar: {
    marginTop: 10,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#D7BCC3',
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchPlaceholder: {
    marginLeft: 7,
    ...typography.small,
    color: '#6E6E6E',
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 9,
    ...typography.title2,
    color: '#222222',
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  checkboxItem: {
    width: '33.33%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  checkbox: {
    width: 13,
    height: 13,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#C9C8C0',
    backgroundColor: '#ECECE6',
    marginRight: 7,
  },
  checkboxSelected: {
    backgroundColor: pinkSelected,
    borderColor: '#AB8EAF',
  },
  checkboxText: {
    ...typography.caption1,
    color: '#2B2B2B',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 13,
  },
  colorCircle: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
  },
  colorCircleActive: {
    borderWidth: 1.5,
    borderColor: '#474747',
  },
  blackCircle: {
    borderWidth: 0.8,
    borderColor: '#444',
  },
  mixedOuter: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2E2E2E',
    flexDirection: 'row',
  },
  mixedHalfWhite: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  mixedHalfBlack: {
    flex: 1,
    backgroundColor: '#111111',
  },
  mixedDot: {
    position: 'absolute',
    left: 5.5,
    top: 1,
    fontSize: typography.caption2.fontSize,
    color: '#111111',
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  pill: {
    width: '31.3%',
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: pinkSelected,
    borderColor: '#B095B4',
  },
  pillText: {
    ...typography.caption1,
    color: '#2E2E2E',
  },
  pillTextSelected: {
    color: '#302A31',
    ...typography.subheadline,
  },
  dateInput: {
    width: 108,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#ECECEC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 7,
  },
  dateText: {
    ...typography.caption1,
    color: '#8A8A8A',
  },
  bottomButtonsRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    width: '47%',
    height: 43,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    ...typography.small,
    color: '#242424',
  },
  applyButton: {
    width: '47%',
    height: 43,
    borderRadius: 10,
    backgroundColor: '#060606',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    ...typography.small,
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 26,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  datePickerCard: {
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthText: {
    ...typography.callout,
    color: '#242424',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    width: 32,
    textAlign: 'center',
    ...typography.caption1,
    color: '#7A7A7A',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
  },
  dayCellActive: {
    backgroundColor: pinkSelected,
  },
  dayText: {
    ...typography.caption1,
    color: '#2E2E2E',
  },
  dayTextActive: {
    ...typography.subheadline,
  },
});
