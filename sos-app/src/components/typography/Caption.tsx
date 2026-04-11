import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
} from 'react-native';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface CaptionProps {
  children: React.ReactNode;
  variant?: 'footnote' | 'caption1' | 'caption2';
  style?: TextStyle;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'onLight';
  center?: boolean;
}

export const Caption: React.FC<CaptionProps> = ({
  children,
  variant = 'footnote',
  style,
  color = 'secondary',
  center = false,
}) => {
  const getTextStyle = () => {
    switch (variant) {
      case 'footnote':
        return typography.footnote;
      case 'caption1':
        return typography.caption1;
      case 'caption2':
        return typography.caption2;
      default:
        return typography.footnote;
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary':
        return colors.text.primary;
      case 'secondary':
        return colors.text.secondary;
      case 'tertiary':
        return colors.text.tertiary;
      case 'inverse':
        return colors.text.inverse;
      case 'onLight':
        return colors.text.onLightSecondary;
      default:
        return colors.text.secondary;
    }
  };

  const textStyle = getTextStyle();

  return (
    <Text
      style={[
        {
          ...textStyle,
          color: getColor(),
          textAlign: center ? 'center' : 'left',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
