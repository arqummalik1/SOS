import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { GlassView } from '../../components/ui/GlassView';
import { useUser } from '../../store/UserContext';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ApiError } from '../../api/errors';
import { notify } from '../../utils/notify';

interface EditProfileScreenProps {
  navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { user, updateProfile, refreshProfile } = useUser();
  const [name, setName] = useState(user?.name ?? '');
  const [height, setHeight] = useState(user?.height ?? '');
  const [weight, setWeight] = useState(user?.weight ?? '');
  const [dob, setDob] = useState(user?.dob ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setName(user.name ?? '');
    setHeight(user.height ?? '');
    setWeight(user.weight ?? '');
    setDob(user.dob ?? '');
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void refreshProfile().catch(() => undefined);
    }, [refreshProfile])
  );

  const handleSave = async () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        height: height.trim(),
        weight: weight.trim(),
        dob: dob.trim(),
      });
      notify({ type: 'success', message: 'Profile updated successfully.' });
      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Could not update profile. Please try again.';
      notify({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSaving}>
          <Ionicons name="close" size={28} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#BF5AF2" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.photoSection}>
          <View style={styles.photoWrapper}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={40} color="#999999" />
              </View>
            )}
            <View style={styles.cameraButton}>
              <GlassView intensity="thin" borderRadius={20} style={styles.cameraButtonInner}>
                <Ionicons name="camera" size={20} color="#000000" />
              </GlassView>
            </View>
          </View>
          <Text style={styles.changePhotoHint}>Profile photo is managed during onboarding.</Text>
        </View>

        <View style={styles.formSection}>
          <Field label="Name">
            <Pressable style={styles.inputContainer}>
              <TextInput
                style={[styles.input, Platform.OS === 'web' && styles.inputWebOutline]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#888888"
                editable={!isSaving}
              />
            </Pressable>
          </Field>

          <Field label="Height">
            <Pressable style={styles.inputContainer}>
              <TextInput
                style={[styles.input, Platform.OS === 'web' && styles.inputWebOutline]}
                value={height}
                onChangeText={setHeight}
                placeholder="e.g. 164"
                placeholderTextColor="#888888"
                keyboardType="decimal-pad"
                editable={!isSaving}
              />
            </Pressable>
          </Field>

          <Field label="Weight">
            <Pressable style={styles.inputContainer}>
              <TextInput
                style={[styles.input, Platform.OS === 'web' && styles.inputWebOutline]}
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g. 64"
                placeholderTextColor="#888888"
                keyboardType="decimal-pad"
                editable={!isSaving}
              />
            </Pressable>
          </Field>

          <Field label="Date of birth">
            <Pressable style={styles.inputContainer}>
              <TextInput
                style={[styles.input, Platform.OS === 'web' && styles.inputWebOutline]}
                value={dob}
                onChangeText={setDob}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#888888"
                editable={!isSaving}
                autoCapitalize="none"
              />
            </Pressable>
          </Field>

          <Field label="Phone">
            <Pressable style={[styles.inputContainer, styles.inputDisabled]}>
              <TextInput
                style={[styles.input, Platform.OS === 'web' && styles.inputWebOutline]}
                value={user?.phone || ''}
                editable={false}
                placeholder="Phone number"
                placeholderTextColor="#888888"
              />
            </Pressable>
          </Field>
        </View>
      </ScrollView>
    </SafeContainer>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.inputGroup} accessibilityLabel={label}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

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
  saveText: {
    ...typography.headline,
    color: '#BF5AF2',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  photoWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    opacity: 0.45,
  },
  cameraButtonInner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoHint: {
    ...typography.caption1,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  formSection: {
    marginBottom: spacing.xxl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.subheadline,
    color: '#666666',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    justifyContent: 'center',
  },
  inputDisabled: {
    opacity: 0.75,
  },
  input: {
    ...typography.body,
    color: '#000000',
    flex: 1,
    minHeight: 48,
    paddingVertical: spacing.md,
  },
  inputWebOutline: {
    outlineWidth: 0,
    outlineStyle: 'none',
  },
});
