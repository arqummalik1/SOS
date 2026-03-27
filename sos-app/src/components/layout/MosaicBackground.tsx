import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

const mockImages = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
];

export const MosaicBackground: React.FC = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      scrollY.setValue(0);
      Animated.timing(scrollY, {
        toValue: 1,
        duration: 60000,
        useNativeDriver: true,
      }).start(() => animate());
    };

    animate();

    return () => {
      scrollY.stopAnimation();
    };
  }, [scrollY]);

  const translateY = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -400],
  });
  const renderMosaicGrid = () => {
    const items = [];
    const columns = 2;
    const rows = 6;

    for (let i = 0; i < rows * columns * 3; i++) {
      const imageIndex = i % mockImages.length;
      const isLarge = i % 3 === 0;
      items.push(
        <View
          key={i}
          style={[
            styles.mosaicItem,
            isLarge ? styles.largeItem : styles.smallItem,
          ]}
        >
          <Image
            source={{ uri: mockImages[imageIndex] }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      );
    }
    return items;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          { transform: [{ translateY }] },
        ]}
      >
        <View style={styles.grid}>
          {renderMosaicGrid()}
        </View>
      </Animated.View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.overlay}
        locations={[0.4, 0.8]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  animatedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
    gap: 4,
  },
  mosaicItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  largeItem: {
    width: (width - 24) / 2,
    height: 200,
  },
  smallItem: {
    width: (width - 24) / 2,
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
