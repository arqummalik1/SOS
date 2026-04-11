import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontNames } from '../../theme';
import { typography } from '../../theme/typography';
import { useAuth } from '../../store/AuthContext';
import { useUser } from '../../store/UserContext';
import { useOutfits } from '../../store/OutfitContext';
import { LinearGradient } from 'expo-linear-gradient';

interface SettingsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { logout } = useAuth();
  const { user, clearUserData } = useUser();
  const { clearSavedOutfits } = useOutfits();
  const [darkMode, setDarkMode] = useState(false);

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
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={22} color="#9B7BA0" />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      {value ? (
        <View style={styles.settingValue}>
          {value}
        </View>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={20} color="#B79CBC" />
      ) : null}
    </TouchableOpacity>
  );

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
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image 
            source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }} 
            style={styles.profileAvatar} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
            <Text style={styles.profileEmail}>{user?.phone || 'No phone number'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#9B7BA0" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section - Only Dark Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'moon-outline',
              'Dark Mode',
              undefined,
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E7EB', true: '#B79CBC' }}
                thumbColor={darkMode ? '#FFFFFF' : '#9CA3AF'}
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
                <Ionicons name="information-circle-outline" size={22} color="#9B7BA0" />
              </View>
              <Text style={styles.settingLabel}>App Version</Text>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          activeOpacity={0.7}
          onPress={async () => {
            await logout();
            clearUserData();
            clearSavedOutfits();
            navigation.navigate('First');
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF375F" />
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    ...typography.headline,
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
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
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
    ...typography.headline,
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    ...typography.subheadline,
    color: '#6B7280',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F6F0F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    ...typography.footnote,
    color: '#9B7BA0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F6F0F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    ...typography.body,
    color: '#374151',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionText: {
    ...typography.body,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 8,
  },
  logoutText: {
    ...typography.body,
    color: '#FF375F',
  },
  bottomPadding: {
    height: 40,
  },
});
