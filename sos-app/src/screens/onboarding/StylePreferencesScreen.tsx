import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  ImageBackground,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useUser } from '../../store/UserContext';
import { useAuth } from '../../store/AuthContext';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

interface StylePreferencesScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'StylePreferences'>;
  route: RouteProp<AuthStackParamList, 'StylePreferences'>;
}

const skinTones = [
  '#FFE5C4', '#FEE5B1', '#FDD59B', '#FBCB97',
  '#F4C193', '#F1BC87', '#D79F7E', '#CB7144',
  '#D79F67', '#B99468', '#95653F', '#7E4723',
  '#CB754B', '#894F2C', '#5D3316', '#2A1A12',
 ] as const;

const styleCards = [
  { id: 'sporty', label: 'Sporty', image: require('../../../assets/images/mosaic/fashion1.jpg') },
  { id: 'casual', label: 'Casual', image: require('../../../assets/images/mosaic/fashion2.jpg') },
  { id: 'formal', label: 'Formal', image: require('../../../assets/images/mosaic/fashion3.jpg') },
  { id: 'boho', label: 'Boho', image: require('../../../assets/images/mosaic/fashion4.jpg') },
];

/**
 * Profile setup step 3: Skin tone + style preferences.
 * Uses route profile data and persists onboarding data before completion.
 */
export const StylePreferencesScreen: React.FC<StylePreferencesScreenProps> = ({ navigation, route }) => {
  const { updateProfile } = useUser();
  const { completeOnboarding } = useAuth();
  const profileData = route.params?.profileData;
  const [selectedTone, setSelectedTone] = useState<string>(skinTones[0]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(styleCards[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedStyleLabel = useMemo(
    () => styleCards.find((card) => card.id === selectedStyleId)?.label ?? styleCards[0].label,
    [selectedStyleId]
  );

  const hydrateDob = (value: string | undefined) => {
    if (!value) return '';
    return value;
  };

  const handleContinue = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateProfile({
        name: profileData?.name ?? '',
        height: profileData?.height ?? '',
        weight: profileData?.weight ?? '',
        dob: hydrateDob(profileData?.dob),
        profileImage: profileData?.profileImage ?? null,
        stylePreferences: [selectedStyleLabel],
        colorPreferences: [selectedTone],
      });
      await completeOnboarding();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateProfile({
        name: profileData?.name ?? '',
        height: profileData?.height ?? '',
        weight: profileData?.weight ?? '',
        dob: hydrateDob(profileData?.dob),
        profileImage: profileData?.profileImage ?? null,
      });
      await completeOnboarding();
    } catch (error) {
      console.error('Error skipping style preferences:', error);
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
      >
        {/* Progress Bar (3 segments, 3rd active) */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentActive]} />
        </View>

        {/* Title Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Skin tone & Style Preferences</Text>
          <Text style={styles.subtitle}>
            Personalize color and style recommendations
          </Text>
        </View>

        {/* Skin Tone Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select your skin tone:</Text>
          <View style={styles.toneGrid}>
            {skinTones.map((tone, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.toneSquare,
                  { backgroundColor: tone },
                  selectedTone === tone && styles.toneSquareSelected
                ]}
                onPress={() => setSelectedTone(tone)}
                activeOpacity={0.8}
              />
            ))}
          </View>
        </View>

        {/* Custom Skin Tone Section */}
        <View style={styles.customToneRow}>
          <Text style={styles.sectionTitle}>Custom skin tone:</Text>
          <TouchableOpacity style={styles.colorPickerButton} activeOpacity={0.7}>
            <Ionicons name="eyedrop-outline" size={18} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Style Preference Section */}
        <View style={styles.styleSection}>
          <Text style={styles.sectionTitle}>Style preference:</Text>
          <FlatList
            data={styleCards}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.styleListContent}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.styleCard,
                  selectedStyleId === item.id && styles.styleCardSelected
                ]}
                onPress={() => setSelectedStyleId(item.id)}
                activeOpacity={0.9}
              >
                <ImageBackground source={item.image} style={styles.styleImage} imageStyle={styles.styleImageMask}>
                  <View style={styles.imageOverlay} />
                </ImageBackground>
                <View style={styles.stylePill}>
                  <Text style={styles.stylePillText}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#000000" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.9}
              disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueText}>Continue</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.skipLink} 
            activeOpacity={0.7}
            onPress={handleSkip}
            disabled={isSubmitting}
          >
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
    backgroundColor: '#FAFAFA',
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
    width: (width - 48 - 16) / 3,
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
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
    lineHeight: 38,
  },
  subtitle: {
    ...typography.subheadline,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.title3,
    color: '#000000',
    marginBottom: 16,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  toneSquare: {
    width: (width - 48 - 36) / 4,
    height: ((width - 48 - 36) / 4) * 0.7,
    borderRadius: 8,
  },
  toneSquareSelected: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  customToneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  colorPickerButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  styleSection: {
    marginBottom: 40,
  },
  styleListContent: {
    gap: 16,
    paddingRight: 24,
  },
  styleCard: {
    width: width * 0.58,
    height: width * 0.82,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  styleCardSelected: {
    borderWidth: 3,
    borderColor: '#000000',
  },
  styleImage: {
    width: '100%',
    height: '100%',
  },
  styleImageMask: {
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  stylePill: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stylePillText: {
    ...typography.subheadline,
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
  backButton: {
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
    borderRadius: 15,
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
