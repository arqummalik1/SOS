import React, { useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  Animated,
  View,
} from 'react-native';
import { GlassView } from './GlassView';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type ButtonVariant = 'solid' | 'glass' | 'ghost';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'solid',
  style,
  textStyle,
  disabled = false,
  icon,
  size = 'large',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  };

  const getHeight = () => {
    switch (size) {
      case 'small': return 36;
      case 'medium': return 44;
      case 'large': return 56;
    }
  };

  const renderContent = () => {
    const content = (
      <>
        {icon && <>{icon}</>}
        <Text
          style={[
            styles.text,
            variant === 'solid' && styles.solidText,
            variant === 'ghost' && styles.ghostText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </>
    );

    if (variant === 'solid') {
      return (
        <Animated.View
          style={[
            styles.solidContainer,
            { height: getHeight() },
            disabled && styles.disabled,
            { transform: [{ scale: scaleAnim }] },
            style,
          ]}
        >
          {content}
        </Animated.View>
      );
    }

    if (variant === 'glass') {
      return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <GlassView
            intensity="thin"
            borderRadius={100}
            style={[styles.glassContainer, { height: getHeight() }]}
          >
            {content}
          </GlassView>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.ghostContainer,
          { height: getHeight() },
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        {content}
      </Animated.View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  solidContainer: {
    backgroundColor: colors.solid.black,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  glassContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ghostContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 100,
  },
  text: {
    ...typography.headline,
    color: colors.text.primary,
  },
  solidText: {
    color: colors.solid.white,
  },
  ghostText: {
    color: colors.text.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
