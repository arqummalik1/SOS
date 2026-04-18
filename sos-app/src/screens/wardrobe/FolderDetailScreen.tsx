import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { typography } from '../../theme/typography';
import { gradients } from '../../theme/gradients';
import { WardrobeStackParamList } from '../../navigation/WardrobeStackNavigator';
import { wardrobeFolderService } from '../../services/wardrobeFolderService';
import { wardrobeItemService, wardrobeItemToFolderGridRow } from '../../services/wardrobeItemService';
import { WardrobeFolder, WardrobeFolderItem } from '../../models/WardrobeFolder.model';
import type { ItemDetailsViewParams } from '../../navigation/wardrobeNavParams';
import { ApiError } from '../../api/errors';
import { notify } from '../../utils/notify';
import { logSosError } from '../../utils/logSosError';

const LOG = '[SOS_FOLDER_DETAIL]';

const PLACEHOLDER = require('../../../assets/MyWardrobe/WomenUpper.png');

type Props = {
  navigation: NativeStackNavigationProp<WardrobeStackParamList, 'FolderDetail'>;
  route: RouteProp<WardrobeStackParamList, 'FolderDetail'>;
};

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

export const FolderDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(400, width - 28);
  const folderId = route.params.folderId;
  const initialName = route.params.folderName ?? 'Folder';

  const [folder, setFolder] = useState<WardrobeFolder | null>(route.params.folder ?? null);
  const [items, setItems] = useState<WardrobeFolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editOrder, setEditOrder] = useState('0');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const load = useCallback(
    async (mode: 'full' | 'refresh') => {
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
              : 'Could not load folder.';
        notify({ type: 'error', message });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [folderId]
  );

  React.useEffect(() => {
    void load('full');
  }, [load]);

  const openEdit = () => {
    if (!folder) {
      return;
    }
    setEditName(folder.name);
    setEditDescription(folder.description);
    setEditColor(folder.colorCode);
    setEditOrder(String(folder.order));
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!folder) {
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
      void load('refresh');
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

  const confirmDelete = () => {
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

  const title = folder?.name ?? initialName;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      <View style={[styles.header, { width: contentWidth, alignSelf: 'center' }]}>
        <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerActions}>
          <Pressable onPress={openEdit} hitSlop={10} accessibilityLabel="Edit folder">
            <Ionicons name="create-outline" size={22} color="#333333" />
          </Pressable>
          <Pressable onPress={confirmDelete} hitSlop={10} accessibilityLabel="Delete folder">
            <Ionicons name="trash-outline" size={21} color="#C62828" />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9B7BA0" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={items.length === 0 ? 1 : 2}
          columnWrapperStyle={items.length > 0 ? styles.columnWrap : undefined}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: Math.max(14, (width - contentWidth) / 2) }]}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void load('refresh')} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No items yet</Text>
              <Text style={styles.emptySubtitle}>Add pieces to this folder from your wardrobe flows.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.tile, { width: (contentWidth - 12) / 2 }]}
              onPress={() =>
                navigation.navigate('ItemDetailsView', { item: mapItemForDetailsNav(item) })
              }
            >
              <View style={styles.tileImageWrap}>
                {item.imageUri ? (
                  <Image source={{ uri: item.imageUri }} style={styles.tileImage} resizeMode="contain" />
                ) : (
                  <Image source={PLACEHOLDER} style={styles.tileImage} resizeMode="contain" />
                )}
              </View>
              <LinearGradient
                colors={gradients.sospink.colors}
                start={gradients.sospink.start}
                end={gradients.sospink.end}
                style={styles.tileFooter}
              >
                <Text style={styles.tileName} numberOfLines={2}>
                  {item.name}
                </Text>
              </LinearGradient>
            </Pressable>
          )}
        />
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
                onPress={saveEdit}
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
    backgroundColor: '#F2F2F2',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backArrow: {
    ...typography.body,
    color: '#191919',
  },
  backText: {
    ...typography.small,
    color: '#2F2F2F',
  },
  title: {
    ...typography.headline,
    color: '#171717',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  columnWrap: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tile: {
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#ECECEC',
  },
  tileImageWrap: {
    height: 160,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileImage: {
    width: 110,
    height: 130,
  },
  tileFooter: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  tileName: {
    ...typography.caption1,
    color: '#1A1A1A',
    textAlign: 'center',
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
