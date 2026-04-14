import React, { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Asset } from 'expo-asset';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SvgUri } from 'react-native-svg';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface PaymentGatewayScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

type GatewayType = 'card' | 'banking' | 'wallet' | 'upi';

const OPTIONS: Array<{
  id: GatewayType;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'card',
    label: 'Debit / Credit Card',
    icon: <Ionicons name="card-outline" size={24} color="#A580A6" />,
  },
  {
    id: 'banking',
    label: 'Net Banking',
    icon: <Ionicons name="business-outline" size={24} color="#A580A6" />,
  },
  {
    id: 'wallet',
    label: 'Paypal',
    icon: <Ionicons name="logo-paypal" size={24} color="#A580A6" />,
  },
  {
    id: 'upi',
    label: 'UPI',
    icon: <MaterialCommunityIcons name="currency-inr" size={24} color="#A580A6" />,
  },
];

const UPI_APPS = [
  { id: 'googlepay', source: require('../../../assets/icons-svg/payment/googlePay.svg') },
  { id: 'paytm', source: require('../../../assets/icons-svg/payment/paytm.svg') },
  { id: 'phonepe', source: require('../../../assets/icons-svg/payment/phonepe.svg') },
  { id: 'amazonpay', source: require('../../../assets/icons-svg/payment/amazonpay.svg') },
];

export const PaymentGatewayScreen: React.FC<PaymentGatewayScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [expandedSection, setExpandedSection] = useState<GatewayType | null>(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [isUpiInputFocused, setIsUpiInputFocused] = useState(false);
  const [saveDetails, setSaveDetails] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardNumberTouched, setCardNumberTouched] = useState(false);
  const [expiryTouched, setExpiryTouched] = useState(false);
  const [cvvTouched, setCvvTouched] = useState(false);
  const [cardNumberFocused, setCardNumberFocused] = useState(false);
  const [expiryFocused, setExpiryFocused] = useState(false);
  const [cvvFocused, setCvvFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [paypalId, setPaypalId] = useState('');
  const [paypalFocused, setPaypalFocused] = useState(false);
  const [saveCardDetails, setSaveCardDetails] = useState(false);
  const upiInputRef = useRef<TextInput>(null);

  // Match CustomTabBar width: it uses left/right inset of 24.
  const cardWidth = width - 48;
  const webNoOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

  const isUpiFormatValid = useMemo(() => /^[\w.+-]{2,}@[a-zA-Z]{2,}$/i.test(upiId.trim()), [upiId]);
  const hasUpiInput = upiId.trim().length > 0;
  const isUpiInvalid = hasUpiInput && !isUpiFormatValid;
  const isUpiActionEnabled = isUpiFormatValid;
  const upiActionLabel = isUpiVerified ? 'Pay Now' : 'Verify';
  const cardNumberDigits = useMemo(() => cardNumber.replace(/\D/g, ''), [cardNumber]);
  const cvvDigits = useMemo(() => cvv.replace(/\D/g, ''), [cvv]);

  const isCardNumberValid = useMemo(() => {
    if (cardNumberDigits.length !== 16) return false;
    // Luhn check for card number validation.
    let sum = 0;
    let shouldDouble = false;
    for (let i = cardNumberDigits.length - 1; i >= 0; i -= 1) {
      let digit = Number(cardNumberDigits[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }, [cardNumberDigits]);

  const isExpiryValid = useMemo(() => {
    const trimmed = expiry.trim();
    const match = trimmed.match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
    if (!match) return false;

    const month = Number(match[1]);
    if (month < 1 || month > 12) return false;

    let year = Number(match[2]);
    if (match[2].length === 2) year += 2000;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  }, [expiry]);

  const isCvvValid = useMemo(() => cvvDigits.length >= 3 && cvvDigits.length <= 4, [cvvDigits]);
  const isPaypalIdValid = useMemo(() => {
    const value = paypalId.trim();
    if (value.length < 6 || value.length > 254) return false;
    // PayPal ID validation: use canonical email format.
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
  }, [paypalId]);

  const isCardFormValid = useMemo(() => {
    return isCardNumberValid && isExpiryValid && isCvvValid && nameOnCard.trim().length >= 2;
  }, [isCardNumberValid, isExpiryValid, isCvvValid, nameOnCard]);

  const showCardNumberInvalid = cardNumberTouched && cardNumber.trim().length > 0 && !isCardNumberValid;
  const showExpiryInvalid = expiryTouched && expiry.trim().length > 0 && !isExpiryValid;
  const showCvvInvalid = cvvTouched && cvv.trim().length > 0 && !isCvvValid;
  const showNameInvalid = nameTouched && nameOnCard.trim().length > 0 && nameOnCard.trim().length < 2;
  const showPaypalInvalid = paypalId.trim().length > 0 && !isPaypalIdValid;

  const formatCardNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1-');
  };

  const formatExpiry = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    if (digitsOnly.length <= 2) return digitsOnly;
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  };

  const onToggleSection = (id: GatewayType) => {
    setExpandedSection((current) => {
      const next = current === id ? null : id;
      if (next !== 'upi') {
        setIsUpiVerified(false);
      }
      return next;
    });
  };

  const onPressUpiAction = () => {
    if (!isUpiFormatValid) {
      setIsUpiVerified(false);
      return;
    }

    if (!isUpiVerified) {
      setIsUpiVerified(true);
      return;
    }

    // Payment API integration point for Pay Now.
  };

  const renderOptionRow = (option: (typeof OPTIONS)[number]) => {
    const isExpanded = expandedSection === option.id;
    const isCardExpanded = option.id === 'card' && isExpanded;
    const isWalletExpanded = option.id === 'wallet' && isExpanded;
    const isUpiExpanded = option.id === 'upi' && isExpanded;

    return (
      <View
        key={option.id}
        style={[
          styles.rowWrap,
          { width: cardWidth },
          isUpiExpanded && styles.rowWrapExpanded,
          isCardExpanded && styles.rowWrapExpanded,
          isWalletExpanded && styles.rowWrapExpanded,
        ]}
      >
        <Pressable
          style={[
            styles.optionRow,
            (isUpiExpanded || isWalletExpanded) && styles.optionRowExpanded,
          ]}
          onPress={() => onToggleSection(option.id)}
        >
          <View style={styles.optionLeft}>
            {option.icon}
            <Text style={styles.optionText}>{option.label}</Text>
          </View>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={19} color="#111111" />
        </Pressable>

        {isCardExpanded ? (
          <View style={styles.cardExpandedBody}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={[
                styles.cardInput,
                cardNumberFocused && styles.cardInputFocused,
                showCardNumberInvalid && styles.cardInputInvalid,
                webNoOutline,
              ]}
              value={cardNumber}
              onChangeText={(value) => setCardNumber(formatCardNumber(value))}
              onFocus={() => setCardNumberFocused(true)}
              onBlur={() => {
                setCardNumberFocused(false);
                setCardNumberTouched(true);
              }}
              keyboardType="number-pad"
              placeholder="1234-5678-9876-4321"
              placeholderTextColor="#8D8E95"
              maxLength={19}
            />

            <View style={styles.cardDualRow}>
              <View style={styles.cardHalfField}>
                <Text style={[styles.inputLabel, showCvvInvalid && styles.inputLabelInvalid]}>CVV/CVC No.</Text>
                <TextInput
                  style={[
                    styles.cardInput,
                    cvvFocused && styles.cardInputFocused,
                    showCvvInvalid && styles.cardInputInvalid,
                    webNoOutline,
                  ]}
                  value={cvv}
                  onChangeText={(value) => setCvv(value.replace(/\D/g, '').slice(0, 4))}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={() => {
                    setCvvFocused(false);
                    setCvvTouched(true);
                  }}
                  keyboardType="number-pad"
                  placeholder="xxx"
                  placeholderTextColor="#8D8E95"
                  secureTextEntry
                  maxLength={4}
                />
                {showCvvInvalid ? <Text style={styles.cardErrorText}>Enter valid cvv</Text> : null}
              </View>
              <View style={styles.cardHalfField}>
                <Text style={[styles.inputLabel, showExpiryInvalid && styles.inputLabelInvalid]}>Valid Thru</Text>
                <TextInput
                  style={[
                    styles.cardInput,
                    expiryFocused && styles.cardInputFocused,
                    showExpiryInvalid && styles.cardInputInvalid,
                    webNoOutline,
                  ]}
                  value={expiry}
                  onChangeText={(value) => setExpiry(formatExpiry(value))}
                  onFocus={() => setExpiryFocused(true)}
                  onBlur={() => {
                    setExpiryFocused(false);
                    setExpiryTouched(true);
                  }}
                  keyboardType="number-pad"
                  placeholder="01/2024"
                  placeholderTextColor="#8D8E95"
                  maxLength={7}
                />
                {showExpiryInvalid ? <Text style={styles.cardErrorText}>Enter valid id</Text> : null}
              </View>
            </View>

            <Text style={[styles.inputLabel, showNameInvalid && styles.inputLabelInvalid]}>Name on Card</Text>
            <TextInput
              style={[
                styles.cardInput,
                nameFocused && styles.cardInputFocused,
                showNameInvalid && styles.cardInputInvalid,
                webNoOutline,
              ]}
              value={nameOnCard}
              onChangeText={setNameOnCard}
              onFocus={() => setNameFocused(true)}
              onBlur={() => {
                setNameFocused(false);
                setNameTouched(true);
              }}
              placeholder="Cardholder name"
              placeholderTextColor="#8D8E95"
            />
            {showNameInvalid ? <Text style={styles.cardErrorText}>Enter valid name</Text> : null}

            <Pressable
              style={[styles.cardPayButton, isCardFormValid && styles.cardPayButtonEnabled]}
              disabled={!isCardFormValid}
            >
              <Text style={styles.cardPayText}>Send OTP</Text>
            </Pressable>

            <Pressable
              style={styles.cardSaveRow}
              onPress={() => setSaveCardDetails((current) => !current)}
            >
              <View style={[styles.checkbox, saveCardDetails && styles.checkboxChecked]}>
                {saveCardDetails ? <Ionicons name="checkmark" size={13} color="#111111" /> : null}
              </View>
              <Text style={styles.saveText}>Save details for future</Text>
            </Pressable>
          </View>
        ) : null}

        {isWalletExpanded ? (
          <View style={styles.paypalExpandedBody}>
            <Text style={[styles.inputLabel, showPaypalInvalid && styles.inputLabelInvalid]}>
              Paypal ID
            </Text>
            <View style={styles.paypalRow}>
              <TextInput
                style={[
                  styles.paypalInput,
                  paypalFocused && styles.cardInputFocused,
                  showPaypalInvalid && styles.cardInputInvalid,
                  webNoOutline,
                ]}
                value={paypalId}
                onChangeText={setPaypalId}
                onFocus={() => setPaypalFocused(true)}
                onBlur={() => {
                  setPaypalFocused(false);
                }}
                placeholder="Enter Paypal ID"
                placeholderTextColor="#8D8E95"
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor="#111111"
              />
              <Pressable
                style={[styles.paypalConfirmButton, isPaypalIdValid && styles.paypalConfirmButtonEnabled]}
                disabled={!isPaypalIdValid}
              >
                <Text style={styles.paypalConfirmText}>Confirm</Text>
              </Pressable>
            </View>
            {showPaypalInvalid ? <Text style={styles.cardErrorText}>Enter valid id</Text> : null}
          </View>
        ) : null}

        {isUpiExpanded ? (
          <View style={styles.upiExpandedBody}>
            <Text style={styles.upiChooseApp}>Choose App</Text>

            <View style={styles.upiAppsRow}>
              {UPI_APPS.map((app) => {
                const isSelected = app.id === selectedUpiApp;
                return (
                  <Pressable
                    key={app.id}
                    onPress={() => {
                      setSelectedUpiApp(app.id);
                      setIsUpiVerified(false);
                    }}
                    style={[styles.appTile, isSelected && styles.appTileSelected]}
                  >
                    <SvgUri width={42} height={42} uri={Asset.fromModule(app.source).uri} />
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.orWrap}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Or</Text>
              <View style={styles.orLine} />
            </View>

            <Text style={[styles.enterUpiLabel, isUpiInvalid && styles.enterUpiLabelInvalid]}>Enter UPI ID</Text>
            <View style={styles.upiActionRow}>
              <Pressable
                style={[
                  styles.upiInputWrap,
                  isUpiInputFocused && styles.upiInputWrapFocused,
                  isUpiInvalid && styles.upiInputWrapInvalid,
                ]}
                onPress={() => upiInputRef.current?.focus()}
              >
                <TextInput
                  ref={upiInputRef}
                  style={[
                    styles.upiInput,
                    isUpiInvalid && styles.upiInputInvalid,
                    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
                  ]}
                  value={upiId}
                  onChangeText={(value) => {
                    setUpiId(value);
                    setIsUpiVerified(false);
                  }}
                  onFocus={() => setIsUpiInputFocused(true)}
                  onBlur={() => setIsUpiInputFocused(false)}
                  placeholder="123456@upi"
                  placeholderTextColor="#555555"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor="#111111"
                />
                {isUpiVerified ? (
                  <View style={styles.verifiedBadge} pointerEvents="none">
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                ) : null}
              </Pressable>

              <Pressable
                style={[styles.payNowButton, isUpiActionEnabled && styles.payNowButtonEnabled]}
                onPress={onPressUpiAction}
                disabled={!isUpiActionEnabled}
              >
                <Text style={styles.payNowText}>{upiActionLabel}</Text>
              </Pressable>
            </View>
            {isUpiInvalid ? <Text style={styles.upiValidationText}>Enter valid id</Text> : null}

            <Pressable style={styles.saveRow} onPress={() => setSaveDetails((current) => !current)}>
              <View style={[styles.checkbox, saveDetails && styles.checkboxChecked]}>
                {saveDetails ? <Ionicons name="checkmark" size={13} color="#111111" /> : null}
              </View>
              <Text style={styles.saveText}>Save details for future</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeContainer style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.headerBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111111" />
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { width: cardWidth }]}>Select Payment Method</Text>
        <View style={[styles.section, { width: cardWidth }]}>{OPTIONS.map(renderOptionRow)}</View>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F6',
  },
  header: {
    height: 58,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    ...typography.title3,
    color: '#1F2024',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 28,
  },
  headerBackButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 34,
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.footnote,
    color: '#3A3B40',
    marginBottom: 18,
  },
  section: {
    gap: 10,
  },
  rowWrap: {
    backgroundColor: '#F7F7F9',
    borderRadius: 9,
    overflow: 'hidden',
  },
  rowWrapExpanded: {
    borderWidth: 1,
    borderColor: '#BCBEC6',
  },
  optionRow: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F7F9',
  },
  optionRowExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: '#D2D2D7',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    paddingRight: 12,
  },
  optionText: {
    ...typography.body,
    color: '#111111',
    fontWeight: '400',
  },
  upiExpandedBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#F7F7F9',
    borderWidth: 0,
  },
  cardExpandedBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#F7F7F9',
    borderWidth: 0,
  },
  inputLabel: {
    ...typography.caption1,
    color: '#555760',
    marginBottom: 7,
  },
  inputLabelInvalid: {
    color: '#D74444',
  },
  cardInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#C9CBD2',
    borderRadius: 10,
    backgroundColor: '#F7F7F9',
    paddingHorizontal: 12,
    ...typography.callout,
    color: '#23242A',
    marginBottom: 10,
  },
  cardInputFocused: {
    borderColor: '#111111',
  },
  cardInputInvalid: {
    borderColor: '#D74444',
    color: '#D74444',
  },
  cardDualRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cardHalfField: {
    flex: 1,
  },
  cardErrorText: {
    ...typography.caption1,
    color: '#D74444',
    marginTop: -2,
    marginBottom: 6,
  },
  cardPayButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#84858C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardPayButtonEnabled: {
    backgroundColor: '#111111',
  },
  cardPayText: {
    ...typography.subheadline,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardSaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  paypalExpandedBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#F7F7F9',
    borderWidth: 0,
  },
  paypalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paypalInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 12,
    ...typography.callout,
    color: '#23242A',
    backgroundColor: '#F7F7F9',
  },
  paypalConfirmButton: {
    width: 84,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#A0A1A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paypalConfirmButtonEnabled: {
    backgroundColor: '#111111',
  },
  paypalConfirmText: {
    ...typography.subheadline,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  upiChooseApp: {
    ...typography.subheadline,
    color: '#4B4D55',
    marginBottom: 10,
  },
  upiAppsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  appTile: {
    width: 54,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 0,
    backgroundColor: '#F7F7F9',
  },
  appTileSelected: {
    backgroundColor: '#EEE7F0',
  },
  orWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#8C8D95',
  },
  orText: {
    ...typography.subheadline,
    color: '#53545B',
    marginHorizontal: 8,
  },
  enterUpiLabel: {
    ...typography.body,
    color: '#111111',
    fontWeight: '600',
    marginBottom: 9,
  },
  enterUpiLabelInvalid: {
    color: '#D74444',
  },
  upiActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  upiInputWrap: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#8F919A',
    backgroundColor: '#F7F7F9',
    paddingHorizontal: 0,
  },
  upiInputWrapInvalid: {
    borderColor: '#D74444',
  },
  upiInputWrapFocused: {
    borderColor: '#111111',
  },
  upiInput: {
    ...typography.callout,
    color: '#222222',
    paddingRight: 36,
    paddingLeft: 14,
    height: '100%',
    width: '100%',
    paddingVertical: 0,
    borderRadius: 12,
  },
  upiInputInvalid: {
    color: '#D74444',
  },
  upiValidationText: {
    ...typography.caption1,
    color: '#D74444',
    marginBottom: 8,
  },
  verifiedBadge: {
    position: 'absolute',
    right: 16,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#21A521',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowButton: {
    width: 80,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#84858C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowButtonEnabled: {
    backgroundColor: '#111111',
  },
  payNowText: {
    ...typography.subheadline,
    color: '#FFFFFF',
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.6,
    borderColor: '#7D7E85',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F9',
  },
  checkboxChecked: {
    borderColor: '#111111',
  },
  saveText: {
    ...typography.callout,
    color: '#25262B',
  },
});
