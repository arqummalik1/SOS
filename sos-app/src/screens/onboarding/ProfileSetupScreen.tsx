import React, { useState } from 'react';
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

interface ProfileSetupScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

/**
 * ProfileSetupScreen - Replicates "Profile setup 1.png" with 100% visual fidelity.
 * Features Kyiv Sans typography, custom form fields, and a branded progress bar.
 */
export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('Jane Doe');

  return (
    <SafeContainer style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Bar (3 segments, 1st active) */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.segmentActive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
        </View>

        {/* Title Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Profile setup</Text>
          <Text style={styles.subtitle}>
            This information helps us deliver a better, more personalized experience for you.
          </Text>
        </View>

        {/* Profile Image Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoWrapper}>
            <Image 
              source={require('../../../assets/images/mosaic/fashion1.jpg')} // Using as placeholder
              style={styles.profileImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.editIconBadge} activeOpacity={0.8}>
              <View style={styles.editIconCircle}>
                <Ionicons name="pencil" size={16} color="#000000" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Your Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your name:</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#999999"
              />
            </View>
          </View>

          {/* Height & Weight Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Height:</Text>
              <TouchableOpacity style={styles.dropdownTrigger}>
                <Text style={styles.dropdownText}>160cm</Text>
                <Ionicons name="chevron-down" size={18} color="#000000" />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
              <Text style={styles.label}>Weight:</Text>
              <TouchableOpacity style={styles.dropdownTrigger}>
                <Text style={styles.dropdownText}>60kg</Text>
                <Ionicons name="chevron-down" size={18} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth:</Text>
            <View style={styles.dobRow}>
              <TouchableOpacity style={[styles.dropdownTrigger, styles.dobSegment]}>
                <Text style={styles.dropdownText}>28</Text>
                <Ionicons name="chevron-down" size={16} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dropdownTrigger, styles.dobSegmentMedium]}>
                <Text style={styles.dropdownText}>February</Text>
                <Ionicons name="chevron-down" size={16} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dropdownTrigger, styles.dobSegment]}>
                <Text style={styles.dropdownText}>2002</Text>
                <Ionicons name="chevron-down" size={16} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={() => navigation.navigate('FullBodyPhoto')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    width: (width - 48 - 24) / 4,
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
    marginBottom: 32,
  },
  title: {
    ...typography.title1,
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.subheadline,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  photoWrapper: {
    borderRadius: 28,
    overflow: 'visible', // For overlapping edit icon
  },
  profileImage: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: 28,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  editIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    ...typography.headline,
    color: '#000000',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F2F2F7',
    borderRadius: 24,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 20,
    // Subtle inner shadow effect matching design
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  textInput: {
    ...typography.callout,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F2F2F7',
    borderRadius: 24,
    height: 56,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownText: {
    ...typography.callout,
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
  buttonContainer: {
    marginTop: 16,
  },
  nextButton: {
    backgroundColor: '#111111',
    width: '100%',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
});
