import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OCCASIONS, DAYS, INITIAL_DASHBOARD_STATE } from '../../store/DashboardStore';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const CONTENT_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

// Main card takes ~73% of content width, side items take ~27%
const CARD_WIDTH = CONTENT_WIDTH * 0.73;
const SIDE_PANEL_WIDTH = CONTENT_WIDTH * 0.27;
const SIDE_ITEM_SIZE = 52;
const SIDE_ITEM_GAP = 6;

interface DashboardScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const OUTFIT_ITEMS = [
  { id: 1, image: require('../../../assets/dashboard/side 1.png') },
  { id: 2, image: require('../../../assets/dashboard/side 2.png') },
  { id: 3, image: require('../../../assets/dashboard/side 3.png') },
  { id: 4, image: require('../../../assets/dashboard/side 4.png') },
];

const DAY_TOUCH_SLOTS = [
  { left: 16 },
  { left: 66 },
  { left: 116 },
  { left: 166 },
  { left: 216 },
  { left: 266 },
  { left: 316 },
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [selectedOccasion, setSelectedOccasion] = useState(INITIAL_DASHBOARD_STATE.selectedOccasion);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(INITIAL_DASHBOARD_STATE.selectedItemIndex);
  const [selectedDay, setSelectedDay] = useState(INITIAL_DASHBOARD_STATE.selectedDay);
  const [showOccasionPicker, setShowOccasionPicker] = useState(false);

  const activeItemIndex = selectedItemIndex ?? 0;
  const activeSideItem = OUTFIT_ITEMS[activeItemIndex];

  const handleSaveLook = () => {
    Alert.alert('Save The Look', 'Your outfit has been saved to your collection!');
  };

  const handleWearThis = () => {
    Alert.alert('Wear This', 'This outfit is ready to wear today!');
  };

  const handleClosetAction = (action: string) => {
    Alert.alert('Closet Snapshot', `${action} selected`);
  };

  const handleModelAction = (action: string) => {
    Alert.alert('Action', `${action} selected`);
  };

  const handlePlanOutfit = () => {
    Alert.alert('Plan Outfit', 'Plan your outfit for the week');
  };

  const handleRotateOutfitItem = () => {
    const nextIndex = (activeItemIndex + 1) % OUTFIT_ITEMS.length;
    setSelectedItemIndex(nextIndex);
  };

  const handleSelectDay = (day: string) => {
    setSelectedDay(day);
    Alert.alert('Plan your week', `Selected ${day}`);
  };

  const handleAddLook = () => {
    navigation.navigate('MyItems');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ====== HEADER ====== */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome Elena!</Text>
          <Text style={styles.subtitleText}>Let's Style Your Day.</Text>
        </View>

        {/* ====== OCCASION PILL ====== */}
        <TouchableOpacity
          style={styles.occasionPill}
          onPress={() => setShowOccasionPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.occasionText}>{selectedOccasion}</Text>
          <Ionicons name="chevron-down" size={14} color="#000000" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {/* ====== MAIN OUTFIT ROW ====== */}
        <View style={styles.outfitRow}>
          {/* LEFT: Gradient Card */}
          <View style={styles.mainCard}>
            <Image
              source={require('../../../assets/dashboard/glass bg.png')}
              style={styles.cardBg}
              resizeMode="cover"
            />
            {/* Modern Muse Badge */}
            <Image
              source={require('../../../assets/dashboard/Modern Muse.png')}
              style={styles.museBadge}
              resizeMode="contain"
            />
            {/* Model */}
            <Image
              source={require('../../../assets/dashboard/model.png')}
              style={styles.modelImg}
              resizeMode="contain"
            />
            {/* Bottom-left item */}
            <Image
              source={activeSideItem.image}
              style={styles.bottomLeftItem}
              resizeMode="contain"
            />
            {/* Refresh icon */}
            <TouchableOpacity style={styles.refreshIcon} activeOpacity={0.7} onPress={handleRotateOutfitItem}>
              <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          {/* RIGHT: Side Item Selector */}
          <View style={styles.sidePanel}>
            {OUTFIT_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.sideItem,
                  selectedItemIndex === index && styles.sideItemSelected,
                ]}
                onPress={() => setSelectedItemIndex(index)}
                activeOpacity={0.8}
              >
                <Image
                  source={item.image}
                  style={styles.sideItemImg}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sideArrow} activeOpacity={0.7} onPress={handleRotateOutfitItem}>
              <Ionicons name="chevron-down" size={16} color="#AAAAAA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ====== ACTION BUTTONS ====== */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={handleSaveLook}
            activeOpacity={0.8}
          >
            <Text style={styles.btnOutlineText}>Save The Look</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSolid}
            onPress={handleWearThis}
            activeOpacity={0.9}
          >
            <Text style={styles.btnSolidText}>Wear This</Text>
          </TouchableOpacity>
        </View>

        {/* ====== CLOSET SNAPSHOT ====== */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.sectionTitleCenter}>Closet snapshot</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.closetRow}>
          <TouchableOpacity onPress={() => handleClosetAction('Collection')} activeOpacity={0.8}>
            <Image
              source={require('../../../assets/dashboard/Collection.png')}
              style={styles.closetAsset}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleClosetAction('Styled Looks')} activeOpacity={0.8}>
            <Image
              source={require('../../../assets/dashboard/Styled Looks.png')}
              style={styles.closetAsset}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleClosetAction('Favorite')} activeOpacity={0.8}>
            <Image
              source={require('../../../assets/dashboard/Favorite.png')}
              style={styles.closetAsset}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleClosetAction('Remixed')} activeOpacity={0.8}>
            <Image
              source={require('../../../assets/dashboard/Remixed.png')}
              style={styles.closetAsset}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* ====== MODEL CARD ====== */}
        <View style={styles.modelCard}>
          <Image
            source={require('../../../assets/dashboard/concept-women-s-jewelry-closeup-rings-earrings-necklace-modern-elegant-lifestyle-accessories-with-copy-space-text-background_785351-1840 1.png')}
            style={styles.modelCardImg}
            resizeMode="contain"
          />
          {/* Overlay buttons */}
          <TouchableOpacity style={styles.overlayBtnWrap} activeOpacity={1}>
            <Image
              source={require('../../../assets/dashboard/Frame 1000006708.png')}
              style={styles.overlayBtns}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {/* Invisible touch targets over each button */}
          <TouchableOpacity
            style={[styles.overlayTouch, { bottom: 46, right: 14 }]}
            onPress={() => handleModelAction('Trending')}
            activeOpacity={0.7}
          />
          <TouchableOpacity
            style={[styles.overlayTouch, { bottom: 46, right: 100 }]}
            onPress={() => handleModelAction('Start styling')}
            activeOpacity={0.7}
          />
          <TouchableOpacity
            style={[styles.overlayTouch, { bottom: 12, right: 14 }]}
            onPress={() => handleModelAction('Assistance')}
            activeOpacity={0.7}
          />
          <TouchableOpacity
            style={[styles.overlayTouch, { bottom: 12, right: 100 }]}
            onPress={() => handleModelAction('See similar')}
            activeOpacity={0.7}
          />
        </View>

        {/* ====== PLAN YOUR WEEK ====== */}
        <Text style={styles.sectionTitleCenterAlt}>Plan your week</Text>
        <View style={styles.planWeekCard}>
          <Image
            source={require('../../../assets/dashboard/Plan week calendar.png')}
            style={styles.planWeekImg}
            resizeMode="contain"
          />
          <View style={styles.planWeekHotspots}>
            {DAYS.map((day, index) => (
              <TouchableOpacity
                key={`${day}-${index}`}
                style={[styles.dayTouchZone, DAY_TOUCH_SLOTS[index]]}
                onPress={() => handleSelectDay(day)}
                activeOpacity={0.65}
              />
            ))}
          </View>
        </View>

        {/* ====== BOTTOM ACTION BUTTONS ====== */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={handlePlanOutfit}
            activeOpacity={0.8}
          >
            <Text style={styles.btnOutlineText}>Plan Outfit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSolid}
            onPress={handleAddLook}
            activeOpacity={0.9}
          >
            <Text style={styles.btnSolidText}>+ Add Look</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ====== OCCASION PICKER MODAL ====== */}
      <Modal
        visible={showOccasionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOccasionPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOccasionPicker(false)}
        >
          <View style={styles.pickerBox}>
            {OCCASIONS.map((occasion) => (
              <TouchableOpacity
                key={occasion}
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedOccasion(occasion);
                  setShowOccasionPicker(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerItemText}>{occasion}</Text>
                {selectedOccasion === occasion && (
                  <Ionicons name="checkmark" size={20} color="#000000" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Container ──
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 20,
  },

  // ── Header ──
  header: {
    marginBottom: 12,
  },
  welcomeText: {
    ...typography.title2,
    color: '#000000',
    lineHeight: 32,
  },
  subtitleText: {
    ...typography.caption1,
    color: '#999999',
    marginTop: 2,
  },

  // ── Occasion Pill ──
  occasionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  occasionText: {
    ...typography.caption1,
    color: '#000000',
  },

  // ── Main Outfit Row ──
  outfitRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  // Left: Gradient Card
  mainCard: {
    width: CARD_WIDTH,
    aspectRatio: 0.72,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  museBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 140,
    height: 28,
    zIndex: 2,
  },
  modelImg: {
    position: 'absolute',
    top: 10,
    left: 20,
    width: CARD_WIDTH * 0.65,
    height: '95%',
    zIndex: 1,
  },
  bottomLeftItem: {
    position: 'absolute',
    bottom: 10,
    left: 8,
    width: 70,
    height: 70,
    zIndex: 2,
  },
  refreshIcon: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  // Right: Side Items
  sidePanel: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
    gap: SIDE_ITEM_GAP,
  },
  sideItem: {
    width: SIDE_ITEM_SIZE,
    height: SIDE_ITEM_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sideItemSelected: {
    borderWidth: 2,
    borderColor: '#9B59B6',
  },
  sideItemImg: {
    width: SIDE_ITEM_SIZE - 8,
    height: SIDE_ITEM_SIZE - 8,
  },
  sideArrow: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  // ── Action Buttons ──
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  btnOutline: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  btnOutlineText: {
    ...typography.subheadline,
    color: '#000000',
  },
  btnSolid: {
    flex: 1,
    height: 46,
    backgroundColor: '#000000',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSolidText: {
    ...typography.subheadline,
    color: '#FFFFFF',
  },

  // ── Section Divider ──
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  sectionTitleCenter: {
    ...typography.subheadline,
    color: '#000000',
    marginHorizontal: 12,
  },

  // ── Closet Snapshot ──
  closetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  closetAsset: {
    width: (CONTENT_WIDTH - 36) / 4,
    height: ((CONTENT_WIDTH - 36) / 4) * 1.25,
  },

  // ── Model Card ──
  modelCard: {
    width: CONTENT_WIDTH,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  modelCardImg: {
    width: '100%',
    height: undefined,
    aspectRatio: 3 / 4,
  },
  overlayBtnWrap: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  overlayBtns: {
    width: 180,
    height: 70,
  },
  overlayTouch: {
    position: 'absolute',
    width: 80,
    height: 30,
  },

  // ── Plan Your Week ──
  sectionTitleCenterAlt: {
    ...typography.subheadline,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  planWeekCard: {
    width: CONTENT_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    position: 'relative',
  },
  planWeekImg: {
    width: '100%',
    height: undefined,
    aspectRatio: 433 / 205,
  },
  planWeekHotspots: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
  dayTouchZone: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: SCREEN_WIDTH - 80,
    paddingVertical: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pickerItemText: {
    ...typography.body,
    color: '#000000',
  },
});
