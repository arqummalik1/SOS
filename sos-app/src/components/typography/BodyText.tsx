import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
} from 'react-native';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface BodyTextProps {
  children: React.ReactNode;
  variant?: 'body' | 'callout' | 'subheadline';
  style?: TextStyle;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'onLight' | 'onLightSecondary';
  center?: boolean;
}

export const BodyText: React.FC<BodyTextProps> = ({
  children,
  variant = 'body',
  style,
  color = 'primary',
  center = false,
}) => {
  const getTextStyle = () => {
    switch (variant) {
      case 'body':
        return typography.body;
      case 'callout':
        return typography.callout;
      case 'subheadline':
        return typography.subheadline;
      default:
        return typography.body;
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
        return colors.text.onLight;
      case 'onLightSecondary':
        return colors.text.onLightSecondary;
      default:
        return colors.text.primary;
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
