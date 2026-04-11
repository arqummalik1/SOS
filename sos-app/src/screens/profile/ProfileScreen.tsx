import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../store/UserContext';
import { useOutfits } from '../../store/OutfitContext';
import { useAuth } from '../../store/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontNames } from '../../theme';
import { typography } from '../../theme/typography';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ProfileScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, clearUserData } = useUser();
  const { savedOutfits, clearSavedOutfits } = useOutfits();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    clearUserData();
    clearSavedOutfits();
    navigation.navigate('First');
  };

  const stats = [
    { label: 'Saved outfits', value: savedOutfits.length },
    { label: 'Styles', value: user?.stylePreferences?.length || 0 },
  ];

  const settings = [
    { icon: 'person-outline', label: 'Edit Profile', action: () => navigation.navigate('EditProfile') },
    { icon: 'settings-outline', label: 'Settings', action: () => navigation.navigate('Settings') },
    { icon: 'notifications-outline', label: 'Notifications', action: () => navigation.navigate('Notifications') },
    { icon: 'lock-closed-outline', label: 'Privacy', action: () => navigation.navigate('Privacy') },
    { icon: 'help-circle-outline', label: 'Help', action: () => navigation.navigate('Help') },
    { icon: 'log-out-outline', label: 'Logout', danger: true, action: handleLogout },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[100]} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Pink/Purple Gradient Header Background */}
        <LinearGradient
          colors={['#E8D5E8', '#F3E8F3', colors.gray[100]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.6 }}
          style={styles.gradientHeader}
        />

        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            {/* Profile Photo with pink ring */}
            <View style={styles.photoOuterContainer}>
              <LinearGradient
                colors={['#C9A8CF', '#B79CBC', '#9B7BA0']}
                style={styles.photoRing}
              >
                <View style={styles.photoInnerRing}>
                  {user?.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={styles.profilePhoto} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="person" size={48} color="#9B7BA0" />
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>

            {/* Name */}
            <Text style={styles.name}>{user?.name || 'Guest'}</Text>

            {/* Style Tags - Pill shaped */}
            <View style={styles.tagsContainer}>
              {user?.stylePreferences?.slice(0, 3).map((style) => (
                <View key={style} style={styles.tag}>
                  <Text style={styles.tagText}>{style}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Stats Row - 2 Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat) => (
            <TouchableOpacity
              key={stat.label}
              style={styles.statCard}
              activeOpacity={0.85}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings Menu Card */}
        <View style={styles.settingsCard}>
          {settings.map((setting, index) => (
            <TouchableOpacity
              key={setting.label}
              style={[
                styles.settingRow,
                index < settings.length - 1 && styles.settingRowBorder,
              ]}
              onPress={setting.action}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[
                  styles.iconContainer,
                  setting.danger && styles.iconContainerDanger
                ]}>
                  <Ionicons
                    name={setting.icon as any}
                    size={20}
                    color={setting.danger ? '#FF375F' : '#9B7BA0'}
                  />
                </View>
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
                size={18}
                color={setting.danger ? '#FF375F' : '#B79CBC'}
              />
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
  scrollView: {
    flex: 1,
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  profileSection: {
    alignItems: 'center',
  },
  
  // Profile Photo with Pink Ring
  photoOuterContainer: {
    width: 124,
    height: 124,
    borderRadius: 62,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9B7BA0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  photoRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    padding: 4,
  },
  photoInnerRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  profilePhoto: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  photoPlaceholder: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Name - Dark text for light theme
  name: {
    ...typography.title1,
    color: '#111111',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  
  // Style Tags - Pink pill shaped
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#E8D5E8',
    borderWidth: 1,
    borderColor: '#D4B8D9',
  },
  tagText: {
    ...typography.footnote,
    color: '#5A3D5F',
    letterSpacing: 0.2,
  },
  
  // Stats Cards - Light theme cards
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    ...typography.title2,
    color: '#111111',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    ...typography.footnote,
    color: '#666666',
    letterSpacing: 0.2,
  },
  
  // Settings Card - Light theme
  settingsCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F6F0F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDanger: {
    backgroundColor: '#FFF0F3',
  },
  settingLabel: {
    ...typography.body,
    color: '#1F1F1F',
    letterSpacing: -0.3,
  },
  settingLabelDanger: {
    ...typography.body,
    color: '#FF375F',
  },
  bottomPadding: {
    height: 32,
  },
});
