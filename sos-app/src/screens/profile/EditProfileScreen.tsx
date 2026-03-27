import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { GlassView } from '../../components/ui/GlassView';
import { GlassButton } from '../../components/ui/GlassButton';
import { useUser } from '../../store/UserContext';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface EditProfileScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
}) => {
  const { user, updateProfile } = useUser();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('Fashion enthusiast');

  const handleSave = async () => {
    await updateProfile({ name });
    navigation.goBack();
  };

  return (
    <SafeContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
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
            <TouchableOpacity style={styles.cameraButton}>
              <GlassView intensity="thin" borderRadius={20} style={styles.cameraButtonInner}>
                <Ionicons name="camera" size={20} color="#000000" />
              </GlassView>
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={user?.phone || ''}
                editable={false}
                placeholder="Phone number"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Preferences</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Update Style Preferences</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Palette</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Update Color Preferences</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
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
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
    color: '#000000',
  },
  saveText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
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
  },
  cameraButtonInner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: typography.subheadline.fontSize,
    color: '#BF5AF2',
    fontWeight: '500',
  },
  formSection: {
    marginBottom: spacing.xxl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: typography.subheadline.fontWeight,
    color: '#666666',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(120,120,128,0.2)',
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    justifyContent: 'center',
  },
  input: {
    fontSize: typography.body.fontSize,
    color: '#000000',
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: typography.subheadline.fontWeight,
    color: '#666666',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowText: {
    fontSize: typography.body.fontSize,
    color: '#000000',
  },
});
