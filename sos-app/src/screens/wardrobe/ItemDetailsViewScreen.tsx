import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { typography } from '../../theme/typography';
import { gradients } from '../../theme/gradients';
import { fontNames } from '../../theme/fonts';
import type { ItemDetailsViewParams } from '../../navigation/wardrobeNavParams';
import { wardrobeItemService } from '../../services/wardrobeItemService';
import type { WardrobeItem } from '../../models/WardrobeItem.model';
import { ApiError } from '../../api/errors';
import { notify } from '../../utils/notify';
import { logSosError } from '../../utils/logSosError';

const LOG = '[SOS_ITEM_DETAILS]';

type ItemDetailsViewScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ ItemDetailsView: { item: ItemDetailsViewParams } }, 'ItemDetailsView'>;
};

const defaultItem: ItemDetailsViewParams = {
  name: 'Red Overcoat',
  image: require('../../../assets/EditItemDetails/trendy-top-design-mockup-presented-wooden-hanger_460848-14028 1.png'),
  details: {
    category: 'Top',
    color: '#8C1215',
    season: 'Winter',
    size: '32 | Large',
    material: 'Cotton',
    occasion: 'Formal',
    description:
      "One very important aspect of describing attire well is understanding why you're describing it in the first place.",
  },
};

const mapWardrobeItemToView = (it: WardrobeItem, imageFallback: ItemDetailsViewParams['image']): ItemDetailsViewParams => ({
  name: it.name,
  wardrobeItemId: it.id,
  image: it.imageUrl ? { uri: it.imageUrl } : imageFallback,
  details: {
    category: it.category || '—',
    color: it.color ?? '#888888',
    season: it.seasons.length ? it.seasons.join(', ') : '—',
    size: it.size ?? '—',
    material: it.material ?? '—',
    occasion: it.occasions.length ? it.occasions.join(', ') : '—',
    description: it.description?.trim() ? it.description : '—',
  },
});

export const ItemDetailsViewScreen: React.FC<ItemDetailsViewScreenProps> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(400, width - 40);
  const routeItem = route.params?.item;
  const [fetched, setFetched] = useState<ItemDetailsViewParams | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const item = fetched ?? routeItem ?? defaultItem;

  useFocusEffect(
    useCallback(() => {
      const id = route.params?.item?.wardrobeItemId;
      if (!id) {
        return;
      }
      let cancelled = false;
      void (async () => {
        try {
          const it = await wardrobeItemService.getItem(id);
          if (cancelled || !it) {
            if (!cancelled && !it) {
              console.warn(`${LOG} getItem returned empty — keeping route params`, { id });
            }
            return;
          }
          setFetched(mapWardrobeItemToView(it, route.params.item.image ?? defaultItem.image));
        } catch (error) {
          logSosError(LOG, 'refresh item on focus', error);
          notify({
            type: 'error',
            message:
              error instanceof ApiError
                ? error.message
                : 'Could not refresh this item. Showing last known details.',
          });
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [route.params?.item?.wardrobeItemId])
  );

  const title = useMemo(() => {
    if (!item?.name) return defaultItem.name;
    return item.name;
  }, [item?.name]);
  const itemColor = item.details?.color ?? defaultItem.details.color;

  const onDelete = () => {
    const id = item.wardrobeItemId;
    if (!id) {
      Alert.alert('Item details', 'This preview item cannot be removed from the server.');
      return;
    }
    Alert.alert('Remove item', 'This permanently removes the piece from your wardrobe.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await wardrobeItemService.deleteItem(id);
            notify({ type: 'success', message: 'Item removed.' });
            navigation.goBack();
          } catch (error) {
            logSosError(LOG, 'deleteItem', error);
            const message =
              error instanceof ApiError
                ? error.message
                : error instanceof Error
                  ? error.message
                  : 'Could not delete this item.';
            notify({ type: 'error', message });
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const onEdit = () => {
    const id = item.wardrobeItemId;
    if (!id) {
      console.warn(`${LOG} onEdit skipped — no wardrobeItemId`);
      notify({ type: 'error', message: 'Open this item from a folder to edit it.' });
      return;
    }
    navigation.navigate('EditItemDetails', { mode: 'edit', itemId: id });
  };

  return (
    <SafeContainer style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: Math.max(20, (width - contentWidth) / 2),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backRow} activeOpacity={0.75} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.iconHit}
              activeOpacity={0.75}
              onPress={onEdit}
              accessibilityLabel="Edit item"
            >
              <Ionicons name="create-outline" size={18} color="#9B9B9B" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconHit}
              activeOpacity={0.75}
              onPress={onDelete}
              disabled={isDeleting}
              accessibilityLabel="Delete item"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#9B9B9B" />
              ) : (
                <Ionicons name="trash-outline" size={17} color="#9B9B9B" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageWrap}>
          <Image source={item.image ?? defaultItem.image} style={styles.itemImage} resizeMode="contain" />
        </View>

        <Text style={styles.itemTitle}>{title}</Text>

        <TouchableOpacity
          style={styles.virtualTryOnButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('VirtualTryOn', {
              selectedItem: item,
            })
          }
        >
          <LinearGradient
            colors={gradients.sospink.colors}
            start={gradients.sospink.start}
            end={gradients.sospink.end}
            style={styles.virtualTryOnGradient}
          >
            <Text style={styles.virtualTryOnText}>Virtual Try-On</Text>
            <Text style={styles.virtualTryOnArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.detailsCard}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Category:</Text>
            <View style={styles.valueSlot}>
              <Text style={styles.detailsValue}>{item.details?.category ?? defaultItem.details.category}</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Color:</Text>
            <View style={styles.valueSlot}>
              <View style={[styles.colorDot, { backgroundColor: itemColor }]} />
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Season</Text>
            <View style={styles.valueSlot}>
              <Text style={styles.detailsValue}>{item.details?.season ?? defaultItem.details.season}</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Size:</Text>
            <View style={styles.valueSlot}>
              <Text style={styles.detailsValue}>{item.details?.size ?? defaultItem.details.size}</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Material:</Text>
            <View style={styles.valueSlot}>
              <Text style={styles.detailsValue}>{item.details?.material ?? defaultItem.details.material}</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Occasion</Text>
            <View style={styles.valueSlot}>
              <Text style={styles.detailsValue}>{item.details?.occasion ?? defaultItem.details.occasion}</Text>
            </View>
          </View>

          <View style={styles.descriptionWrap}>
            <Text style={styles.detailsLabel}>Description:</Text>
            <Text style={styles.descriptionText}>{item.details?.description ?? defaultItem.details.description}</Text>
          </View>
        </View>
        <View style={styles.bottomGap} />
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  topRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backArrow: {
    ...typography.body,
    color: '#1A1A1A',
  },
  backText: {
    ...typography.small,
    color: '#3F3F3F',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconHit: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 360,
  },
  itemImage: {
    width: 260,
    height: 320,
  },
  itemTitle: {
    marginTop: 8,
    textAlign: 'center',
    ...typography.title1,
    color: '#111111',
    fontFamily: fontNames.medium,
    fontWeight: '500',
  },
  virtualTryOnButton: {
    marginTop: 8,
    alignSelf: 'center',
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
  },
  virtualTryOnGradient: {
    height: 30,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  virtualTryOnText: {
    ...typography.caption2,
    color: '#1D1D1D',
    fontFamily: fontNames.medium,
  },
  virtualTryOnArrow: {
    ...typography.caption2,
    color: '#1D1D1D',
    fontWeight: '700',
  },
  detailsCard: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  detailsRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsLabel: {
    ...typography.headline,
    color: '#171717',
    fontWeight: '400',
    fontFamily: fontNames.regular,
  },
  detailsValue: {
    ...typography.headline,
    color: '#171717',
    fontWeight: '700',
    fontFamily: fontNames.bold,
    textAlign: 'right',
  },
  valueSlot: {
    width: '48%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  descriptionWrap: {
    marginTop: 4,
  },
  descriptionText: {
    marginTop: 8,
    ...typography.callout,
    color: '#1E1E1E',
    lineHeight: 26,
  },
  bottomGap: {
    height: 110,
  },
});
