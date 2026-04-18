import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { typography } from '../../theme/typography';
import { gradients } from '../../theme/gradients';
import { wardrobeFolderService } from '../../services/wardrobeFolderService';
import { wardrobeItemService, wardrobeItemToFolderGridRow } from '../../services/wardrobeItemService';
import type { WardrobeFolder, WardrobeFolderItem } from '../../models/WardrobeFolder.model';
import type { ItemDetailsViewParams } from '../../navigation/wardrobeNavParams';
import { ApiError } from '../../api/errors';
import { notify } from '../../utils/notify';
import { logSosError } from '../../utils/logSosError';
const LOG = '[SOS_MY_ITEMS]';

const PLACEHOLDER = require('../../../assets/MyWardrobe/WomenUpper.png');

type MyItemsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type RouteParams = {
  selectionMode?: boolean;
  folderId?: string;
  folderName?: string;
  folder?: WardrobeFolder;
};

type ItemCard = {
  id: string;
  title: string;
  category: string;
  color: string;
  season: string;
  size: string;
  image: any;
};

const MOCK_ITEMS: ItemCard[] = [
  {
    id: '1',
    title: 'Denim ripped jeans',
    category: 'Pants',
    color: 'Denim blue',
    season: 'Summer',
    size: '36',
    image: require('../../../assets/MyItems/Image (1).png'),
  },
  {
    id: '2',
    title: 'Green blue checked\nshirt, half sleeve',
    category: 'Shirt',
    color: 'Green',
    season: 'Summer',
    size: '32',
    image: require('../../../assets/MyItems/Frame 1000006701.png'),
  },
  {
    id: '3',
    title: 'Black T-shirt with\nguitar print',
    category: 'Top',
    color: 'Dark blue',
    season: 'Summer',
    size: '32',
    image: require('../../../assets/MyItems/Frame 1000006701 (1).png'),
  },
  {
    id: '4',
    title: 'Red Overcoat',
    category: 'Coat',
    color: 'Red',
    season: 'Winter',
    size: 'M',
    image: require('../../../assets/MyItems/Frame 1000006701 (2).png'),
  },
];

const joinOrDash = (values: string[] | undefined, fallback: string) =>
  values && values.length ? values.join(', ') : fallback;

const mapItemForDetailsNav = (item: WardrobeFolderItem): ItemDetailsViewParams => ({
  name: item.name,
  wardrobeItemId: item.id,
  image: item.imageUri ? { uri: item.imageUri } : PLACEHOLDER,
  details: {
    category: item.category && item.category.length > 0 ? item.category : '—',
    color: item.color && item.color.length > 0 ? item.color : '#888888',
    season: joinOrDash(item.seasons, '—'),
    size: item.size && item.size.length > 0 ? item.size : '—',
    material: item.material && item.material.length > 0 ? item.material : '—',
    occasion: joinOrDash(item.occasions, '—'),
    description:
      item.description && item.description.trim().length > 0
        ? item.description
        : item.raw && typeof item.raw.description === 'string'
          ? item.raw.description
          : '—',
  },
});

const formatCategory = (c: string | undefined): string => {
  if (!c || !String(c).trim()) return '—';
  const s = String(c).trim();
  if (s.length <= 24 && !s.includes(' ')) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return s;
};

export const MyItemsScreen: React.FC<MyItemsScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(400, width - 28);

  const selectionMode = params.selectionMode === true;
  const folderId = params.folderId;
  const initialFolderName = params.folderName ?? 'Collection';
  const isFolderMode = Boolean(folderId);

  const [folder, setFolder] = useState<WardrobeFolder | null>(params.folder ?? null);
  const [items, setItems] = useState<WardrobeFolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(isFolderMode);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editOrder, setEditOrder] = useState('0');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadFolder = useCallback(
    async (mode: 'full' | 'refresh') => {
      if (!folderId) {
        return;
      }
      if (mode === 'full') {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      try {
        const [folderResult, listed] = await Promise.all([
          wardrobeFolderService.getFolderDetails(folderId),
          wardrobeItemService.listItems({ folder_id: folderId }).catch((err) => {
            logSosError(LOG, 'listItems failed — using folder detail items', err, 'warn');
            return null;
          }),
        ]);
        setFolder(folderResult.folder);
        if (listed && listed.length > 0) {
          setItems(listed.map(wardrobeItemToFolderGridRow));
        } else {
          setItems(folderResult.items);
        }
      } catch (error) {
        logSosError(LOG, 'load folder + items', error);
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Could not load items.';
        notify({ type: 'error', message });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [folderId]
  );

  useFocusEffect(
    useCallback(() => {
      if (folderId) {
        void loadFolder('refresh');
      }
    }, [folderId, loadFolder])
  );

  const openAddItem = useCallback(() => {
    if (!folderId) {
      return;
    }
    navigation.navigate('WardrobeAddItemCamera', { folderId });
  }, [navigation, folderId]);

  const openFolderEdit = () => {
    if (!folder) {
      return;
    }
    setEditName(folder.name);
    setEditDescription(folder.description);
    setEditColor(folder.colorCode);
    setEditOrder(String(folder.order));
    setEditVisible(true);
  };

  const saveFolderEdit = async () => {
    if (!folder || !folderId) {
      return;
    }
    setIsSavingEdit(true);
    try {
      const updated = await wardrobeFolderService.updateFolder(folder.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        color_code: editColor.trim() || folder.colorCode,
        order: Number(editOrder) || 0,
      });
      setFolder(updated);
      setEditVisible(false);
      notify({ type: 'success', message: 'Folder updated.' });
      void loadFolder('refresh');
    } catch (error) {
      logSosError(LOG, 'updateFolder', error);
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Update failed.';
      notify({ type: 'error', message });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDeleteFolder = () => {
    if (!folderId) {
      return;
    }
    Alert.alert(
      'Delete folder',
      'This will remove the folder. Items may be unlinked depending on your backend rules.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await wardrobeFolderService.deleteFolder(folderId);
              notify({ type: 'success', message: 'Folder deleted.' });
              navigation.goBack();
            } catch (error) {
              logSosError(LOG, 'deleteFolder', error);
              const message =
                error instanceof ApiError
                  ? error.message
                  : error instanceof Error
                    ? error.message
                    : 'Delete failed.';
              notify({ type: 'error', message });
            }
          },
        },
      ]
    );
  };

  const onSelectItem = () => {
    navigation.navigate('OutfitComplete');
  };

  const onEditDetailsMock = () => {
    if (selectionMode) {
      onSelectItem();
      return;
    }
    navigation.navigate('EditItemDetails');
  };

  const onEditDetailsApi = (item: WardrobeFolderItem) => {
    if (selectionMode) {
      onSelectItem();
      return;
    }
    navigation.navigate('EditItemDetails', { mode: 'edit', itemId: item.id });
  };

  const subtitle = selectionMode
    ? 'Select an item to complete your outfit'
    : isFolderMode
      ? 'Make your wardrobe even smarter!'
      : 'Make your wardrobe even smarter!';

  const collectionTitle = isFolderMode ? folder?.name ?? initialFolderName : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEEEEE" />

      <View style={styles.headerTopPad} />

      <View style={[styles.topBar, { maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
        <TouchableOpacity style={styles.backHit} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        {isFolderMode ? (
          <View style={styles.headerActions}>
            <Pressable onPress={openAddItem} hitSlop={10} accessibilityLabel="Add item">
              <Ionicons name="add-circle-outline" size={24} color="#333333" />
            </Pressable>
            <Pressable onPress={openFolderEdit} hitSlop={10} accessibilityLabel="Edit folder">
              <Ionicons name="create-outline" size={22} color="#333333" />
            </Pressable>
            <Pressable onPress={confirmDeleteFolder} hitSlop={10} accessibilityLabel="Delete folder">
              <Ionicons name="trash-outline" size={21} color="#C62828" />
            </Pressable>
          </View>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>My Items</Text>
        {collectionTitle ? (
          <Text style={styles.collectionName} numberOfLines={2}>
            {collectionTitle}
          </Text>
        ) : null}
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {isFolderMode && isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9B7BA0" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: Math.max(14, (width - contentWidth) / 2) }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            isFolderMode ? (
              <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadFolder('refresh')} />
            ) : undefined
          }
        >
          {isFolderMode ? (
            items.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No items yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add a photo with the + button above, then save on the next screen.
                </Text>
                <Pressable onPress={openAddItem} style={styles.emptyCtaWrap} accessibilityRole="button">
                  <LinearGradient
                    colors={gradients.sospink.colors}
                    start={gradients.sospink.start}
                    end={gradients.sospink.end}
                    style={styles.emptyCta}
                  >
                    <Text style={styles.emptyCtaText}>Add item</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={selectionMode ? 0.9 : 0.92}
                  onPress={
                    selectionMode
                      ? onSelectItem
                      : () => navigation.navigate('ItemDetailsView', { item: mapItemForDetailsNav(item) })
                  }
                >
                  <View style={styles.imageColumn}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.itemImage} resizeMode="contain" />
                    ) : (
                      <Image source={PLACEHOLDER} style={styles.itemImage} resizeMode="contain" />
                    )}
                  </View>

                  <View style={styles.detailsColumn}>
                    <Text style={styles.itemTitle}>{item.name}</Text>

                    <View style={styles.specBox}>
                      <View style={styles.specRow}>
                        <Text style={styles.specLabel}>Category:</Text>
                        <Text style={styles.specValue}>{formatCategory(item.category)}</Text>
                      </View>
                      <View style={styles.specRow}>
                        <Text style={styles.specLabel}>Color:</Text>
                        <Text style={styles.specValue}>{item.color && item.color.length > 0 ? item.color : '—'}</Text>
                      </View>
                      <View style={styles.specRow}>
                        <Text style={styles.specLabel}>Season:</Text>
                        <Text style={styles.specValue}>{joinOrDash(item.seasons, '—')}</Text>
                      </View>
                      <View style={styles.specRow}>
                        <Text style={styles.specLabel}>Size:</Text>
                        <Text style={styles.specValue}>{item.size && item.size.length > 0 ? item.size : '—'}</Text>
                      </View>
                      <View style={styles.specPurpleAccent} />
                    </View>

                    <TouchableOpacity activeOpacity={0.85} onPress={() => onEditDetailsApi(item)}>
                      <LinearGradient
                        colors={gradients.sospink.colors}
                        start={gradients.sospink.start}
                        end={gradients.sospink.end}
                        style={styles.editButtonGradient}
                      >
                        <Text style={styles.editButtonText}>{selectionMode ? 'Select item' : 'Edit details'}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : (
            MOCK_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={selectionMode ? 0.9 : 1}
                onPress={selectionMode ? onSelectItem : undefined}
                disabled={!selectionMode}
              >
                <View style={styles.imageColumn}>
                  <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
                  {item.id === '4' ? (
                    <Image
                      source={require('../../../assets/MyItems/Frame 1000006728.png')}
                      style={styles.optionalAltImage}
                      resizeMode="contain"
                    />
                  ) : null}
                </View>

                <View style={styles.detailsColumn}>
                  <Text style={styles.itemTitle}>{item.title}</Text>

                  <View style={styles.specBox}>
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>Category:</Text>
                      <Text style={styles.specValue}>{item.category}</Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>Color:</Text>
                      <Text style={styles.specValue}>{item.color}</Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>Season:</Text>
                      <Text style={styles.specValue}>{item.season}</Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>Size:</Text>
                      <Text style={styles.specValue}>{item.size}</Text>
                    </View>
                    <View style={styles.specPurpleAccent} />
                  </View>

                  <TouchableOpacity activeOpacity={0.85} onPress={onEditDetailsMock}>
                    <LinearGradient
                      colors={gradients.sospink.colors}
                      start={gradients.sospink.start}
                      end={gradients.sospink.end}
                      style={styles.editButtonGradient}
                    >
                      <Text style={styles.editButtonText}>{selectionMode ? 'Select item' : 'Edit details'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}

          <View style={styles.bottomGap} />
        </ScrollView>
      )}

      <Modal transparent visible={editVisible} animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => !isSavingEdit && setEditVisible(false)}>
          <Pressable style={[styles.modalSheet, { width: Math.min(360, width - 32) }]} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Edit folder</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} editable={!isSavingEdit} />
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              editable={!isSavingEdit}
            />
            <Text style={styles.label}>Color</Text>
            <TextInput style={styles.input} value={editColor} onChangeText={setEditColor} editable={!isSavingEdit} />
            <Text style={styles.label}>Order</Text>
            <TextInput
              style={styles.input}
              value={editOrder}
              onChangeText={setEditOrder}
              keyboardType="number-pad"
              editable={!isSavingEdit}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => setEditVisible(false)}
                disabled={isSavingEdit}
              >
                <Text style={styles.modalBtnGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={saveFolderEdit}
                disabled={isSavingEdit}
              >
                {isSavingEdit ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Save</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  headerTopPad: {
    height: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  backHit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backArrow: {
    ...typography.title2,
    color: '#1F1F1F',
    marginTop: -1,
  },
  backText: {
    ...typography.small,
    color: '#3A3A3A',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  titleWrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    ...typography.largeTitle,
    color: '#222222',
  },
  collectionName: {
    marginTop: 6,
    ...typography.headline,
    color: '#444444',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    ...typography.medium,
    color: '#333333',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    minHeight: 270,
    marginBottom: 14,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageColumn: {
    width: '51%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  itemImage: {
    width: '96%',
    height: 238,
  },
  optionalAltImage: {
    position: 'absolute',
    bottom: -8,
    right: -26,
    width: 76,
    height: 76,
    opacity: 0.01,
  },
  detailsColumn: {
    width: '49%',
    paddingTop: 2,
  },
  itemTitle: {
    ...typography.largeTitle,
    color: '#000000',
    marginBottom: 8,
    fontSize: 18,
  },
  specBox: {
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 10,
    marginBottom: 12,
    position: 'relative',
    minHeight: 112,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  specLabel: {
    width: 73,
    ...typography.small,
    color: '#3C3C3C',
  },
  specValue: {
    flex: 1,
    ...typography.small,
    color: '#3C3C3C',
  },
  specPurpleAccent: {
    position: 'absolute',
    top: 2,
    right: 0,
    width: 2,
    height: 38,
    backgroundColor: '#B884BA',
    borderRadius: 2,
  },
  editButtonGradient: {
    alignSelf: 'flex-start',
    minWidth: 102,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: {
    ...typography.small,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  bottomGap: {
    height: 102,
  },
  empty: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.title3,
    color: '#333333',
    marginBottom: 6,
  },
  emptySubtitle: {
    ...typography.footnote,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyCtaWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyCta: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  emptyCtaText: {
    ...typography.callout,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    ...typography.title3,
    color: '#111111',
    marginBottom: 12,
  },
  label: {
    ...typography.caption1,
    color: '#444444',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    ...typography.body,
    color: '#111111',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputMulti: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
  },
  modalBtn: {
    minWidth: 96,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  modalBtnGhost: {
    backgroundColor: '#EFEFEF',
  },
  modalBtnGhostText: {
    ...typography.callout,
    color: '#222222',
  },
  modalBtnPrimary: {
    backgroundColor: '#111111',
  },
  modalBtnPrimaryText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
