import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface OTPInputProps {
  value: string[];
  onChange: (index: number, val: string) => void;
  onComplete?: (otp: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  onComplete,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const currentIndex = value.findIndex((v) => v === '');
    if (currentIndex !== -1) {
      inputRefs.current[currentIndex]?.focus();
    }
  }, [value]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    onChange(index, digit);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const newValue = [...value];
    newValue[index] = digit;
    if (newValue.every((v) => v !== '') && onComplete) {
      onComplete(newValue.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {value.map((digit, index) => {
        const isFilled = digit !== '';
        const isActive = index === value.findIndex((v) => v === '') ||
          (index === 0 && value.every((v) => v === ''));

        return (
          <View
            key={index}
            style={[
              styles.box,
              isFilled && styles.boxFilled,
            ]}
          >
            <TextInput
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.input,
                isFilled ? styles.inputFilled : styles.inputEmpty,
              ]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  box: {
    width: 46,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFilled: {
    borderColor: 'rgba(0,0,0,0.2)',
    backgroundColor: '#FFFFFF',
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: typography.title3.fontSize,
    fontWeight: typography.title3.fontWeight,
    padding: 0,
  },
  inputEmpty: {
    color: '#999999',
  },
  inputFilled: {
    color: '#000000',
  },
});
