import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { GlassView } from '../../components/ui/GlassView';
import { spacing } from '../../theme/spacing';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

interface PrivacyScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState({
    publicProfile: true,
    showSavedOutfits: false,
    allowRecommendations: true,
    shareAnalytics: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderToggle = (
    label: string,
    description: string,
    key: keyof typeof settings
  ) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => toggleSetting(key)}
        trackColor={{ false: '#D1D1D6', true: '#BF5AF2' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <SafeContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Privacy</Text>
          {renderToggle(
            'Public Profile',
            'Allow others to see your profile and style preferences',
            'publicProfile'
          )}
          {renderToggle(
            'Show Saved Outfits',
            'Display your saved outfits on your public profile',
            'showSavedOutfits'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Analytics</Text>
          {renderToggle(
            'Personalized Recommendations',
            'Allow us to suggest outfits based on your preferences',
            'allowRecommendations'
          )}
          {renderToggle(
            'Share Usage Analytics',
            'Help improve the app by sharing anonymous usage data',
            'shareAnalytics'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionText}>Download My Data</Text>
            <Ionicons name="download-outline" size={20} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionTextDanger}>Delete Account</Text>
            <Ionicons name="trash-outline" size={20} color="#FF375F" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.headline,
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.subheadline,
    color: '#666666',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  rowText: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowLabel: {
    ...typography.body,
    color: '#000000',
    marginBottom: spacing.xs,
  },
  rowDescription: {
    ...typography.caption1,
    color: '#666666',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  actionText: {
    ...typography.body,
    color: '#000000',
  },
  actionTextDanger: {
    ...typography.body,
    color: '#FF375F',
  },
});
