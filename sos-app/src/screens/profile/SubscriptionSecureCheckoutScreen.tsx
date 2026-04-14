import React, { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { typography } from '../../theme/typography';
import { PrimaryActionButton, SubscriptionHeader } from './components/SubscriptionFlowComponents';

type BillingCycle = 'annual' | 'monthly';
type SubscriptionPlan = 'free' | 'premium';

interface SubscriptionSecureCheckoutScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
}

const PAYMENT_APPS = [
  { id: 'phonepe', source: require('../../../assets/icons-svg/payment/phonepe.svg') },
  { id: 'paytm', source: require('../../../assets/icons-svg/payment/paytm.svg') },
  { id: 'googlepay', source: require('../../../assets/icons-svg/payment/googlePay.svg') },
  { id: 'amazonpay', source: require('../../../assets/icons-svg/payment/amazonpay.svg') },
];

const APP_ICON_TREATMENT: Record<string, { frameHeight: number; scale: number }> = {
  phonepe: { frameHeight: 50, scale: 1.17 },
  paytm: { frameHeight: 34, scale: 1.46 },
  googlepay: { frameHeight: 34, scale: 1.46 },
  amazonpay: { frameHeight: 34, scale: 1.53 },
};

export const SubscriptionSecureCheckoutScreen: React.FC<SubscriptionSecureCheckoutScreenProps> = ({
  navigation,
  route,
}) => {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const contentWidth = Math.min(382, width - 28);
  const appTileWidth = Math.min(84, Math.max(0, (contentWidth - 32 - 30) / 4));
  const appLogoFrameWidth = Math.max(40, appTileWidth - 14);
  const upiInputRef = useRef<TextInput>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>('phonepe');
  const [upiAddress, setUpiAddress] = useState('user@bank');
  const [isUpiFocused, setIsUpiFocused] = useState(false);
  const [isUpiAddressEnabled, setIsUpiAddressEnabled] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const plan: SubscriptionPlan = route?.params?.plan === 'free' ? 'free' : 'premium';
  const cycle: BillingCycle = route?.params?.cycle === 'monthly' ? 'monthly' : 'annual';

  const isUpiValid = useMemo(() => /^[\w.+-]{2,}@[a-zA-Z]{2,}$/i.test(upiAddress.trim()), [upiAddress]);
  const isFreePlan = plan === 'free';
  const canComplete = agreed && (isFreePlan || selectedApp != null || isUpiValid);

  const planLine = isFreePlan
    ? 'Free Plan - 7 Day Trial'
    : `Premium Plan - ${cycle === 'annual' ? 'Annual' : 'Monthly'}`;
  const billingLine = isFreePlan
    ? '₹0 / trial • No immediate charge'
    : cycle === 'annual'
      ? '₹599 / year • Billed annually'
      : '₹59 / month • Billed monthly';
  const planPrice = isFreePlan ? '₹0.00' : cycle === 'annual' ? '₹599.00' : '₹59.00';
  const gstPrice = isFreePlan ? '₹0.00' : cycle === 'annual' ? '₹10.62' : '₹10.62';
  const totalPrice = isFreePlan ? '₹0.00' : cycle === 'annual' ? '₹609.62' : '₹69.62';

  return (
    <SafeContainer style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 18 }]}>
        <View style={{ width: contentWidth }}>
          <View style={styles.headerBlock}>
            <SubscriptionHeader
              title="Secure checkout"
              subtitle="Your payment is secured with encryption"
              onBack={() => navigation.goBack()}
            />
          </View>

          <View style={styles.methodsCard}>
            <View style={styles.methodsCardTopGlow} pointerEvents="none" />
            <TouchableOpacity style={styles.methodRow} activeOpacity={0.9}>
              <Text style={styles.methodLabel}>Pay with Credit / Debit Card</Text>
              <Ionicons name="arrow-forward" size={18} color="#1C1C1E" />
            </TouchableOpacity>

            <Text style={styles.methodLabel}>Pay with UPI app</Text>
            <View style={styles.appsRow}>
              {PAYMENT_APPS.map((app) => (
                (() => {
                  const treatment = APP_ICON_TREATMENT[app.id] ?? { frameHeight: 34, scale: 1.7 };
                  return (
                <TouchableOpacity
                  key={app.id}
                  style={[styles.appTile, { width: appTileWidth }, selectedApp === app.id && styles.appTileActive]}
                  activeOpacity={0.88}
                  onPress={() => setSelectedApp(app.id)}
                >
                  <View style={[styles.appLogoFrame, { width: appLogoFrameWidth, height: treatment.frameHeight }]}>
                    <View style={{ transform: [{ scale: treatment.scale }] }}>
                      <SvgUri width={52} height={52} uri={Asset.fromModule(app.source).uri} />
                    </View>
                  </View>
                </TouchableOpacity>
                  );
                })()
              ))}
            </View>

            <TouchableOpacity style={styles.selectRow} activeOpacity={0.9}>
              <Text style={styles.selectRowText}>Select UPI app</Text>
              <Ionicons name="arrow-forward" size={16} color="#1C1C1E" />
            </TouchableOpacity>

            <Text style={styles.methodSubLabel}>Pay with UPI address</Text>
            <Pressable
              style={[
                styles.upiInputWrap,
                isUpiFocused && styles.upiInputWrapFocused,
                !isUpiAddressEnabled && styles.upiInputWrapDisabled,
              ]}
              onPress={() => {
                if (isUpiAddressEnabled) {
                  upiInputRef.current?.focus();
                }
              }}
            >
              <TextInput
                ref={upiInputRef}
                style={[
                  styles.upiInput,
                  !isUpiAddressEnabled && styles.upiInputDisabled,
                  Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null,
                ]}
                value={upiAddress}
                onChangeText={setUpiAddress}
                placeholder="user@bank"
                placeholderTextColor="#9A9AA1"
                autoCapitalize="none"
                autoCorrect={false}
                editable={isUpiAddressEnabled}
                onFocus={() => setIsUpiFocused(true)}
                onBlur={() => setIsUpiFocused(false)}
                selectionColor="#111111"
              />
              <TouchableOpacity
                style={[styles.inlineCheck, !isUpiAddressEnabled && styles.inlineCheckOff]}
                activeOpacity={0.85}
                onPress={() => {
                  setIsUpiFocused(false);
                  setIsUpiAddressEnabled((current) => !current);
                }}
              >
                {isUpiAddressEnabled ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Ionicons name="remove" size={14} color="#111111" />
                )}
              </TouchableOpacity>
            </Pressable>
          </View>

          <Text style={styles.paymentDetailsTitle}>Payment Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeaderRow}>
              <View>
                <Text style={styles.planLine}>{planLine}</Text>
                <Text style={styles.planBillingLine}>{billingLine}</Text>
              </View>
              <View style={[styles.radioDot, isFreePlan && styles.radioDotFree]} />
            </View>

            <Text style={styles.detailSectionLabel}>Payment Details</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Plan Price</Text>
              <Text style={styles.amountValue}>{planPrice}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>GST (18%)</Text>
              <Text style={styles.amountValue}>{gstPrice}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.amountRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>{totalPrice}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed((current) => !current)} activeOpacity={0.9}>
            <View style={[styles.termsCheckbox, agreed && styles.termsCheckboxOn]}>
              {agreed ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
            </View>
            <Text style={styles.termsText}>I agree to the Terms & Conditions and Privacy Policy</Text>
          </TouchableOpacity>

          <PrimaryActionButton
            label="Complete Payment"
            onPress={() => navigation.navigate('PaymentGateway')}
            disabled={!canComplete}
          />
        </View>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 4,
  },
  headerBlock: {
    marginTop: 20,
  },
  methodsCard: {
    marginTop: 6,
    backgroundColor: '#F8F8F9',
    borderRadius: 18,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 0,
  },
  methodsCardTopGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  methodLabel: {
    ...typography.title3,
    color: '#202020',
    fontWeight: '500',
  },
  appsRow: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  appTile: {
    height: 72,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.11,
    shadowRadius: 8,
    elevation: 2,
  },
  appLogoFrame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTileActive: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  selectRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectRowText: {
    ...typography.callout,
    color: '#1E1E1E',
    fontWeight: '500',
  },
  methodSubLabel: {
    ...typography.callout,
    color: '#353535',
    marginBottom: 8,
  },
  upiInputWrap: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 0,
  },
  upiInputWrapFocused: {
    borderColor: '#111111',
  },
  upiInputWrapDisabled: {
    backgroundColor: '#EFEFEF',
    borderColor: '#E1E1E1',
  },
  upiInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    ...typography.callout,
    color: '#222222',
  },
  upiInputDisabled: {
    color: '#9A9AA1',
  },
  inlineCheck: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineCheckOff: {
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: '#D2D2D2',
  },
  paymentDetailsTitle: {
    marginTop: 16,
    marginBottom: 10,
    ...typography.title3,
    color: '#1B1B1B',
    fontWeight: '500',
  },
  detailsCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#DADADA',
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  planLine: {
    ...typography.headline,
    color: '#222222',
  },
  planBillingLine: {
    marginTop: 2,
    ...typography.callout,
    color: '#1E1E1E',
    fontWeight: '600',
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#844A93',
  },
  radioDotFree: {
    backgroundColor: '#8F8F95',
  },
  detailSectionLabel: {
    ...typography.headline,
    color: '#1B1B1B',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountLabel: {
    ...typography.callout,
    color: '#333333',
  },
  amountValue: {
    ...typography.callout,
    color: '#333333',
  },
  divider: {
    marginTop: 8,
    marginBottom: 10,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  totalLabel: {
    ...typography.headline,
    color: '#1C1C1C',
  },
  totalValue: {
    ...typography.headline,
    color: '#1C1C1C',
  },
  termsRow: {
    marginTop: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  termsCheckbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#8A8A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsCheckboxOn: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },
  termsText: {
    ...typography.footnote,
    color: '#2D2D2D',
    flex: 1,
  },
});
