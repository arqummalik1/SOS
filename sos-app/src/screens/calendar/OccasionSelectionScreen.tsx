import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontNames } from '../../theme';
import { typography } from '../../theme/typography';

type OccasionSelectionScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type OccasionOption = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

const OPTIONS: OccasionOption[] = [
  { key: 'casual', label: 'Casual', icon: <Ionicons name="shirt-outline" size={32} color="#D0BED4" /> },
  { key: 'formal', label: 'Formal', icon: <Ionicons name="footsteps-outline" size={32} color="#D0BED4" /> },
  { key: 'party', label: 'Party', icon: <Ionicons name="sparkles-outline" size={32} color="#D0BED4" /> },
  { key: 'sport', label: 'Sport', icon: <Ionicons name="football-outline" size={32} color="#D0BED4" /> },
  { key: 'work', label: 'Work', icon: <Ionicons name="briefcase-outline" size={32} color="#D0BED4" /> },
  { key: 'travel', label: 'Travel', icon: <Ionicons name="airplane-outline" size={32} color="#D0BED4" /> },
  { key: 'date-night', label: 'Date Night', icon: <Ionicons name="moon" size={32} color="#D0BED4" /> },
  { key: 'lounge', label: 'Lounge', icon: <MaterialCommunityIcons name="sofa-outline" size={32} color="#D0BED4" /> },
];

export const FirstScreen: React.FC<OccasionSelectionScreenProps> = ({ navigation }) => {
  const [selectedOccasion, setSelectedOccasion] = useState<string>('casual');
  const [isCustomSelected, setIsCustomSelected] = useState(false);

  const onSelectOccasion = (key: string) => {
    setSelectedOccasion(key);
    setIsCustomSelected(false);
  };

  const onSelectCustom = () => {
    setIsCustomSelected(true);
  };

  const onContinue = () => {
    navigation.navigate('TravelPlanner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[100]} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>What's the occasion</Text>

        <View style={styles.grid}>
          {OPTIONS.map((option) => {
            const selected = !isCustomSelected && selectedOccasion === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.optionCard, selected && styles.optionCardSelected]}
                onPress={() => onSelectOccasion(option.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option.label}</Text>
                <View style={styles.iconWrap}>{option.icon}</View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.customBtn, isCustomSelected && styles.customBtnSelected]}
          onPress={onSelectCustom}
          activeOpacity={0.85}
        >
          <Ionicons name="create" size={15} color="#020202" />
          <Text style={styles.customBtnText}>Custom</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.9}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export const OccasionSelectionScreen = FirstScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    paddingBottom: 132,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginLeft: -2,
  },
  backText: {
    marginLeft: 4,
    ...typography.body,
    color: '#1F1F1F',
  },
  heading: {
    marginTop: 18,
    textAlign: 'center',
    ...typography.largeTitle,
    color: '#111111',
  },
  grid: {
    marginTop: 26,
    rowGap: 14,
  },
  optionCard: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    height: 88,
    borderRadius: 14,
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardSelected: {
    backgroundColor: '#B79CBC',
    borderColor: '#B79CBC',
  },
  optionLabel: {
    ...typography.body,
    lineHeight: 22,
    color: '#474135',
  },
  optionLabelSelected: {
    color: '#111111',
  },
  iconWrap: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBtn: {
    marginTop: 26,
    alignSelf: 'center',
    height: 40,
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 7,
  },
  customBtnSelected: {
    backgroundColor: '#ECE2EF',
  },
  customBtnText: {
    ...typography.subheadline,
    lineHeight: 20,
    color: '#111111',
  },
  continueBtn: {
    marginTop: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#030303',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    ...typography.body,
    color: '#FFFFFF',
  },
});
