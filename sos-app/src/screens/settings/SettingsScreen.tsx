import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const user = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  };

  const renderSettingItem = (
    icon: string,
    label: string,
    onPress?: () => void,
    value?: React.ReactNode
  ) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={22} color="#6B7280" />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      {value ? (
        <View style={styles.settingValue}>
          {value}
        </View>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'notifications-outline',
              'Notifications',
              undefined,
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E5E7EB', true: '#7C3AED' }}
                thumbColor={notifications ? '#FFFFFF' : '#9CA3AF'}
              />
            )}
            {renderSettingItem(
              'moon-outline',
              'Dark Mode',
              undefined,
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E7EB', true: '#7C3AED' }}
                thumbColor={darkMode ? '#FFFFFF' : '#9CA3AF'}
              />
            )}
            {renderSettingItem(
              'location-outline',
              'Location Services',
              undefined,
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
                trackColor={{ false: '#E5E7EB', true: '#7C3AED' }}
                thumbColor={locationServices ? '#FFFFFF' : '#9CA3AF'}
              />
            )}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'person-outline',
              'Edit Profile',
              () => navigation.navigate('EditProfile')
            )}
            {renderSettingItem(
              'lock-closed-outline',
              'Change Password',
              () => {}
            )}
            {renderSettingItem(
              'shield-outline',
              'Privacy',
              () => navigation.navigate('Privacy')
            )}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'help-circle-outline',
              'Help Center',
              () => navigation.navigate('Help')
            )}
            {renderSettingItem(
              'mail-outline',
              'Contact Us',
              () => {}
            )}
            {renderSettingItem(
              'document-text-outline',
              'Terms of Service',
              () => {}
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="information-circle-outline" size={22} color="#6B7280" />
              </View>
              <Text style={styles.settingLabel}>App Version</Text>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  bottomPadding: {
    height: 40,
  },
});
