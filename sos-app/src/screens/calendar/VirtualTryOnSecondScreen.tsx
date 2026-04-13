import React, { useMemo, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarStackParamList } from '../../navigation/CalendarStackNavigator';
import { typography } from '../../theme/typography';
import { gradients } from '../../theme';

type VirtualTryOnSecondScreenProps = {
  navigation: NativeStackNavigationProp<CalendarStackParamList, 'VirtualTryOnSecond'>;
  route: RouteProp<CalendarStackParamList, 'VirtualTryOnSecond'>;
};

const HERO_IMAGE = require('../../../SOS-FigmaDesigns/VirtualTryOnSecond/BigImage.png');
const THUMBNAILS = [
  { id: '1', image: require('../../../SOS-FigmaDesigns/VirtualTryOnSecond/image1.png') },
  { id: '2', image: require('../../../SOS-FigmaDesigns/VirtualTryOnSecond/image2.png') },
  { id: '3', image: require('../../../SOS-FigmaDesigns/VirtualTryOnSecond/image3.png') },
  { id: '4', image: require('../../../SOS-FigmaDesigns/VirtualTryOnSecond/image4.png') },
];
const ITEM_ROWS = ['Top', 'Bottom', 'Shoe', 'Accessories'] as const;

export const VirtualTryOnSecondScreen: React.FC<VirtualTryOnSecondScreenProps> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const [selectedThumbId, setSelectedThumbId] = useState(route.params?.selectedOutfitId ?? '1');
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [starred, setStarred] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [refreshState, setRefreshState] = useState<Record<string, boolean>>({});

  const horizontalPadding = Math.max(14, Math.min(24, width * 0.055));
  const contentWidth = width - horizontalPadding * 2;
  const heroHeight = contentWidth * (437 / 312);
  const thumbGap = 16;
  const thumbWidth = Math.max(96, Math.min(116, contentWidth * 0.35));
  const saveBtnWidth = Math.min(220, contentWidth * 0.62);
  const scoreCardsWidthExpanded = saveBtnWidth * 1.2 * 1.2 * 0.9 * 1.05;
  const scoreCardsWidth = Math.min(contentWidth, scoreCardsWidthExpanded);
  const scoreCardPadV = Math.round(10 * 1.1);
  const scoreCardPadH = Math.round(12 * 1.1);
  const scoreCardBlockSpacing = Math.round(8 * 1.1);
  const scoreTrackHeight = Math.round(9 * 1.1);
  const weatherIconSize = Math.round(14 * 1.1);

  const weatherScore = useMemo(() => 85, []);
  const occasionScore = useMemo(() => 90, []);

  const toggleRefreshRow = (label: string) => {
    setRefreshState((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F3F3" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: horizontalPadding, paddingBottom: 128 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Your outfit is ready</Text>
        <Text style={styles.subheading}>Lorem Ipsum El Dolor alpus golum</Text>

        <View style={[styles.heroWrap, { width: contentWidth, height: heroHeight }]}>
          <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="cover" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.thumbScrollContent, { gap: thumbGap }]}
          style={styles.thumbStrip}
        >
          {THUMBNAILS.map((thumb) => {
            const isSelected = selectedThumbId === thumb.id;
            return (
              <TouchableOpacity
                key={thumb.id}
                style={[styles.thumbCard, { width: thumbWidth, height: thumbWidth * 0.83 }]}
                onPress={() => setSelectedThumbId(thumb.id)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={gradients.pinkFade.colors}
                  start={gradients.pinkFade.start}
                  end={gradients.pinkFade.end}
                  style={[styles.thumbGradient, isSelected && styles.thumbGradientSelected]}
                >
                  <View style={styles.thumbInnerTile}>
                    <Image source={thumb.image} style={styles.thumbImage} resizeMode="contain" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.iconRow}>
          <View style={styles.iconGroup}>
            <TouchableOpacity style={styles.groupIconBtn} onPress={() => setLiked((v) => !v)} activeOpacity={0.85}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={27} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.groupIconBtn} onPress={() => setDisliked((v) => !v)} activeOpacity={0.85}>
              <Ionicons name={disliked ? 'thumbs-down' : 'thumbs-down-outline'} size={27} color="#111111" />
            </TouchableOpacity>
          </View>

          <View style={styles.iconGroup}>
            <TouchableOpacity style={styles.groupIconBtn} onPress={() => setSaved((v) => !v)} activeOpacity={0.85}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={27} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.groupIconBtn} onPress={() => setShuffleOn((v) => !v)} activeOpacity={0.85}>
              <Ionicons name="shuffle-outline" size={27} color="#111111" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.singleIconBtn} onPress={() => setStarred((v) => !v)} activeOpacity={0.85}>
            <Ionicons name={starred ? 'star' : 'star-outline'} size={27} color="#111111" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.singleIconBtn} onPress={() => setCalendarAdded((v) => !v)} activeOpacity={0.85}>
            <Ionicons name={calendarAdded ? 'calendar' : 'calendar-outline'} size={27} color="#111111" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Item cards:</Text>
        <View style={styles.itemRows}>
          {ITEM_ROWS.map((label) => (
            <View key={label} style={styles.itemRow}>
              <View style={styles.itemLabelWrap}>
                <Text style={styles.itemLabel}>{label}</Text>
              </View>
              <TouchableOpacity style={styles.itemActionBtn} onPress={() => toggleRefreshRow(label)} activeOpacity={0.85}>
                <Ionicons name={refreshState[label] ? 'refresh' : 'refresh-outline'} size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.outfitScoreTitle]}>Outfit match score:</Text>
        <View style={[styles.scoreColumn, { width: scoreCardsWidth }]}>
          <LinearGradient
            colors={gradients.pinkFade.colors}
            start={gradients.pinkFade.start}
            end={gradients.pinkFade.end}
            style={[
              styles.scoreCard,
              { paddingVertical: scoreCardPadV, paddingHorizontal: scoreCardPadH },
            ]}
          >
            <View style={[styles.weatherRow, { marginBottom: scoreCardBlockSpacing }]}>
              <Ionicons name="sunny-outline" size={weatherIconSize} color="#111111" />
              <Text style={styles.weatherText}>27°C 85% Weather appropriate</Text>
            </View>
            <View style={[styles.scoreTrack, { height: scoreTrackHeight }]}>
              <LinearGradient
                colors={[...gradients.scoreProgress.colors]}
                start={gradients.scoreProgress.start}
                end={gradients.scoreProgress.end}
                style={[styles.scoreFill, { width: `${weatherScore}%` }]}
              />
            </View>
          </LinearGradient>
          <LinearGradient
            colors={gradients.pinkFade.colors}
            start={gradients.pinkFade.start}
            end={gradients.pinkFade.end}
            style={[
              styles.scoreCard,
              { paddingVertical: scoreCardPadV, paddingHorizontal: scoreCardPadH },
            ]}
          >
            <Text style={[styles.scoreLabel, { marginBottom: scoreCardBlockSpacing }]}>
              {`${occasionScore}% Occasion match`}
            </Text>
            <View style={[styles.scoreTrack, { height: scoreTrackHeight }]}>
              <LinearGradient
                colors={[...gradients.scoreProgress.colors]}
                start={gradients.scoreProgress.start}
                end={gradients.scoreProgress.end}
                style={[styles.scoreFill, { width: `${occasionScore}%` }]}
              />
            </View>
          </LinearGradient>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { width: saveBtnWidth }]}
          onPress={() => navigation.navigate('OutfitComplete')}
          activeOpacity={0.9}
        >
          <Text style={styles.saveBtnText}>Save outfit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  content: {
    paddingTop: 10,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginLeft: -2,
    marginBottom: 4,
  },
  backText: {
    ...typography.callout,
    color: '#1F1F1F',
  },
  heading: {
    ...typography.title1,
    textAlign: 'center',
    color: '#111111',
    fontSize: 34,
    lineHeight: 38,
  },
  subheading: {
    ...typography.caption2,
    textAlign: 'center',
    color: '#515151',
    marginTop: 4,
  },
  heroWrap: {
    marginTop: 18,
    borderRadius: 25,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  heroImage: {
    position: 'absolute',
    width: '106%',
    height: '106%',
    left: '-3%',
    top: '-3%',
  },
  thumbStrip: {
    marginTop: 10,
  },
  thumbScrollContent: {
    paddingRight: 8,
  },
  thumbCard: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbGradient: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbGradientSelected: {
    opacity: 0.95,
  },
  thumbInnerTile: {
    width: '56%',
    height: '56%',
    borderRadius: 8,
    backgroundColor: '#EBE6EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: {
    width: '74%',
    height: '74%',
  },
  iconRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconGroup: {
    width: 110,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.09,
    shadowRadius: 4,
    elevation: 1,
  },
  groupIconBtn: {
    width: 52,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.09,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    ...typography.title2,
    color: '#1E1E1E',
    marginTop: 18,
    marginBottom: 8,
  },
  itemRows: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  itemLabelWrap: {
    flex: 1,
    height: 31,
    borderRadius: 8,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  itemLabel: {
    ...typography.subheadline,
    color: '#222222',
  },
  itemActionBtn: {
    width: 36,
    height: 31,
    borderRadius: 7,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outfitScoreTitle: {
    alignSelf: 'stretch',
    textAlign: 'left',
  },
  scoreColumn: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  scoreCard: {
    width: '100%',
    alignItems: 'stretch',
    borderRadius: 12,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherText: {
    ...typography.footnote,
    color: '#1D1D1D',
  },
  scoreLabel: {
    ...typography.footnote,
    color: '#1D1D1D',
  },
  scoreTrack: {
    alignSelf: 'center',
    width: '94%',
    alignItems: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#D8D4DB',
    overflow: 'hidden',
  },
  scoreFill: {
    alignSelf: 'flex-start',
    height: '100%',
    borderRadius: 999,
  },
  saveBtn: {
    marginTop: 14,
    alignSelf: 'center',
    height: 39,
    borderRadius: 12,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    ...typography.subheadline,
    color: '#FFFFFF',
  },
});
