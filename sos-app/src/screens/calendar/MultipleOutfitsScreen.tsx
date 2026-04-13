import React, { useRef } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CalendarStackParamList } from '../../navigation/CalendarStackNavigator';
import { typography } from '../../theme/typography';

type MultipleOutfitsScreenProps = {
  navigation: NativeStackNavigationProp<CalendarStackParamList, 'MultipleOutfits'>;
};

const CAROUSEL_ITEMS = [
  { id: '1', image: require('../../../SOS-FigmaDesigns/MultipleOutfits/image.png') },
  { id: '2', image: require('../../../SOS-FigmaDesigns/MultipleOutfits/image1.png') },
  { id: '3', image: require('../../../SOS-FigmaDesigns/MultipleOutfits/Image2.png') },
];

const CARD_RATIO = 473 / 315;
const LENGTH_SCALE = 1.2;

export const MultipleOutfitsScreen: React.FC<MultipleOutfitsScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;

  const cardWidth = Math.max(280, Math.min(315, width * 0.8));
  const cardHeight = cardWidth * CARD_RATIO * LENGTH_SCALE;
  const itemGap = 12;
  const snapInterval = cardWidth + itemGap;
  const horizontalInset = Math.max(0, (width - snapInterval) / 2);

  const onSelectThis = (itemId: string) => {
    navigation.navigate('VirtualTryOnSecond', {
      selectedOutfitId: itemId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F3F3" />

      <View style={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Your outfits are ready</Text>

        <View style={[styles.carouselContainer, { height: cardHeight + 34 }]}>
          <Animated.FlatList
            data={CAROUSEL_ITEMS}
            keyExtractor={(item) => item.id}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={snapInterval}
            snapToAlignment="start"
            disableIntervalMomentum
            contentContainerStyle={{ paddingHorizontal: horizontalInset }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: true,
            })}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 1) * snapInterval,
                index * snapInterval,
                (index + 1) * snapInterval,
              ];

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.83, 1, 0.83],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.7, 1, 0.7],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  style={[
                    styles.cardSlot,
                    {
                      width: snapInterval,
                      height: cardHeight,
                      opacity,
                      transform: [{ scale }],
                    },
                  ]}
                >
                  <View style={[styles.cardWrap, { width: cardWidth, height: cardHeight }]}>
                    <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                    <TouchableOpacity style={styles.glassButton} onPress={() => onSelectThis(item.id)} activeOpacity={0.9}>
                      <BlurView intensity={35} tint="dark" style={styles.glassInner}>
                        <Text style={styles.glassButtonText}>Select this</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                      </BlurView>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  content: {
    flex: 1,
    paddingTop: 42,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginLeft: 18,
    marginBottom: 6,
  },
  backText: {
    ...typography.callout,
    color: '#1F1F1F',
  },
  heading: {
    textAlign: 'center',
    ...typography.title1,
    color: '#111111',
  },
  carouselContainer: {
    marginTop: 42,
  },
  cardSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrap: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  cardImage: {
    position: 'absolute',
    width: '106%',
    height: '106%',
    left: '-3%',
    top: '-3%',
  },
  glassButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
  },
  glassInner: {
    minWidth: 158,
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(128,128,128,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  glassButtonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
});
