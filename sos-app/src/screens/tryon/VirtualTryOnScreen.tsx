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

const { width } = Dimensions.get('window');

type VirtualTryOnScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const HERO_IMAGE = require('../../../assets/VirtualTryOn/Frame 1000006731.png');
const ALL_ICONS_IMAGE = require('../../../assets/VirtualTryOn/allIconsTogether.png');

const CLOTHES = [
  { id: 'front-red', image: require('../../../assets/VirtualTryOn/suggestedcloth.png') },
  { id: 'cream-top', image: require('../../../assets/VirtualTryOn/suggestios.png') },
  { id: 'blue-jacket', image: require('../../../assets/VirtualTryOn/sugggestion1.png') },
  { id: 'back-red', image: require('../../../assets/VirtualTryOn/Frame 1000006728 (1).png') },
  { id: 'pants', image: require('../../../assets/VirtualTryOn/suggestion2.png') },
  { id: 'brown-top', image: require('../../../assets/VirtualTryOn/suggestion3.png') },
];

const ACTION_ICONS = [
  { id: 'heart', image: require('../../../assets/VirtualTryOn/HeartIcon.png') },
  { id: 'dislike', image: require('../../../assets/VirtualTryOn/dislikeIcon.png') },
  { id: 'save', image: require('../../../assets/VirtualTryOn/saveIcon.png') },
  { id: 'shuffle', image: null },
  { id: 'star', image: require('../../../assets/VirtualTryOn/StarIcon.png') },
  { id: 'calendar', image: require('../../../assets/VirtualTryOn/CalanderIcon.png') },
];

export const VirtualTryOnScreen: React.FC<VirtualTryOnScreenProps> = ({ navigation }) => {
  const [selectedId, setSelectedId] = useState('front-red');

  const heroImage = useMemo(() => HERO_IMAGE, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topInset} />

        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerWrap}>
          <Text style={styles.heading}>Virtual Try-On</Text>
          <Text style={styles.subHeading}>Lorem Ipsum El Dolor alpus golum</Text>
        </View>

        <View style={styles.heroWrap}>
          <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.clothesRow}
        >
          {CLOTHES.map((cloth) => {
            const selected = cloth.id === selectedId;
            return (
              <TouchableOpacity
                key={cloth.id}
                activeOpacity={0.85}
                onPress={() => setSelectedId(cloth.id)}
                style={[styles.clothCard, selected && styles.clothCardActive]}
              >
                <Image source={cloth.image} style={styles.clothImage} resizeMode="cover" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.actionsWrap}>
          <View style={styles.actionsRow}>
            {ACTION_ICONS.map((icon, index) => (
              <TouchableOpacity key={icon.id} style={styles.actionButton} activeOpacity={0.85}>
                {icon.image ? (
                  <Image source={icon.image} style={styles.actionIconImage} resizeMode="contain" />
                ) : (
                  <View style={styles.shuffleClipper}>
                    <Image
                      source={ALL_ICONS_IMAGE}
                      resizeMode="cover"
                      style={[
                        styles.shuffleSprite,
                        {
                          transform: [{ translateX: -(index * 74) }],
                        },
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomGap} />
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
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  topInset: {
    height: 20,
  },
  backRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  backArrow: {
    ...typography.title2,
    color: '#161616',
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
    ...typography.largeTitle,
    color: '#151515',
  },
  subHeading: {
    marginTop: 4,
    ...typography.subheadline,
    color: '#2B2B2B',
  },
  heroWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  heroImage: {
    width: width - 32,
    height: width * 1.36,
    borderRadius: 22,
  },
  clothesRow: {
    marginTop: 18,
    paddingHorizontal: 16,
    gap: 10,
    paddingRight: 28,
  },
  clothCard: {
    width: 112,
    height: 112,
    borderRadius: 13,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DFDFDF',
    backgroundColor: '#F2F2F2',
  },
  clothCardActive: {
    borderColor: '#B4B4B4',
  },
  clothImage: {
    width: '100%',
    height: '100%',
  },
  actionsWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  actionsRow: {
    width: width - 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconImage: {
    width: 58,
    height: 58,
  },
  shuffleClipper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
  },
  shuffleSprite: {
    width: 446,
    height: 88,
    marginTop: -15,
  },
  bottomGap: {
    height: 94,
  },
});
