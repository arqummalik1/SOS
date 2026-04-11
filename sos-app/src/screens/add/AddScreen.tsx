import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontNames, typography } from '../../theme';

interface AddScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const ADD_OPTIONS = [
  {
    icon: 'camera-outline',
    label: 'Take Photo',
    description: 'Capture a new item with your camera',
    action: 'AddItemCamera',
    gradient: ['#C9A8CF', '#B79CBC'] as const,
  },
  {
    icon: 'images-outline',
    label: 'From Gallery',
    description: 'Select photos from your library',
    action: 'AddItemGallery',
    gradient: ['#B79CBC', '#9B7BA0'] as const,
  },
  {
    icon: 'scan-outline',
    label: 'Scan Item',
    description: 'Scan barcode or QR code',
    action: 'ScanItem',
    gradient: ['#9B7BA0', '#7C6A8A'] as const,
  },
];

export const AddScreen: React.FC<AddScreenProps> = ({ navigation }) => {
  const handleOptionPress = (action: string) => {
    navigation.navigate(action);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[100]} />
      
      {/* Pink/Purple Gradient Header Background */}
      <LinearGradient
        colors={['#E8D5E8', '#F3E8F3', colors.gray[100]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        style={styles.gradientHeader}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={[typography.title2, styles.headerTitle]}>Add Item</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <Text style={[typography.body, styles.subtitle]}>
          How would you like to add a new item?
        </Text>

        {/* Options Grid */}
        <View style={styles.optionsContainer}>
          {ADD_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={option.label}
              style={styles.optionCard}
              onPress={() => handleOptionPress(option.action)}
              activeOpacity={0.85}
            >
              {/* Icon with gradient background */}
              <LinearGradient
                colors={option.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <Ionicons name={option.icon as any} size={28} color="#FFFFFF" />
              </LinearGradient>

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text style={[typography.headline, styles.optionLabel]}>
                  {option.label}
                </Text>
                <Text style={[typography.footnote, styles.optionDescription]}>
                  {option.description}
                </Text>
              </View>

              {/* Arrow */}
              <Ionicons name="chevron-forward" size={20} color="#B79CBC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: '#1F2937',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    color: '#1F1F1F',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#6B7280',
  },
  bottomPadding: {
    height: 40,
  },
});
