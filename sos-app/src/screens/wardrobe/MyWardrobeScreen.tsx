import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography } from '../../theme/typography';
import { gradients } from '../../theme/gradients';
import { WardrobeStackParamList } from '../../navigation/WardrobeStackNavigator';
import { wardrobeFolderService } from '../../services/wardrobeFolderService';
import { WardrobeFolder } from '../../models/WardrobeFolder.model';
import { useAuth } from '../../store/AuthContext';
import { ApiError } from '../../api/errors';
import { notify } from '../../utils/notify';
import { logSosError } from '../../utils/logSosError';

const LOG = '[SOS_MY_WARDROBE]';
import { CreateFolderModal } from '../../components/wardrobe/CreateFolderModal';

type MyWardrobeScreenProps = {
  navigation: NativeStackNavigationProp<WardrobeStackParamList, 'MyWardrobe'>;
};

const FILTERS = ['All', 'Tops', 'T-shirt', 'Trousers', 'Dresses'];

const PLACEHOLDER = require('../../../assets/MyWardrobe/WomenUpper.png');

const folderTagLabel = (name: string): string => {
  const first = name.trim().split(/\s+/)[0] || name.trim() || 'SOS';
  return first.toUpperCase().slice(0, 10);
};

const matchesFilter = (folder: WardrobeFolder, filter: string): boolean => {
  if (filter === 'All') return true;
  const n = folder.name.toLowerCase();
  if (filter === 'Tops') return n.includes('top');
  if (filter === 'T-shirt') return n.includes('shirt') || n.includes('t-shirt') || n.includes('tee');
  if (filter === 'Trousers') return n.includes('trouser') || n.includes('pant');
  if (filter === 'Dresses') return n.includes('dress');
  return true;
};

const matchesSearch = (folder: WardrobeFolder, q: string): boolean => {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return folder.name.toLowerCase().includes(s) || folder.description.toLowerCase().includes(s);
};

const SearchGlyph: React.FC = () => (
  <View style={styles.searchGlyphWrap}>
    <View style={styles.searchGlyphCircle} />
    <View style={styles.searchGlyphHandle} />
  </View>
);

const FilterGlyph: React.FC = () => (
  <View style={styles.filterGlyphWrap}>
    <View style={styles.filterLine} />
    <View style={[styles.filterLine, styles.filterLineMid]} />
    <View style={styles.filterLine} />
  </View>
);

const GridGlyph: React.FC<{ active: boolean }> = ({ active }) => (
  <View style={styles.gridGlyphWrap}>
    {[0, 1, 2, 3].map((cell) => (
      <View key={cell} style={[styles.gridGlyphCell, active && styles.toggleGlyphActive]} />
    ))}
  </View>
);

const ListGlyph: React.FC<{ active: boolean }> = ({ active }) => (
  <View style={styles.listGlyphWrap}>
    {[0, 1, 2].map((row) => (
      <View key={row} style={[styles.listGlyphRow, active && styles.toggleGlyphActive]} />
    ))}
  </View>
);

export const MyWardrobeScreen: React.FC<MyWardrobeScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { state: authState } = useAuth();
  const contentWidth = Math.min(400, width - 28);
  const gridCardWidth = (contentWidth - 12) / 2;
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState<WardrobeFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const loadFolders = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      if (!authState.isAuthenticated || !authState.isOnboarded) {
        setFolders([]);
        setIsLoading(false);
        return;
      }
      if (mode === 'initial') {
        setIsLoading(true);
      }
      if (mode === 'refresh') {
        setIsRefreshing(true);
      }
      try {
        const list = await wardrobeFolderService.listFolders();
        setFolders(list);
      } catch (error) {
        logSosError(LOG, 'listFolders', error);
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Could not load wardrobe folders.';
        notify({ type: 'error', message });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [authState.isAuthenticated, authState.isOnboarded]
  );

  useFocusEffect(
    useCallback(() => {
      void loadFolders('initial');
    }, [loadFolders])
  );

  const filteredFolders = useMemo(() => {
    return folders.filter(
      (f) => matchesFilter(f, selectedFilter) && matchesSearch(f, searchQuery)
    );
  }, [folders, selectedFilter, searchQuery]);

  const openFolder = (folder: WardrobeFolder) => {
    navigation.navigate('MyItems', {
      folderId: folder.id,
      folderName: folder.name,
      folder,
    });
  };

  const countLabel = (n: number) => (n < 10 ? `0${n}` : String(n));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />

      <View style={styles.topInset} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: Math.max(14, (width - contentWidth) / 2) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadFolders('refresh')} />
        }
      >
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerWrap}>
          <Text style={styles.title}>Style closet</Text>
          <Text style={styles.subtitle}>Your wardrobe, beautifully organized.</Text>
        </View>

        <View style={styles.searchBar}>
          <SearchGlyph />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Look Into Your Wardrobe"
            placeholderTextColor="#6B6B6B"
            returnKeyType="search"
          />
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('WardrobeFilters')}>
            <FilterGlyph />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.8}
              >
                {isActive ? (
                  <LinearGradient colors={gradients.sospink.colors} start={gradients.sospink.start} end={gradients.sospink.end} style={styles.filterPillGradient}>
                    <Text style={[styles.filterText, styles.filterTextActive]}>{filter}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.filterText}>{filter}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Image
          source={require('../../../assets/MyWardrobe/glass bg.png')}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.85}
            onPress={() => {
              if (!authState.isAuthenticated || !authState.isOnboarded) {
                notify({ type: 'error', message: 'Please complete onboarding first' });
                return;
              }
              setCreateOpen(true);
            }}
          >
            <Text style={styles.createButtonText}>Create Wardrobe</Text>
            <Text style={styles.createButtonPlus}>+</Text>
          </TouchableOpacity>

          <View style={styles.toggleWrap}>
            <TouchableOpacity
              style={[styles.toggleButton, isGridView && styles.toggleButtonActive]}
              activeOpacity={0.85}
              onPress={() => setIsGridView(true)}
            >
              <GridGlyph active={isGridView} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isGridView && styles.toggleButtonActive]}
              activeOpacity={0.85}
              onPress={() => setIsGridView(false)}
            >
              <ListGlyph active={!isGridView} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color="#9B7BA0" />
            <Text style={styles.loadingCaption}>Loading folders…</Text>
          </View>
        ) : filteredFolders.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>No folders yet</Text>
            <Text style={styles.emptySubtitle}>
              Create a wardrobe folder to organize your pieces. Pull down to refresh.
            </Text>
          </View>
        ) : isGridView ? (
          <View style={styles.gridWrap}>
            {filteredFolders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                style={[styles.gridCard, { width: gridCardWidth }]}
                activeOpacity={0.9}
                onPress={() => openFolder(folder)}
              >
                <LinearGradient colors={gradients.sospink.colors} start={gradients.sospink.start} end={gradients.sospink.end} style={styles.gridTagWrap}>
                  <Text style={styles.gridTag}>{folderTagLabel(folder.name)}</Text>
                </LinearGradient>
                <View style={styles.gridImageWrap}>
                  {folder.featureImageUrl ? (
                    <Image source={{ uri: folder.featureImageUrl }} style={styles.gridImage} resizeMode="contain" />
                  ) : (
                    <Image source={PLACEHOLDER} style={styles.gridImage} resizeMode="contain" />
                  )}
                </View>
                <View style={styles.gridBottomRow}>
                  <Text style={styles.gridName}>{folder.name}</Text>
                  <LinearGradient colors={gradients.sospink.colors} start={gradients.sospink.start} end={gradients.sospink.end} style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{countLabel(folder.itemCount)}</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.listWrap}>
            {filteredFolders.map((folder) => (
              <View key={folder.id} style={styles.listItemRow}>
                <TouchableOpacity
                  style={styles.listImageCard}
                  activeOpacity={0.9}
                  onPress={() => openFolder(folder)}
                >
                  <LinearGradient colors={gradients.sospink.colors} start={gradients.sospink.start} end={gradients.sospink.end} style={styles.listImageCardGradient} />
                  {folder.featureImageUrl ? (
                    <Image source={{ uri: folder.featureImageUrl }} style={styles.listImage} resizeMode="contain" />
                  ) : (
                    <Image source={PLACEHOLDER} style={styles.listImage} resizeMode="contain" />
                  )}
                </TouchableOpacity>

                <View style={styles.listTextCol}>
                  <Text style={styles.listTag}>{folderTagLabel(folder.name)}</Text>
                  <View style={styles.listNameRow}>
                    <Text style={styles.listName}>{folder.name}</Text>
                    <LinearGradient colors={gradients.sospink.colors} start={gradients.sospink.start} end={gradients.sospink.end} style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{countLabel(folder.itemCount)}</Text>
                    </LinearGradient>
                  </View>

                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    activeOpacity={0.85}
                    onPress={() => openFolder(folder)}
                  >
                    <LinearGradient colors={gradients.sospink.colors} start={gradients.sospink.start} end={gradients.sospink.end} style={styles.viewDetailsButtonGradient}>
                      <Text style={styles.viewDetailsText}>Open folder</Text>
                      <Text style={styles.viewDetailsArrow}>→</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomGap} />
      </ScrollView>

      <CreateFolderModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void loadFolders('silent')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  topInset: {
    height: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backArrow: {
    ...typography.body,
    color: '#191919',
  },
  backText: {
    ...typography.small,
    color: '#2F2F2F',
  },
  headerWrap: {
    marginTop: 2,
    alignItems: 'center',
  },
  title: {
    ...typography.largeTitle,
    color: '#171717',
  },
  subtitle: {
    marginTop: 2,
    ...typography.medium,
    color: '#333333',
  },
  searchBar: {
    marginTop: 10,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D6C3CF',
    backgroundColor: '#F1F1F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchGlyphWrap: {
    width: 15,
    height: 15,
    marginRight: 8,
  },
  searchGlyphCircle: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.5,
    borderColor: '#777777',
  },
  searchGlyphHandle: {
    position: 'absolute',
    width: 5,
    height: 1.5,
    backgroundColor: '#777777',
    transform: [{ rotate: '45deg' }],
    right: 0,
    bottom: 1,
  },
  searchText: {
    flex: 1,
    ...typography.small,
    color: '#6B6B6B',
  },
  searchInput: {
    flex: 1,
    ...typography.small,
    color: '#1A1A1A',
    paddingVertical: 0,
    minHeight: 40,
  },
  loadingBlock: {
    marginTop: 32,
    alignItems: 'center',
    gap: 10,
  },
  loadingCaption: {
    ...typography.footnote,
    color: '#666666',
  },
  emptyBlock: {
    marginTop: 28,
    paddingHorizontal: 12,
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
  filterGlyphWrap: {
    width: 14,
    gap: 2,
  },
  filterLine: {
    height: 1.5,
    borderRadius: 1,
    backgroundColor: '#777777',
  },
  filterLineMid: {
    width: 10,
    alignSelf: 'flex-end',
  },
  filterRow: {
    marginTop: 10,
    gap: 8,
    paddingRight: 14,
  },
  filterPill: {
    minWidth: 56,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#D6CDCF',
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
  filterPillActive: {
    backgroundColor: 'transparent',
    borderColor: '#D6CDD0',
    overflow: 'hidden',
  },
  filterPillGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    ...typography.subheadline,
    color: '#5F5F5F',
  },
  filterTextActive: {
    ...typography.subheadline,
    color: '#363636',
  },
  bannerImage: {
    marginTop: 12,
    width: '100%',
    height: 127,
    borderRadius: 14,
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createButton: {
    width: 176,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#050505',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  createButtonText: {
    ...typography.small,
    color: '#FFFFFF',
  },
  createButtonPlus: {
    ...typography.title2,
    color: '#FFFFFF',
    marginTop: -3,
  },
  toggleWrap: {
    width: 88,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3E3E3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    gap: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#F3F3F3',
  },
  gridGlyphWrap: {
    width: 14,
    height: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridGlyphCell: {
    width: 6,
    height: 6,
    borderWidth: 1,
    borderColor: '#6A6A6A',
    borderRadius: 1,
  },
  listGlyphWrap: {
    width: 14,
    gap: 2,
  },
  listGlyphRow: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#6A6A6A',
  },
  toggleGlyphActive: {
    borderColor: '#1F1F1F',
    backgroundColor: '#1F1F1F',
  },
  gridWrap: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    backgroundColor: '#ECECEC',
    borderRadius: 13,
    marginBottom: 12,
    overflow: 'hidden',
  },
  gridTagWrap: {
    height: 44,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    backgroundColor: '#B79DBC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTag: {
    ...typography.subheadline,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  gridImageWrap: {
    height: 168,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridImage: {
    width: 112,
    height: 132,
  },
  gridBottomRow: {
    height: 48,
    backgroundColor: '#ECECEC',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  gridName: {
    ...typography.body,
    color: '#222222',
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C2ADC4',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    ...typography.caption1,
    color: '#FFFFFF',
  },
  listWrap: {
    marginTop: 12,
  },
  listItemRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  listImageCard: {
    width: 120,
    height: 150,
    borderRadius: 11,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  listImageCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  listImage: {
    width: 88,
    height: 112,
  },
  listTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  listTag: {
    ...typography.headline,
    color: '#161616',
  },
  listNameRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listName: {
    ...typography.body,
    color: '#171717',
  },
  viewDetailsButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  viewDetailsButtonGradient: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  viewDetailsText: {
    ...typography.caption1,
    color: '#202020',
  },
  viewDetailsArrow: {
    ...typography.footnote,
    color: '#202020',
  },
  bottomGap: {
    height: 116,
  },
});
