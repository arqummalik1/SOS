import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BodyMeasurementsScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route?: any;
}

interface BodyType {
  id: string;
  name: string;
  description: string;
}

const bodyTypes: BodyType[] = [
  { id: 'pear', name: 'Pear', description: 'Wider hips, narrow shoulders' },
  { id: 'apple', name: 'Apple', description: 'Rounder midsection' },
  { id: 'hourglass', name: 'Hourglass', description: 'Balanced bust and hips' },
  { id: 'rectangle', name: 'Rectangle', description: 'Straight up and down' },
  { id: 'inverted', name: 'Inverted Triangle', description: 'Broad shoulders, narrow hips' },
  { id: 'oval', name: 'Oval', description: 'Fuller midsection' },
];

export const BodyMeasurementsScreen: React.FC<BodyMeasurementsScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const profileData = route?.params?.profileData || {};

  const canProceed = selectedBodyType && height && weight;

  const handleNext = () => {
    if (canProceed) {
      navigation.navigate('FullBodyPhoto', { 
        profileData: { 
          ...profileData, 
          bodyType: selectedBodyType,
          height,
          weight,
        } 
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Setup</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
        </View>

        {/* Title */}
        <Text style={styles.title}>What's your body type?</Text>
        <Text style={styles.subtitle}>
          This helps us recommend outfits that flatter your unique shape.
        </Text>

        {/* Body Type Grid */}
        <View style={styles.grid}>
          {bodyTypes.map((type) => {
            const isSelected = selectedBodyType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.bodyTypeCard,
                  isSelected && styles.bodyTypeCardSelected,
                ]}
                onPress={() => setSelectedBodyType(type.id)}
                activeOpacity={0.8}
              >
                <View style={styles.bodyTypeIcon}>
                  <View style={[
                    styles.bodyShape,
                    isSelected && styles.bodyShapeSelected,
                  ]} />
                </View>
                <Text style={[
                  styles.bodyTypeName,
                  isSelected && styles.bodyTypeNameSelected,
                ]}>
                  {type.name}
                </Text>
                <Text style={[
                  styles.bodyTypeDesc,
                  isSelected && styles.bodyTypeDescSelected,
                ]}>
                  {type.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Measurements */}
        <Text style={styles.sectionTitle}>Your Measurements</Text>
        
        <View style={styles.measurementsRow}>
          <View style={styles.measurementInput}>
            <Text style={styles.label}>Height (cm)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="170"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>
          
          <View style={styles.measurementInput}>
            <Text style={styles.label}>Weight (kg)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="65"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Next Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, canProceed && styles.nextButtonActive]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={[styles.nextButtonText, canProceed && styles.nextButtonTextActive]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  progressBar: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressBarActive: {
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  bodyTypeCard: {
    width: '31%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bodyTypeCardSelected: {
    backgroundColor: '#1F2937',
  },
  bodyTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bodyShape: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
  },
  bodyShapeSelected: {
    backgroundColor: '#1F2937',
  },
  bodyTypeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  bodyTypeNameSelected: {
    color: '#FFFFFF',
  },
  bodyTypeDesc: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  bodyTypeDescSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  measurementsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  measurementInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 17,
    color: '#1F2937',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  nextButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#1F2937',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  nextButtonTextActive: {
    color: '#FFFFFF',
  },
});
