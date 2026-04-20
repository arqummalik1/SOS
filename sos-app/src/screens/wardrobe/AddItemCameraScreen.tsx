import React from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { SosProfileStyleCamera } from '../../components/camera/SosProfileStyleCamera';
import { notify } from '../../utils/notify';
import { logSosError } from '../../utils/logSosError';

const LOG = '[SOS_ADD_ITEM_CAMERA]';

/** Avoid web a11y warnings: stack sets aria-hidden on hidden routes while focus stays on the shutter. */
const blurActiveElementIfWeb = () => {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }
  const el = document.activeElement;
  if (el && el instanceof HTMLElement) {
    el.blur();
  }
};

/**
 * Wardrobe add-item camera: same layout and behavior as profile picture camera
 * (`SosProfileStyleCamera`). Opens the item editor with `folderId` when a photo is chosen.
 */
export const AddItemCameraScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddItemCamera'>>();

  const handlePickedImage = (uri: string) => {
    try {
      const folderId = route.params?.folderId;
      console.log(`${LOG} picked image — opening EditItemDetails`, { hasFolderId: Boolean(folderId) });
      blurActiveElementIfWeb();
      navigation.navigate('Main', {
        screen: 'Wardrobe',
        params: {
          screen: 'EditItemDetails',
          params: { mode: 'create', imageUri: uri, folderId },
        },
      });
      // Let nested state apply before popping the modal; InteractionManager can fire too early on web.
      const dismissDelayMs = Platform.OS === 'web' ? 320 : 180;
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }, dismissDelayMs);
    } catch (error) {
      logSosError(LOG, 'navigate to EditItemDetails', error);
      notify({ type: 'error', message: 'Could not open the item editor. Try again.' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      <SosProfileStyleCamera
        headerMode="modal"
        title="Add item"
        subtitle="Capture your clothing on a plain background"
        permissionTitle="Camera Access"
        permissionBody="We need camera access to photograph your wardrobe item."
        onPickedImage={(uri) => {
          handlePickedImage(uri);
        }}
        onRequestClose={() => navigation.goBack()}
      />
    </View>
  );
};
