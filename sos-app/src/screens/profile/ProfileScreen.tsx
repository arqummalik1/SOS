import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { GradientBackground } from '../../components/layout/GradientBackground';
import { GlassView } from '../../components/ui/GlassView';
import { useUser } from '../../store/UserContext';
import { useOutfits } from '../../store/OutfitContext';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ProfileScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, updateProfile } = useUser();
  const { savedOutfits } = useOutfits();

  const stats = [
    { label: 'Saved outfits', value: savedOutfits.length },
    { label: 'Styles', value: user?.stylePreferences?.length || 0 },
    { label: 'Following', value: 0 },
  ];

  const settings = [
    { icon: 'person-outline', label: 'Edit Profile', action: () => navigation.navigate('EditProfile') },
    { icon: 'settings-outline', label: 'Settings', action: () => navigation.navigate('Settings') },
    { icon: 'shirt-outline', label: 'My Wardrobe', action: () => navigation.navigate('Wardrobe') },
    { icon: 'cut-outline', label: 'Book Stylist', action: () => navigation.navigate('Stylist') },
    { icon: 'notifications-outline', label: 'Notifications', action: () => navigation.navigate('Notifications') },
    { icon: 'lock-closed-outline', label: 'Privacy', action: () => navigation.navigate('Privacy') },
    { icon: 'help-circle-outline', label: 'Help', action: () => navigation.navigate('Help') },
    { icon: 'log-out-outline', label: 'Logout', danger: true, action: () => {} },
  ];

  return (
    <GradientBackground>
      <SafeContainer>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.photoContainer}>
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.profilePhoto} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="person" size={40} color="rgba(255,255,255,0.5)" />
                  </View>
                )}
              </View>
              <Text style={styles.name}>{user?.name || 'Guest'}</Text>
              <View style={styles.tagsContainer}>
                {user?.stylePreferences?.slice(0, 3).map((style) => (
                  <GlassView key={style} intensity="thin" borderRadius={100} style={styles.tag}>
                    <Text style={styles.tagText}>{style}</Text>
                  </GlassView>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <GlassView
                key={stat.label}
                intensity="thin"
                borderRadius={20}
                style={styles.statCard}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </GlassView>
            ))}
          </View>

          <GlassView intensity="thin" borderRadius={24} style={styles.settingsCard}>
            {settings.map((setting, index) => (
              <TouchableOpacity
                key={setting.label}
                style={[
                  styles.settingRow,
                  index < settings.length - 1 && styles.settingRowBorder,
                ]}
                onPress={setting.action}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name={setting.icon as any}
                    size={22}
                    color={setting.danger ? '#FF375F' : 'rgba(255,255,255,0.8)'}
                  />
                  <Text
                    style={[
                      styles.settingLabel,
                      setting.danger && styles.settingLabelDanger,
                    ]}
                  >
                    {setting.label}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={setting.danger ? '#FF375F' : 'rgba(255,255,255,0.5)'}
                />
              </TouchableOpacity>
            ))}
          </GlassView>
        </ScrollView>
      </SafeContainer>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  profileSection: {
    alignItems: 'center',
  },
  photoContainer: {
    marginBottom: spacing.lg,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  name: {
    fontSize: typography.title2.fontSize,
    fontWeight: typography.title2.fontWeight,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontSize: typography.caption1.fontSize,
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.title2.fontSize,
    fontWeight: typography.title2.fontWeight,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.caption1.fontSize,
    color: 'rgba(255,255,255,0.7)',
  },
  settingsCard: {
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    fontSize: typography.body.fontSize,
    color: '#FFFFFF',
  },
  settingLabelDanger: {
    color: '#FF375F',
  },
});
