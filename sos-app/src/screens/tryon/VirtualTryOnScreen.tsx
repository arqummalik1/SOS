import React, { useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { typography } from '../../theme/typography';

type VirtualTryOnScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

const HERO_IMAGE = require('../../../assets/VirtualTryOn/Frame 1000006731.png');
const BASE_CLOTHES = [
  { id: 'front-red', image: require('../../../assets/VirtualTryOn/suggestedcloth.png') },
  { id: 'cream-top', image: require('../../../assets/VirtualTryOn/suggestios.png') },
  { id: 'blue-jacket', image: require('../../../assets/VirtualTryOn/sugggestion1.png') },
  { id: 'back-red', image: require('../../../assets/VirtualTryOn/Frame 1000006728 (1).png') },
];
type TryOnStripItem = {
  id: string;
  image: ImageSourcePropType;
};

export const VirtualTryOnScreen: React.FC<VirtualTryOnScreenProps> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const selectedItem = route.params?.selectedItem;
  const [selectedId, setSelectedId] = useState('front-red');
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [starred, setStarred] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  const contentWidth = Math.min(430, width - 24);
  const heroHeight = Math.round(contentWidth * 1.53);
  const outfitCardSize = Math.max(104, Math.min(118, contentWidth * 0.31));
  const heroImage = useMemo(() => HERO_IMAGE, []);

  const clothes = useMemo<TryOnStripItem[]>(() => {
    if (selectedItem?.image) {
      return [
        { id: `selected-${selectedItem.id ?? 'item'}`, image: selectedItem.image },
        ...BASE_CLOTHES.slice(0, 3),
      ];
    }
    return BASE_CLOTHES;
  }, [selectedItem]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: Math.max(12, (width - contentWidth) / 2),
            paddingBottom: tabBarHeight + 72,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backRow} activeOpacity={0.75} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={17} color="#1A1A1A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerWrap}>
          <Text style={styles.heading}>Virtual Try-On</Text>
          <Text style={styles.subHeading}>Lorem Ipsum El Dolor alpus golum</Text>
        </View>

        <View style={[styles.heroWrap, { width: contentWidth, height: heroHeight }]}>
          <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clothesRow}>
          {clothes.map((cloth) => {
            const selected = cloth.id === selectedId;
            return (
              <TouchableOpacity
                key={cloth.id}
                activeOpacity={0.85}
                onPress={() => setSelectedId(cloth.id)}
                style={[
                  styles.clothCard,
                  { width: outfitCardSize, height: outfitCardSize },
                  selected && styles.clothCardActive,
                ]}
              >
                <Image source={cloth.image} style={styles.clothImage} resizeMode="contain" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.actionsWrap}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, liked && styles.actionButtonActive]}
              activeOpacity={0.85}
              onPress={() => setLiked((v) => !v)}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={29} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, disliked && styles.actionButtonActive]}
              activeOpacity={0.85}
              onPress={() => setDisliked((v) => !v)}
            >
              <Ionicons name={disliked ? 'thumbs-down' : 'thumbs-down-outline'} size={29} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, saved && styles.actionButtonActive]}
              activeOpacity={0.85}
              onPress={() => setSaved((v) => !v)}
            >
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={29} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, shuffleOn && styles.actionButtonActive]}
              activeOpacity={0.85}
              onPress={() => setShuffleOn((v) => !v)}
            >
              <Ionicons name="shuffle-outline" size={29} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, starred && styles.actionButtonActive]}
              activeOpacity={0.85}
              onPress={() => setStarred((v) => !v)}
            >
              <Ionicons name={starred ? 'star' : 'star-outline'} size={29} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, addedToCalendar && styles.actionButtonActive]}
              activeOpacity={0.85}
              onPress={() => setAddedToCalendar((v) => !v)}
            >
              <Ionicons name={addedToCalendar ? 'calendar' : 'calendar-outline'} size={29} color="#111111" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  backRow: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  backText: {
    ...typography.caption1,
    color: '#2D2D2D',
  },
  headerWrap: {
    alignItems: 'center',
    marginTop: 2,
  },
  heading: {
    ...typography.title1,
    color: '#151515',
  },
  subHeading: {
    marginTop: 4,
    ...typography.caption1,
    color: '#3A3A3A',
  },
  heroWrap: {
    marginTop: 16,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  clothesRow: {
    marginTop: 16,
    gap: 10,
    paddingRight: 24,
    paddingHorizontal: 2,
  },
  clothCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2.5 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 1,
  },
  clothCardActive: {
    shadowOpacity: 0.16,
    elevation: 3,
  },
  clothImage: {
    width: '74%',
    height: '74%',
  },
  actionsWrap: {
    marginTop: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  actionButtonActive: {
    opacity: 0.78,
  },
});
