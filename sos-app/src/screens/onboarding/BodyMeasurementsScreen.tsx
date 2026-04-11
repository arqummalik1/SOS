import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

interface BodyMeasurementsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

interface BodyType {
  id: string;
  name: string;
  // TODO: Replace with real silhouette images
  // Place .png silhouette assets in 'src/assets/images/shapes/'
  // and import them here.
  image: any; 
}

const bodyTypes: BodyType[] = [
  { id: 'apple', name: 'Apple', image: require('../../../assets/images/mosaic/fashion1.jpg') },
  { id: 'rectangle', name: 'Rectangle', image: require('../../../assets/images/mosaic/fashion2.jpg') },
  { id: 'triangle', name: 'Triangle', image: require('../../../assets/images/mosaic/fashion3.jpg') },
  { id: 'hourglass', name: 'Hourglass', image: require('../../../assets/images/mosaic/fashion4.jpg') },
  { id: 'inverted_triangle', name: 'Inverted Triangle', image: require('../../../assets/images/mosaic/fashion5.jpg') },
  { id: 'pear', name: 'Pear', image: require('../../../assets/images/mosaic/fashion6.jpg') },
];

/**
 * BodyMeasurementsScreen - Replicates "Profile setup 2.png" with 100% visual fidelity.
 * Features body shape selection grid, custom input, and 3-segment progress indicator.
 */
export const BodyMeasurementsScreen: React.FC<BodyMeasurementsScreenProps> = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState<string>('pear');
  const [customValue, setCustomValue] = useState('Pear');

  return (
    <SafeContainer style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Bar (3 segments, 2nd active as per user correction) */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentActive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
        </View>

        {/* Title Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Bodyshape</Text>
          <Text style={styles.subtitle}>
            Personalize body measurements for accurate recommendations
          </Text>
        </View>

        {/* Body Types Grid (2x3) */}
        <View style={styles.grid}>
          {bodyTypes.map((type) => (
            <TouchableOpacity 
              key={type.id}
              style={[
                styles.card,
                selectedType === type.id && styles.cardSelected
              ]}
              onPress={() => setSelectedType(type.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <Text style={[
                  styles.cardText,
                  selectedType === type.id && styles.cardTextActive
                ]}>
                  {type.name}
                </Text>
                
                {/* Silhouette Image Placeholder */}
                <View style={styles.imageWrapper}>
                   <Image 
                    source={type.image} 
                    style={styles.silhouetteImage} 
                    resizeMode="contain" 
                    // Using low-opacity style for placeholder look
                  />
                </View>

                {/* Info Icon */}
                <TouchableOpacity style={styles.infoButton} activeOpacity={0.6}>
                  <Ionicons name="information-circle-outline" size={14} color="rgba(0,0,0,0.3)" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Input Section */}
        <View style={styles.customSection}>
          <Text style={styles.customLabel}>Custom:</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.textInput}
              value={customValue}
              onChangeText={setCustomValue}
              placeholder="Pear"
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.backIconButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#000000" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => navigation.navigate('StylePreferences', { profileData: {} })}
              activeOpacity={0.9}
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.skipLink} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now</Text>
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
    width: (width - 48 - 16) / 3, // 3 segments
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
    marginBottom: 40,
  },
  title: {
    ...typography.largeTitle,
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.subheadline,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  card: {
    width: (width - 48 - 12) / 2,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    padding: 16,
    // Pixel-perfect card shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: '#000000',
    borderWidth: 2,
    shadowOpacity: 0.08,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardText: {
    ...typography.headline,
    color: '#000000',
    flex: 1,
    zIndex: 2,
  },
  cardTextActive: {
    // Optional additional styling for active text
  },
  imageWrapper: {
    width: 70,
    height: '140%', // Overflow slightly for styling
    position: 'absolute',
    right: -10,
    top: -10,
    zIndex: 1,
  },
  silhouetteImage: {
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  infoButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 3,
  },
  customSection: {
    marginBottom: 40,
  },
  customLabel: {
    ...typography.title3,
    color: '#000000',
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F2F2F7',
    borderRadius: 24,
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  footer: {
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backIconButton: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#000000',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  continueText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    ...typography.subheadline,
    color: '#666666',
  },
});
