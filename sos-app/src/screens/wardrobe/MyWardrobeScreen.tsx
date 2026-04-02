import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

type MyWardrobeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type WardrobeItem = {
  id: string;
  tag: string;
  name: string;
  count: string;
  image: any;
};

const { width } = Dimensions.get('window');

const FILTERS = ['All', 'Tops', 'T-shirt', 'Trousers', 'Dresses'];

const ITEMS: WardrobeItem[] = [
  {
    id: '1',
    tag: 'TIMELESS',
    name: 'T-Shirt',
    count: '12',
    image: require('../../../assets/MyWardrobe/women-blank-red-tshirt-mockup-600nw-2500913723 1.png'),
  },
  {
    id: '2',
    tag: 'MODERN',
    name: 'Tops',
    count: '30',
    image: require('../../../assets/MyWardrobe/WomenUpper.png'),
  },
  {
    id: '3',
    tag: 'ELEGANT',
    name: 'Dresses',
    count: '17',
    image: require('../../../assets/MyWardrobe/WomenDress.png'),
  },
  {
    id: '4',
    tag: 'POLISHED',
    name: 'Trousers',
    count: '08',
    image: require('../../../assets/MyWardrobe/download 5.png'),
  },
  {
    id: '5',
    tag: 'TIMELESS',
    name: 'T-Shirt',
    count: '12',
    image: require('../../../assets/MyWardrobe/women-blank-red-tshirt-mockup-600nw-2500913723 1 (1).png'),
  },
  {
    id: '6',
    tag: 'TIMELESS',
    name: 'T-Shirt',
    count: '12',
    image: require('../../../assets/MyWardrobe/women-blank-red-tshirt-mockup-600nw-2500913723 1.png'),
  },
];

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
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isGridView, setIsGridView] = useState(true);

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'All') return ITEMS;
    if (selectedFilter === 'Tops') return ITEMS.filter((item) => item.name === 'Tops');
    if (selectedFilter === 'T-shirt') return ITEMS.filter((item) => item.name === 'T-Shirt');
    if (selectedFilter === 'Trousers') return ITEMS.filter((item) => item.name === 'Trousers');
    if (selectedFilter === 'Dresses') return ITEMS.filter((item) => item.name === 'Dresses');
    return ITEMS;
  }, [selectedFilter]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />

      <View style={styles.topInset} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.searchText}>Look Into Your Wardrobe</Text>
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
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{filter}</Text>
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
          <TouchableOpacity style={styles.createButton} activeOpacity={0.85}>
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

        {isGridView ? (
          <View style={styles.gridWrap}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('VirtualTryOn')}
              >
                <View style={styles.gridTagWrap}>
                  <Text style={styles.gridTag}>{item.tag}</Text>
                </View>
                <View style={styles.gridImageWrap}>
                  <Image source={item.image} style={styles.gridImage} resizeMode="contain" />
                </View>
                <View style={styles.gridBottomRow}>
                  <Text style={styles.gridName}>{item.name}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{item.count}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.listWrap}>
            {filteredItems.map((item) => (
              <View key={item.id} style={styles.listItemRow}>
                <TouchableOpacity
                  style={styles.listImageCard}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('VirtualTryOn')}
                >
                  <Image source={item.image} style={styles.listImage} resizeMode="contain" />
                </TouchableOpacity>

                <View style={styles.listTextCol}>
                  <Text style={styles.listTag}>{item.tag}</Text>
                  <View style={styles.listNameRow}>
                    <Text style={styles.listName}>{item.name}</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{item.count}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('EditItemDetails')}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Text style={styles.viewDetailsArrow}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomGap} />
      </ScrollView>
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
    paddingHorizontal: 14,
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
    backgroundColor: '#D6CDD0',
    borderColor: '#D6CDD0',
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
    width: (width - 40) / 2,
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
    backgroundColor: '#C7B0CA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    backgroundColor: '#D9CEDB',
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
