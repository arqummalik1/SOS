import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme';

interface SOSProgressBarProps {
  steps: number;
  currentStep: number;
  size?: 'small' | 'medium' | 'large';
}

export const SOSProgressBar: React.FC<SOSProgressBarProps> = ({
  steps,
  currentStep,
  size = 'medium',
}) => {
  const theme = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small': return { height: 3, width: 60 };
      case 'medium': return { height: 4, width: 80 };
      case 'large': return { height: 6, width: 100 };
      default: return { height: 4, width: 80 };
    }
  };

  const { height, width } = getSize();

  return (
    <View style={styles.container}>
      {Array.from({ length: steps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              width,
              height,
              borderRadius: height / 2,
              backgroundColor: index < currentStep 
                ? theme.colors.gray[800] 
                : theme.colors.gray[200],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  bar: {
    borderRadius: 2,
  },
});
