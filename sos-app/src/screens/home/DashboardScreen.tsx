import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { DAYS, INITIAL_DASHBOARD_STATE, OCCASIONS } from '../../store/DashboardStore';
import { typography } from '../../theme/typography';

interface DashboardScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const OUTFIT_ITEMS = [
  require('../../../assets/dashboard/side 1.png'),
  require('../../../assets/dashboard/side 2.png'),
  require('../../../assets/dashboard/side 3.png'),
  require('../../../assets/dashboard/side 4.png'),
];

const SNAPSHOT_ITEMS = [
  { key: 'Collection', icon: require('../../../assets/dashboard/icons/Collection.svg') },
  { key: 'Styled Looks', icon: require('../../../assets/dashboard/icons/Styled Looks.svg') },
  { key: 'Favorite', icon: require('../../../assets/dashboard/icons/Favorite.svg') },
  { key: 'Remixed', icon: require('../../../assets/dashboard/icons/Remixed.svg') },
];

const STYLE_HUB_ACTIONS = [
  { key: 'Trending', icon: require('../../../assets/dashboard/icons/Frame 1000006697.svg') },
  { key: 'Start styling', icon: require('../../../assets/dashboard/icons/Frame 1000006698.svg') },
  { key: 'Assistance', icon: require('../../../assets/dashboard/icons/Frame 1000006699.svg') },
  { key: 'See similar', icon: require('../../../assets/dashboard/icons/Frame 1000006700.svg') },
];

const DAY_KEYS = ['S0', 'M', 'T0', 'W', 'T1', 'F', 'S1'] as const;
type DayKey = typeof DAY_KEYS[number];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const contentWidth = Math.min(400, width - 40);
  const heroLeftWidth = Math.round(contentWidth * 0.765);
  const sideRailWidth = contentWidth - heroLeftWidth;
  const sideItemSize = Math.round(sideRailWidth - 10);
  const heroPanelHeight = sideItemSize * 4 + 30;
  const [selectedOccasion, setSelectedOccasion] = useState(INITIAL_DASHBOARD_STATE.selectedOccasion);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState(INITIAL_DASHBOARD_STATE.selectedDay);
  const [showOccasionPicker, setShowOccasionPicker] = useState(false);
  const [weeklyLooks, setWeeklyLooks] = useState<Record<DayKey, number>>({
    S0: 0,
    M: 1,
    T0: 2,
    W: 3,
    T1: 2,
    F: 3,
    S1: 1,
  });
  const modelRotation = useRef(new Animated.Value(0)).current;
  const baseRotationRef = useRef(0);

  const rotatePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        modelRotation.stopAnimation((value) => {
          baseRotationRef.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        modelRotation.setValue(baseRotationRef.current + gestureState.dx * 0.9);
      },
      onPanResponderRelease: (_, gestureState) => {
        baseRotationRef.current = baseRotationRef.current + gestureState.dx * 0.9;
      },
      onPanResponderTerminate: (_, gestureState) => {
        baseRotationRef.current = baseRotationRef.current + gestureState.dx * 0.9;
      },
    })
  ).current;

  const normalizedSelectedDayKey: DayKey = useMemo(() => {
    const candidates = DAY_KEYS.filter((key) => key.startsWith(selectedDay));
    if (candidates.length === 1) return candidates[0];
    if (selectedDay === 'T') return 'T0';
    if (selectedDay === 'S') return 'S0';
    return 'W';
  }, [selectedDay]);

  const handleAssignLookToSelectedDay = (lookIndex: number) => {
    setWeeklyLooks((prev) => ({
      ...prev,
      [normalizedSelectedDayKey]: lookIndex,
    }));
    Alert.alert('Plan your week', `Assigned look to ${selectedDay}`);
  };
  const modelRotateY = modelRotation.interpolate({
    inputRange: [-720, 720],
    outputRange: ['-720deg', '720deg'],
    extrapolate: 'extend',
  });

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['rgba(237,226,228,0.2)', 'rgba(250,245,247,0.12)', 'rgba(255,255,255,0.5)']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Platform.OS === 'ios' ? 52 : 38,
            paddingBottom: tabBarHeight + 105,
            paddingHorizontal: Math.max(20, (width - contentWidth) / 2),
          },
        ]}
      >
        <Text style={styles.welcomeText}>Welcome Elena!</Text>
        <Text style={styles.subtitleText}>Let&apos;s Style Your Day.</Text>

        <TouchableOpacity style={styles.occasionPill} activeOpacity={0.8} onPress={() => setShowOccasionPicker(true)}>
          <Text style={styles.occasionText}>{selectedOccasion}</Text>
          <Ionicons name="chevron-down" size={16} color="#000000" />
        </TouchableOpacity>

        <View style={{ width: contentWidth }}>
          <LinearGradient
            colors={['rgba(165,128,166,0.3)', '#A580A6']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.modernMuseHeader}
          >
            <Text style={styles.modernMuseTitle}>MODERN MUSE</Text>
          </LinearGradient>

          <View style={styles.heroRow}>
            <View style={[styles.heroMainCard, { width: heroLeftWidth, height: heroPanelHeight }]}>
              <LinearGradient
                colors={['#FFFFFF', '#A580A6']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.heroBgPanel}
              />
              <Animated.Image
                source={require('../../../assets/dashboard/model.png')}
                style={[styles.heroModel, { transform: [{ perspective: 1000 }, { rotateY: modelRotateY }] }]}
                resizeMode="contain"
              />
              <Image source={require('../../../assets/dashboard/purse.png')} style={styles.heroBottomAsset} resizeMode="contain" />
              <View style={styles.heroRotateHandle} {...rotatePanResponder.panHandlers}>
                <MaterialIcons name="3d-rotation" size={16} color="#FFFFFF" />
              </View>
            </View>

            <View style={[styles.heroSideRail, { width: sideRailWidth }]}>
              {OUTFIT_ITEMS.map((image, index) => (
                <TouchableOpacity
                  key={`side-${index}`}
                  style={[styles.sideCell, { width: sideItemSize, height: sideItemSize }, selectedItemIndex === index && styles.sideCellActive]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedItemIndex(index)}
                >
                  <Image source={image} style={styles.sideCellImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.sideChevronBtn} activeOpacity={0.8} onPress={() => setSelectedItemIndex((prev) => (prev + 1) % OUTFIT_ITEMS.length)}>
                <Ionicons name="chevron-down" size={18} color="#7B7B7B" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dualActionRow}>
            <TouchableOpacity style={styles.glassAction} activeOpacity={0.85} onPress={() => Alert.alert('Saved', 'Look saved successfully')}>
              <Text style={styles.glassActionText}>Save The Look</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.solidAction} activeOpacity={0.9} onPress={() => Alert.alert('Wear This', 'Outfit selected')}>
              <Text style={styles.solidActionText}>Wear This</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.centerTitleWrap}>
          <View style={styles.centerRule} />
          <Text style={styles.centerTitle}>Closet snapshot</Text>
          <View style={styles.centerRule} />
        </View>

        <View style={[styles.snapshotRow, { width: contentWidth }]}>
          {SNAPSHOT_ITEMS.map((item) => (
            <TouchableOpacity key={item.key} activeOpacity={0.8} onPress={() => Alert.alert('Closet snapshot', item.key)}>
              <SvgUri width={86} height={102} uri={Asset.fromModule(item.icon).uri} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.styleHubCard, { width: contentWidth }]}>
          <View style={styles.styleHubPanel}>
          <LinearGradient
            colors={['rgba(255,251,251,0.14)', 'rgba(165,128,166,0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          </View>
          <Image source={require('../../../assets/dashboard/model2.png')} style={styles.styleHubModel} resizeMode="contain" />
          <View style={styles.styleHubActions}>
            {STYLE_HUB_ACTIONS.map((item) => (
              <TouchableOpacity key={item.key} style={styles.styleHubActionBtn} activeOpacity={0.8} onPress={() => Alert.alert('Style Hub', item.key)}>
                <SvgUri width={82} height={48} uri={Asset.fromModule(item.icon).uri} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.centerTitleWrap, styles.planWeekTitleWrap]}>
          <View style={styles.centerRule} />
          <Text style={styles.centerTitle}>Plan your week</Text>
          <View style={styles.centerRule} />
        </View>

        <View style={[styles.planWeekCard, { width: contentWidth }]}>
          <View style={styles.weekOutfitRow}>
            {OUTFIT_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={`week-item-${index}`}
                style={[
                  styles.weekTile,
                  weeklyLooks[normalizedSelectedDayKey] === index && styles.weekTileActive,
                ]}
                activeOpacity={0.85}
                onPress={() => handleAssignLookToSelectedDay(index)}
              >
                <Image source={item} style={styles.weekTileImg} resizeMode="contain" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.weekDaysRow}>
            {DAYS.map((day, index) => (
              <TouchableOpacity
                key={`day-${day}-${index}`}
                activeOpacity={0.75}
                onPress={() => setSelectedDay(day)}
                style={[
                  styles.dayCell,
                  DAY_KEYS[index].startsWith(selectedDay) && styles.dayCellActive,
                ]}
              >
                <Text style={styles.dayCellText}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.weekMeta}>4 Looks ready - Outing planned</Text>
        </View>

        <View style={[styles.dualActionRow, { width: contentWidth }]}>
          <TouchableOpacity style={styles.glassAction} activeOpacity={0.85} onPress={() => Alert.alert('Plan Outfit', `Selected ${selectedDay}`)}>
            <Text style={styles.glassActionText}>Plan Outfit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.solidAction} activeOpacity={0.9} onPress={() => navigation.navigate('MyItems')}>
            <Text style={styles.solidActionText}>+ Add Look</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showOccasionPicker} transparent animationType="fade" onRequestClose={() => setShowOccasionPicker(false)}>
        <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={() => setShowOccasionPicker(false)}>
          <View style={styles.modalSheet}>
            {OCCASIONS.map((occasion) => (
              <TouchableOpacity
                key={occasion}
                style={styles.modalOption}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedOccasion(occasion);
                  setShowOccasionPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{occasion}</Text>
                {selectedOccasion === occasion ? <Ionicons name="checkmark" size={18} color="#111111" /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    alignItems: 'center',
  },
  welcomeText: {
    alignSelf: 'flex-start',
    ...typography.title2,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  subtitleText: {
    alignSelf: 'flex-start',
    ...typography.caption1,
    color: '#464646',
    marginBottom: 12,
  },
  occasionPill: {
    alignSelf: 'flex-start',
    width: 144,
    height: 32,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
    marginBottom: 14,
  },
  occasionText: {
    ...typography.subheadline,
    color: '#000000',
  },
  modernMuseHeader: {
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
  },
  modernMuseTitle: {
    ...typography.title1,
    fontWeight: '800',
    fontSize: 48,
    lineHeight: 58,
    color: '#FFFFFF',
    letterSpacing: 0,
  },
  heroRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    overflow: 'visible',
  },
  heroMainCard: {
    borderRadius: 12,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  heroBgPanel: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
  },
  heroModel: {
    position: 'absolute',
    width: 233,
    height: 414,
    left: 34,
    top: -66,
    zIndex: 3,
  },
  heroBottomAsset: {
    position: 'absolute',
    width: 93,
    height: 97,
    left: 22,
    bottom: 6,
  },
  heroRotateHandle: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 24,
    height: 24,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  heroSideRail: {
    alignItems: 'center',
    paddingTop: 0,
    gap: 10,
  },
  sideCell: {
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
  },
  sideCellActive: {
    transform: [{ scale: 1.03 }],
  },
  sideCellImage: {
    width: '84%',
    height: '84%',
  },
  sideChevronBtn: {
    width: 26,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dualActionRow: {
    marginTop: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 22,
  },
  glassAction: {
    flex: 1,
    height: 51,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
  },
  glassActionText: {
    ...typography.callout,
    color: '#000000',
    letterSpacing: -0.3,
  },
  solidAction: {
    flex: 1,
    height: 51,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
  },
  solidActionText: {
    ...typography.callout,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  centerTitleWrap: {
    marginTop: 16,
    marginBottom: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planWeekTitleWrap: {
    marginTop: 40,
  },
  centerRule: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  centerTitle: {
    marginHorizontal: 12,
    ...typography.callout,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  styleHubCard: {
    marginTop: 34,
    height: 304,
    borderRadius: 20,
    overflow: 'visible',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
  },
  styleHubPanel: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    overflow: 'hidden',
  },
  styleHubModel: {
    position: 'absolute',
    width: 286,
    height: 401,
    left: 35,
    top: -76,
    zIndex: 2,
  },
  styleHubActions: {
    position: 'absolute',
    right: 10,
    top: 194,
    width: 176,
    height: 106,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    zIndex: 3,
  },
  styleHubActionBtn: {
    width: 82,
    height: 48,
  },
  planWeekCard: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4.86 },
    shadowOpacity: 0.1,
    shadowRadius: 16.2,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  weekOutfitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekTile: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekTileActive: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  weekTileImg: {
    width: 47,
    height: 66,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayCell: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dayCellActive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  dayCellText: {
    ...typography.callout,
    fontSize: 16,
    lineHeight: 19,
    color: '#000000',
  },
  weekMeta: {
    ...typography.caption1,
    color: '#464646',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheet: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
  },
  modalOption: {
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionText: {
    ...typography.body,
    color: '#000000',
  },
});
