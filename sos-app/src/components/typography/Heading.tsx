import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextStyle,
} from 'react-native';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  style?: TextStyle;
  color?: 'primary' | 'secondary' | 'inverse' | 'onLight';
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  style,
  color = 'primary',
}) => {
  const getTextStyle = () => {
    switch (level) {
      case 1:
        return typography.title1;
      case 2:
        return typography.title2;
      case 3:
        return typography.title3;
      case 4:
        return typography.headline;
      default:
        return typography.title1;
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary':
        return colors.text.primary;
      case 'secondary':
        return colors.text.secondary;
      case 'inverse':
        return colors.text.inverse;
      case 'onLight':
        return colors.text.onLight;
      default:
        return colors.text.primary;
    }
  };

  const textStyle = getTextStyle();

  return (
    <Text
      style={[
        {
          fontSize: textStyle.fontSize,
          fontWeight: textStyle.fontWeight,
          letterSpacing: textStyle.letterSpacing,
          color: getColor(),
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
