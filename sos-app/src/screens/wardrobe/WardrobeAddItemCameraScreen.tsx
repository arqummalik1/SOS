import React from 'react';
import { View, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WardrobeStackParamList } from '../../navigation/WardrobeStackNavigator';
import { SosProfileStyleCamera } from '../../components/camera/SosProfileStyleCamera';
import { notify } from '../../utils/notify';
import { logSosError } from '../../utils/logSosError';

const LOG = '[SOS_WARDROBE_ADD_ITEM_CAMERA]';

/**
 * In-wardrobe camera for new items. Uses the same UI as profile picture (`SosProfileStyleCamera`).
 * `replace` avoids the root-stack race where `navigate(Main)` + `goBack()` left the modal camera open.
 */
export const WardrobeAddItemCameraScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<WardrobeStackParamList>>();
  const route = useRoute<RouteProp<WardrobeStackParamList, 'WardrobeAddItemCamera'>>();
  const folderId = route.params.folderId;

  const handlePickedImage = (uri: string) => {
    try {
      console.log(`${LOG} picked image → EditItemDetails (replace)`, { folderId });
      navigation.replace('EditItemDetails', {
        mode: 'create',
        imageUri: uri,
        folderId,
      });
    } catch (error) {
      logSosError(LOG, 'replace EditItemDetails', error);
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
        onPickedImage={(pickedUri) => {
          handlePickedImage(pickedUri);
        }}
        onRequestClose={() => navigation.goBack()}
      />
    </View>
  );
};
