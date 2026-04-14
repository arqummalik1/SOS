import React, { useCallback } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarStackParamList } from '../../navigation/CalendarStackNavigator';
import { typography } from '../../theme/typography';

/** Layout ratios from SOS-FigmaDesigns/SwitchTheItem/SwitchTheItem.svg (473×1012 artboard). */
const SHEET_H_RATIO = 349 / 1012;
const BTN_W_RATIO = 190 / 440;
const BTN_H = 40;
const BTN_RADIUS = 12;
const SHEET_TOP_RADIUS = 40;
const BTN_GAP = 24;

/** Backdrop blur (halved from previous); sheet uses half of this again (~25% of original pair). */
const BACKDROP_BLUR_IOS = 24;
const BACKDROP_BLUR_ANDROID = 45;
const SHEET_BLUR_IOS = 12;
const SHEET_BLUR_ANDROID = 22;

/** Extra blur surface past the clip so rounded top corners don’t show unblurred content (iOS quirk). */
const SHEET_BLUR_BLEED = 16;

const BACKDROP_FROST = 0.25;
const SHEET_FROST = 0.84;

type Props = {
  navigation: NativeStackNavigationProp<CalendarStackParamList, 'SwitchTheItem'>;
};

export const SwitchTheItemScreen: React.FC<Props> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const sheetHeight = Math.round(height * SHEET_H_RATIO) + Math.max(insets.bottom, 0);
  const buttonWidth = width * BTN_W_RATIO;

  const backdropBlur = Platform.OS === 'ios' ? BACKDROP_BLUR_IOS : BACKDROP_BLUR_ANDROID;
  const sheetBlur = Platform.OS === 'ios' ? SHEET_BLUR_IOS : SHEET_BLUR_ANDROID;

  const onLiveCapture = useCallback(() => {
    navigation.replace('CalendarAddItemCamera');
  }, [navigation]);

  const onSelectExisting = useCallback(() => {
    navigation.replace('CalendarMyItems', { selectionMode: true });
  }, [navigation]);

  const sheetTopRadii = {
    borderTopLeftRadius: SHEET_TOP_RADIUS,
    borderTopRightRadius: SHEET_TOP_RADIUS,
    ...(Platform.OS === 'ios' && ({ borderCurve: 'continuous' } as const)),
  };

  return (
    <View style={styles.root}>
      <View style={styles.upper}>
        <BlurView intensity={backdropBlur} tint="light" style={StyleSheet.absoluteFillObject} />
        <View
          style={[styles.backdropTint, { backgroundColor: `rgba(255,255,255,${BACKDROP_FROST})` }]}
          pointerEvents="none"
        />
        <Pressable
          style={styles.backdropPress}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
      </View>

      <View style={styles.sheetOuter}>
        <View style={[styles.sheetShadow, sheetTopRadii]}>
          <View
            style={[
              styles.sheetClip,
              sheetTopRadii,
              {
                height: sheetHeight,
                overflow: 'hidden',
              },
            ]}
          >
            <BlurView
              intensity={sheetBlur}
              tint="light"
              style={[
                styles.sheetBlurBleed,
                {
                  top: -SHEET_BLUR_BLEED,
                  left: -SHEET_BLUR_BLEED,
                  right: -SHEET_BLUR_BLEED,
                  bottom: -SHEET_BLUR_BLEED,
                },
              ]}
            />
            <View
              style={[styles.sheetTint, { backgroundColor: `rgba(255,255,255,${SHEET_FROST})` }]}
              pointerEvents="none"
            />
            <View style={[styles.sheetInner, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <Text style={styles.title}>Switch the item</Text>

              <TouchableOpacity
                style={[styles.liveBtn, { width: buttonWidth, height: BTN_H, borderRadius: BTN_RADIUS }]}
                onPress={onLiveCapture}
                activeOpacity={0.88}
              >
                <Ionicons name="camera-outline" size={22} color="#111111" />
                <Text style={styles.liveBtnText}>Live Capture</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.existingBtn,
                  { width: buttonWidth, height: BTN_H, borderRadius: BTN_RADIUS },
                ]}
                onPress={onSelectExisting}
                activeOpacity={0.88}
              >
                <Ionicons name="shirt-outline" size={20} color="#FFFFFF" />
                <Text style={styles.existingBtnText}>Select Existing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  upper: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  backdropTint: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetOuter: {
    width: '100%',
  },
  sheetShadow: {
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 18,
  },
  sheetClip: {
    width: '100%',
  },
  sheetBlurBleed: {
    position: 'absolute',
  },
  sheetTint: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetInner: {
    flex: 1,
    paddingTop: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    ...typography.title2,
    fontSize: 24,
    lineHeight: 30,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 32,
  },
  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  liveBtnText: {
    ...typography.headline,
    fontSize: 16,
    color: '#111111',
  },
  existingBtn: {
    marginTop: BTN_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  existingBtnText: {
    ...typography.headline,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
