import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { SOSButton } from '../../components/SOSButton';

const { width } = Dimensions.get('window');

type EditItemDetailsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type DropdownFieldKey = 'category' | 'season' | 'size' | 'material' | 'occasion';
type ThumbnailKey = 'front' | 'back' | 'add';

const COLOR_SWATCHES = ['#C5A784', '#7A5F4B', '#5A4436', '#8E776B', '#B49D85', '#E9D7C0'];

const DROPDOWN_OPTIONS: Record<DropdownFieldKey, string[]> = {
  category: ['Top', 'Shirt', 'Coat', 'Bottom', 'Dress'],
  season: ['Winter', 'Summer', 'Spring', 'Autumn', 'All Season'],
  size: ['28 | Small', '30 | Medium', '32 | Large', '34 | XL', '36 | XXL'],
  material: ['Cotton', 'Wool', 'Denim', 'Linen', 'Polyester'],
  occasion: ['Formal', 'Casual', 'Party', 'Travel', 'Work'],
};

const INITIAL_DESCRIPTION =
  "One very important aspect of describing attire well is understanding why you're describing it in the first place.";

const FRONT_IMAGE = require('../../../assets/EditItemDetails/trendy-top-design-mockup-presented-wooden-hanger_460848-14028 1.png');
const FRONT_THUMB_IMAGE = require('../../../assets/EditItemDetails/trendy-top-design-mockup-presented-wooden-hanger_460848-14028 1 (1).png');
const BACK_IMAGE = require('../../../assets/EditItemDetails/d16fbbf0-d5c4-405c-8740-c0574a48c79d 1.png');
const BACK_THUMB_IMAGE = require('../../../assets/EditItemDetails/Frame 1000006728.png');

export const EditItemDetailsScreen: React.FC<EditItemDetailsScreenProps> = ({ navigation }) => {
  const [category, setCategory] = useState('Top');
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);
  const [season, setSeason] = useState('Winter');
  const [size, setSize] = useState('32 | Large');
  const [material, setMaterial] = useState('Cotton');
  const [occasion, setOccasion] = useState('Formal');
  const [description, setDescription] = useState(INITIAL_DESCRIPTION);
  const [selectedThumbnail, setSelectedThumbnail] = useState<ThumbnailKey>('front');
  const [activeDropdown, setActiveDropdown] = useState<DropdownFieldKey | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const title = 'Red Overcoat';
  const mainImage = selectedThumbnail === 'back' ? BACK_IMAGE : FRONT_IMAGE;

  const closeDropdown = () => setActiveDropdown(null);

  const handleSelectDropdownOption = (value: string) => {
    if (activeDropdown === 'category') {
      setCategory(value);
    }
    if (activeDropdown === 'season') {
      setSeason(value);
    }
    if (activeDropdown === 'size') {
      setSize(value);
    }
    if (activeDropdown === 'material') {
      setMaterial(value);
    }
    if (activeDropdown === 'occasion') {
      setOccasion(value);
    }
    closeDropdown();
  };

  const handleSave = () => {
    navigation.goBack();
  };

  const onOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const onCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const onConfirmDelete = () => {
    setShowDeleteModal(false);
    navigation.goBack();
  };

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

          <TouchableOpacity style={styles.deleteHit} activeOpacity={0.7} onPress={onOpenDeleteModal}>
            <Ionicons name="trash-outline" size={18} color="#6F6F6F" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainImageWrap}>
          <Image source={mainImage} style={styles.mainImage} resizeMode="contain" />
          <TouchableOpacity style={styles.zoomButton} activeOpacity={0.8}>
            <Text style={styles.zoomText}>⊕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        </View>

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
            <Image
              source={FRONT_THUMB_IMAGE}
              style={styles.thumbImage}
              resizeMode="contain"
            />
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

        <View style={styles.formWrap}>
          <Field label="Category">
            <Dropdown value={category} onPress={() => setActiveDropdown('category')} />
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
                  />
                );
              })}
              <View style={styles.extraColorIcon}>
                <View style={styles.extraColorCore} />
              </View>
            </View>
          </Field>

          <Field label="Season">
            <Dropdown value={season} onPress={() => setActiveDropdown('season')} />
          </Field>

          <Field label="Size">
            <Dropdown value={size} onPress={() => setActiveDropdown('size')} />
          </Field>

          <Field label="Material">
            <Dropdown value={material} onPress={() => setActiveDropdown('material')} />
          </Field>

          <Field label="Occasion">
            <Dropdown value={occasion} onPress={() => setActiveDropdown('occasion')} />
          </Field>

          <Field label="Description">
            <TextInput
              value={description}
              style={styles.descriptionInput}
              multiline
              editable
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </Field>
        </View>

        <SOSButton
          title="Save"
          onPress={handleSave}
          variant="primary"
          size="medium"
          style={styles.saveButton}
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

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={onCloseDeleteModal}>
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteSheet}>
            <Text style={styles.deleteTitle}>Are you sure?</Text>
            <Text style={styles.deleteSubtitle}>This action is not reversible</Text>

            <TouchableOpacity style={styles.notNowButton} activeOpacity={0.85} onPress={onCloseDeleteModal}>
              <Text style={styles.notNowText}>Not Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} activeOpacity={0.85} onPress={onConfirmDelete}>
              <Text style={styles.deleteButtonText}>Yes, Delete</Text>
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
};

const Dropdown: React.FC<DropdownProps> = ({ value, onPress }) => (
  <TouchableOpacity style={styles.dropdown} activeOpacity={0.85} onPress={onPress}>
    <Text style={styles.dropdownValue}>{value}</Text>
    <Text style={styles.dropdownChevron}>⌄</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
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
  },
  zoomText: {
    ...typography.caption1,
    color: '#F2F2F2',
    lineHeight: 11,
    marginTop: -1,
  },
  titleRow: {
    marginTop: -2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  title: {
    ...typography.largeTitle,
    color: '#131313',
  },
  editIcon: {
    ...typography.caption2,
    color: '#A690A8',
    marginTop: 7,
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
  },
  thumbnailCardSelected: {
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
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
  dropdown: {
    height: 33,
    borderRadius: 9,
    backgroundColor: '#ECECEC',
    borderWidth: 1,
    borderColor: '#DEDEDE',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    gap: 12,
    height: 32,
    paddingLeft: 1,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  colorDotSelected: {
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
  },
  extraColorIcon: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1,
    borderColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 1,
  },
  extraColorCore: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#222222',
  },
  descriptionInput: {
    minHeight: 83,
    borderRadius: 9,
    backgroundColor: '#ECECEC',
    borderWidth: 1,
    borderColor: '#DEDEDE',
    paddingHorizontal: 9,
    paddingTop: 9,
    ...typography.caption1,
    color: '#7A7A7A',
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
    borderWidth: 1,
    borderColor: '#D9D9D9',
    overflow: 'hidden',
  },
  dropdownOption: {
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DEDEDE',
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
    borderWidth: 1,
    borderColor: '#DEDEDE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
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
  },
  deleteButtonText: {
    ...typography.body,
    color: '#FFFFFF',
  },
});
