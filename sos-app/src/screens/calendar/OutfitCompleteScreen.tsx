import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

const { width, height } = Dimensions.get('window');

interface OutfitCompleteScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

type FeedbackType = 'sad' | 'neutral' | 'happy' | null;

export const OutfitCompleteScreen: React.FC<OutfitCompleteScreenProps> = ({ navigation }) => {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType>(null);

  const handleGoToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      {/* Top Section - White Background */}
      <View style={styles.topSection}>
        {/* Checkmark Icon with Sparkles */}
        <View style={styles.iconContainer}>
          {/* Left Sparkle */}
          <View style={[styles.sparkle, styles.sparkleLeft]}>
            <Ionicons name="star" size={16} color="#B8A0C0" />
          </View>
          
          {/* Checkmark Circle */}
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={40} color="#333333" />
          </View>
          
          {/* Right Sparkle */}
          <View style={[styles.sparkle, styles.sparkleRight]}>
            <Ionicons name="star" size={20} color="#B8A0C0" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Your outfit is completed</Text>
      </View>

      {/* Bottom Section - Light Purple Background */}
      <View style={styles.bottomSection}>
        {/* Feedback Section */}
        <Text style={styles.feedbackLabel}>Please share feedback</Text>
        
        <View style={styles.feedbackContainer}>
          {/* Sad Face */}
          <TouchableOpacity
            style={[
              styles.feedbackButton,
              selectedFeedback === 'sad' && styles.feedbackButtonSelected,
            ]}
            onPress={() => setSelectedFeedback('sad')}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>😞</Text>
          </TouchableOpacity>

          {/* Neutral Face */}
          <TouchableOpacity
            style={[
              styles.feedbackButton,
              selectedFeedback === 'neutral' && styles.feedbackButtonSelected,
            ]}
            onPress={() => setSelectedFeedback('neutral')}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>😐</Text>
          </TouchableOpacity>

          {/* Happy Face */}
          <TouchableOpacity
            style={[
              styles.feedbackButton,
              selectedFeedback === 'happy' && styles.feedbackButtonSelected,
            ]}
            onPress={() => setSelectedFeedback('happy')}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>😊</Text>
          </TouchableOpacity>
        </View>

        {/* Go to Dashboard Button */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={handleGoToDashboard}
          activeOpacity={0.85}
        >
          <Text style={styles.dashboardButtonText}>Go to dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.15,
    paddingBottom: 40,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleLeft: {
    left: -20,
    top: 10,
    transform: [{ rotate: '-15deg' }],
  },
  sparkleRight: {
    right: -24,
    top: 5,
    transform: [{ rotate: '15deg' }],
  },
  title: {
    fontFamily: fontNames.medium,
    fontSize: 20,
    color: '#333333',
    textAlign: 'center',
  },
  bottomSection: {
    backgroundColor: '#E8E0E8',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 50,
    alignItems: 'center',
  },
  feedbackLabel: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    color: '#333333',
    marginBottom: 20,
  },
  feedbackContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  feedbackButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  feedbackButtonSelected: {
    borderColor: '#B8A0C0',
    backgroundColor: '#F5F0F5',
  },
  emoji: {
    fontSize: 28,
  },
  dashboardButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#111111',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardButtonText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
