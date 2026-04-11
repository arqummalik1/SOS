import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const IMG_SIZE = width * 0.45;
const IMG_MARGIN = 12;

/**
 * Helper component for a slow-moving horizontal marquee.
 * Ensures seamless looping by duplicating content.
 */
interface MarqueeRowProps {
  children: React.ReactNode;
  itemCount: number;
  direction: 'left' | 'right';
  duration?: number;
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({ children, itemCount, direction, duration = 80000 }) => {
  const translateX = useSharedValue(0);
  
  // Calculate total width of one set of images
  const contentWidth = itemCount * (IMG_SIZE + IMG_MARGIN);
  
  useEffect(() => {
    const isLeft = direction === 'left';
    // If moving right, start at the offset point so we scroll towards 0
    translateX.value = isLeft ? 0 : -contentWidth; 
    
    translateX.value = withRepeat(
      withTiming(isLeft ? -contentWidth : 0, {
        duration,
        easing: Easing.linear,
      }),
      -1, // Infinite
      false // Do not reverse
    );
  }, [direction, duration, contentWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.marqueeContainer}>
      <Animated.View style={[styles.marqueeRow, animatedStyle]}>
        {/* Render twice for seamless loop */}
        <View style={styles.imageSet}>{children}</View>
        <View style={styles.imageSet}>{children}</View>
      </Animated.View>
    </View>
  );
};

export const OnboardingMosaic: React.FC = () => {
  const renderImage = (img: any) => (
    <Image 
      source={img} 
      style={styles.squareImage} 
      resizeMode="cover" 
    />
  );

  return (
    <View style={styles.mosaicContainer}>
      {/* Row 1 - Left */}
      <MarqueeRow direction="right" itemCount={3} duration={100000}>
        {renderImage(require('../../../assets/Onboarding_Screen_images/img1.png'))}
        {renderImage(require('../../../assets/Onboarding_Screen_images/img2.png'))}
        {renderImage(require('../../../assets/Onboarding_Screen_images/img3.png'))}
      </MarqueeRow>
      
      {/* Row 2 - Right */}
      <MarqueeRow direction="left" itemCount={3} duration={120000}>
        {renderImage(require('../../../assets/Onboarding_Screen_images/img2.png'))}
        {renderImage(require('../../../assets/Onboarding_Screen_images/img3.png'))}
        {renderImage(require('../../../assets/Onboarding_Screen_images/img4.png'))}
      </MarqueeRow>

      {/* Row 3 - Left */}
      <MarqueeRow direction="right" itemCount={3} duration={110000}>
        {renderImage(require('../../../assets/Onboarding_Screen_images/img4.png'))}
        {renderImage(require('../../../assets/Onboarding_Screen_images/img1.png'))}
        {renderImage(require('../../../assets/Onboarding_Screen_images/img2.png'))}
      </MarqueeRow>
    </View>
  );
};

const styles = StyleSheet.create({
  mosaicContainer: {
    height: height * 0.6,
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#F7F7F7',
    overflow: 'hidden',
  },
  marqueeContainer: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 12,
  },
  marqueeRow: {
    flexDirection: 'row',
  },
  imageSet: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  squareImage: {
    width: IMG_SIZE,
    height: IMG_SIZE,
    borderRadius: 28,
    backgroundColor: '#EEEEEE',
    marginRight: IMG_MARGIN,
  },
});
