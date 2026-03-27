import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StylePreferencesScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route?: any;
}

interface StyleOption {
  id: string;
  name: string;
  icon: string;
}

const styleOptions: StyleOption[] = [
  { id: 'classic', name: 'Classic', icon: 'shirt-outline' },
  { id: 'casual', name: 'Casual', icon: 'home-outline' },
  { id: 'chic', name: 'Chic', icon: 'diamond-outline' },
  { id: 'artsy', name: 'Artsy', icon: 'color-palette-outline' },
  { id: 'minimalist', name: 'Minimalist', icon: 'remove-outline' },
  { id: 'bohemian', name: 'Bohemian', icon: 'flower-outline' },
];

export const StylePreferencesScreen: React.FC<StylePreferencesScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const profileData = route?.params?.profileData || {};

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleNext = () => {
    if (selectedStyles.length > 0) {
      navigation.navigate('BodyMeasurements', { 
        profileData: { ...profileData, stylePreferences: selectedStyles } 
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
          <View style={styles.progressBar} />
        </View>

        {/* Title */}
        <Text style={styles.title}>What are your favorite styles?</Text>
        <Text style={styles.subtitle}>
          Select all that apply to you. This helps us curate outfits that match your taste.
        </Text>

        {/* Style Grid */}
        <View style={styles.grid}>
          {styleOptions.map((style) => {
            const isSelected = selectedStyles.includes(style.id);
            return (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  isSelected && styles.styleCardSelected,
                ]}
                onPress={() => toggleStyle(style.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.iconContainer,
                  isSelected && styles.iconContainerSelected,
                ]}>
                  <Ionicons 
                    name={style.icon as any} 
                    size={28} 
                    color={isSelected ? '#FFFFFF' : '#6B7280'} 
                  />
                </View>
                <Text style={[
                  styles.styleName,
                  isSelected && styles.styleNameSelected,
                ]}>
                  {style.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={20} color="#1F2937" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, selectedStyles.length > 0 && styles.nextButtonActive]}
          onPress={handleNext}
          disabled={selectedStyles.length === 0}
        >
          <Text style={[styles.nextButtonText, selectedStyles.length > 0 && styles.nextButtonTextActive]}>
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
    gap: 16,
    justifyContent: 'space-between',
  },
  styleCard: {
    width: '47%',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  styleCardSelected: {
    backgroundColor: '#1F2937',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  styleName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  styleNameSelected: {
    color: '#FFFFFF',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
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
