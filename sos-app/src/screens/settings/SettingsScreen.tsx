import React, { useState, useCallback } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../theme/typography';
import { useUser } from '../../store/UserContext';
import { ApiError } from '../../api/errors';

interface SettingsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

type ToggleKey =
  | 'pushNotifications'
  | 'outfitReminders'
  | 'trendAlerts'
  | 'weeklyPlanner'
  | 'emailNotifications'
  | 'calendarAccess'
  | 'locationAccess'
  | 'photoLibraryAccess'
  | 'contactsAccess';

const sectionSpacing = {
  top: 26,
  section: 20,
  row: 14,
};

const TextRow: React.FC<{ label: string; onPress?: () => void }> = ({ label, onPress }) => (
  <TouchableOpacity
    style={styles.textRow}
    onPress={onPress}
    disabled={onPress == null}
    activeOpacity={0.7}
  >
    <Text style={styles.textRowLabel}>{label}</Text>
  </TouchableOpacity>
);

const ToggleRow: React.FC<{
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}> = ({ label, value, onValueChange }) => (
  <View style={styles.toggleRow}>
    <Text style={styles.textRowLabel}>{label}</Text>
    <Pressable
      style={styles.toggleHitbox}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={styles.toggleTrack}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </Pressable>
  </View>
);

const SectionBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.sectionBlock}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { user, refreshProfile } = useUser();
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const contentWidth = Math.min(380, width - 32);
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    pushNotifications: true,
    outfitReminders: true,
    trendAlerts: true,
    weeklyPlanner: true,
    emailNotifications: true,
    calendarAccess: true,
    locationAccess: true,
    photoLibraryAccess: true,
    contactsAccess: true,
  });

  const setToggle = (key: ToggleKey) => (next: boolean) =>
    setToggles((current) => ({
      ...current,
      [key]: next,
    }));

  const showRowFeedback = (label: string) => {
    const message = `${label} clicked`;
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
      return;
    }
    Alert.alert('Setting', message);
  };

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setIsRefreshingProfile(true);
      void refreshProfile()
        .catch((error) => {
          if (cancelled) {
            return;
          }
          if (error instanceof ApiError) {
            console.warn('[SOS_SETTINGS] Profile refresh failed', error.code);
            return;
          }
          console.warn('[SOS_SETTINGS] Profile refresh failed', error);
        })
        .finally(() => {
          if (!cancelled) {
            setIsRefreshingProfile(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [refreshProfile])
  );

  const dash = (v: string | null | undefined) => (v && String(v).trim() ? String(v).trim() : '—');

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { width: contentWidth }]}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={16} color="#121212" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setting</Text>
        {isRefreshingProfile ? (
          <View style={styles.headerSpinner} accessibilityLabel="Loading profile">
            <ActivityIndicator size="small" color="#6B5B45" />
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { width: contentWidth }]}>
        <SectionBlock title="Your profile">
          <DetailRow label="Name" value={dash(user?.name)} />
          <DetailRow label="Phone" value={dash(user?.phone)} />
          <DetailRow label="Email" value={dash(user?.email)} />
          <DetailRow label="Height" value={dash(user?.height)} />
          <DetailRow label="Weight" value={dash(user?.weight)} />
          <DetailRow label="Date of birth" value={dash(user?.dob)} />
          <DetailRow label="Body shape" value={dash(user?.bodyShape)} />
          <DetailRow label="Skin tone" value={dash(user?.skinTone)} />
          <DetailRow
            label="Style preferences"
            value={
              user?.stylePreferences?.length
                ? user.stylePreferences.join(', ')
                : '—'
            }
          />
          <TouchableOpacity
            style={styles.editProfileLink}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.75}
          >
            <Text style={styles.editProfileLinkText}>Edit profile</Text>
            <Ionicons name="chevron-forward" size={18} color="#6B5B45" />
          </TouchableOpacity>
        </SectionBlock>

        <SectionBlock title="Account Settings">
          <TextRow
            label="Manage active sessions/devices"
            onPress={() => showRowFeedback('Manage active sessions/devices')}
          />
          <TextRow
            label="Change password"
            onPress={() => showRowFeedback('Change password')}
          />
          <TextRow
            label="Delete account"
            onPress={() => showRowFeedback('Delete account')}
          />
        </SectionBlock>

        <SectionBlock title="Preferences">
          <TextRow
            label="Measurement units (Metric/Imperial)"
            onPress={() => showRowFeedback('Measurement units')}
          />
          <TextRow label="Currency" onPress={() => showRowFeedback('Currency')} />
          <TextRow label="Language" onPress={() => showRowFeedback('Language')} />
        </SectionBlock>

        <SectionBlock title="Notifications">
          <ToggleRow
            label="Push notifications"
            value={toggles.pushNotifications}
            onValueChange={setToggle('pushNotifications')}
          />
          <ToggleRow
            label="Outfit reminders"
            value={toggles.outfitReminders}
            onValueChange={setToggle('outfitReminders')}
          />
          <ToggleRow
            label="Trend alerts"
            value={toggles.trendAlerts}
            onValueChange={setToggle('trendAlerts')}
          />
          <ToggleRow
            label="Weekly planner"
            value={toggles.weeklyPlanner}
            onValueChange={setToggle('weeklyPlanner')}
          />
          <ToggleRow
            label="Email notifications"
            value={toggles.emailNotifications}
            onValueChange={setToggle('emailNotifications')}
          />
        </SectionBlock>

        <SectionBlock title="Privacy">
          <ToggleRow
            label="Calendar access"
            value={toggles.calendarAccess}
            onValueChange={setToggle('calendarAccess')}
          />
          <ToggleRow
            label="Location access"
            value={toggles.locationAccess}
            onValueChange={setToggle('locationAccess')}
          />
          <ToggleRow
            label="Photo library access"
            value={toggles.photoLibraryAccess}
            onValueChange={setToggle('photoLibraryAccess')}
          />
          <ToggleRow
            label="Contacts access"
            value={toggles.contactsAccess}
            onValueChange={setToggle('contactsAccess')}
          />
        </SectionBlock>

        <SectionBlock title="Data section">
          <TextRow
            label="Export my data"
            onPress={() => showRowFeedback('Export my data')}
          />
          <TextRow label="Clear cache" onPress={() => showRowFeedback('Clear cache')} />
        </SectionBlock>

        <SectionBlock title="About">
          <TextRow label="App version" onPress={() => showRowFeedback('App version')} />
          <TextRow
            label="Terms of service"
            onPress={() => showRowFeedback('Terms of service')}
          />
          <TextRow
            label="Privacy policy"
            onPress={() => showRowFeedback('Privacy policy')}
          />
          <TextRow
            label="Contact support"
            onPress={() => showRowFeedback('Contact support')}
          />
        </SectionBlock>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEECE2',
    alignItems: 'center',
  },
  header: {
    paddingTop: 8,
    paddingBottom: 18,
    alignItems: 'center',
  },
  backRow: {
    position: 'absolute',
    left: 0,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    ...typography.footnote,
    color: '#111111',
    fontWeight: '400',
  },
  headerTitle: {
    ...typography.title3,
    color: '#111111',
    fontWeight: '600',
  },
  headerSpinner: {
    position: 'absolute',
    right: 0,
    top: 8,
  },
  detailRow: {
    marginBottom: sectionSpacing.row,
    paddingLeft: 14,
  },
  detailLabel: {
    ...typography.caption1,
    color: '#6B6B6B',
    marginBottom: 2,
  },
  detailValue: {
    ...typography.callout,
    color: '#101010',
    fontWeight: '500',
  },
  editProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingLeft: 14,
    paddingVertical: 10,
  },
  editProfileLinkText: {
    ...typography.callout,
    color: '#4A3F2A',
    fontWeight: '600',
  },
  scrollContent: {
    alignSelf: 'center',
    paddingTop: sectionSpacing.top,
  },
  sectionBlock: {
    marginBottom: sectionSpacing.section,
  },
  sectionTitle: {
    ...typography.footnote,
    color: '#1B1B1B',
    fontWeight: '600',
    marginBottom: 9,
  },
  textRow: {
    minHeight: 26,
    justifyContent: 'center',
    marginBottom: sectionSpacing.row,
  },
  textRowLabel: {
    ...typography.callout,
    color: '#101010',
    fontWeight: '500',
    paddingLeft: 14,
  },
  toggleRow: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sectionSpacing.row,
  },
  toggleHitbox: {
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  toggleTrack: {
    width: 66,
    height: 36,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#E8E0CC',
    backgroundColor: '#E4E0D4',
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#47422F',
    marginLeft: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleThumbOn: {
    marginLeft: 33,
  },
  bottomSpacer: {
    height: 36,
  },
});
