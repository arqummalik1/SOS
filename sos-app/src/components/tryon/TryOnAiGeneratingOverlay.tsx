import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography } from '../../theme/typography';
import { gradients } from '../../theme/gradients';

const MESSAGES = [
  'Mapping your outfit to your model…',
  'Scanning fabric & silhouette…',
  'Blending garment with your body scan…',
  'AI is composing your try-on…',
];

type Props = {
  visible: boolean;
  /** Hero height in px — drives scan-line travel range. */
  containerHeight: number;
};

/**
 * Full-bleed overlay for in-progress virtual try-on: scan line, pulses, rotating copy.
 * No stroke borders; uses brand gradient tokens and soft translucency.
 */
export const TryOnAiGeneratingOverlay: React.FC<Props> = ({ visible, containerHeight }) => {
  const scan = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.4)).current;
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!visible) return undefined;
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scan, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    scanLoop.start();
    pulseLoop.start();
    return () => {
      scanLoop.stop();
      pulseLoop.stop();
    };
  }, [visible, scan, pulse]);

  useEffect(() => {
    if (!visible) return undefined;
    const t = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2800);
    return () => clearInterval(t);
  }, [visible]);

  const scanTranslateY = useMemo(() => {
    const h = Math.max(120, containerHeight);
    const top = Math.max(16, h * 0.06);
    const bottom = Math.max(top + 24, h * 0.88);
    return scan.interpolate({
      inputRange: [0, 1],
      outputRange: [top, bottom],
    });
  }, [scan, containerHeight]);

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['rgba(229, 211, 230, 0.12)', 'rgba(165, 128, 166, 0.38)', 'rgba(21, 21, 21, 0.45)']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.scanTrack,
          {
            transform: [{ translateY: scanTranslateY }],
            opacity: pulse,
          },
        ]}
      >
        <LinearGradient
          colors={[...gradients.sospink.colors]}
          start={gradients.sospink.start}
          end={gradients.sospink.end}
          style={styles.scanBar}
        />
      </Animated.View>

      <View style={styles.bottomBlock}>
        <View style={styles.dotRow}>
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: pulse }]} />
          ))}
        </View>
        <View style={styles.generatingTitleRow}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.aiLabel}>Generating</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {MESSAGES[msgIndex]}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scanTrack: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    top: 0,
    height: 8,
    justifyContent: 'center',
  },
  scanBar: {
    height: 5,
    borderRadius: 3,
    shadowColor: '#5C3D66',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomBlock: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F4EEF7',
  },
  generatingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  aiLabel: {
    ...typography.caption1,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.95)',
    textTransform: 'uppercase',
  },
  message: {
    ...typography.caption1,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
