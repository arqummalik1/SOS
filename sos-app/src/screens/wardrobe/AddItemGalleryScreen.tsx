import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { notify } from '../../utils/notify';
import { logSosError } from '../../utils/logSosError';

const LOG = '[SOS_ADD_ITEM_GALLERY]';

const blurActiveElementIfWeb = () => {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }
  const el = document.activeElement;
  if (el && el instanceof HTMLElement) {
    el.blur();
  }
};

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 12;
const ITEM_SIZE = (width - (COLUMN_COUNT + 1) * SPACING) / COLUMN_COUNT;

// Mock Data matching the user provided image
const MOCK_ITEMS = [
  { id: '1', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c717658?q=80&w=200&auto=format&fit=crop', backgroundColor: '#F3E5D8' }, // Blue Plaid
  { id: '2', image: 'https://images.unsplash.com/photo-1620012253295-c05717e093d2?q=80&w=200&auto=format&fit=crop', backgroundColor: '#E0E0E0' }, // White Button-up
  { id: '3', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=200&auto=format&fit=crop', backgroundColor: '#D9C5B2' }, // Patterned
  // 15+ Placeholders for the remaining grid
  ...Array.from({ length: 18 }).map((_, i) => ({ id: `p-${i}`, image: null, backgroundColor: '#E0E0E0' })),
];

/**
 * SelectItemScreen - Replicates the "Select item" gallery view.
 * 100% Pixel-Perfect Replication of Add Item - Gallery.png
 */
export const AddItemGalleryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddItemGallery'>>();

  const openEditorWithImage = (imageUri: string) => {
    try {
      console.log(`${LOG} open EditItemDetails (create)`);
      blurActiveElementIfWeb();
      navigation.navigate('Main', {
        screen: 'Wardrobe',
        params: {
          screen: 'EditItemDetails',
          params: { mode: 'create', imageUri, folderId: route.params?.folderId },
        },
      });
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

  const renderItem = ({ item }: { item: (typeof MOCK_ITEMS)[number] }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: item.backgroundColor }]}
      activeOpacity={0.9}
      onPress={() => {
        if (item.image) {
          openEditorWithImage(item.image);
        }
      }}
    >
      {item.image && <Image source={{ uri: item.image }} style={styles.itemImage} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>Select item</Text>
        <Text style={styles.subtitle}>Select your clothing on a plain background</Text>
      </View>

      {/* Grid Section */}
      <FlatList
        data={MOCK_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 32,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 12,
    padding: 8,
  },
  title: {
    ...typography.title1,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.subheadline,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
  },
  gridContent: {
    paddingHorizontal: SPACING,
    paddingBottom: 40,
  },
  itemContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: SPACING / 2,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
