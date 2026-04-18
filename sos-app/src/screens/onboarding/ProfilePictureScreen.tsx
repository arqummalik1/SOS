import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SosProfileStyleCamera } from '../../components/camera/SosProfileStyleCamera';
import { ApiError } from '../../api/errors';
import { userService } from '../../services/userService';
import { notify } from '../../utils/notify';

interface ProfilePictureScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

/**
 * Profile picture — delegates UI to `SosProfileStyleCamera` (same as wardrobe add-item camera).
 * On pick → uploads profile image, then navigates to ProfileSetup.
 */
export const ProfilePictureScreen: React.FC<ProfilePictureScreenProps> = ({ navigation }) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadAndContinue = async (uri: string, source: 'camera' | 'gallery') => {
    const filename = uri.split('/').pop();
    console.log('[SOS_PROFILE_IMAGE] screen: starting upload pipeline', {
      source,
      filename,
      platform: Platform.OS,
    });

    try {
      setIsUploading(true);
      const uploadResult = await userService.uploadProfileImage(uri);
      console.log('[SOS_PROFILE_IMAGE] screen: upload finished, navigating to ProfileSetup', {
        serverMessage: uploadResult.message,
        usingServerUrl: Boolean(uploadResult.profileImageUrl),
      });
      notify({ type: 'success', message: uploadResult.message });
      navigation.navigate('ProfileSetup', {
        profileImage: uploadResult.profileImageUrl ?? uri,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('[SOS_PROFILE_IMAGE] screen: upload error', {
          code: error.code,
          status: error.status,
          message: error.message,
          details: error.details,
        });
      } else {
        console.error('[SOS_PROFILE_IMAGE] screen: upload error', error);
      }
      const message = error instanceof Error ? error.message : 'Failed to upload profile image.';
      notify({ type: 'error', message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SosProfileStyleCamera
        headerMode="profile"
        title="Profile picture"
        subtitle="Capture your profile image on a plain background"
        permissionTitle="Camera Access"
        permissionBody="We need camera access to capture your profile photo."
        onPickedImage={uploadAndContinue}
        isProcessing={isUploading}
        processingMessage="Uploading profile image..."
      />
    </View>
  );
};
