import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme, getTextStyle, TypographyVariant } from '../theme';

interface SOSTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const SOSText: React.FC<SOSTextProps> = ({
  variant = 'bodyMedium',
  color,
  align,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const textStyle = getTextStyle(variant);
  
  return (
    <Text
      style={[
        textStyle,
        color && { color },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export const SOSTitle: React.FC<SOSTextProps> = (props) => (
  <SOSText variant="headlineLarge" {...props} />
);

export const SOSSubtitle: React.FC<SOSTextProps> = (props) => (
  <SOSText variant="titleMedium" {...props} />
);

export const SOSBody: React.FC<SOSTextProps> = (props) => (
  <SOSText variant="bodyMedium" {...props} />
);

export const SOSLabel: React.FC<SOSTextProps> = (props) => (
  <SOSText variant="labelMedium" {...props} />
);
