import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageSourcePropType,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { typography } from '../../theme/typography';
import { SOSButton } from '../../components/SOSButton';
import type { EditItemDetailsParams } from '../../navigation/wardrobeNavParams';
import { normalizeWardrobeItemCategory, wardrobeItemService } from '../../services/wardrobeItemService';
import { wardrobeFolderService } from '../../services/wardrobeFolderService';
import { ApiError } from '../../api/errors';
import { notify } from '../../utils/notify';
import { logSosError } from '../../utils/logSosError';

const LOG = '[SOS_EDIT_ITEM_DETAILS]';
const WheelColorPickerModule = require('react-native-wheel-color-picker');
const WheelColorPicker =
  (WheelColorPickerModule &&
    (WheelColorPickerModule.default ??
      WheelColorPickerModule.ColorPicker ??
      WheelColorPickerModule)) ||
  null;

const { width } = Dimensions.get('window');

type EditItemDetailsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

/** Mirrors server fields we must resend on PUT so Laravel receives the same shape as Hoppscotch. */
type EditPutSnapshot = {
  folderId: string;
  subcategory: string;
  productUrl: string;
  isFavorite: boolean;
  seasonsApi: string[];
  occasionsApi: string[];
};

type DropdownFieldKey = 'category' | 'season' | 'size' | 'material' | 'occasion';

const COLOR_SWATCHES = ['#C5A784', '#7A5F4B', '#5A4436', '#8E776B', '#B49D85', '#E9D7C0'];

const DROPDOWN_OPTIONS: Record<DropdownFieldKey, string[]> = {
  category: ['Top', 'Shirt', 'Coat', 'Bottom', 'Dress'],
  season: ['Winter', 'Summer', 'Spring', 'Autumn', 'All Season'],
  size: ['28 | Small', '30 | Medium', '32 | Large', '34 | XL', '36 | XXL'],
  material: ['Cotton', 'Wool', 'Denim', 'Linen', 'Polyester'],
  occasion: ['Formal', 'Casual', 'Party', 'Travel', 'Work'],
};

/**
 * Wardrobe item `category` must match Laravel `Rule::in` for this resource.
 * Hoppscotch + live responses use singular buckets: `top`, `bottom`, `outerwear`, `dress`
 * (not `tops` / `bottoms` — those are virtual-try-on categories in the same API export).
 */
const CATEGORY_TO_API: Record<string, string> = {
  Top: 'top',
  Shirt: 'top',
  Coat: 'outerwear',
  Bottom: 'bottom',
  Dress: 'dress',
};

const SEASON_TO_API: Record<string, string> = {
  Winter: 'winter',
  Summer: 'summer',
  Spring: 'spring',
  Autumn: 'autumn',
  'All Season': 'all-season',
};

const OCCASION_TO_API: Record<string, string> = {
  Formal: 'formal',
  Casual: 'casual',
  Party: 'party',
  Travel: 'travel',
  Work: 'work',
};

const API_TO_CATEGORY_LABEL: Record<string, string> = {
  top: 'Top',
  tops: 'Top',
  shirt: 'Shirt',
  blouse: 'Shirt',
  coat: 'Coat',
  jacket: 'Coat',
  outerwear: 'Coat',
  bottom: 'Bottom',
  bottoms: 'Bottom',
  pant: 'Bottom',
  pants: 'Bottom',
  skirt: 'Bottom',
  dress: 'Dress',
  'one-piece': 'Dress',
  onepiece: 'Dress',
};

const API_TO_SEASON_LABEL: Record<string, string> = {
  winter: 'Winter',
  summer: 'Summer',
  spring: 'Spring',
  autumn: 'Autumn',
  'all-season': 'All Season',
};

const API_TO_OCCASION_LABEL: Record<string, string> = {
  formal: 'Formal',
  casual: 'Casual',
  party: 'Party',
  travel: 'Travel',
  work: 'Work',
};

const formatSaveFailureMessage = (error: unknown, verb: string): string => {
  if (error instanceof ApiError) {
    if (error.code === 'VALIDATION_ERROR') {
      return `${error.message} Please check category, season, occasion, and other fields, then try again.`;
    }
    return error.message;
  }
  if (error instanceof Error && error.message.trim()) {
    return `${verb}: ${error.message}`;
  }
  return verb;
};

const FRONT_IMAGE = require('../../../assets/EditItemDetails/trendy-top-design-mockup-presented-wooden-hanger_460848-14028 1.png');
const FRONT_THUMB_IMAGE = require('../../../assets/EditItemDetails/trendy-top-design-mockup-presented-wooden-hanger_460848-14028 1 (1).png');
const BACK_IMAGE = require('../../../assets/EditItemDetails/d16fbbf0-d5c4-405c-8740-c0574a48c79d 1.png');
const BACK_THUMB_IMAGE = require('../../../assets/EditItemDetails/Frame 1000006728.png');

const TOP_ONLY_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  // Android elevation always casts mostly bottom shadow; use subtle top border instead.
  android: {
    elevation: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
  },
  default: {},
}) ?? {};

const INITIAL_DESCRIPTION =
  "One very important aspect of describing attire well is understanding why you're describing it in the first place.";

const materialToApi = (m: string) => m.trim().toLowerCase();

const normalizeHexColor = (value: string): string | null => {
  const hex = value.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex.toUpperCase()}`;
  }
  return null;
};

const sizeToApi = (s: string) => {
  const parts = s.split('|');
  return parts.length > 1 ? parts[1].trim() : s.trim();
};

const sizeLabelFromApi = (apiSize: string | null | undefined): string => {
  if (!apiSize) {
    return DROPDOWN_OPTIONS.size[2];
  }
  const found = DROPDOWN_OPTIONS.size.find((o) => o.toLowerCase().includes(apiSize.toLowerCase()));
  return found ?? apiSize;
};

const materialLabelFromApi = (apiMaterial: string | null | undefined): string => {
  if (!apiMaterial) {
    return DROPDOWN_OPTIONS.material[0];
  }
  const found = DROPDOWN_OPTIONS.material.find((o) => o.toLowerCase() === apiMaterial.toLowerCase());
  return found ?? DROPDOWN_OPTIONS.material[0];
};

type EditRoute = RouteProp<{ EditItemDetails: EditItemDetailsParams | undefined }, 'EditItemDetails'>;

export const EditItemDetailsScreen: React.FC<EditItemDetailsScreenProps> = ({ navigation }) => {
  const route = useRoute<EditRoute>();
  const params = route.params;

  const createParams = params?.mode === 'create' ? params : undefined;
  const isCreate = Boolean(createParams);
  const isEdit = params?.mode === 'edit';
  const isLegacy = !isCreate && !isEdit;
  const editItemId = params?.mode === 'edit' ? params.itemId : undefined;

  const [name, setName] = useState('Red Overcoat');
  const [brand, setBrand] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('0');
  const [category, setCategory] = useState('Top');
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);
  const [season, setSeason] = useState('Winter');
  const [size, setSize] = useState('32 | Large');
  const [material, setMaterial] = useState('Cotton');
  const [occasion, setOccasion] = useState('Formal');
  const [description, setDescription] = useState(INITIAL_DESCRIPTION);
  const [selectedThumbnail, setSelectedThumbnail] = useState<'front' | 'back' | 'add'>('front');
  const [activeDropdown, setActiveDropdown] = useState<DropdownFieldKey | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showColorPickerModal, setShowColorPickerModal] = useState(false);
  const [customColorDraft, setCustomColorDraft] = useState(COLOR_SWATCHES[0]);

  const [resolvedFolderId, setResolvedFolderId] = useState<string | null>(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const [remoteImageUri, setRemoteImageUri] = useState<string | null>(null);

  const editPutSnapshotRef = useRef<EditPutSnapshot | null>(null);

  useEffect(() => {
    if (!isCreate) {
      return;
    }
    if (createParams?.folderId) {
      setResolvedFolderId(createParams.folderId);
      return;
    }
    let cancelled = false;
    void (async () => {
      setIsLoadingFolders(true);
      try {
        const folders = await wardrobeFolderService.listFolders();
        if (!cancelled && folders[0]) {
          setResolvedFolderId(folders[0].id);
        }
      } catch (error) {
        logSosError(LOG, 'listFolders (resolve default folder)', error, 'warn');
      } finally {
        if (!cancelled) {
          setIsLoadingFolders(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isCreate, createParams?.folderId]);

  useEffect(() => {
    if (!isEdit || !editItemId) {
      return;
    }
    let cancelled = false;
    editPutSnapshotRef.current = null;
    void (async () => {
      setIsLoadingItem(true);
      try {
        const it = await wardrobeItemService.getItem(editItemId);
        if (cancelled) {
          return;
        }
        if (!it) {
          console.warn(`${LOG} getItem returned empty`, { editItemId });
          notify({ type: 'error', message: 'This item was not found or could not be loaded.' });
          return;
        }
        const folderId = it.folderId?.trim() ?? '';
        const seasonsApi = it.seasons.length
          ? it.seasons.map((s) => s.trim().toLowerCase()).filter(Boolean)
          : [SEASON_TO_API[DROPDOWN_OPTIONS.season[0]] ?? 'winter'];
        const occasionsApi = it.occasions.length
          ? it.occasions.map((o) => o.trim().toLowerCase()).filter(Boolean)
          : [OCCASION_TO_API[DROPDOWN_OPTIONS.occasion[0]] ?? 'casual'];

        editPutSnapshotRef.current = {
          folderId,
          subcategory: it.subcategory?.trim() ?? '',
          productUrl: it.productUrl?.trim() ?? '',
          isFavorite: it.isFavorite,
          seasonsApi: [...seasonsApi],
          occasionsApi: [...occasionsApi],
        };

        setName(it.name);
        setBrand(it.brand ?? '');
        setPurchasePrice(it.purchasePrice?.trim() ? it.purchasePrice : '0');
        const catKey = normalizeWardrobeItemCategory(it.category);
        setCategory(API_TO_CATEGORY_LABEL[catKey] ?? API_TO_CATEGORY_LABEL[it.category.toLowerCase()] ?? 'Top');
        const apiColor = it.color && /^#/.test(it.color) ? it.color : COLOR_SWATCHES[0];
        setSelectedColor(apiColor);
        setCustomColorDraft(apiColor);
        setSeason(API_TO_SEASON_LABEL[seasonsApi[0] ?? ''] ?? DROPDOWN_OPTIONS.season[0]);
        setSize(sizeLabelFromApi(it.size));
        setMaterial(materialLabelFromApi(it.material));
        setOccasion(API_TO_OCCASION_LABEL[occasionsApi[0] ?? ''] ?? DROPDOWN_OPTIONS.occasion[0]);
        setDescription(it.description?.trim() ? it.description : '');
        setRemoteImageUri(it.imageUrl);
        setPendingImageUri(null);
      } catch (error) {
        logSosError(LOG, 'getItem (edit mode)', error);
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Could not load this item.';
        notify({ type: 'error', message });
      } finally {
        if (!cancelled) {
          setIsLoadingItem(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      editPutSnapshotRef.current = null;
    };
  }, [isEdit, editItemId]);

  const mainImageSource: ImageSourcePropType = useMemo(() => {
    if (pendingImageUri) {
      return { uri: pendingImageUri };
    }
    if (isCreate && createParams?.imageUri) {
      return { uri: createParams.imageUri };
    }
    if (remoteImageUri) {
      return { uri: remoteImageUri };
    }
    if (isLegacy) {
      return selectedThumbnail === 'back' ? BACK_IMAGE : FRONT_IMAGE;
    }
    return FRONT_IMAGE;
  }, [pendingImageUri, isCreate, createParams?.imageUri, remoteImageUri, isLegacy, selectedThumbnail]);

  const closeDropdown = () => setActiveDropdown(null);

  const handleSelectDropdownOption = (value: string) => {
    if (activeDropdown === 'category') {
      setCategory(value);
    }
    if (activeDropdown === 'season') {
      setSeason(value);
      const api = SEASON_TO_API[value] ?? value.trim().toLowerCase();
      if (editPutSnapshotRef.current && api) {
        editPutSnapshotRef.current.seasonsApi = [api];
      }
    }
    if (activeDropdown === 'size') {
      setSize(value);
    }
    if (activeDropdown === 'material') {
      setMaterial(value);
    }
    if (activeDropdown === 'occasion') {
      setOccasion(value);
      const api = OCCASION_TO_API[value] ?? value.trim().toLowerCase();
      if (editPutSnapshotRef.current && api) {
        editPutSnapshotRef.current.occasionsApi = [api];
      }
    }
    closeDropdown();
  };

  const pickNewPhoto = useCallback(async () => {
    if (!isCreate && !isEdit) {
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setPendingImageUri(result.assets[0].uri);
      }
    } catch (error) {
      logSosError(LOG, 'launchImageLibrary (replace photo)', error);
      notify({ type: 'error', message: 'Could not open your photo library. Check permissions and try again.' });
    }
  }, [isCreate, isEdit]);

  const effectiveFolderId = createParams?.folderId ?? resolvedFolderId ?? '';

  const applyCustomColor = () => {
    const normalized = normalizeHexColor(customColorDraft);
    if (!normalized) {
      notify({ type: 'error', message: 'Please enter a valid hex color like #C5A784.' });
      return;
    }
    setSelectedColor(normalized);
    setCustomColorDraft(normalized);
    setShowColorPickerModal(false);
  };

  const handleSave = async () => {
    if (isLegacy) {
      notify({
        type: 'info',
        message: 'This screen is not linked to the server yet. Open Add item from a folder or the Add tab.',
      });
      navigation.goBack();
      return;
    }
    if (isSaving) {
      return;
    }
    if (!name.trim()) {
      notify({ type: 'error', message: 'Add a name for this item.' });
      return;
    }
    if (isCreate && createParams) {
      if (!effectiveFolderId) {
        notify({
          type: 'error',
          message: 'Create a wardrobe folder first, then add items from that folder.',
        });
        return;
      }
      const imageUri = pendingImageUri ?? createParams.imageUri;
      if (!imageUri) {
        notify({ type: 'error', message: 'A photo is required for new items.' });
        return;
      }
      setIsSaving(true);
      try {
        await wardrobeItemService.createItem({
          name: name.trim(),
          category: normalizeWardrobeItemCategory(
            CATEGORY_TO_API[category] ?? category.trim().toLowerCase()
          ),
          brand: brand.trim() || 'Unknown',
          purchase_price: (purchasePrice || '0').trim(),
          folder_id: effectiveFolderId,
          seasons: [SEASON_TO_API[season] ?? season.trim().toLowerCase()].filter(Boolean),
          occasions: [OCCASION_TO_API[occasion] ?? occasion.trim().toLowerCase()].filter(Boolean),
          description: description.trim() || undefined,
          color: selectedColor,
          material: materialToApi(material),
          size: sizeToApi(size),
          imageUri,
        });
        notify({ type: 'success', message: 'Item added to your wardrobe.' });
        navigation.goBack();
      } catch (error) {
        logSosError(LOG, 'createItem', error);
        notify({ type: 'error', message: formatSaveFailureMessage(error, 'Could not add this item') });
      } finally {
        setIsSaving(false);
      }
      return;
    }
    if (isEdit && editItemId) {
      const snap = editPutSnapshotRef.current;
      if (!snap?.folderId) {
        notify({
          type: 'error',
          message: 'This item is still loading or has no folder on the server. Go back and open it again.',
        });
        return;
      }
      setIsSaving(true);
      try {
        const categoryApi = normalizeWardrobeItemCategory(
          CATEGORY_TO_API[category] ?? category.trim().toLowerCase()
        );
        await wardrobeItemService.updateItem(editItemId, {
          name: name.trim(),
          description: description.trim(),
          category: categoryApi,
          color: selectedColor,
          brand: brand.trim() || undefined,
          material: materialToApi(material),
          size: sizeToApi(size),
          purchase_price: purchasePrice.trim() || undefined,
          folder_id: snap.folderId,
          subcategory: snap.subcategory,
          product_url: snap.productUrl,
          is_favorite: snap.isFavorite,
          seasons: snap.seasonsApi.length
            ? [...snap.seasonsApi]
            : [SEASON_TO_API[season] ?? season.trim().toLowerCase()].filter(Boolean),
          occasions: snap.occasionsApi.length
            ? [...snap.occasionsApi]
            : [OCCASION_TO_API[occasion] ?? occasion.trim().toLowerCase()].filter(Boolean),
          imageUri: pendingImageUri ?? undefined,
        });
        notify({ type: 'success', message: 'Your changes were saved.' });
        navigation.goBack();
      } catch (error) {
        logSosError(LOG, 'updateItem', error);
        notify({ type: 'error', message: formatSaveFailureMessage(error, 'Could not update this item') });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const onOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const onCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const onConfirmDelete = async () => {
    if (isLegacy || !isEdit || !editItemId) {
      setShowDeleteModal(false);
      navigation.goBack();
      return;
    }
    setIsDeleting(true);
    try {
      await wardrobeItemService.deleteItem(editItemId);
      notify({ type: 'success', message: 'Item removed.' });
      setShowDeleteModal(false);
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
  };

  if (isLoadingItem) {
    return (
      <View style={[styles.container, styles.loadingWrap]}>
        <StatusBar barStyle="dark-content" backgroundColor="#EFEFEF" />
        <ActivityIndicator size="large" color="#9B7BA0" />
        <Text style={styles.loadingLabel}>Loading item…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EFEFEF" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topInset} />

        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backHit} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          {!isCreate ? (
            <TouchableOpacity style={styles.deleteHit} activeOpacity={0.7} onPress={onOpenDeleteModal}>
              <Ionicons name="trash-outline" size={18} color="#6F6F6F" />
            </TouchableOpacity>
          ) : (
            <View style={styles.deleteHit} />
          )}
        </View>

        {isCreate && isLoadingFolders ? (
          <View style={styles.folderHint}>
            <ActivityIndicator size="small" color="#888888" />
            <Text style={styles.folderHintText}>Resolving folder…</Text>
          </View>
        ) : null}

        <View style={styles.mainImageWrap}>
          <Image source={mainImageSource} style={styles.mainImage} resizeMode="contain" />
          {(isCreate || isEdit) && (
            <TouchableOpacity style={styles.zoomButton} activeOpacity={0.8} onPress={pickNewPhoto}>
              <Text style={styles.zoomText}>⊕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.titleRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.titleInput}
            placeholder="Item name"
            placeholderTextColor="#9A9A9A"
            editable={!isSaving}
          />
        </View>

        {isLegacy ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            <TouchableOpacity
              style={[styles.thumbnailCard, selectedThumbnail === 'front' && styles.thumbnailCardSelected]}
              activeOpacity={0.85}
              onPress={() => setSelectedThumbnail('front')}
            >
              <Image source={FRONT_THUMB_IMAGE} style={styles.thumbImage} resizeMode="contain" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.thumbnailCard, selectedThumbnail === 'back' && styles.thumbnailCardSelected]}
              activeOpacity={0.85}
              onPress={() => setSelectedThumbnail('back')}
            >
              <Image source={BACK_THUMB_IMAGE} style={styles.thumbImageBack} resizeMode="cover" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addThumbnailCard, selectedThumbnail === 'add' && styles.thumbnailCardSelected]}
              activeOpacity={0.85}
              onPress={() => setSelectedThumbnail('add')}
            >
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}

        <View style={styles.formWrap}>
          <Field label="Category">
            <Dropdown value={category} onPress={() => setActiveDropdown('category')} disabled={isSaving} />
          </Field>

          <Field label="Color">
            <View style={styles.colorRow}>
              {COLOR_SWATCHES.map((swatch, index) => {
                const isSelected = swatch === selectedColor;
                return (
                  <TouchableOpacity
                    key={`${swatch}-${index}`}
                    style={[styles.colorDot, { backgroundColor: swatch }, isSelected && styles.colorDotSelected]}
                    onPress={() => setSelectedColor(swatch)}
                    activeOpacity={0.8}
                    disabled={isSaving}
                  />
                );
              })}
              <TouchableOpacity
                style={styles.pickColorButton}
                onPress={() => setShowColorPickerModal(true)}
                activeOpacity={0.85}
                disabled={isSaving}
              >
                <Text style={styles.pickColorButtonText}>Pick</Text>
              </TouchableOpacity>
              <View style={styles.selectedColorPreview}>
                <View style={[styles.selectedColorDot, { backgroundColor: selectedColor }]} />
                <Text style={styles.selectedColorLabel}>{selectedColor.toUpperCase()}</Text>
              </View>
            </View>
          </Field>

          <Field label="Season">
            <Dropdown value={season} onPress={() => setActiveDropdown('season')} disabled={isSaving} />
          </Field>

          <Field label="Size">
            <Dropdown value={size} onPress={() => setActiveDropdown('size')} disabled={isSaving} />
          </Field>

          <Field label="Material">
            <Dropdown value={material} onPress={() => setActiveDropdown('material')} disabled={isSaving} />
          </Field>

          <Field label="Occasion">
            <Dropdown value={occasion} onPress={() => setActiveDropdown('occasion')} disabled={isSaving} />
          </Field>

          <Field label="Brand">
            <TextInput
              value={brand}
              onChangeText={setBrand}
              style={styles.inlineInput}
              placeholder="e.g. Gucci"
              placeholderTextColor="#9A9A9A"
              editable={!isSaving}
            />
          </Field>

          <Field label="Purchase price">
            <TextInput
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              style={styles.inlineInput}
              placeholder="0"
              placeholderTextColor="#9A9A9A"
              keyboardType="decimal-pad"
              editable={!isSaving}
            />
          </Field>

          <Field label="Description">
            <TextInput
              value={description}
              style={styles.descriptionInput}
              multiline
              editable={!isSaving}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </Field>
        </View>

        <SOSButton
          title="Save"
          onPress={() => void handleSave()}
          variant="primary"
          size="medium"
          style={styles.saveButton}
          loading={isSaving}
        />

        <View style={styles.bottomGap} />
      </ScrollView>

      <Modal visible={activeDropdown !== null} transparent animationType="fade" onRequestClose={closeDropdown}>
        <Pressable style={styles.dropdownOverlay} onPress={closeDropdown}>
          <Pressable style={styles.dropdownModal}>
            {(activeDropdown ? DROPDOWN_OPTIONS[activeDropdown] : []).map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownOption}
                onPress={() => handleSelectDropdownOption(option)}
                activeOpacity={0.85}
              >
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showColorPickerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowColorPickerModal(false)}
      >
        <View style={styles.dropdownOverlay}>
          <View style={styles.colorModal}>
            <Text style={styles.colorModalTitle}>Choose item color</Text>
            {WheelColorPicker ? (
              <View style={styles.colorPickerWrap}>
                <WheelColorPicker
                  color={customColorDraft}
                  onColorChange={(color: string) => {
                    const normalized = normalizeHexColor(color);
                    if (normalized) {
                      setCustomColorDraft(normalized);
                    }
                  }}
                  thumbSize={22}
                  sliderSize={18}
                  noSnap
                  row={false}
                />
              </View>
            ) : (
              <View style={styles.colorPickerUnavailable}>
                <Text style={styles.colorPickerUnavailableText}>
                  Color wheel is unavailable on this runtime. Enter a HEX color below (for example: #C5A784).
                </Text>
              </View>
            )}
            <TextInput
              style={styles.colorHexInput}
              value={customColorDraft}
              onChangeText={(value) => setCustomColorDraft(value.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="#C5A784"
              placeholderTextColor="#8C8C8C"
              maxLength={7}
            />
            <View style={styles.colorModalActions}>
              <TouchableOpacity
                style={styles.colorModalCancel}
                onPress={() => setShowColorPickerModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.colorModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.colorModalApply} onPress={applyCustomColor} activeOpacity={0.85}>
                <Text style={styles.colorModalApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={onCloseDeleteModal}>
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteSheet}>
            <Text style={styles.deleteTitle}>Are you sure?</Text>
            <Text style={styles.deleteSubtitle}>This action is not reversible</Text>

            <TouchableOpacity style={styles.notNowButton} activeOpacity={0.85} onPress={onCloseDeleteModal}>
              <Text style={styles.notNowText}>Not Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.85}
              onPress={() => void onConfirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>Yes, Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

const Field: React.FC<FieldProps> = ({ label, children }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}:</Text>
    {children}
  </View>
);

type DropdownProps = {
  value: string;
  onPress: () => void;
  disabled?: boolean;
};

const Dropdown: React.FC<DropdownProps> = ({ value, onPress, disabled }) => (
  <TouchableOpacity style={styles.dropdown} activeOpacity={0.85} onPress={onPress} disabled={disabled}>
    <Text style={styles.dropdownValue}>{value}</Text>
    <Text style={styles.dropdownChevron}>⌄</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  loadingWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLabel: {
    marginTop: 12,
    ...typography.subheadline,
    color: '#555555',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
  },
  topInset: {
    height: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backHit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  deleteHit: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  backArrow: {
    ...typography.body,
    color: '#151515',
    marginTop: -1,
  },
  backText: {
    ...typography.small,
    color: '#3F3F3F',
  },
  folderHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    justifyContent: 'center',
  },
  folderHintText: {
    ...typography.footnote,
    color: '#666666',
  },
  mainImageWrap: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 318,
    position: 'relative',
  },
  mainImage: {
    width: width * 0.62,
    height: 294,
  },
  zoomButton: {
    position: 'absolute',
    right: 8,
    bottom: 18,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#B8B8B8',
    alignItems: 'center',
    justifyContent: 'center',
    ...TOP_ONLY_SHADOW,
  },
  zoomText: {
    ...typography.caption1,
    color: '#F2F2F2',
    lineHeight: 11,
    marginTop: -1,
  },
  titleRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  titleInput: {
    flex: 1,
    textAlign: 'center',
    ...typography.largeTitle,
    color: '#131313',
    paddingVertical: 4,
    minHeight: 44,
  },
  thumbnailRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  thumbnailCard: {
    width: 78,
    height: 78,
    borderRadius: 9,
    backgroundColor: '#D3C8D8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...TOP_ONLY_SHADOW,
  },
  thumbnailCardSelected: {
    ...TOP_ONLY_SHADOW,
  },
  thumbImage: {
    width: 42,
    height: 64,
  },
  thumbImageBack: {
    width: 78,
    height: 78,
  },
  addThumbnailCard: {
    width: 78,
    height: 78,
    borderRadius: 9,
    backgroundColor: '#E4DEE7',
    alignItems: 'center',
    justifyContent: 'center',
    ...TOP_ONLY_SHADOW,
  },
  addText: {
    ...typography.largeTitle,
    color: '#101010',
    marginTop: -4,
  },
  formWrap: {
    marginTop: 10,
  },
  fieldWrap: {
    marginBottom: 7,
  },
  fieldLabel: {
    ...typography.subheadline,
    color: '#1D1D1D',
    marginBottom: 6,
  },
  inlineInput: {
    ...typography.body,
    color: '#151515',
    backgroundColor: '#ECECEC',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 10,
    minHeight: 44,
    ...TOP_ONLY_SHADOW,
  },
  dropdown: {
    height: 33,
    borderRadius: 9,
    backgroundColor: '#ECECEC',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...TOP_ONLY_SHADOW,
  },
  dropdownValue: {
    ...typography.caption1,
    color: '#151515',
  },
  dropdownChevron: {
    ...typography.footnote,
    color: '#181818',
    marginTop: -1,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 36,
    paddingLeft: 1,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  colorDotSelected: {
    ...TOP_ONLY_SHADOW,
  },
  pickColorButton: {
    paddingHorizontal: 12,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    ...TOP_ONLY_SHADOW,
  },
  pickColorButtonText: {
    ...typography.caption1,
    color: '#181818',
  },
  selectedColorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ECECEC',
    ...TOP_ONLY_SHADOW,
  },
  selectedColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  selectedColorLabel: {
    ...typography.caption1,
    color: '#2F2F2F',
  },
  colorModal: {
    borderRadius: 14,
    backgroundColor: '#F2F2F2',
    padding: 14,
    ...TOP_ONLY_SHADOW,
  },
  colorModalTitle: {
    ...typography.headline,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
  },
  colorPickerWrap: {
    height: 200,
  },
  colorPickerUnavailable: {
    borderRadius: 10,
    backgroundColor: '#E7E7E7',
    padding: 12,
    marginBottom: 4,
  },
  colorPickerUnavailableText: {
    ...typography.caption1,
    color: '#4A4A4A',
    lineHeight: 18,
  },
  colorHexInput: {
    marginTop: 8,
    ...typography.body,
    color: '#151515',
    backgroundColor: '#E7E7E7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'center',
    ...TOP_ONLY_SHADOW,
  },
  colorModalActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  colorModalCancel: {
    minWidth: 84,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E4E4E4',
    justifyContent: 'center',
    alignItems: 'center',
    ...TOP_ONLY_SHADOW,
  },
  colorModalCancelText: {
    ...typography.subheadline,
    color: '#333333',
  },
  colorModalApply: {
    minWidth: 84,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    ...TOP_ONLY_SHADOW,
  },
  colorModalApplyText: {
    ...typography.subheadline,
    color: '#FFFFFF',
  },
  descriptionInput: {
    minHeight: 83,
    borderRadius: 9,
    backgroundColor: '#ECECEC',
    paddingHorizontal: 9,
    paddingTop: 9,
    ...typography.caption1,
    color: '#3A3A3A',
    ...TOP_ONLY_SHADOW,
  },
  bottomGap: {
    height: 112,
  },
  saveButton: {
    marginTop: 14,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  dropdownModal: {
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    ...TOP_ONLY_SHADOW,
  },
  dropdownOption: {
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    marginBottom: 1,
  },
  dropdownOptionText: {
    ...typography.subheadline,
    color: '#1E1E1E',
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(168, 168, 168, 0.58)',
    justifyContent: 'flex-end',
  },
  deleteSheet: {
    backgroundColor: '#F4F4F4',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 42,
    paddingHorizontal: 28,
    paddingBottom: 94,
    alignItems: 'center',
    ...TOP_ONLY_SHADOW,
  },
  deleteTitle: {
    ...typography.largeTitle,
    color: '#111111',
  },
  deleteSubtitle: {
    marginTop: 12,
    ...typography.subheadline,
    color: '#202020',
  },
  notNowButton: {
    marginTop: 32,
    width: 190,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
    ...TOP_ONLY_SHADOW,
  },
  notNowText: {
    ...typography.body,
    color: '#202020',
  },
  deleteButton: {
    marginTop: 26,
    width: 190,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F21510',
    justifyContent: 'center',
    alignItems: 'center',
    ...TOP_ONLY_SHADOW,
  },
  deleteButtonText: {
    ...typography.body,
    color: '#FFFFFF',
  },
});
