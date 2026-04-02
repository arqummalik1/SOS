import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontNames } from '../../theme';
import { typography } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAROUSEL_ITEMS = [
  { id: '1', image: require('../../../assets/MultipleOutfits/Image1.png') },
  { id: '2', image: require('../../../assets/MultipleOutfits/Image2.png') },
  { id: '3', image: require('../../../assets/MultipleOutfits/Image3.png') },
];

const ITEM_WIDTH = SCREEN_WIDTH * 0.85;
const ITEM_HEIGHT = 520;
const ITEM_SPACING = 20;

type MultipleOutfitsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const FirstScreen: React.FC<MultipleOutfitsScreenProps> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelectThis = (index: number) => {
    navigation.navigate('VirtualTryOnSecond');
  };

  const renderItem = ({ item, index }: { item: typeof CAROUSEL_ITEMS[0]; index: number }) => {
    return (
      <View style={styles.card}>
        <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
        
        <TouchableOpacity 
          style={styles.glassButton}
          onPress={() => onSelectThis(index)}
          activeOpacity={0.85}
        >
          <Text style={styles.glassButtonText}>Select this</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (ITEM_WIDTH + ITEM_SPACING));
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[100]} />

      <View style={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Select Your Look</Text>

        <View style={styles.carouselContainer}>
          <FlatList
            data={CAROUSEL_ITEMS}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH + ITEM_SPACING}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onScroll={onScroll}
            scrollEventThrottle={16}
            ItemSeparatorComponent={() => <View style={{ width: ITEM_SPACING }} />}
          />
        </View>

        <View style={styles.pagination}>
          {CAROUSEL_ITEMS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export const MultipleOutfitsScreen = FirstScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginLeft: 16,
  },
  backText: {
    marginLeft: 4,
    ...typography.body,
    color: '#1F1F1F',
  },
  heading: {
    marginTop: 16,
    textAlign: 'center',
    ...typography.largeTitle,
    color: '#111111',
  },
  carouselContainer: {
    marginTop: 32,
    height: ITEM_HEIGHT + 40,
  },
  carouselContent: {
    paddingHorizontal: (SCREEN_WIDTH - ITEM_WIDTH) / 2 - ITEM_SPACING / 2,
    alignItems: 'center',
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  glassButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 150,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  glassButtonText: {
    ...typography.subheadline,
    color: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#111111',
    width: 20,
    height: 6,
    borderRadius: 3,
  },
  inactiveDot: {
    backgroundColor: '#D9D9D9',
  },
});
